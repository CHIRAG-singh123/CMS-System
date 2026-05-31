<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\CmsPage;
use App\Support\FixedCmsPageRegistry;
use Illuminate\Database\Seeder;

class CmsPageSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = Admin::query()->orderBy('id')->value('id');

        foreach (FixedCmsPageRegistry::keys() as $key) {
            CmsPage::query()->updateOrCreate(
                ['page_key' => $key],
                FixedCmsPageRegistry::seedAttributes($key, $adminId),
            );
        }
    }
}
