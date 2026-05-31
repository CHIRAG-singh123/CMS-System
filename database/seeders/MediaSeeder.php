<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Gallery;
use App\Models\Media;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class MediaSeeder extends Seeder
{
    public function run(): void
    {
        $admins = Admin::query()->orderBy('id')->get();
        $settings = SiteSetting::query()->first();

        $assets = collect([
            $settings?->logo_light,
            $settings?->logo_dark,
        ])
            ->filter()
            ->values()
            ->merge($admins->pluck('avatar')->filter()->take(8))
            ->merge(Category::query()->orderBy($this->categoryOrderColumn())->orderBy('id')->pluck('image')->filter()->take(8))
            ->merge(Gallery::query()->orderBy('id')->pluck('cover_image')->filter()->take(8))
            ->merge(collect(range(1, 30))->map(fn (int $item): string => sprintf('seed/media/placeholder-%02d.webp', $item)))
            ->unique()
            ->take(30)
            ->values();

        foreach ($assets as $index => $path) {
            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

            Media::query()->updateOrCreate(
                ['file_path' => $path],
                [
                    'file_name' => basename($path),
                    'original_name' => basename($path),
                    'file_type' => str_contains($path, 'branding')
                        ? 'branding'
                        : (str_contains($path, 'avatars') ? 'avatar' : (str_contains($path, 'categories') ? 'category' : 'gallery')),
                    'mime_type' => $this->mimeType($extension),
                    'file_size' => 120000 + (($index + 1) * 4096),
                    'alt_text' => 'Seeded media asset '.($index + 1),
                    'uploaded_by' => $admins[$index % $admins->count()]->id,
                ],
            );
        }
    }

    private function mimeType(string $extension): string
    {
        return match ($extension) {
            'svg' => 'image/svg+xml',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };
    }

    private function categoryOrderColumn(): string
    {
        return Schema::hasColumn('categories', 'position') ? 'position' : 'id';
    }
}
