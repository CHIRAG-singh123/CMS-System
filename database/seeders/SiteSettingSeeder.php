<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = Admin::query()->orderBy('id')->value('id');

        SiteSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'company_name' => 'Default Panel',
                'legal_name' => 'Default Panel Private Limited',
                'company_address' => 'Primary office address loaded from the seeded SQLite configuration.',
                'maintenance_mode' => false,
                'maintenance_message' => 'We are performing a quick maintenance update. Please check back shortly.',
                'google_login_enabled' => true,
                'logo_light' => null,
                'logo_dark' => null,
                'export_email' => 'exports@example.com',
                'phone' => '+91-9000000001',
                'whatsapp_number' => '+91-9000000001',
                'whatsapp_chat_enabled' => true,
                'whatsapp_prefill_message' => 'Hello, I would like to know more about your products.',
                'map_title' => 'Head Office',
                'map_address' => 'India manufacturing and export office',
                'map_embed' => 'https://www.google.com/maps',
                'linkedin_url' => 'https://linkedin.com/company/example-company',
                'facebook_url' => 'https://facebook.com/example-company',
                'instagram_url' => 'https://instagram.com/example-company',
                'created_by' => $adminId,
                'updated_by' => $adminId,
            ],
        );
    }
}
