<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\ProductService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;

class ProductServiceSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::query()
            ->orderBy($this->categoryOrderColumn())
            ->orderBy('id')
            ->get();

        $records = [
            'Automation Line Integration',
            'Carton Sealing Machine',
            'Pressure Vessel Package',
            'RO Plant Commissioning',
            'Industrial Safety Audit',
            'PLC Control Panel',
            'Critical Spare Kit',
            'Predictive Maintenance Program',
            'Warehouse Conveyor System',
            'Inspection Bench Setup',
            'Custom Fabrication Service',
            'Solar Backup Integration',
            'Cleanroom HVAC Upgrade',
            'Fire Alarm Retrofit',
            'Laboratory Calibration Service',
            'Robot Palletizer Deployment',
            'Shrink Wrap Packaging System',
            'Steam Boiler Retrofit',
            'Wastewater Neutralization',
            'Emergency Ventilation Upgrade',
            'Motor Control Center',
            'Spare Parts Cataloging Service',
            'Predictive Analytics Package',
            'Automated Storage Shuttle',
            'Inspection Drone Survey',
            'Pipe Fabrication Contract',
            'Battery Backup System',
            'Clean Air Filtration',
            'Fire Suppression Upgrade',
            'Lab Equipment Validation',
        ];

        foreach ($records as $index => $title) {
            $category = $categories[$index % $categories->count()];
            $type = ProductService::TYPES[$index % count(ProductService::TYPES)];

            ProductService::query()->updateOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'category_id' => $category->id,
                    'type' => $type,
                    'title' => $title,
                    'short_description' => "Seeded {$type} entry for {$category->name}.",
                    'description' => "Detailed seeded description for {$title}, aligned with the {$category->name} category and reusable admin workflows.",
                    'featured_image' => sprintf('seed/products-services/featured-%02d.webp', $index + 1),
                    'gallery_images' => [
                        sprintf('seed/products-services/gallery-%02d-a.webp', $index + 1),
                        sprintf('seed/products-services/gallery-%02d-b.webp', $index + 1),
                    ],
                    'features_json' => [
                        "{$title} feature highlight 1",
                        "{$title} feature highlight 2",
                        "{$title} feature highlight 3",
                    ],
                    'benefits_json' => [
                        "{$title} benefit 1",
                        "{$title} benefit 2",
                        "{$title} benefit 3",
                    ],
                    'specifications_json' => [
                        'Operating range: seeded reference data',
                        'Service interval: 90 days',
                        'Deployment mode: production-ready',
                    ],
                    'status' => ProductService::STATUSES[$index % count(ProductService::STATUSES)],
                    'is_featured' => $index % 4 === 0,
                    'meta_title' => "{$title} | Example Company",
                    'meta_description' => "Seeded meta description for {$title}.",
                ],
            );
        }
    }

    private function categoryOrderColumn(): string
    {
        return Schema::hasColumn('categories', 'position') ? 'position' : 'id';
    }
}
