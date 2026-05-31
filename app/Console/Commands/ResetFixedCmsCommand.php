<?php

namespace App\Console\Commands;

use App\Models\Admin;
use App\Support\AdminUiCache;
use App\Support\FixedCmsResetService;
use Illuminate\Console\Command;

class ResetFixedCmsCommand extends Command
{
    protected $signature = 'cms:reset-fixed-pages';

    protected $description = 'Reset cms_pages and inquiries, then recreate the fixed 5-page CMS structure.';

    public function handle(FixedCmsResetService $resetService, AdminUiCache $uiCache): int
    {
        if (! $this->confirm('This will delete all CMS pages and all inquiries, then recreate the fixed 5 CMS pages. Continue?')) {
            $this->components->warn('Reset cancelled.');

            return self::SUCCESS;
        }

        $admin = Admin::query()->orderBy('id')->first();

        $resetService->reset($admin);
        $uiCache->flushBranding();
        $uiCache->flushPublicCms();

        $this->components->info('Fixed 5-page CMS reset completed successfully.');

        return self::SUCCESS;
    }
}
