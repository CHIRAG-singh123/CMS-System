<?php

namespace App\Http\Middleware;

use BadMethodCallException;
use Closure;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAdminSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $guard = Auth::guard('admin');
        $admin = $guard->user();

        if (! $request->hasSession() || ! $admin || ! $admin->getAuthPassword()) {
            return $next($request);
        }

        if ($guard->viaRemember()) {
            $passwordHashFromCookie = explode('|', $request->cookies->get($guard->getRecallerName()))[2] ?? null;

            if (! $passwordHashFromCookie || ! $this->validatePasswordHash($guard, $admin->getAuthPassword(), $passwordHashFromCookie)) {
                return $this->logout($request, $guard);
            }
        }

        if (! $request->session()->has('password_hash_admin')) {
            $this->storePasswordHashInSession($request, $guard, $admin->getAuthPassword());
        }

        $sessionPasswordHash = $request->session()->get('password_hash_admin');

        if (! $this->validatePasswordHash($guard, $admin->getAuthPassword(), $sessionPasswordHash)) {
            return $this->logout($request, $guard);
        }

        $response = $next($request);

        if ($guard->user()) {
            $latestPasswordHash = $guard->user()->getAuthPassword();
            $currentStoredHash = $request->session()->get('password_hash_admin');

            if (! $this->validatePasswordHash($guard, $latestPasswordHash, $currentStoredHash)) {
                $this->storePasswordHashInSession($request, $guard, $latestPasswordHash);
            }
        }

        return $response;
    }

    private function storePasswordHashInSession(Request $request, StatefulGuard $guard, string $passwordHash): void
    {
        try {
            $passwordHash = $guard->hashPasswordForCookie($passwordHash);
        } catch (BadMethodCallException) {
        }

        $request->session()->put('password_hash_admin', $passwordHash);
    }

    private function validatePasswordHash(StatefulGuard $guard, string $passwordHash, ?string $storedValue): bool
    {
        if (! $storedValue) {
            return false;
        }

        try {
            return hash_equals($guard->hashPasswordForCookie($passwordHash), $storedValue)
                || hash_equals($passwordHash, $storedValue);
        } catch (BadMethodCallException) {
            return hash_equals($passwordHash, $storedValue);
        }
    }

    private function logout(Request $request, StatefulGuard $guard): RedirectResponse
    {
        $guard->logoutCurrentDevice();

        $request->session()->flush();
        $request->session()->regenerateToken();

        return redirect()
            ->route('admin.login')
            ->with('error', 'Your session has expired. Please sign in again.');
    }
}
