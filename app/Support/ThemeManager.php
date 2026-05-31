<?php

namespace App\Support;

use App\Models\Admin;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;

class ThemeManager
{
    public const LEGACY_COOKIE_NAME = 'app_theme';
    public const PUBLIC_COOKIE_NAME = 'public_theme';
    public const ADMIN_COOKIE_NAME = 'admin_theme';
    public const DEFAULT_MODE = 'dark';
    public const LIGHT_MODE = 'light';
    public const DARK_MODE = 'dark';
    public const SCOPE_PUBLIC = 'public';
    public const SCOPE_ADMIN = 'admin';
    public const MODES = [
        self::LIGHT_MODE,
        self::DARK_MODE,
    ];

    public function resolve(Request $request, ?Admin $admin = null, string $scope = self::SCOPE_PUBLIC): string
    {
        if ($scope === self::SCOPE_ADMIN && $admin && in_array($admin->theme_preference, self::MODES, true)) {
            return $admin->theme_preference;
        }

        return $this->normalize(
            $request->cookie($this->cookieName($scope))
            ?? $request->cookie(self::LEGACY_COOKIE_NAME)
        );
    }

    public function normalize(?string $mode): string
    {
        return in_array($mode, self::MODES, true) ? $mode : self::DEFAULT_MODE;
    }

    public function cookie(?string $mode, string $scope = self::SCOPE_PUBLIC): Cookie
    {
        return cookie(
            $this->cookieName($scope),
            $this->normalize($mode),
            60 * 24 * 365 * 5,
            '/',
            null,
            false,
            false,
            false,
            'lax',
        );
    }

    public function cookieName(string $scope = self::SCOPE_PUBLIC): string
    {
        return $scope === self::SCOPE_ADMIN
            ? self::ADMIN_COOKIE_NAME
            : self::PUBLIC_COOKIE_NAME;
    }
}
