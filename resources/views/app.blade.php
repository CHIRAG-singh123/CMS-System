@php($themeMode = data_get($page ?? [], 'props.theme.mode', \App\Support\ThemeManager::DEFAULT_MODE))
@php($isViteHot = app(\Illuminate\Foundation\Vite::class)->isRunningHot())
<!DOCTYPE html>
<html
    lang="{{ str_replace('_', '-', app()->getLocale()) }}"
    data-theme="{{ $themeMode }}"
    class="{{ $themeMode === 'dark' ? 'dark ' : '' }}h-full"
>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @if ($isViteHot)
            @viteReactRefresh
            @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @else
            @vite(['resources/js/app.tsx'])
        @endif
        @inertiaHead
    </head>
    <body class="min-h-full font-sans antialiased">
        @inertia
    </body>
</html>
