<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminAvatarUpdateRequest;
use App\Http\Requests\Admin\AdminLogoutOtherSessionsRequest;
use App\Http\Requests\Admin\AdminPasswordUpdateRequest;
use App\Http\Requests\Admin\AdminProfileUpdateRequest;
use App\Http\Requests\Admin\AdminThemePreferenceUpdateRequest;
use App\Http\Requests\Admin\AdminTwoFactorActionRequest;
use App\Http\Requests\Admin\AdminTwoFactorCodeRequest;
use App\Models\Admin;
use App\Models\SiteSetting;
use App\Support\AdminAuthenticatorAppService;
use App\Support\AdminMediaService;
use App\Support\AdminTwoFactorService;
use App\Support\ThemeManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class ProfileController extends Controller
{
    public function edit(
        Request $request,
        AdminTwoFactorService $twoFactor,
        AdminAuthenticatorAppService $authenticator,
    ): Response
    {
        /** @var Admin $admin */
        $admin = Auth::guard('admin')->user();
        $pendingAction = $twoFactor->profilePendingAction($request);
        $pendingMethod = $twoFactor->profilePendingMethod($request);
        $pendingSecret = $pendingMethod === 'authenticator' ? $authenticator->pendingSecret($request) : null;

        if ($pendingAction && ! $pendingMethod) {
            $twoFactor->clearProfilePendingAction($request);
            $pendingAction = null;
        }

        if ($pendingMethod === 'authenticator' && $pendingAction === 'enable' && ! $pendingSecret) {
            $twoFactor->clearProfilePendingAction($request);
            $authenticator->clearPendingSecret($request);
            $pendingAction = null;
            $pendingMethod = null;
        }

        return Inertia::render('admin/profile/Edit', [
            'googleLoginEnabled' => SiteSetting::query()->value('google_login_enabled') ?? true,
            'sessionContext' => $this->currentSessionContext($request, $admin),
            'twoFactor' => [
                'emailEnabled' => $admin->isEmailTwoFactorEnabled(),
                'authenticatorEnabled' => $admin->isAuthenticatorAppEnabled(),
                'enabledMethod' => $admin->hasTwoFactorEnabled() ? $admin->two_factor_method : null,
                'pendingAction' => $pendingAction,
                'pendingMethod' => $pendingMethod,
                'maskedEmail' => $twoFactor->maskEmail($admin->email),
                'authenticatorQrCode' => $pendingSecret ? $authenticator->qrCodeInline($admin, $pendingSecret) : null,
                'authenticatorSecret' => $pendingSecret,
            ],
        ]);
    }

    public function update(AdminProfileUpdateRequest $request): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        $admin->fill($request->validated());
        $admin->save();

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(AdminPasswordUpdateRequest $request): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        $admin->forceFill([
            'password' => Hash::make($request->string('password')->toString()),
        ])->save();

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'Password updated successfully.');
    }

    public function updateAvatar(AdminAvatarUpdateRequest $request, AdminMediaService $media): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        $admin->forceFill([
            'avatar' => $media->replace($request->file('avatar'), $admin->avatar, 'admins/avatars', $admin),
        ])->save();

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'Profile photo updated successfully.');
    }

    public function destroyAvatar(Request $request, AdminMediaService $media): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        $media->delete($admin->avatar);

        $admin->forceFill(['avatar' => null])->save();

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'Profile photo removed successfully.');
    }

    public function updateThemePreference(AdminThemePreferenceUpdateRequest $request, ThemeManager $themeManager): HttpResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');
        $themePreference = $themeManager->normalize($request->string('theme_preference')->toString());

        $admin->forceFill([
            'theme_preference' => $themePreference,
        ])->save();

        if ($request->expectsJson()) {
            return response()
                ->noContent()
                ->withCookie($themeManager->cookie($themePreference, ThemeManager::SCOPE_ADMIN));
        }

        return redirect()
            ->back(303)
            ->withCookie($themeManager->cookie($themePreference, ThemeManager::SCOPE_ADMIN));
    }

    public function updateGoogleLoginVisibility(Request $request): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');
        $rules = [
            'google_login_enabled' => ['required', 'boolean'],
            'current_password' => ['required', 'current_password:admin'],
        ];

        $validated = $request->validate($rules);

        $settings = SiteSetting::singleton($admin);

        $settings->forceFill([
            'google_login_enabled' => (bool) $validated['google_login_enabled'],
            'created_by' => $settings->created_by ?? $admin->id,
            'updated_by' => $admin->id,
        ])->save();

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', $validated['google_login_enabled']
                ? 'Google login has been enabled.'
                : 'Google login has been disabled.');
    }

    public function logoutOtherSessions(AdminLogoutOtherSessionsRequest $request): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');
        $currentPassword = $request->string('current_password')->toString();
        $originalPasswordHash = $admin->getAuthPassword();

        Auth::guard('admin')->logoutOtherDevices($currentPassword);
        $admin->refresh();

        if (hash_equals($originalPasswordHash, $admin->getAuthPassword())) {
            $admin->forceFill([
                'password' => $currentPassword,
                'remember_token' => Str::random(60),
            ])->save();
        }

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'Other browser sessions have been signed out.');
    }

    public function requestEnableTwoFactor(AdminTwoFactorActionRequest $request, AdminTwoFactorService $twoFactor): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        if ($admin->isEmailTwoFactorEnabled()) {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'Email two-factor authentication is already enabled.');
        }

        if ($admin->isAuthenticatorAppEnabled()) {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'Disable authenticator app two-factor authentication before enabling email two-factor authentication.');
        }

        $admin->clearTwoFactorChallenge();
        $twoFactor->clearProfilePendingAction($request);
        $twoFactor->sendChallenge($admin);
        $twoFactor->setProfilePendingAction($request, 'enable', 'email');

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'A verification code has been sent to your email address.');
    }

    public function confirmEnableTwoFactor(AdminTwoFactorCodeRequest $request, AdminTwoFactorService $twoFactor): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        if ($twoFactor->profilePendingAction($request) !== 'enable') {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'Start the enable flow again.');
        }

        if ($twoFactor->profilePendingMethod($request) !== 'email') {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'The pending verification request does not match the email two-factor flow.');
        }

        return $this->completeTwoFactorChange(
            request: $request,
            admin: $admin,
            twoFactor: $twoFactor,
            action: 'enable',
            onSuccess: function (Admin $admin): void {
                $admin->forceFill([
                    'two_factor_enabled_at' => now(),
                    'two_factor_method' => 'email',
                    'authenticator_secret' => null,
                ])->save();
            },
            successMessage: 'Email two-factor authentication enabled successfully.',
        );
    }

    public function requestDisableTwoFactor(AdminTwoFactorActionRequest $request, AdminTwoFactorService $twoFactor): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        if (! $admin->isEmailTwoFactorEnabled()) {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'Email two-factor authentication is already disabled.');
        }

        $admin->clearTwoFactorChallenge();
        $twoFactor->clearProfilePendingAction($request);
        $twoFactor->sendChallenge($admin);
        $twoFactor->setProfilePendingAction($request, 'disable', 'email');

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'A verification code has been sent to your email address.');
    }

    public function confirmDisableTwoFactor(AdminTwoFactorCodeRequest $request, AdminTwoFactorService $twoFactor): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        if ($twoFactor->profilePendingAction($request) !== 'disable') {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'Start the disable flow again.');
        }

        if ($twoFactor->profilePendingMethod($request) !== 'email') {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'The pending verification request does not match the email two-factor flow.');
        }

        return $this->completeTwoFactorChange(
            request: $request,
            admin: $admin,
            twoFactor: $twoFactor,
            action: 'disable',
            onSuccess: function (Admin $admin): void {
                $admin->forceFill([
                    'two_factor_enabled_at' => null,
                    'two_factor_method' => null,
                ])->save();
            },
            successMessage: 'Email two-factor authentication disabled successfully.',
        );
    }

    public function requestEnableAuthenticatorTwoFactor(
        AdminTwoFactorActionRequest $request,
        AdminTwoFactorService $twoFactor,
        AdminAuthenticatorAppService $authenticator,
    ): RedirectResponse {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        if ($admin->isAuthenticatorAppEnabled()) {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'Authenticator app two-factor authentication is already enabled.');
        }

        if ($admin->isEmailTwoFactorEnabled()) {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'Disable email two-factor authentication before enabling authenticator app two-factor authentication.');
        }

        $admin->clearTwoFactorChallenge();
        $twoFactor->clearProfilePendingAction($request);
        $authenticator->clearPendingSecret($request);

        $secret = $authenticator->generateSecret($admin);

        $authenticator->setPendingSecret($request, $secret);
        $twoFactor->setProfilePendingAction($request, 'enable', 'authenticator');

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'Scan the QR code in your authenticator app, then enter the generated code to finish setup.');
    }

    public function confirmEnableAuthenticatorTwoFactor(
        AdminTwoFactorCodeRequest $request,
        AdminTwoFactorService $twoFactor,
        AdminAuthenticatorAppService $authenticator,
    ): RedirectResponse {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        if ($twoFactor->profilePendingAction($request) !== 'enable' || $twoFactor->profilePendingMethod($request) !== 'authenticator') {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'Start the authenticator app setup again.');
        }

        $secret = $authenticator->pendingSecret($request);

        if (! $secret) {
            $twoFactor->clearProfilePendingAction($request);

            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'The authenticator app setup expired. Start the setup again.');
        }

        $code = $request->string('code')->toString();

        if (! $authenticator->verifyCode($secret, $code)) {
            return back()->withErrors([
                'code' => 'The authenticator code is invalid.',
            ]);
        }

        $admin->clearTwoFactorChallenge();
        $admin->forceFill([
            'two_factor_enabled_at' => now(),
            'two_factor_method' => 'authenticator',
            'authenticator_secret' => $secret,
        ])->save();

        $twoFactor->clearProfilePendingAction($request);
        $authenticator->clearPendingSecret($request);

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'Authenticator app two-factor authentication enabled successfully.');
    }

    public function requestDisableAuthenticatorTwoFactor(
        AdminTwoFactorActionRequest $request,
        AdminTwoFactorService $twoFactor,
        AdminAuthenticatorAppService $authenticator,
    ): RedirectResponse {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        if (! $admin->isAuthenticatorAppEnabled()) {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'Authenticator app two-factor authentication is already disabled.');
        }

        $admin->clearTwoFactorChallenge();
        $twoFactor->clearProfilePendingAction($request);
        $authenticator->clearPendingSecret($request);
        $twoFactor->setProfilePendingAction($request, 'disable', 'authenticator');

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'Enter a code from your authenticator app to disable two-factor authentication.');
    }

    public function confirmDisableAuthenticatorTwoFactor(
        AdminTwoFactorCodeRequest $request,
        AdminTwoFactorService $twoFactor,
        AdminAuthenticatorAppService $authenticator,
    ): RedirectResponse {
        /** @var Admin $admin */
        $admin = $request->user('admin');

        if ($twoFactor->profilePendingAction($request) !== 'disable' || $twoFactor->profilePendingMethod($request) !== 'authenticator') {
            return redirect()
                ->route('admin.profile.edit')
                ->with('error', 'Start the authenticator app disable flow again.');
        }

        $code = $request->string('code')->toString();

        if (! $authenticator->verifyCode((string) $admin->authenticator_secret, $code)) {
            return back()->withErrors([
                'code' => 'The authenticator code is invalid.',
            ]);
        }

        $admin->forceFill([
            'two_factor_enabled_at' => null,
            'two_factor_method' => null,
            'authenticator_secret' => null,
        ])->save();

        $twoFactor->clearProfilePendingAction($request);
        $authenticator->clearPendingSecret($request);

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', 'Authenticator app two-factor authentication disabled successfully.');
    }

    private function currentSessionContext(Request $request, Admin $admin): array
    {
        $userAgent = $request->userAgent() ?? 'Unknown device';
        $session = DB::table('sessions')->where('id', $request->session()->getId())->first();

        return [
            'browser' => $this->detectBrowser($userAgent),
            'platform' => $this->detectPlatform($userAgent),
            'ip_address' => $request->ip(),
            'user_agent' => $userAgent,
            'last_active_at' => $session?->last_activity
                ? Carbon::createFromTimestamp((int) $session->last_activity)->toIso8601String()
                : null,
            'last_login_at' => $admin->last_login_at?->toIso8601String(),
        ];
    }

    private function detectBrowser(string $userAgent): string
    {
        return match (true) {
            str_contains($userAgent, 'Edg/') => 'Microsoft Edge',
            str_contains($userAgent, 'OPR/') => 'Opera',
            str_contains($userAgent, 'Firefox/') => 'Firefox',
            str_contains($userAgent, 'Chrome/') => 'Chrome',
            str_contains($userAgent, 'Safari/') && ! str_contains($userAgent, 'Chrome/') => 'Safari',
            default => 'Browser',
        };
    }

    private function detectPlatform(string $userAgent): string
    {
        return match (true) {
            str_contains($userAgent, 'Windows') => 'Windows',
            str_contains($userAgent, 'Macintosh') => 'macOS',
            str_contains($userAgent, 'Android') => 'Android',
            str_contains($userAgent, 'iPhone') || str_contains($userAgent, 'iPad') => 'iOS',
            str_contains($userAgent, 'Linux') => 'Linux',
            default => 'Unknown OS',
        };
    }

    private function completeTwoFactorChange(
        Request $request,
        Admin $admin,
        AdminTwoFactorService $twoFactor,
        string $action,
        callable $onSuccess,
        string $successMessage,
    ): RedirectResponse {
        if (! $admin->two_factor_code_expires_at?->isFuture()) {
            $admin->clearTwoFactorChallenge();
            $twoFactor->clearProfilePendingAction($request);

            return redirect()
                ->route('admin.profile.edit')
                ->with('error', "The verification code expired. Start the {$action} flow again.");
        }

        $code = $request->string('code')->toString();

        if (! $admin->hasValidTwoFactorCode($code)) {
            $attempts = $admin->incrementTwoFactorAttempts();

            if ($attempts >= Admin::TWO_FACTOR_MAX_ATTEMPTS) {
                $admin->clearTwoFactorChallenge();
                $twoFactor->clearProfilePendingAction($request);

                return redirect()
                    ->route('admin.profile.edit')
                    ->with('error', "Too many invalid verification attempts. Start the {$action} flow again.");
            }

            return back()->withErrors([
                'code' => 'The verification code is invalid.',
            ]);
        }

        $onSuccess($admin);
        $admin->clearTwoFactorChallenge();
        $twoFactor->clearProfilePendingAction($request);

        return redirect()
            ->route('admin.profile.edit')
            ->with('success', $successMessage);
    }
}
