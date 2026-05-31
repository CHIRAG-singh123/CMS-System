<?php

namespace App\Support;

use App\Models\Admin;
use Illuminate\Http\Request;
use PragmaRX\Google2FALaravel\Google2FA;

class AdminAuthenticatorAppService
{
    public const PROFILE_PENDING_SECRET_SESSION_KEY = 'admin_profile_authenticator_secret';

    public function __construct(
        private readonly Google2FA $google2fa,
    ) {
    }

    public function generateSecret(Admin $admin): string
    {
        return $this->google2fa->generateSecretKey(32);
    }

    public function qrCodeInline(Admin $admin, string $secret): string
    {
        $qrCode = $this->google2fa->getQRCodeInline(
            company: (string) config('app.name'),
            holder: $admin->email,
            secret: $secret,
            size: 220,
        );

        $trimmed = ltrim($qrCode);

        if (str_starts_with($trimmed, '<svg') || str_starts_with($trimmed, '<?xml')) {
            return 'data:image/svg+xml;base64,'.base64_encode($qrCode);
        }

        return $qrCode;
    }

    public function verifyCode(string $secret, string $code): bool
    {
        return (bool) $this->google2fa->verifyKey($secret, $code, 1);
    }

    public function setPendingSecret(Request $request, string $secret): void
    {
        $request->session()->put(self::PROFILE_PENDING_SECRET_SESSION_KEY, $secret);
    }

    public function pendingSecret(Request $request): ?string
    {
        $secret = $request->session()->get(self::PROFILE_PENDING_SECRET_SESSION_KEY);

        return is_string($secret) && $secret !== '' ? $secret : null;
    }

    public function clearPendingSecret(Request $request): void
    {
        $request->session()->forget(self::PROFILE_PENDING_SECRET_SESSION_KEY);
    }
}
