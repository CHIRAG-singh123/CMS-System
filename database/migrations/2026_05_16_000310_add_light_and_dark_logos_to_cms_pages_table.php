<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cms_pages', function (Blueprint $table): void {
            $table->string('logo_light')->nullable()->after('logo');
            $table->string('logo_dark')->nullable()->after('logo_light');
        });

        DB::table('cms_pages')
            ->whereNotNull('logo')
            ->update([
                'logo_light' => DB::raw('COALESCE(logo_light, logo)'),
                'logo_dark' => DB::raw('COALESCE(logo_dark, logo)'),
            ]);
    }

    public function down(): void
    {
        Schema::table('cms_pages', function (Blueprint $table): void {
            $table->dropColumn(['logo_light', 'logo_dark']);
        });
    }
};
