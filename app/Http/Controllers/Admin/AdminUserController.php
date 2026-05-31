<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminUserRequest;
use App\Models\Admin;
use App\Models\Permission;
use App\Models\Role;
use App\Support\AdminMediaService;
use App\Support\AdminPaginator;
use App\Support\AdminUiCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
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

        return Inertia::render('admin/admin-users/Index', [
            'adminUsers' => fn () => Admin::query()
                ->select([
                    'id',
                    'name',
                    'email',
                    'avatar',
                    'status',
                    'last_login_at',
                ])
                ->with(['roles:id,name,slug'])
                ->withCount('permissions')
                ->when($request->string('search')->toString(), function ($query, string $search): void {
                    $like = "%{$search}%";

                    $query->where(function ($subQuery) use ($like): void {
                        $subQuery->where('name', 'like', $like)
                            ->orWhere('email', 'like', $like)
                            ->orWhere('job_title', 'like', $like)
                            ->orWhere('phone', 'like', $like)
                            ->orWhere('status', 'like', $like)
                            ->orWhereHas('roles', function ($roleQuery) use ($like): void {
                                $roleQuery->where(function ($nestedQuery) use ($like): void {
                                    $nestedQuery->where('name', 'like', $like)
                                        ->orWhere('slug', 'like', $like);
                                });
                            });
                    });
                })
                ->when($request->string('status')->toString(), fn ($query, string $status) => $query->where('status', $status))
                ->orderBy('name')
                ->paginate($perPage)
                ->through(fn (Admin $admin): array => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'avatar' => $admin->avatar,
                    'status' => $admin->status,
                    'last_login_at' => $admin->last_login_at?->toIso8601String(),
                    'role' => $admin->primaryRole()?->only(['id', 'name', 'slug']),
                    'permissions_count' => $admin->permissions_count,
                    'is_current' => $request->user('admin')?->is($admin) ?? false,
                ])
                ->withQueryString(),
            'filters' => $request->only(['search', 'status', 'per_page']),
            'statuses' => ['active', 'inactive'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/admin-users/Create', [
            'roles' => $this->roles(),
            'permissionGroups' => Inertia::defer(
                fn (): array => $this->permissionGroups(),
                'admin-user-access',
            ),
            'statuses' => ['active', 'inactive'],
        ]);
    }

    public function store(AdminUserRequest $request, AdminMediaService $media): RedirectResponse
    {
        /** @var Admin $currentAdmin */
        $currentAdmin = $request->user('admin');
        $data = $request->validated();
        $role = Role::query()->findOrFail((int) $data['role_id']);
        $permissionIds = $this->permissionIds($data);

        if ($scopeError = $this->accessManagementScopeError($currentAdmin, $role, $permissionIds)) {
            return back()->withErrors($scopeError);
        }

        DB::transaction(function () use ($request, $media, $currentAdmin, $data, $role, $permissionIds): void {
            $admin = Admin::query()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'avatar' => $media->store($request->file('avatar'), 'admins/avatars', $currentAdmin),
                'phone' => $data['phone'] ?? null,
                'phone_country' => $data['phone_country'] ?? null,
                'job_title' => $data['job_title'] ?? null,
                'timezone' => $data['timezone'] ?? null,
                'bio' => $data['bio'] ?? null,
                'theme_preference' => $data['theme_preference'],
                'status' => $data['status'],
            ]);

            $this->syncAccess($admin, $role, $permissionIds);
        });

        app(AdminUiCache::class)->flushPermissions();

        return redirect()
            ->route('admin.admin-users.index')
            ->with('success', 'Admin user created successfully.');
    }

    public function edit(Admin $adminUser): Response
    {
        $adminUser->load(['roles:id,name,slug', 'permissions:id']);

        return Inertia::render('admin/admin-users/Edit', [
            'adminUser' => [
                'id' => $adminUser->id,
                'name' => $adminUser->name,
                'email' => $adminUser->email,
                'avatar' => $adminUser->avatar,
                'phone' => $adminUser->phone,
                'phone_country' => $adminUser->phone_country,
                'job_title' => $adminUser->job_title,
                'timezone' => $adminUser->timezone,
                'bio' => $adminUser->bio,
                'theme_preference' => $adminUser->theme_preference,
                'status' => $adminUser->status,
                'last_login_at' => $adminUser->last_login_at?->toIso8601String(),
                'role' => $adminUser->primaryRole()?->only(['id', 'name', 'slug']),
                'permission_ids' => $adminUser->permissions->pluck('id')->map(fn ($id): int => (int) $id)->values()->all(),
            ],
            'roles' => $this->roles(),
            'permissionGroups' => Inertia::defer(
                fn (): array => $this->permissionGroups(),
                'admin-user-access',
            ),
            'statuses' => ['active', 'inactive'],
        ]);
    }

    public function update(AdminUserRequest $request, Admin $adminUser, AdminMediaService $media): RedirectResponse
    {
        /** @var Admin $currentAdmin */
        $currentAdmin = $request->user('admin');
        $data = $request->validated();
        $role = Role::query()->findOrFail((int) $data['role_id']);
        $permissionIds = $this->permissionIds($data);

        if ($this->isCurrentAdmin($currentAdmin, $adminUser) && $data['status'] !== 'active') {
            return back()->withErrors(['status' => 'You cannot deactivate the current session owner.']);
        }

        if ($this->isEffectiveSuperAdmin($adminUser) && ! $this->willRemainEffectiveSuperAdmin($data['status'], $role) && ! $this->hasAnotherEffectiveSuperAdmin($adminUser)) {
            return back()->withErrors(['role_id' => 'At least one active Super Admin account must remain available.']);
        }

        if ($this->isCurrentAdmin($currentAdmin, $adminUser) && ! $this->hasCriticalSelfAccess($role, $permissionIds)) {
            return back()->withErrors(['permission_ids' => 'You cannot remove your own dashboard and access-management permissions.']);
        }

        if ($scopeError = $this->accessManagementScopeError($currentAdmin, $role, $permissionIds)) {
            return back()->withErrors($scopeError);
        }

        DB::transaction(function () use ($request, $media, $currentAdmin, $adminUser, $data, $role, $permissionIds): void {
            $payload = [
                'name' => $data['name'],
                'email' => $data['email'],
                'avatar' => $media->replace($request->file('avatar'), $adminUser->avatar, 'admins/avatars', $currentAdmin),
                'phone' => $data['phone'] ?? null,
                'phone_country' => $data['phone_country'] ?? null,
                'job_title' => $data['job_title'] ?? null,
                'timezone' => $data['timezone'] ?? null,
                'bio' => $data['bio'] ?? null,
                'theme_preference' => $data['theme_preference'],
                'status' => $data['status'],
            ];

            if (! empty($data['password'])) {
                $payload['password'] = $data['password'];
            }

            $adminUser->update($payload);

            $this->syncAccess($adminUser, $role, $permissionIds);
        });

        app(AdminUiCache::class)->flushPermissions();

        return redirect()
            ->route('admin.admin-users.index')
            ->with('success', 'Admin user updated successfully.');
    }

    public function destroy(Request $request, Admin $adminUser, AdminMediaService $media): RedirectResponse
    {
        /** @var Admin $currentAdmin */
        $currentAdmin = $request->user('admin');

        if ($this->isCurrentAdmin($currentAdmin, $adminUser)) {
            return back()->with('error', 'You cannot delete the current session owner.');
        }

        if ($this->isEffectiveSuperAdmin($adminUser) && ! $this->hasAnotherEffectiveSuperAdmin($adminUser)) {
            return back()->with('error', 'At least one active Super Admin account must remain available.');
        }

        $media->delete($adminUser->avatar);
        $adminUser->delete();
        app(AdminUiCache::class)->flushPermissions();

        if ($request->headers->get('X-Inertia-Partial-Component') === 'admin/admin-users/Index') {
            return back(status: SymfonyResponse::HTTP_SEE_OTHER)
                ->with('success', 'Admin user deleted successfully.');
        }

        return redirect()
            ->route('admin.admin-users.index')
            ->with('success', 'Admin user deleted successfully.');
    }

    private function roles(): array
    {
        return app(AdminUiCache::class)->roleOptions();
    }

    private function permissionGroups(): array
    {
        return app(AdminUiCache::class)->permissionGroups();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<int>
     */
    private function permissionIds(array $data): array
    {
        return collect($data['permission_ids'] ?? [])
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @param  list<int>  $permissionIds
     * @return array<string, string>|null
     */
    private function accessManagementScopeError(Admin $currentAdmin, Role $role, array $permissionIds): ?array
    {
        if ($currentAdmin->isSuperAdmin()) {
            return null;
        }

        if ($role->isSuperAdmin()) {
            return ['role_id' => 'Only a Super Admin can assign the Super Admin role.'];
        }

        $currentPermissionIds = $currentAdmin->getAllPermissions()->pluck('id')->all();
        $rolePermissionIds = $role->permissions()->pluck('id')->all();

        if (array_diff($rolePermissionIds, $currentPermissionIds)) {
            return ['role_id' => 'You cannot assign a role with permissions outside your own access scope.'];
        }

        if (array_diff($permissionIds, $currentPermissionIds)) {
            return ['permission_ids' => 'You cannot grant direct permissions outside your own access scope.'];
        }

        return null;
    }

    /**
     * @param  list<int>  $permissionIds
     */
    private function hasCriticalSelfAccess(Role $role, array $permissionIds): bool
    {
        if ($role->isSuperAdmin()) {
            return true;
        }

        $effectivePermissions = array_unique([
            ...$role->permissions()->pluck('name')->all(),
            ...Permission::query()->whereKey($permissionIds)->pluck('name')->all(),
        ]);

        return count(array_diff(self::CRITICAL_SELF_ACCESS, $effectivePermissions)) === 0;
    }

    private function syncAccess(Admin $admin, Role $role, array $permissionIds): void
    {
        $admin->syncRoles([$role->id]);
        $admin->syncPermissions($role->isSuperAdmin() ? [] : $permissionIds);
    }

    private function isCurrentAdmin(?Admin $currentAdmin, Admin $targetAdmin): bool
    {
        return $currentAdmin?->is($targetAdmin) ?? false;
    }

    private function isEffectiveSuperAdmin(Admin $admin): bool
    {
        return $admin->status === 'active' && $admin->isSuperAdmin();
    }

    private function willRemainEffectiveSuperAdmin(string $status, Role $role): bool
    {
        return $status === 'active' && $role->isSuperAdmin();
    }

    private function hasAnotherEffectiveSuperAdmin(Admin $admin): bool
    {
        return Admin::query()
            ->whereKeyNot($admin->id)
            ->where('status', 'active')
            ->whereHas('roles', fn ($query) => $query->where('slug', Role::SUPER_ADMIN_SLUG))
            ->exists();
    }
}
