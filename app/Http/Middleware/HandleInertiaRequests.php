<?php

namespace App\Http\Middleware;

use App\Support\AdminUiCache;
use App\Support\ThemeManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $isAdminRequest = $request->is('admin') || $request->is('admin/*');
        $admin = $isAdminRequest ? Auth::guard('admin')->user() : null;
        $uiCache = app(AdminUiCache::class);
        $themeAdmin = $isAdminRequest ? $admin : null;
        $themeScope = $isAdminRequest ? ThemeManager::SCOPE_ADMIN : ThemeManager::SCOPE_PUBLIC;

        return [
            ...parent::share($request),
            'auth' => Inertia::once(fn (): array => [
                'admin' => $admin ? (function () use ($admin, $uiCache): array {
                    $admin->loadMissing('roles:id,name,slug');

                    $role = $admin->roles->sortBy('name')->first();
                    $permissions = $uiCache->permissions($admin);

                    return [
                        'id' => $admin->id,
                        'name' => $admin->name,
                        'email' => $admin->email,
                        'avatar' => $admin->avatar,
                        'phone' => $admin->phone,
                        'phone_country' => $admin->phone_country,
                        'job_title' => $admin->job_title,
                        'timezone' => $admin->timezone,
                        'bio' => $admin->bio,
                        'status' => $admin->status,
                        'last_login_at' => $admin->last_login_at?->toIso8601String(),
                        'role' => $role?->only(['id', 'name', 'slug']),
                        'permissions' => $role?->slug === 'super-admin'
                            ? ['*', ...$permissions]
                            : $permissions,
                    ];
                })() : null,
            ])->as($admin ? "auth.admin:{$admin->id}:{$admin->updated_at?->timestamp}:{$uiCache->permissionsVersion()}" : 'auth.admin:guest'),
            'branding' => Inertia::once(fn (): array => $uiCache->branding())->as("branding:{$uiCache->brandingVersion()}"),
            'theme' => fn (): array => [
                'mode' => app(ThemeManager::class)->resolve($request, $themeAdmin, $themeScope),
                'scope' => $themeScope,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
