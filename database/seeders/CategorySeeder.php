<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Industrial Automation',
            'Packaging Systems',
            'Process Equipment',
            'Water Treatment',
            'Safety Products',
            'Electrical Panels',
            'Critical Spare Parts',
            'Maintenance Tools',
            'Material Handling',
            'Quality Control',
            'Fabrication Works',
            'Energy Systems',
            'HVAC Solutions',
            'Fire Protection',
            'Laboratory Equipment',
            'Automation Robotics',
            'Thermal Processing',
            'Industrial IoT',
            'Asset Management',
            'Waste Recycling',
            'Compressed Air Systems',
            'Instrumentation',
            'Chemical Handling',
            'Plant Security',
            'EHS Consulting',
            'Smart Warehouse',
            'Logistics Automation',
            'Packaging Design',
            'Performance Monitoring',
            'Remote Support',
        ];

        foreach ($categories as $index => $name) {
            Category::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => "Seeded category for {$name} offerings and supporting workflows.",
                    'image' => sprintf('seed/categories/category-%02d.webp', $index + 1),
                    'status' => Category::STATUSES[$index % count(Category::STATUSES)],
                ],
            );
        }
    }
}
