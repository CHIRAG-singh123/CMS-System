<?php

namespace Database\Seeders;

use App\Models\Gallery;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        $galleries = [
            'Factory Launch Highlights',
            'Assembly Line Walkthrough',
            'Packaging Zone Showcase',
            'Quality Lab Moments',
            'Safety Drill Highlights',
            'Client Visit Album',
            'Installation Milestones',
            'Project Handover Notes',
            'Team Workshop Gallery',
            'Service Camp Recap',
            'Plant Expansion Diary',
            'Conference Participation',
            'Expo Booth Showcase',
            'Field Inspection Album',
            'Annual Celebration Moments',
            'Vendor Collaboration Event',
            'Customer Training Session',
            'Maintenance Audit Album',
            'Transport Loading Bay',
            'Machinery Retrofit Gallery',
            'Control Room Setup',
            'Laboratory Safety Tour',
            'Project Kickoff',
            'Final Inspection Photos',
            'Employee Recognition Night',
            'New Product Teaser',
            'Warehouse Optimization',
            'Sustainability Drive',
            'Annual Safety Pledge',
            'Team Offsite Highlights',
        ];

        foreach ($galleries as $index => $title) {
            Gallery::query()->updateOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'title' => $title,
                    'description' => "Seeded gallery collection for {$title}.",
                    'cover_image' => sprintf('seed/galleries/covers/gallery-%02d.webp', $index + 1),
                    'status' => Gallery::STATUSES[$index % count(Gallery::STATUSES)],
                ],
            );
        }
    }
}
