<?php

namespace App\Support;

use App\Models\Admin;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Arr;
use Throwable;

class AdminUiCache
{
    private array $resolvedVersions = [];

    private const BRANDING_VERSION_KEY = 'admin-ui:branding-version';
    private const PERMISSIONS_VERSION_KEY = 'admin-ui:permissions-version';
    private const PUBLIC_SETTINGS_VERSION_KEY = 'admin-ui:public-settings-version';
    private const PUBLIC_CMS_VERSION_KEY = 'admin-ui:public-cms-version';
    private const REFERENCE_VERSION_KEY = 'admin-ui:reference-version';
    private const PUBLIC_SETTING_KEYS = [
        'id',
        'company_name',
        'maintenance_mode',
        'maintenance_message',
        'company_address',
        'header_tagline',
        'header_cta_label',
        'header_cta_url',
        'footer_heading',
        'footer_description',
        'footer_cta_label',
        'footer_cta_url',
        'footer_copyright',
        'export_email',
        'phone',
        'phone_country',
        'whatsapp_number',
        'whatsapp_number_country',
        'whatsapp_chat_enabled',
        'map_title',
        'map_address',
        'map_embed',
        'linkedin_url',
        'facebook_url',
        'instagram_url',
    ];

    public function branding(): array
    {
        $version = $this->version(self::BRANDING_VERSION_KEY);

        /** @var array{logo:?string,logoLight:?string,logoDark:?string} $branding */
        $branding = Cache::remember(
            "admin-ui:branding:{$version}",
            now()->addMinutes(10),
            function (): array {
                $settings = null;

                try {
                    $settings = SiteSetting::query()->first(['logo_light', 'logo_dark']);
                } catch (Throwable) {
                    $settings = null;
                }

                return [
                    'logo' => null,
                    'logoLight' => $settings?->logo_light,
                    'logoDark' => $settings?->logo_dark,
                ];
            },
        );

        return $branding;
    }

    /**
     * @return array<int, array{id:int,name:string,slug:string,permission_ids:list<int>}>
     */
    public function roleOptions(): array
    {
        $version = $this->version(self::REFERENCE_VERSION_KEY);

        /** @var array<int, array{id:int,name:string,slug:string,permission_ids:list<int>}> $roles */
        $roles = Cache::remember(
            "admin-ui:roles:{$version}",
            now()->addMinutes(10),
            fn (): array => Role::query()
                ->with('permissions:id')
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(fn (Role $role): array => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                    'permission_ids' => $role->permissions
                        ->pluck('id')
                        ->map(fn ($id): int => (int) $id)
                        ->values()
                        ->all(),
                ])
                ->all(),
        );

        return $roles;
    }

    /**
     * @return array<string, array<int, array{id:int,name:string,label:?string}>>
     */
    public function permissionGroups(): array
    {
        $version = $this->version(self::REFERENCE_VERSION_KEY);

        /** @var array<string, array<int, array{id:int,name:string,label:?string}>> $groups */
        $groups = Cache::remember(
            "admin-ui:permission-groups:{$version}",
            now()->addMinutes(10),
            fn (): array => Permission::query()
                ->select(['id', 'name', 'label', 'module'])
                ->orderBy('module')
                ->orderBy('label')
                ->get()
                ->groupBy('module')
                ->map(fn ($permissions) => $permissions->map(fn (Permission $permission): array => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'label' => $permission->label,
                ])->values()->all())
                ->all(),
        );

        return $groups;
    }

    /**
     * @return list<string>
     */
    public function permissions(Admin $admin): array
    {
        $version = $this->version(self::PERMISSIONS_VERSION_KEY);

        /** @var list<string> $permissions */
        $permissions = Cache::remember(
            "admin-ui:permissions:{$admin->id}:{$version}",
            now()->addMinutes(10),
            fn (): array => $admin->getAllPermissions()->pluck('name')->values()->all(),
        );

        return $permissions;
    }

    /**
     * @return array<string, mixed>
     */
    public function publicSettings(): array
    {
        $version = $this->version(self::PUBLIC_SETTINGS_VERSION_KEY);

        /** @var array<string, mixed> $settings */
        $settings = Cache::remember(
            "admin-ui:public-settings:{$version}",
            now()->addMinutes(10),
            fn (): array => Arr::only(SiteSetting::singleton()->toArray(), self::PUBLIC_SETTING_KEYS),
        );

        return $settings;
    }

    /**
     * @return array<string, mixed>
     */
    public function publicCmsPage(string $key, FixedCmsPageService $pages): array
    {
        $pageKey = FixedCmsPageRegistry::definition($key)['key'];
        $version = $this->version(self::PUBLIC_CMS_VERSION_KEY);

        /** @var array<string, mixed> $page */
        $page = Cache::remember(
            "admin-ui:public-cms-page:{$pageKey}:{$version}",
            now()->addMinutes(10),
            fn (): array => $pages->viewData($pages->page($pageKey)),
        );

        return $page;
    }

    public function flushBranding(): void
    {
        $this->bumpVersion(self::BRANDING_VERSION_KEY);
        $this->bumpVersion(self::PUBLIC_SETTINGS_VERSION_KEY);
    }

    public function flushPermissions(): void
    {
        $this->bumpVersion(self::PERMISSIONS_VERSION_KEY);
        $this->bumpVersion(self::REFERENCE_VERSION_KEY);
    }

    public function flushPublicCms(): void
    {
        $this->bumpVersion(self::PUBLIC_CMS_VERSION_KEY);
    }

    public function brandingVersion(): int
    {
        return $this->version(self::BRANDING_VERSION_KEY);
    }

    public function permissionsVersion(): int
    {
        return $this->version(self::PERMISSIONS_VERSION_KEY);
    }

    public function hasColumn(string $table, string $column): bool
    {
        $version = $this->version(self::REFERENCE_VERSION_KEY);

        /** @var bool $hasColumn */
        $hasColumn = Cache::rememberForever(
            "admin-ui:column:{$version}:{$table}:{$column}",
            fn (): bool => Schema::hasColumn($table, $column),
        );

        return $hasColumn;
    }

    private function version(string $key): int
    {
        if (! isset($this->resolvedVersions[$key])) {
            $this->resolvedVersions[$key] = (int) Cache::get($key, 1);
        }

        return $this->resolvedVersions[$key];
    }

    private function bumpVersion(string $key): void
    {
        $nextVersion = $this->version($key) + 1;
        Cache::forever($key, $nextVersion);
        $this->resolvedVersions[$key] = $nextVersion;
    }
}
