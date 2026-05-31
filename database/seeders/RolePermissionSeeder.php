<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $roleDefinitions = [
            [
                'name' => 'Super Admin',
                'slug' => Role::SUPER_ADMIN_SLUG,
                'description' => 'Full access to the admin panel.',
                'status' => 'active',
                'grants' => '*',
            ],
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Operational admin access.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'cms_pages' => ['view', 'create', 'edit', 'delete', 'publish'],
                    'products_services' => ['view', 'create', 'edit', 'delete', 'publish'],
                    'categories' => ['view', 'create', 'edit', 'delete'],
                    'inquiries' => ['view', 'edit', 'delete', 'export'],
                    'members' => ['view', 'create', 'edit', 'delete'],
                    'testimonials' => ['view', 'create', 'edit', 'delete', 'publish'],
                    'galleries' => ['view', 'create', 'edit', 'delete', 'publish'],
                    'settings' => ['view', 'edit'],
                ],
            ],
            [
                'name' => 'Content Manager',
                'slug' => 'content-manager',
                'description' => 'Content and media management access.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'cms_pages' => ['view', 'create', 'edit', 'publish'],
                    'products_services' => ['view', 'create', 'edit', 'publish'],
                    'categories' => ['view', 'create', 'edit'],
                    'inquiries' => ['view', 'edit'],
                    'members' => ['view', 'create', 'edit'],
                    'testimonials' => ['view', 'create', 'edit', 'publish'],
                    'galleries' => ['view', 'create', 'edit', 'publish'],
                ],
            ],
            [
                'name' => 'Viewer',
                'slug' => 'viewer',
                'description' => 'Read-only admin access.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'cms_pages' => ['view'],
                    'products_services' => ['view'],
                    'categories' => ['view'],
                    'inquiries' => ['view'],
                    'members' => ['view'],
                    'testimonials' => ['view'],
                    'galleries' => ['view'],
                ],
            ],
            [
                'name' => 'Sales Manager',
                'slug' => 'sales-manager',
                'description' => 'Owns quote enquiries and product catalogue visibility.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'products_services' => ['view', 'edit', 'publish'],
                    'categories' => ['view'],
                    'inquiries' => ['view', 'edit', 'export'],
                    'testimonials' => ['view'],
                    'galleries' => ['view'],
                ],
            ],
            [
                'name' => 'Marketing Lead',
                'slug' => 'marketing-lead',
                'description' => 'Handles brand, landing pages, and showcase content.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'cms_pages' => ['view', 'create', 'edit', 'publish'],
                    'products_services' => ['view', 'edit', 'publish'],
                    'categories' => ['view'],
                    'testimonials' => ['view', 'create', 'edit', 'publish'],
                    'galleries' => ['view', 'create', 'edit', 'publish'],
                ],
            ],
            [
                'name' => 'Support Lead',
                'slug' => 'support-lead',
                'description' => 'Oversees inbound enquiries and response operations.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'inquiries' => ['view', 'edit', 'delete', 'export'],
                    'members' => ['view'],
                    'products_services' => ['view'],
                    'cms_pages' => ['view'],
                ],
            ],
            [
                'name' => 'Catalog Editor',
                'slug' => 'catalog-editor',
                'description' => 'Maintains categories and products/services.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'products_services' => ['view', 'create', 'edit', 'publish'],
                    'categories' => ['view', 'create', 'edit'],
                ],
            ],
            [
                'name' => 'SEO Editor',
                'slug' => 'seo-editor',
                'description' => 'Optimises discoverability across CMS and catalogue pages.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'cms_pages' => ['view', 'edit', 'publish'],
                    'products_services' => ['view', 'edit'],
                    'categories' => ['view'],
                ],
            ],
            [
                'name' => 'Gallery Manager',
                'slug' => 'gallery-manager',
                'description' => 'Curates gallery albums and supporting visuals.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'galleries' => ['view', 'create', 'edit', 'delete', 'publish'],
                    'testimonials' => ['view'],
                    'cms_pages' => ['view'],
                ],
            ],
            [
                'name' => 'Inquiry Operator',
                'slug' => 'inquiry-operator',
                'description' => 'Processes enquiry queue and updates workflow state.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'inquiries' => ['view', 'edit', 'export'],
                ],
            ],
            [
                'name' => 'Testimonial Editor',
                'slug' => 'testimonial-editor',
                'description' => 'Maintains social proof and client review content.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'testimonials' => ['view', 'create', 'edit', 'delete', 'publish'],
                    'galleries' => ['view'],
                    'cms_pages' => ['view'],
                ],
            ],
            [
                'name' => 'QA Reviewer',
                'slug' => 'qa-reviewer',
                'description' => 'Reviews content and media before publishing.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'cms_pages' => ['view', 'publish'],
                    'products_services' => ['view', 'publish'],
                    'testimonials' => ['view', 'publish'],
                    'galleries' => ['view', 'publish'],
                    'inquiries' => ['view'],
                ],
            ],
            [
                'name' => 'Branch Admin',
                'slug' => 'branch-admin',
                'description' => 'Runs day-to-day branch content and enquiry operations.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'cms_pages' => ['view', 'edit'],
                    'products_services' => ['view', 'edit'],
                    'categories' => ['view'],
                    'inquiries' => ['view', 'edit'],
                    'members' => ['view', 'edit'],
                    'testimonials' => ['view', 'edit'],
                    'galleries' => ['view', 'edit'],
                ],
            ],
            [
                'name' => 'Analytics Viewer',
                'slug' => 'analytics-viewer',
                'description' => 'Monitors dashboard, enquiries, and catalogue performance.',
                'status' => 'active',
                'grants' => [
                    'dashboard' => ['view'],
                    'cms_pages' => ['view'],
                    'products_services' => ['view'],
                    'categories' => ['view'],
                    'inquiries' => ['view', 'export'],
                    'testimonials' => ['view'],
                    'galleries' => ['view'],
                ],
            ],
        ];

        $roles = collect($roleDefinitions)->mapWithKeys(function (array $role) {
            $model = Role::query()->updateOrCreate(
                ['slug' => $role['slug']],
                collect($role)
                    ->except('grants')
                    ->merge(['guard_name' => 'admin'])
                    ->all(),
            );

            return [$model->slug => $model];
        });

        $permissionIdsByName = [];

        foreach (Permission::MODULES as $module) {
            foreach (Permission::ACTIONS as $action) {
                $name = "{$module}.{$action}";

                $permission = Permission::query()->updateOrCreate(
                    ['name' => $name, 'guard_name' => 'admin'],
                    [
                        'label' => Str::of($module)->replace('_', ' ')->headline().' '.Str::headline($action),
                        'module' => $module,
                        'slug' => $name,
                    ],
                );

                $permissionIdsByName[$name] = $permission->id;
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ($roleDefinitions as $role) {
            $roles[$role['slug']]->syncPermissions(
                $this->permissionIds($permissionIdsByName, $role['grants']),
            );
        }
    }

    /**
     * @param  array<string, int>  $permissionIdsByName
     * @param  array<string, list<string>>|string  $grants
     * @return list<int>
     */
    private function permissionIds(array $permissionIdsByName, array|string $grants): array
    {
        if ($grants === '*') {
            return array_values($permissionIdsByName);
        }

        return collect($grants)
            ->flatMap(function (array $actions, string $module) use ($permissionIdsByName) {
                return collect($actions)->map(
                    fn (string $action): ?int => $permissionIdsByName["{$module}.{$action}"] ?? null,
                );
            })
            ->filter()
            ->unique()
            ->map(fn (int $permissionId): int => $permissionId)
            ->all();
    }
}
