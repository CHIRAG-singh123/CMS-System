<?php

namespace App\Support;

use App\Models\Admin;
use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminMediaService
{
    public function store(?UploadedFile $file, string $directory, ?Admin $admin = null): ?string
    {
        if (! $file) {
            return null;
        }

        $path = $file->store($directory, 'public');

        $this->syncPublicMirror($path);
        $this->record($file, $path, $directory, $admin);

        return $path;
    }

    /**
     * @param  array<int, UploadedFile>  $files
     * @return list<string>
     */
    public function storeMany(array $files, string $directory, ?Admin $admin = null): array
    {
        return collect($files)
            ->map(fn (UploadedFile $file): ?string => $this->store($file, $directory, $admin))
            ->filter()
            ->values()
            ->all();
    }

    public function replace(?UploadedFile $file, ?string $currentPath, string $directory, ?Admin $admin = null): ?string
    {
        if (! $file) {
            return $currentPath;
        }

        $this->delete($currentPath);

        return $this->store($file, $directory, $admin);
    }

    public function delete(?string $path): void
    {
        if (! $path) {
            return;
        }

        Storage::disk('public')->delete($path);
        $this->deletePublicMirror($path);
    }

    private function syncPublicMirror(string $path): void
    {
        $sourcePath = Storage::disk('public')->path($path);
        $publicPath = public_path('storage/'.str_replace('\\', '/', ltrim($path, '/')));

        if (! is_file($sourcePath) || realpath($sourcePath) === realpath($publicPath)) {
            return;
        }

        File::ensureDirectoryExists(dirname($publicPath));
        File::copy($sourcePath, $publicPath);
    }

    private function deletePublicMirror(string $path): void
    {
        $sourcePath = Storage::disk('public')->path($path);
        $publicPath = public_path('storage/'.str_replace('\\', '/', ltrim($path, '/')));

        if (realpath($sourcePath) !== realpath($publicPath) && is_file($publicPath)) {
            File::delete($publicPath);
        }
    }

    private function record(UploadedFile $file, string $path, string $directory, ?Admin $admin): void
    {
        Media::query()->create([
            'file_name' => basename($path),
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => Str::before($directory, '/'),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => $admin?->id,
        ]);
    }
}
