<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Console\Commands\ResetFixedCmsCommand;
use App\Http\Middleware\AdminAuth;
use App\Http\Middleware\AuthenticateAdminSession;
use App\Http\Middleware\EnsurePublicSiteIsLive;
use App\Http\Middleware\RedirectIfAdminAuthenticated;
use App\Support\ThemeManager;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands([
        ResetFixedCmsCommand::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: [
            ThemeManager::LEGACY_COOKIE_NAME,
            ThemeManager::PUBLIC_COOKIE_NAME,
            ThemeManager::ADMIN_COOKIE_NAME,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin.auth' => AdminAuth::class,
            'admin.guest' => RedirectIfAdminAuthenticated::class,
            'admin.session' => AuthenticateAdminSession::class,
            'public.live' => EnsurePublicSiteIsLive::class,
            'permission' => PermissionMiddleware::class,
            'role' => RoleMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthorizationException $exception, Request $request) {
            if (! $request->expectsJson() && ($request->is('admin') || $request->is('admin/*'))) {
                $target = $request->is('admin/cms-pages') || $request->is('admin/cms-pages/*')
                    ? route('admin.cms-pages.index')
                    : route('admin.dashboard');
                $current = $request->fullUrl();

                return redirect()
                    ->to($target !== $current ? $target : route('admin.dashboard'))
                    ->with('error', 'You do not have permission to open that section. Please contact a Super Admin if you need edit access.');
            }

            return null;
        });
    })->create();
