<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            AdminSeeder::class,
            CmsPageSeeder::class,
            SiteSettingSeeder::class,
            CategorySeeder::class,
            ProductServiceSeeder::class,
            InquirySeeder::class,
            MemberSeeder::class,
            TestimonialSeeder::class,
            GallerySeeder::class,
            GalleryImageSeeder::class,
            MediaSeeder::class,
        ]);
    }
}
