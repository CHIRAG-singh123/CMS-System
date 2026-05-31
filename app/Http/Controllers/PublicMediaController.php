<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublicMediaController extends Controller
{
    public function __invoke(string $path): BinaryFileResponse
    {
        $path = str_replace('\\', '/', ltrim(rawurldecode($path), '/'));
        $segments = array_values(array_filter(explode('/', $path), static fn (string $segment): bool => $segment !== ''));

        abort_if($segments === [] || in_array('..', $segments, true), 404);

        $disk = Storage::disk('public');

        abort_unless($disk->exists($path), 404);

        return response()->file($disk->path($path), [
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}
