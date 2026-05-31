<?php

namespace App\Support;

use App\Models\Admin;
use App\Models\CmsPage;
use App\Models\Inquiry;
use App\Models\Media;
use Illuminate\Support\Facades\DB;

class FixedCmsResetService
{
    public function reset(?Admin $admin = null): void
    {
        $adminId = $admin?->id ?? Admin::query()->orderBy('id')->value('id');

        DB::transaction(function () use ($adminId): void {
            $pages = CmsPage::query()->get();

            foreach ($pages as $page) {
                $this->deleteCmsMedia($page->logo);
                $this->deleteCmsMedia($page->logo_light);
                $this->deleteCmsMedia($page->logo_dark);
                $this->deleteCmsMedia($page->banner_image);
            }

            CmsPage::query()->delete();
            Inquiry::query()->delete();

            foreach (FixedCmsPageRegistry::keys() as $key) {
                CmsPage::query()->create(FixedCmsPageRegistry::seedAttributes($key, $adminId));
            }
        });
    }

    private function deleteCmsMedia(?string $path): void
    {
        if (! $path) {
            return;
        }

        app(AdminMediaService::class)->delete($path);
        Media::query()->where('file_path', $path)->delete();
    }
}
