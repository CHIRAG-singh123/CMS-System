<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminTwoFactorCodeRequest;
use App\Models\Admin;
use App\Support\AdminAuthenticatorAppService;
use App\Support\AdminTwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request, AdminTwoFactorService $twoFactor): Response|RedirectResponse
    {
        if (Auth::guard('admin')->check()) {
            return redirect()->route('admin.dashboard');
        }

        $admin = $this->pendingAdmin($request, $twoFactor);

        if (! $admin || ! $admin->hasTwoFactorEnabled()) {
            $twoFactor->clearLoginChallengeSession($request);

            return redirect()
                ->route('admin.login')
                ->with('error', 'Please sign in again to continue.');
        }

        if ($admin->isEmailTwoFactorEnabled() && ! $admin->two_factor_code_expires_at?->isFuture()) {
            $admin->clearTwoFactorChallenge();
            $twoFactor->clearLoginChallengeSession($request);

            return redirect()
                ->route('admin.login')
                ->with('error', 'Your verification code expired. Please sign in again.');
        }

        return Inertia::render('admin/auth/TwoFactorChallenge', [
            'method' => $admin->isAuthenticatorAppEnabled() ? 'authenticator' : 'email',
            'maskedEmail' => $admin->isEmailTwoFactorEnabled() ? $twoFactor->maskEmail($admin->email) : null,
        ]);
    }

    public function store(
        AdminTwoFactorCodeRequest $request,
        AdminTwoFactorService $twoFactor,
        AdminAuthenticatorAppService $authenticator,
    ): RedirectResponse
    {
        $admin = $this->pendingAdmin($request, $twoFactor);

        if (! $admin || ! $admin->hasTwoFactorEnabled()) {
            $twoFactor->clearLoginChallengeSession($request);

            return redirect()
                ->route('admin.login')
                ->with('error', 'Please sign in again to continue.');
        }

        if ($admin->isEmailTwoFactorEnabled() && ! $admin->two_factor_code_expires_at?->isFuture()) {
            $admin->clearTwoFactorChallenge();
            $twoFactor->clearLoginChallengeSession($request);

            return redirect()
                ->route('admin.login')
                ->with('error', 'Your verification code expired. Please sign in again.');
        }

        $code = $request->string('code')->toString();

        if ($admin->isEmailTwoFactorEnabled() && ! $admin->hasValidTwoFactorCode($code)) {
            $attempts = $admin->incrementTwoFactorAttempts();

            if ($attempts >= Admin::TWO_FACTOR_MAX_ATTEMPTS) {
                $admin->clearTwoFactorChallenge();
                $twoFactor->clearLoginChallengeSession($request);

                return redirect()
                    ->route('admin.login')
                    ->with('error', 'Too many invalid verification attempts. Please sign in again.');
            }

            return back()->withErrors([
                'code' => 'The verification code is invalid.',
            ]);
        }

        if ($admin->isAuthenticatorAppEnabled() && ! $authenticator->verifyCode((string) $admin->authenticator_secret, $code)) {
            return back()->withErrors([
                'code' => 'The authenticator code is invalid.',
            ]);
        }

        $remember = (bool) $request->session()->get(AdminTwoFactorService::LOGIN_PENDING_REMEMBER_SESSION_KEY, false);

        $admin->clearTwoFactorChallenge();
        $twoFactor->clearLoginChallengeSession($request);

        Auth::guard('admin')->login($admin, $remember);

        $request->session()->regenerate();

        $admin->forceFill([
            'last_login_at' => now(),
        ])->save();

        return redirect()
            ->intended(route('admin.dashboard'))
            ->with('success', sprintf('Welcome back, %s!', $admin->name));
    }

    public function resend(Request $request, AdminTwoFactorService $twoFactor): RedirectResponse
    {
        $admin = $this->pendingAdmin($request, $twoFactor);

        if (! $admin || ! $admin->hasTwoFactorEnabled()) {
            $twoFactor->clearLoginChallengeSession($request);

            return redirect()
                ->route('admin.login')
                ->with('error', 'Please sign in again to continue.');
        }

        if (! $admin->isEmailTwoFactorEnabled()) {
            return back()->with('error', 'Resend is only available for email verification codes.');
        }

        if (! $admin->canResendTwoFactorCode()) {
            return back()->with('error', 'Please wait at least 60 seconds before requesting another code.');
        }

        $twoFactor->sendChallenge($admin);

        return back()->with('success', 'A new verification code has been sent to your email address.');
    }

    private function pendingAdmin(Request $request, AdminTwoFactorService $twoFactor): ?Admin
    {
        $pendingAdminId = $twoFactor->pendingLoginAdminId($request);

        if (! $pendingAdminId) {
            return null;
        }

        return Admin::query()->find($pendingAdminId);
    }
}
