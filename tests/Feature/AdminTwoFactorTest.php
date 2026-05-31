<?php

namespace Tests\Feature;

use App\Mail\AdminTwoFactorCodeMail;
use App\Models\Admin;
use App\Support\AdminAuthenticatorAppService;
use App\Support\AdminTwoFactorService;
use Database\Seeders\AdminSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use PragmaRX\Google2FALaravel\Google2FA;
use Tests\TestCase;

class AdminTwoFactorTest extends TestCase
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

    public function test_admin_with_two_factor_enabled_must_verify_code_before_login_completes(): void
    {
        Mail::fake();

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $admin->forceFill([
            'two_factor_enabled_at' => now(),
            'two_factor_method' => 'email',
        ])->save();

        $response = $this->post('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
            'remember' => true,
        ]);

        $response->assertRedirect('/admin/two-factor/challenge');
        $this->assertGuest('admin');
        $this->assertSame($admin->id, session(AdminTwoFactorService::LOGIN_PENDING_ID_SESSION_KEY));

        $code = null;

        Mail::assertSent(AdminTwoFactorCodeMail::class, function (AdminTwoFactorCodeMail $mail) use (&$code, $admin) {
            $code = $mail->code;

            return $mail->hasTo($admin->email);
        });

        $this->post('/admin/two-factor/challenge', [
            'code' => $code,
        ])
            ->assertRedirect('/admin/dashboard');

        $this->assertAuthenticatedAs($admin->fresh(), 'admin');
        $this->assertNull($admin->fresh()->two_factor_code_hash);
        $this->assertFalse(session()->has(AdminTwoFactorService::LOGIN_PENDING_ID_SESSION_KEY));
    }

    public function test_too_many_invalid_two_factor_attempts_invalidate_the_login_challenge(): void
    {
        Mail::fake();

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $admin->forceFill([
            'two_factor_enabled_at' => now(),
            'two_factor_method' => 'email',
        ])->save();

        $this->post('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ])->assertRedirect('/admin/two-factor/challenge');

        $validCode = null;

        Mail::assertSent(AdminTwoFactorCodeMail::class, function (AdminTwoFactorCodeMail $mail) use (&$validCode): bool {
            $validCode = $mail->code;

            return true;
        });

        $invalidCode = $validCode === '000000' ? '111111' : '000000';

        for ($attempt = 1; $attempt < Admin::TWO_FACTOR_MAX_ATTEMPTS; $attempt++) {
            $this->post('/admin/two-factor/challenge', [
                'code' => $invalidCode,
            ])->assertSessionHasErrors('code');
        }

        $this->post('/admin/two-factor/challenge', [
            'code' => $invalidCode,
        ])->assertRedirect('/admin/login');

        $this->assertGuest('admin');
        $this->assertFalse(session()->has(AdminTwoFactorService::LOGIN_PENDING_ID_SESSION_KEY));
        $this->assertNull($admin->fresh()->two_factor_code_hash);
    }

    public function test_admin_can_enable_and_disable_two_factor_from_profile(): void
    {
        Mail::fake();

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin, 'admin')
            ->post('/admin/profile/two-factor/enable/request', [
                'two_factor_current_password' => 'password',
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $enableCode = null;

        Mail::assertSent(AdminTwoFactorCodeMail::class, function (AdminTwoFactorCodeMail $mail) use (&$enableCode, $admin) {
            $enableCode = $mail->code;

            return $mail->hasTo($admin->email);
        });

        $this->actingAs($admin->fresh(), 'admin')
            ->post('/admin/profile/two-factor/enable/confirm', [
                'code' => $enableCode,
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $this->assertNotNull($admin->fresh()->two_factor_enabled_at);

        Mail::fake();

        $this->actingAs($admin->fresh(), 'admin')
            ->post('/admin/profile/two-factor/disable/request', [
                'two_factor_current_password' => 'password',
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $disableCode = null;

        Mail::assertSent(AdminTwoFactorCodeMail::class, function (AdminTwoFactorCodeMail $mail) use (&$disableCode, $admin) {
            $disableCode = $mail->code;

            return $mail->hasTo($admin->email);
        });

        $this->actingAs($admin->fresh(), 'admin')
            ->post('/admin/profile/two-factor/disable/confirm', [
                'code' => $disableCode,
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $admin->refresh();

        $this->assertNull($admin->two_factor_enabled_at);
        $this->assertNull($admin->two_factor_code_hash);
        $this->assertFalse(session()->has(AdminTwoFactorService::PROFILE_PENDING_ACTION_SESSION_KEY));
    }

    public function test_admin_can_enable_and_disable_authenticator_app_two_factor_from_profile(): void
    {
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin, 'admin')
            ->post('/admin/profile/two-factor/authenticator/enable/request', [
                'two_factor_current_password' => 'password',
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $pendingSecret = session(AdminAuthenticatorAppService::PROFILE_PENDING_SECRET_SESSION_KEY);
        $code = app(Google2FA::class)->getCurrentOtp($pendingSecret);

        $this->actingAs($admin->fresh(), 'admin')
            ->get('/admin/profile')
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/profile/Edit')
                ->where('twoFactor.pendingMethod', 'authenticator')
                ->where('twoFactor.pendingAction', 'enable')
            );

        $this->actingAs($admin->fresh(), 'admin')
            ->post('/admin/profile/two-factor/authenticator/enable/confirm', [
                'code' => $code,
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $admin->refresh();

        $this->assertTrue($admin->isAuthenticatorAppEnabled());
        $this->assertSame('authenticator', $admin->two_factor_method);
        $this->assertNotNull($admin->authenticator_secret);

        $disableCode = app(Google2FA::class)->getCurrentOtp((string) $admin->authenticator_secret);

        $this->actingAs($admin, 'admin')
            ->post('/admin/profile/two-factor/authenticator/disable/request', [
                'two_factor_current_password' => 'password',
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $this->actingAs($admin->fresh(), 'admin')
            ->post('/admin/profile/two-factor/authenticator/disable/confirm', [
                'code' => $disableCode,
            ])
            ->assertRedirect('/admin/profile')
            ->assertSessionHasNoErrors();

        $admin->refresh();

        $this->assertFalse($admin->hasTwoFactorEnabled());
        $this->assertNull($admin->two_factor_method);
        $this->assertNull($admin->authenticator_secret);
    }

    public function test_profile_page_clears_stale_legacy_two_factor_pending_session_state(): void
    {
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin, 'admin')
            ->withSession([
                AdminTwoFactorService::PROFILE_PENDING_ACTION_SESSION_KEY => 'enable',
            ])
            ->get('/admin/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/profile/Edit')
                ->where('twoFactor.pendingAction', null)
                ->where('twoFactor.pendingMethod', null)
            );

        $this->assertFalse(session()->has(AdminTwoFactorService::PROFILE_PENDING_ACTION_SESSION_KEY));
        $this->assertFalse(session()->has(AdminTwoFactorService::PROFILE_PENDING_METHOD_SESSION_KEY));
    }

    public function test_profile_page_clears_stale_authenticator_setup_without_a_pending_secret(): void
    {
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($admin, 'admin')
            ->withSession([
                AdminTwoFactorService::PROFILE_PENDING_ACTION_SESSION_KEY => 'enable',
                AdminTwoFactorService::PROFILE_PENDING_METHOD_SESSION_KEY => 'authenticator',
            ])
            ->get('/admin/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/profile/Edit')
                ->where('twoFactor.pendingAction', null)
                ->where('twoFactor.pendingMethod', null)
                ->where('twoFactor.authenticatorQrCode', null)
                ->where('twoFactor.authenticatorSecret', null)
            );

        $this->assertFalse(session()->has(AdminTwoFactorService::PROFILE_PENDING_ACTION_SESSION_KEY));
        $this->assertFalse(session()->has(AdminTwoFactorService::PROFILE_PENDING_METHOD_SESSION_KEY));
        $this->assertFalse(session()->has(AdminAuthenticatorAppService::PROFILE_PENDING_SECRET_SESSION_KEY));
    }

    public function test_admin_with_authenticator_app_enabled_must_verify_code_before_login_completes(): void
    {
        Mail::fake();

        $secret = app(Google2FA::class)->generateSecretKey(32);
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $admin->forceFill([
            'two_factor_enabled_at' => now(),
            'two_factor_method' => 'authenticator',
            'authenticator_secret' => $secret,
        ])->save();

        $response = $this->post('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
            'remember' => true,
        ]);

        $response->assertRedirect('/admin/two-factor/challenge');
        $this->assertGuest('admin');

        Mail::assertNothingSent();

        $this->get('/admin/two-factor/challenge')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/auth/TwoFactorChallenge')
                ->where('method', 'authenticator')
                ->where('maskedEmail', null)
            );

        $this->post('/admin/two-factor/challenge', [
            'code' => app(Google2FA::class)->getCurrentOtp($secret),
        ])
            ->assertRedirect('/admin/dashboard');

        $this->assertAuthenticatedAs($admin->fresh(), 'admin');
    }

    public function test_admin_with_email_two_factor_enabled_must_verify_code_after_google_login(): void
    {
        Mail::fake();

        config([
            'services.google.client_id' => 'google-client-id',
            'services.google.client_secret' => 'google-client-secret',
            'services.google.redirect' => '/admin/login/google/callback',
        ]);

        Socialite::fake('google', (new SocialiteUser())->map([
            'id' => 'google-admin-2fa-email',
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
        ]));

        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $admin->forceFill([
            'two_factor_enabled_at' => now(),
            'two_factor_method' => 'email',
        ])->save();

        $this->withSession(['admin_google_login_remember' => true])
            ->get('/admin/login/google/callback')
            ->assertRedirect('/admin/two-factor/challenge');

        $this->assertGuest('admin');
        $this->assertSame($admin->id, session(AdminTwoFactorService::LOGIN_PENDING_ID_SESSION_KEY));

        $code = null;

        Mail::assertSent(AdminTwoFactorCodeMail::class, function (AdminTwoFactorCodeMail $mail) use (&$code, $admin) {
            $code = $mail->code;

            return $mail->hasTo($admin->email);
        });

        $this->post('/admin/two-factor/challenge', [
            'code' => $code,
        ])->assertRedirect('/admin/dashboard');

        $this->assertAuthenticatedAs($admin->fresh(), 'admin');
    }

    public function test_admin_with_authenticator_two_factor_must_verify_code_after_google_login(): void
    {
        Mail::fake();

        config([
            'services.google.client_id' => 'google-client-id',
            'services.google.client_secret' => 'google-client-secret',
            'services.google.redirect' => '/admin/login/google/callback',
        ]);

        Socialite::fake('google', (new SocialiteUser())->map([
            'id' => 'google-admin-2fa-authenticator',
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
        ]));

        $secret = app(Google2FA::class)->generateSecretKey(32);
        $admin = Admin::query()->where('email', 'admin@example.com')->firstOrFail();
        $admin->forceFill([
            'two_factor_enabled_at' => now(),
            'two_factor_method' => 'authenticator',
            'authenticator_secret' => $secret,
        ])->save();

        $this->withSession(['admin_google_login_remember' => false])
            ->get('/admin/login/google/callback')
            ->assertRedirect('/admin/two-factor/challenge');

        Mail::assertNothingSent();

        $this->get('/admin/two-factor/challenge')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/auth/TwoFactorChallenge')
                ->where('method', 'authenticator')
                ->where('maskedEmail', null)
            );

        $this->post('/admin/two-factor/challenge', [
            'code' => app(Google2FA::class)->getCurrentOtp($secret),
        ])->assertRedirect('/admin/dashboard');

        $this->assertAuthenticatedAs($admin->fresh(), 'admin');
    }
}
