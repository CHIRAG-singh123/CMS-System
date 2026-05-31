<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Member;
use App\Models\Permission;
use App\Models\Role;
use Database\Seeders\AdminSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUsersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->seed([
            RolePermissionSeeder::class,
            AdminSeeder::class,
        ]);
    }

    public function test_super_admin_can_create_admin_user_with_one_role_and_direct_permission_override(): void
    {
        $superAdmin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $viewerRole = Role::query()->where('slug', 'viewer')->firstOrFail();
        $directPermission = Permission::query()->where('name', 'settings.view')->firstOrFail();

        $this->actingAs($superAdmin, 'admin')
            ->post('/admin/admin-users', [
                'name' => 'Access Analyst',
                'email' => 'access-analyst@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'phone' => '+91-9000000000',
                'job_title' => 'Access Analyst',
                'timezone' => 'UTC',
                'bio' => 'Handles access reviews.',
                'theme_preference' => 'dark',
                'status' => 'active',
                'role_id' => $viewerRole->id,
                'permission_ids' => [$directPermission->id],
            ])
            ->assertRedirect('/admin/admin-users')
            ->assertSessionHasNoErrors();

        $adminUser = Admin::query()->where('email', 'access-analyst@example.com')->firstOrFail();

        $this->assertTrue($adminUser->hasRole($viewerRole));
        $this->assertTrue($adminUser->hasDirectPermission($directPermission));
    }

    public function test_current_session_owner_cannot_deactivate_self_via_admin_users_module(): void
    {
        $superAdmin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $superAdminRole = Role::query()->where('slug', Role::SUPER_ADMIN_SLUG)->firstOrFail();

        $this->actingAs($superAdmin, 'admin')
            ->put("/admin/admin-users/{$superAdmin->id}", [
                'name' => $superAdmin->name,
                'email' => $superAdmin->email,
                'phone' => $superAdmin->phone,
                'job_title' => $superAdmin->job_title,
                'timezone' => $superAdmin->timezone,
                'bio' => $superAdmin->bio,
                'theme_preference' => $superAdmin->theme_preference,
                'status' => 'inactive',
                'role_id' => $superAdminRole->id,
                'permission_ids' => [],
            ])
            ->assertSessionHasErrors('status');
    }

    public function test_last_effective_super_admin_cannot_be_deleted(): void
    {
        $superAdminRole = Role::query()->where('slug', Role::SUPER_ADMIN_SLUG)->firstOrFail();
        $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
        $deletePermissionIds = Permission::query()
            ->whereIn('name', ['dashboard.view', 'admin_users.view', 'admin_users.delete'])
            ->pluck('id')
            ->all();

        $seededSuperAdmin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $seededSuperAdmin->syncRoles([$adminRole->id]);
        $seededSuperAdmin->syncPermissions([]);

        $operatorRole = Role::query()->create([
            'name' => 'Access Operator',
            'guard_name' => 'admin',
            'slug' => 'access-operator',
            'status' => 'active',
        ]);
        $operatorRole->syncPermissions($deletePermissionIds);

        $operator = Admin::query()->create([
            'name' => 'Access Operator',
            'email' => 'operator@example.com',
            'password' => 'password',
            'status' => 'active',
            'theme_preference' => 'dark',
        ]);
        $operator->syncRoles([$operatorRole->id]);

        $target = Admin::query()->create([
            'name' => 'Platform Owner',
            'email' => 'platform-owner@example.com',
            'password' => 'password',
            'status' => 'active',
            'theme_preference' => 'dark',
        ]);
        $target->syncRoles([$superAdminRole->id]);

        $this->actingAs($operator, 'admin')
            ->delete("/admin/admin-users/{$target->id}")
            ->assertSessionHas('error', 'At least one active Super Admin account must remain available.');

        $this->assertDatabaseHas('admins', ['id' => $target->id]);
    }

    public function test_member_can_be_created_with_role_assignment(): void
    {
        $superAdmin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $viewerRole = Role::query()->where('slug', 'viewer')->firstOrFail();

        $this->actingAs($superAdmin, 'admin')
            ->post('/admin/members', [
                'name' => 'Public Member',
                'designation' => 'Team Lead',
                'short_bio' => 'Public facing profile.',
                'email' => 'public-member@example.com',
                'phone' => '+91-8111111111',
                'linkedin' => 'https://www.linkedin.com/in/public-member',
                'twitter' => 'https://x.com/public-member',
                'instagram' => 'https://instagram.com/public-member',
                'role_id' => $viewerRole->id,
                'status' => 'active',
                'sort_order' => 4,
            ])
            ->assertRedirect('/admin/members')
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('members', [
            'name' => 'Public Member',
            'designation' => 'Team Lead',
        ]);

        $member = Member::query()->where('email', 'public-member@example.com')->firstOrFail();

        $this->assertSame(4, $member->sort_order);
        $this->assertSame($viewerRole->id, $member->role_id);
    }

    public function test_role_with_assigned_members_cannot_be_deleted(): void
    {
        $superAdmin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $assignedRole = Role::query()->where('slug', 'viewer')->firstOrFail();

        Member::query()->create([
            'name' => 'Assigned Member',
            'designation' => 'Coordinator',
            'email' => 'assigned-member@example.com',
            'role_id' => $assignedRole->id,
            'status' => 'active',
            'sort_order' => 1,
        ]);

        $this->actingAs($superAdmin, 'admin')
            ->delete("/admin/roles-permissions/roles/{$assignedRole->id}")
            ->assertSessionHas('error', 'Reassign admins and members before deleting this role.');

        $this->assertDatabaseHas('roles', ['id' => $assignedRole->id]);
    }
}
