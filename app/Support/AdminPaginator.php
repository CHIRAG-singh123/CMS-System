<?php

namespace App\Support;

use Illuminate\Http\Request;

class AdminPaginator
{
    public const PER_PAGE_OPTIONS = [10, 15, 50, 100];

    public static function resolve(Request $request, int $default = 10): int
    {
        $perPage = $request->integer('per_page', $default);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : $default;
    }
}
