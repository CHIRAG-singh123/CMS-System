<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublicThemeRequest;
use App\Support\ThemeManager;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PublicThemeController extends Controller
{
    public function update(PublicThemeRequest $request, ThemeManager $themeManager): HttpResponse
    {
        $themeMode = $themeManager->normalize($request->string('theme_mode')->toString());

        if ($request->expectsJson()) {
            return response()
                ->noContent()
                ->withCookie($themeManager->cookie($themeMode, ThemeManager::SCOPE_PUBLIC));
        }

        return redirect()
            ->back(303)
            ->withCookie($themeManager->cookie($themeMode, ThemeManager::SCOPE_PUBLIC));
    }
}
