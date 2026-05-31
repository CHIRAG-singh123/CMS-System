<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->string('header_tagline', 140)->nullable();
            $table->string('header_cta_label', 60)->nullable();
            $table->string('header_cta_url')->nullable();
            $table->string('footer_heading', 120)->nullable();
            $table->text('footer_description')->nullable();
            $table->string('footer_cta_label', 60)->nullable();
            $table->string('footer_cta_url')->nullable();
            $table->string('footer_copyright', 180)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->dropColumn([
                'header_tagline',
                'header_cta_label',
                'header_cta_url',
                'footer_heading',
                'footer_description',
                'footer_cta_label',
                'footer_cta_url',
                'footer_copyright',
            ]);
        });
    }
};
