<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoleRequest;
use App\Models\Admin;
use App\Models\Permission;
use App\Models\Role;
use App\Support\AdminPaginator;
use App\Support\AdminUiCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Inertia\Inertia;
use Inertia\Response;

class RolePermissionController extends Controller
{
    private const CRITICAL_SELF_ACCESS = [
        'dashboard.view',
        'admin_users.view',
        'admin_users.edit',
        'roles_permissions.view',
        'roles_permissions.edit',
    ];

    public function index(Request $request): Response
    {
        $perPage = AdminPaginator::resolve($request);

        return Inertia::render('admin/roles-permissions/Index', [
            'roles' => fn () => Role::query()
                ->select(['id', 'name', 'slug', 'status'])
                ->withCount(['admins', 'permissions'])
                ->when($request->string('search')->toString(), function ($query, string $search): void {
                    $like = "%{$search}%";

                    $query->where(function ($subQuery) use ($like): void {
                        $subQuery->where('name', 'like', $like)
                            ->orWhere('slug', 'like', $like)
                            ->orWhere('description', 'like', $like)
                            ->orWhere('status', 'like', $like)
                            ->orWhereHas('admins', function ($adminQuery) use ($like): void {
                                $adminQuery->where(function ($nestedQuery) use ($like): void {
                                    $nestedQuery->where('name', 'like', $like)
                                        ->orWhere('email', 'like', $like);
                                });
                            })
                            ->orWhereHas('permissions', function ($permissionQuery) use ($like): void {
                                $permissionQuery->where(function ($nestedQuery) use ($like): void {
                                    $nestedQuery->where('label', 'like', $like)
                                        ->orWhere('name', 'like', $like);
                                });
                            });
                    });
                })
                ->when($request->string('status')->toString(), fn ($query, string $status) => $query->where('status', $status))
                ->orderBy('name')
                ->paginate($perPage)
                ->withQueryString(),
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/roles-permissions/RoleCreate', [
            'permissionGroups' => Inertia::defer(
                fn (): array => $this->permissionGroups(),
                'role-access',
            ),
            'statuses' => ['active', 'inactive'],
        ]);
    }

    public function store(RoleRequest $request): RedirectResponse
    {
        /** @var Admin $currentAdmin */
        $currentAdmin = $request->user('admin');
        $data = $request->validated();
        $data['slug'] = Str::slug($data['slug'] ?: $data['name']);
        $permissionIds = $this->permissionIdsForPayload($data);

        if ($scopeError = $this->accessManagementScopeError($currentAdmin, $data['slug'], $permissionIds)) {
            return back()->withErrors($scopeError);
        }

        DB::transaction(function () use ($data, $permissionIds): void {
            $role = Role::query()->create([
                'name' => $data['name'],
                'guard_name' => 'admin',
                'slug' => $data['slug'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'],
            ]);

            $role->syncPermissions($permissionIds);
        });

        app(AdminUiCache::class)->flushPermissions();

        return redirect()
            ->route('admin.roles-permissions.index')
            ->with('success', 'Role created successfully.');
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('admin/roles-permissions/RoleEdit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'status' => $role->status,
                'permissions' => $role->permissions()->select(['permissions.id'])->get()->map->only(['id'])->values()->all(),
            ],
            'permissionGroups' => Inertia::defer(
                fn (): array => $this->permissionGroups(),
                'role-access',
            ),
            'statuses' => ['active', 'inactive'],
        ]);
    }

    public function update(RoleRequest $request, Role $role): RedirectResponse
    {
        /** @var Admin $currentAdmin */
        $currentAdmin = $request->user('admin');
        $data = $request->validated();
        $data['slug'] = $role->isSuperAdmin() ? Role::SUPER_ADMIN_SLUG : Str::slug($data['slug'] ?: $data['name']);
        $data['status'] = $role->isSuperAdmin() ? 'active' : $data['status'];
        $permissionIds = $this->permissionIdsForPayload($data, $role);

        if ($scopeError = $this->accessManagementScopeError($currentAdmin, $data['slug'], $permissionIds)) {
            return back()->withErrors($scopeError);
        }

        if ($currentAdmin->hasRole($role) && $data['status'] !== 'active') {
            return back()->withErrors(['status' => 'You cannot deactivate your own role.']);
        }

        if ($currentAdmin->hasRole($role) && ! $this->hasCriticalSelfAccess($currentAdmin, $permissionIds)) {
            return back()->withErrors(['permission_ids' => 'You cannot remove your own critical access.']);
        }

        DB::transaction(function () use ($role, $data, $permissionIds): void {
            $role->update([
                'name' => $role->isSuperAdmin() ? 'Super Admin' : $data['name'],
                'guard_name' => 'admin',
                'slug' => $data['slug'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'],
            ]);

            $role->syncPermissions($permissionIds);
        });

        app(AdminUiCache::class)->flushPermissions();

        return redirect()
            ->route('admin.roles-permissions.index')
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->isSuperAdmin()) {
            return back()->with('error', 'The Super Admin role cannot be deleted.');
        }

        if ($role->admins()->exists() || $role->members()->exists()) {
            return back()->with('error', 'Reassign admins and members before deleting this role.');
        }

        $role->delete();
        app(AdminUiCache::class)->flushPermissions();

        if (request()->headers->get('X-Inertia-Partial-Component') === 'admin/roles-permissions/Index') {
            return back(status: SymfonyResponse::HTTP_SEE_OTHER)
                ->with('success', 'Role deleted successfully.');
        }

        return redirect()
            ->route('admin.roles-permissions.index')
            ->with('success', 'Role deleted successfully.');
    }

    private function permissionGroups(): array
    {
        return app(AdminUiCache::class)->permissionGroups();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<int>
     */
    private function permissionIdsForPayload(array $data, ?Role $role = null): array
    {
        if ($role?->isSuperAdmin() || ($data['slug'] ?? null) === Role::SUPER_ADMIN_SLUG) {
            return Permission::query()->pluck('id')->all();
        }

        return collect($data['permission_ids'] ?? [])
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @param  list<int>  $permissionIds
     */
    private function hasCriticalSelfAccess(Admin $currentAdmin, array $permissionIds): bool
    {
        $granted = array_unique([
            ...Permission::query()->whereKey($permissionIds)->pluck('name')->all(),
            ...$currentAdmin->permissions()->pluck('name')->all(),
        ]);

        return count(array_diff(self::CRITICAL_SELF_ACCESS, $granted)) === 0;
    }

    /**
     * @param  list<int>  $permissionIds
     * @return array<string, string>|null
     */
    private function accessManagementScopeError(Admin $currentAdmin, string $roleSlug, array $permissionIds): ?array
    {
        if ($currentAdmin->isSuperAdmin()) {
            return null;
        }

        if ($roleSlug === Role::SUPER_ADMIN_SLUG) {
            return ['slug' => 'Only a Super Admin can create or update the Super Admin role.'];
        }

        $currentPermissionIds = $currentAdmin->getAllPermissions()->pluck('id')->all();

        if (array_diff($permissionIds, $currentPermissionIds)) {
            return ['permission_ids' => 'You cannot grant permissions outside your own access scope.'];
        }

        return null;
    }
}
