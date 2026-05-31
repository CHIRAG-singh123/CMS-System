<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginRequest;
use App\Models\Admin;
use App\Models\SiteSetting;
use App\Support\AdminTwoFactorService;
use GuzzleHttp\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Throwable;

class AuthController extends Controller
{
    private const GOOGLE_REMEMBER_SESSION_KEY = 'admin_google_login_remember';

    public function create(Request $request, AdminTwoFactorService $twoFactor): Response|RedirectResponse
    {
        if ($twoFactor->pendingLoginAdminId($request)) {
            return redirect()->route('admin.two-factor.challenge');
        }

        return Inertia::render('admin/auth/Login', [
            'canResetPassword' => true,
            'googleLoginEnabled' => $this->googleLoginEnabled() && $this->googleLoginConfigured(),
            'status' => session('status'),
            'error' => session('error'),
        ]);
    }

    public function store(LoginRequest $request, AdminTwoFactorService $twoFactor): RedirectResponse
    {
        $admin = $request->authenticateAdmin();
        $remember = $request->boolean('remember');

        return $this->completeAdminLogin($request, $admin, $remember, $twoFactor);
    }

    public function redirectToGoogle(Request $request): RedirectResponse
    {
        if (! $this->googleLoginEnabled()) {
            return redirect()
                ->route('admin.login')
                ->with('error', 'Google login is currently disabled.');
        }

        if (! $this->googleLoginConfigured()) {
            return redirect()
                ->route('admin.login')
                ->with('error', 'Google login is not configured yet.');
        }

        $request->session()->put(self::GOOGLE_REMEMBER_SESSION_KEY, $request->boolean('remember'));

        return $this->googleProvider()->redirect();
    }

    public function handleGoogleCallback(Request $request, AdminTwoFactorService $twoFactor): RedirectResponse
    {
        if (! $this->googleLoginEnabled()) {
            return redirect()
                ->route('admin.login')
                ->with('error', 'Google login is currently disabled.');
        }

        if (! $this->googleLoginConfigured()) {
            return redirect()
                ->route('admin.login')
                ->with('error', 'Google login is not configured yet.');
        }

        try {
            $googleUser = $this->googleProvider()->user();
        } catch (InvalidStateException $exception) {
            report($exception);

            try {
                $googleUser = $this->googleProvider(stateless: true)->user();
            } catch (Throwable $fallbackException) {
                report($fallbackException);
                $request->session()->forget(self::GOOGLE_REMEMBER_SESSION_KEY);

                return redirect()
                    ->route('admin.login')
                    ->with('error', 'Google sign-in could not be completed. Please try again.');
            }
        } catch (Throwable $exception) {
            report($exception);
            $request->session()->forget(self::GOOGLE_REMEMBER_SESSION_KEY);

            return redirect()
                ->route('admin.login')
                ->with('error', 'Google sign-in could not be completed. Please try again.');
        }

        $googleId = trim((string) $googleUser->getId());
        $googleEmail = Str::lower(trim((string) ($googleUser->getEmail() ?? '')));

        if ($googleId === '' || $googleEmail === '') {
            $request->session()->forget(self::GOOGLE_REMEMBER_SESSION_KEY);

            return redirect()
                ->route('admin.login')
                ->with('error', 'Your Google account did not return a usable email address.');
        }

        $admin = Admin::query()
            ->where('google_id', $googleId)
            ->first();

        if (! $admin) {
            $admin = Admin::query()
                ->where('email', $googleEmail)
                ->first();

            if (! $admin) {
                $request->session()->forget(self::GOOGLE_REMEMBER_SESSION_KEY);

                return redirect()
                    ->route('admin.login')
                    ->with('error', 'No active admin account matches this Google email address.');
            }

            if (filled($admin->google_id) && $admin->google_id !== $googleId) {
                $request->session()->forget(self::GOOGLE_REMEMBER_SESSION_KEY);

                return redirect()
                    ->route('admin.login')
                    ->with('error', 'This admin account is already linked to a different Google account.');
            }

            $admin->forceFill([
                'google_id' => $googleId,
            ])->save();
        }

        if ($admin->status !== 'active') {
            $request->session()->forget(self::GOOGLE_REMEMBER_SESSION_KEY);

            return redirect()
                ->route('admin.login')
                ->with('error', 'Only active admin accounts can sign in.');
        }

        $remember = (bool) $request->session()->pull(self::GOOGLE_REMEMBER_SESSION_KEY, false);

        return $this->completeAdminLogin($request, $admin, $remember, $twoFactor);
    }

    public function destroy(Request $request, AdminTwoFactorService $twoFactor): RedirectResponse
    {
        Auth::guard('admin')->logout();
        $twoFactor->clearLoginChallengeSession($request);
        $twoFactor->clearProfilePendingAction($request);
        $request->session()->forget(self::GOOGLE_REMEMBER_SESSION_KEY);

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('admin.login')
            ->with('success', 'Logged out successfully.');
    }

    private function completeAdminLogin(
        Request $request,
        Admin $admin,
        bool $remember,
        AdminTwoFactorService $twoFactor,
    ): RedirectResponse {
        $twoFactor->clearLoginChallengeSession($request);

        if ($admin->hasTwoFactorEnabled()) {
            $twoFactor->startLoginChallengeSession($request, $admin, $remember);

            if ($admin->isEmailTwoFactorEnabled()) {
                $twoFactor->sendChallenge($admin);

                return redirect()
                    ->route('admin.two-factor.challenge')
                    ->with('success', 'A verification code has been sent to your email address.');
            }

            return redirect()
                ->route('admin.two-factor.challenge');
        }

        Auth::guard('admin')->login($admin, $remember);

        $request->session()->regenerate();

        $admin->forceFill(['last_login_at' => now()])->save();

        return redirect()
            ->intended(route('admin.dashboard'))
            ->with('success', sprintf('Welcome back, %s!', $admin->name));
    }

    private function googleLoginConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'))
            && filled(config('services.google.redirect'));
    }

    private function googleLoginEnabled(): bool
    {
        return (bool) (SiteSetting::query()->value('google_login_enabled') ?? true);
    }

    private function googleProvider(bool $stateless = false)
    {
        $provider = Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->with(['prompt' => 'select_account']);

        if ($stateless) {
            $provider->stateless();
        }

        $caBundle = config('services.google.ca_bundle');
        $httpVerify = config('services.google.http_verify', true);
        $clientOptions = [];

        if (is_string($caBundle) && $caBundle !== '') {
            $clientOptions['verify'] = $caBundle;
        } elseif ($httpVerify === false) {
            $clientOptions['verify'] = false;
        }

        if ($clientOptions !== []) {
            $provider->setHttpClient(new Client($clientOptions));
        }

        return $provider;
    }
}
