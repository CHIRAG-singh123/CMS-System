<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\CmsPage;
use App\Models\Role;
use App\Models\SiteSetting;
use App\Support\ThemeManager;
use Database\Seeders\AdminSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminProfileTest extends TestCase
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

    public function test_guest_is_redirected_from_admin_profile(): void
    {
        $this->get('/admin/profile')->assertRedirect('/admin/login');
    }

    public function test_authenticated_admin_can_view_profile_without_module_permissions(): void
    {
        $role = Role::query()->create([
            'name' => 'Support',
            'guard_name' => 'admin',
            'slug' => 'support',
            'status' => 'active',
        ]);

        $admin = Admin::query()->create([
            'name' => 'Support Admin',
            'email' => 'support@example.com',
            'password' => 'password',
            'status' => 'active',
        ]);

        $admin->syncRoles([$role->id]);

        $this->actingAs($admin, 'admin')
            ->get('/admin/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('admin/profile/Edit'));
    }

    public function test_admin_can_update_profile_information(): void
    {
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin, 'admin')
            ->put('/admin/profile', [
                'name' => 'Updated Admin',
                'email' => 'updated-admin@example.com',
                'phone' => '+91-9999999999',
                'job_title' => 'Platform Administrator',
                'timezone' => 'Asia/Kolkata',
                'bio' => 'Owns the reusable admin workspace.',
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $admin->refresh();

        $this->assertSame('Updated Admin', $admin->name);
        $this->assertSame('updated-admin@example.com', $admin->email);
        $this->assertSame('+91-9999999999', $admin->phone);
        $this->assertSame('Platform Administrator', $admin->job_title);
        $this->assertSame('Asia/Kolkata', $admin->timezone);
        $this->assertSame('Owns the reusable admin workspace.', $admin->bio);
    }

    public function test_admin_can_upload_and_remove_avatar(): void
    {
        Storage::fake('public');

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin, 'admin')
            ->post('/admin/profile/avatar', [
                'avatar' => UploadedFile::fake()->image('avatar.webp', 200, 200),
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $admin->refresh();

        $this->assertNotNull($admin->avatar);
        Storage::disk('public')->assertExists($admin->avatar);

        $avatarPath = $admin->avatar;

        $this->actingAs($admin->fresh(), 'admin')
            ->delete('/admin/profile/avatar')
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $this->assertNull($admin->fresh()->avatar);
        Storage::disk('public')->assertMissing($avatarPath);
    }

    public function test_admin_can_update_password_and_stay_authenticated(): void
    {
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin, 'admin')
            ->put('/admin/profile/password', [
                'current_password' => 'password',
                'password' => 'new-password-123',
                'password_confirmation' => 'new-password-123',
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $this->assertAuthenticated('admin');
        $this->assertTrue(Hash::check('new-password-123', $admin->fresh()->password));
    }

    public function test_theme_shared_prop_uses_default_dark_mode_without_cookie(): void
    {
        $this->get('/admin/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('theme.mode', ThemeManager::DARK_MODE));
    }

    public function test_theme_shared_prop_uses_cookie_for_guest_pages(): void
    {
        $this->withCookie(ThemeManager::COOKIE_NAME, ThemeManager::LIGHT_MODE)
            ->get('/admin/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('theme.mode', ThemeManager::LIGHT_MODE));
    }

    public function test_admin_can_update_theme_preference_and_it_overrides_cookie_on_reload(): void
    {
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin, 'admin')
            ->from('/admin/profile')
            ->put('/admin/profile/theme', [
                'theme_preference' => ThemeManager::LIGHT_MODE,
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors()
            ->assertCookie(ThemeManager::COOKIE_NAME);

        $this->assertSame(ThemeManager::LIGHT_MODE, $admin->fresh()->theme_preference);

        $this->withCookie(ThemeManager::COOKIE_NAME, ThemeManager::DARK_MODE)
            ->actingAs($admin->fresh(), 'admin')
            ->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('theme.mode', ThemeManager::LIGHT_MODE));
    }

    public function test_super_admin_can_upload_and_remove_light_and_dark_sidebar_logos(): void
    {
        Storage::fake('public');

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin, 'admin')
            ->post('/admin/settings', [
                '_method' => 'PUT',
                'logo_light' => UploadedFile::fake()->create('sidebar-logo-light.svg', 64, 'image/svg+xml'),
                'logo_dark' => UploadedFile::fake()->image('sidebar-logo-dark.png', 200, 200),
            ])
            ->assertRedirect('/admin/settings')
            ->assertSessionHasNoErrors();

        $settings = SiteSetting::query()->firstOrFail();

        $this->assertNotNull($settings->logo_light);
        $this->assertNotNull($settings->logo_dark);
        Storage::disk('public')->assertExists($settings->logo_light);
        Storage::disk('public')->assertExists($settings->logo_dark);

        $storedLightLogo = $settings->logo_light;
        $storedDarkLogo = $settings->logo_dark;

        $this->actingAs($admin, 'admin')
            ->get('/admin/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('branding.logoLight', $storedLightLogo)
                ->where('branding.logoDark', $storedDarkLogo));

        $this->actingAs($admin, 'admin')
            ->put('/admin/settings', ['remove_logo_light' => true])
            ->assertRedirect('/admin/settings')
            ->assertSessionHasNoErrors();

        $settings->refresh();

        $this->assertNull($settings->logo_light);
        $this->assertSame($storedDarkLogo, $settings->logo_dark);
        Storage::disk('public')->assertMissing($storedLightLogo);
        Storage::disk('public')->assertExists($storedDarkLogo);

        $this->actingAs($admin, 'admin')
            ->put('/admin/settings', ['remove_logo_dark' => true])
            ->assertRedirect('/admin/settings')
            ->assertSessionHasNoErrors();

        $this->assertNull($settings->fresh()->logo_dark);
        Storage::disk('public')->assertMissing($storedDarkLogo);
    }

    public function test_non_super_admin_cannot_update_sidebar_logo(): void
    {
        Storage::fake('public');

        $role = Role::query()->create([
            'name' => 'Support',
            'guard_name' => 'admin',
            'slug' => 'support',
            'status' => 'active',
        ]);

        $admin = Admin::query()->create([
            'name' => 'Support Admin',
            'email' => 'support@example.com',
            'password' => 'password',
            'status' => 'active',
        ]);

        $admin->syncRoles([$role->id]);

        $this->actingAs($admin, 'admin')
            ->post('/admin/settings', [
                '_method' => 'PUT',
                'logo_light' => UploadedFile::fake()->create('sidebar-logo.svg', 64, 'image/svg+xml'),
            ])
            ->assertForbidden();
    }

    public function test_dashboard_shares_recently_updated_pages_in_descending_order(): void
    {
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $olderPage = CmsPage::query()->create([
            'title' => 'Older page',
            'slug' => 'older-page',
            'page_key' => 'older-page',
            'status' => 'published',
            'sort_order' => 1,
            'sections_json' => [],
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        $newerPage = CmsPage::query()->create([
            'title' => 'Newer page',
            'slug' => 'newer-page',
            'page_key' => 'newer-page',
            'status' => 'published',
            'sort_order' => 2,
            'sections_json' => [],
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
        ]);

        CmsPage::query()->whereKey($olderPage->id)->update(['updated_at' => now()->subDays(2)]);
        CmsPage::query()->whereKey($newerPage->id)->update(['updated_at' => now()->subHour()]);

        $this->actingAs($admin, 'admin')
            ->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('recentCmsPages', 2)
                ->where('recentCmsPages.0.title', 'Newer page')
                ->where('recentCmsPages.1.title', 'Older page'));
    }

    public function test_admin_can_log_out_other_sessions_without_losing_current_session(): void
    {
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $originalPasswordHash = $admin->password;

        $this->actingAs($admin, 'admin')
            ->post('/admin/profile/logout-other-sessions', [
                'current_password' => 'password',
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $this->assertAuthenticated('admin');
        $this->assertNotSame($originalPasswordHash, $admin->fresh()->password);
    }
}
