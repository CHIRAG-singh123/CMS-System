<?php

namespace Database\Seeders;

use App\Models\Gallery;
use App\Models\GalleryImage;
use Illuminate\Database\Seeder;

class GalleryImageSeeder extends Seeder
{
    public function run(): void
    {
        $galleries = Gallery::query()->orderBy('id')->get();

        foreach ($galleries as $index => $gallery) {
            GalleryImage::query()->updateOrCreate(
                [
                    'gallery_id' => $gallery->id,
                    'sort_order' => 1,
                ],
                [
                    'image' => sprintf('seed/galleries/images/gallery-%02d-image-01.webp', $index + 1),
                    'title' => "{$gallery->title} Detail",
                    'alt_text' => "{$gallery->title} seeded image",
                    'caption' => "Seeded gallery image for {$gallery->title}.",
                    'status' => GalleryImage::STATUSES[$index % count(GalleryImage::STATUSES)],
                ],
            );
        }
    }
}
