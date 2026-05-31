<?php

namespace Tests\Feature;

use App\Mail\AdminTwoFactorCodeMail;
use App\Models\Admin;
use App\Notifications\AdminResetPassword;
use Database\Seeders\AdminSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminPasswordResetTest extends TestCase
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

    public function test_guest_can_view_admin_forgot_password_page(): void
    {
        $this->get('/admin/forgot-password')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('admin/auth/ForgotPassword'));
    }

    public function test_admin_login_page_exposes_forgot_password_support(): void
    {
        $this->get('/admin/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/auth/Login')
                ->where('canResetPassword', true)
            );
    }

    public function test_active_admin_can_request_a_reset_link(): void
    {
        Notification::fake();

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->post('/admin/forgot-password', [
            'email' => $admin->email,
        ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        Notification::assertSentTo($admin, AdminResetPassword::class);
    }

    public function test_unknown_email_cannot_request_a_reset_link(): void
    {
        Notification::fake();

        $this->from('/admin/forgot-password')
            ->post('/admin/forgot-password', [
                'email' => 'missing@example.com',
            ])
            ->assertRedirect('/admin/forgot-password')
            ->assertSessionHasErrors('email');

        Notification::assertNothingSent();
    }

    public function test_inactive_admin_cannot_request_a_reset_link(): void
    {
        Notification::fake();

        $admin = Admin::query()->create([
            'name' => 'Inactive Admin',
            'email' => 'inactive-admin@example.com',
            'password' => 'password',
            'status' => 'inactive',
        ]);

        $this->from('/admin/forgot-password')
            ->post('/admin/forgot-password', [
                'email' => $admin->email,
            ])
            ->assertRedirect('/admin/forgot-password')
            ->assertSessionHasErrors('email');

        Notification::assertNothingSent();
    }

    public function test_reset_password_screen_can_be_rendered_from_the_notification_token(): void
    {
        Notification::fake();

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->post('/admin/forgot-password', [
            'email' => $admin->email,
        ]);

        Notification::assertSentTo($admin, AdminResetPassword::class, function (AdminResetPassword $notification) use ($admin): bool {
            $response = $this->get('/admin/reset-password/'.$notification->token.'?email='.urlencode($admin->email));

            $response->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('admin/auth/ResetPassword')
                    ->where('email', $admin->email)
                    ->where('token', $notification->token)
                );

            return true;
        });
    }

    public function test_password_can_be_reset_with_a_valid_token_and_old_password_stops_working(): void
    {
        Notification::fake();

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $newPassword = 'new-password-123';

        $this->post('/admin/forgot-password', [
            'email' => $admin->email,
        ]);

        Notification::assertSentTo($admin, AdminResetPassword::class, function (AdminResetPassword $notification) use ($admin, $newPassword): bool {
            $this->post('/admin/reset-password', [
                'token' => $notification->token,
                'email' => $admin->email,
                'password' => $newPassword,
                'password_confirmation' => $newPassword,
            ])
                ->assertRedirect('/admin/login')
                ->assertSessionHasNoErrors();

            return true;
        });

        $this->post('/admin/login', [
            'email' => $admin->email,
            'password' => 'password',
        ])
            ->assertSessionHasErrors('email');

        $this->assertGuest('admin');

        $this->post('/admin/login', [
            'email' => $admin->email,
            'password' => $newPassword,
        ])
            ->assertRedirect('/admin/dashboard');
    }

    public function test_admin_with_two_factor_enabled_still_gets_the_challenge_after_password_reset(): void
    {
        Notification::fake();
        Mail::fake();

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $admin->forceFill([
            'two_factor_enabled_at' => now(),
            'two_factor_method' => 'email',
        ])->save();

        $newPassword = 'two-factor-reset-123';

        $this->post('/admin/forgot-password', [
            'email' => $admin->email,
        ]);

        Notification::assertSentTo($admin, AdminResetPassword::class, function (AdminResetPassword $notification) use ($admin, $newPassword): bool {
            $this->post('/admin/reset-password', [
                'token' => $notification->token,
                'email' => $admin->email,
                'password' => $newPassword,
                'password_confirmation' => $newPassword,
            ])
                ->assertRedirect('/admin/login')
                ->assertSessionHasNoErrors();

            return true;
        });

        $this->post('/admin/login', [
            'email' => $admin->email,
            'password' => $newPassword,
        ])
            ->assertRedirect('/admin/two-factor/challenge');

        Mail::assertSent(AdminTwoFactorCodeMail::class, fn (AdminTwoFactorCodeMail $mail) => $mail->hasTo($admin->email));
    }
}
