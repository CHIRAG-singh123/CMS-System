<?php

namespace App\Support;

use App\Mail\AdminTwoFactorCodeMail;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminTwoFactorService
{
    public const LOGIN_PENDING_ID_SESSION_KEY = 'admin_two_factor_pending_id';
    public const LOGIN_PENDING_REMEMBER_SESSION_KEY = 'admin_two_factor_remember';
    public const PROFILE_PENDING_ACTION_SESSION_KEY = 'admin_profile_two_factor_action';
    public const PROFILE_PENDING_METHOD_SESSION_KEY = 'admin_profile_two_factor_method';

    public function sendChallenge(Admin $admin): void
    {
        $code = $admin->issueTwoFactorCode();

        Mail::to($admin->email)->send(new AdminTwoFactorCodeMail(
            admin: $admin,
            code: $code,
            expiresInMinutes: Admin::TWO_FACTOR_CODE_EXPIRY_MINUTES,
        ));
    }

    public function startLoginChallengeSession(Request $request, Admin $admin, bool $remember): void
    {
        $request->session()->put([
            self::LOGIN_PENDING_ID_SESSION_KEY => $admin->getKey(),
            self::LOGIN_PENDING_REMEMBER_SESSION_KEY => $remember,
        ]);
    }

    public function clearLoginChallengeSession(Request $request): void
    {
        $request->session()->forget([
            self::LOGIN_PENDING_ID_SESSION_KEY,
            self::LOGIN_PENDING_REMEMBER_SESSION_KEY,
        ]);
    }

    public function pendingLoginAdminId(Request $request): ?int
    {
        $pendingAdminId = $request->session()->get(self::LOGIN_PENDING_ID_SESSION_KEY);

        return is_numeric($pendingAdminId) ? (int) $pendingAdminId : null;
    }

    public function setProfilePendingAction(Request $request, string $action, string $method = 'email'): void
    {
        $request->session()->put([
            self::PROFILE_PENDING_ACTION_SESSION_KEY => $action,
            self::PROFILE_PENDING_METHOD_SESSION_KEY => $method,
        ]);
    }

    public function clearProfilePendingAction(Request $request): void
    {
        $request->session()->forget([
            self::PROFILE_PENDING_ACTION_SESSION_KEY,
            self::PROFILE_PENDING_METHOD_SESSION_KEY,
        ]);
    }

    public function profilePendingAction(Request $request): ?string
    {
        $action = $request->session()->get(self::PROFILE_PENDING_ACTION_SESSION_KEY);

        return in_array($action, ['enable', 'disable'], true) ? $action : null;
    }

    public function profilePendingMethod(Request $request): ?string
    {
        $method = $request->session()->get(self::PROFILE_PENDING_METHOD_SESSION_KEY);

        return in_array($method, ['email', 'authenticator'], true) ? $method : null;
    }

    public function maskEmail(string $email): string
    {
        [$localPart, $domain] = array_pad(explode('@', $email, 2), 2, '');

        if ($domain === '') {
            return $email;
        }

        if (strlen($localPart) <= 2) {
            return substr($localPart, 0, 1).'*@'.$domain;
        }

        return substr($localPart, 0, 2)
            .str_repeat('*', max(strlen($localPart) - 4, 1))
            .substr($localPart, -2)
            .'@'
            .$domain;
    }
}
