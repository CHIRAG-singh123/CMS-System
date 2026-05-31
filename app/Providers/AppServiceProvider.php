<?php

namespace App\Providers;

use App\Models\Admin;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::useHotFile(storage_path('framework/vite.hot'));

        Gate::before(function ($user) {
            if ($user instanceof Admin && $user->isSuperAdmin()) {
                return true;
            }

            return null;
        });
    }
}
