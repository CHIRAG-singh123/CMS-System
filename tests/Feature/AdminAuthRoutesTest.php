<?php

namespace Tests\Feature;

use App\Models\Admin;
use Database\Seeders\AdminSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class AdminAuthRoutesTest extends TestCase
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

    public function test_guest_can_view_admin_login_page(): void
    {
        $this->get('/admin/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('admin/auth/Login'));
    }

    public function test_guest_is_redirected_from_admin_root_and_dashboard(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
        $this->get('/admin/dashboard')->assertRedirect('/admin/login');
    }

    public function test_admin_login_redirects_to_dashboard(): void
    {
        $response = $this->post('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect('/admin/dashboard');
        $this->assertAuthenticated('admin');
    }

    public function test_authenticated_admin_is_redirected_away_from_login_and_can_access_protected_routes(): void
    {
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin, 'admin');

        $this->get('/admin/login')->assertRedirect('/admin/dashboard');
        $this->get('/admin/dashboard')->assertOk();
        $this->get('/admin/cms-pages')->assertOk();
    }

    public function test_guest_can_start_google_login(): void
    {
        config([
            'services.google.client_id' => 'google-client-id',
            'services.google.client_secret' => 'google-client-secret',
            'services.google.redirect' => '/admin/login/google/callback',
        ]);

        Socialite::fake('google');

        $this->get('/admin/login/google/redirect?remember=1')
            ->assertRedirect();
    }

    public function test_admin_can_login_with_google_using_existing_email_and_link_google_id(): void
    {
        config([
            'services.google.client_id' => 'google-client-id',
            'services.google.client_secret' => 'google-client-secret',
            'services.google.redirect' => '/admin/login/google/callback',
        ]);

        Socialite::fake('google', (new SocialiteUser())->map([
            'id' => 'google-admin-123',
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
        ]));

        $this->withSession(['admin_google_login_remember' => true])
            ->get('/admin/login/google/callback')
            ->assertRedirect('/admin/dashboard');

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($admin, 'admin');
        $this->assertSame('google-admin-123', $admin->fresh()->google_id);
    }
}
