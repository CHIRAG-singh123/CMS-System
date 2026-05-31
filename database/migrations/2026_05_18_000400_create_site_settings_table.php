<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('company_name')->nullable();
            $table->string('legal_name')->nullable();
            $table->text('company_address')->nullable();
            $table->boolean('maintenance_mode')->default(false);
            $table->string('maintenance_message', 500)->nullable();
            $table->string('logo_light')->nullable();
            $table->string('logo_dark')->nullable();
            $table->string('brochure_file')->nullable();
            $table->string('export_email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('whatsapp_number', 50)->nullable();
            $table->boolean('whatsapp_chat_enabled')->default(false);
            $table->string('whatsapp_prefill_message', 500)->nullable();
            $table->string('map_title')->nullable();
            $table->string('map_address')->nullable();
            $table->text('map_embed')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();
        });

        $homepage = DB::table('cms_pages')
            ->where('page_key', 'homepage')
            ->first(['logo_light', 'logo_dark']);

        DB::table('site_settings')->insert([
            'id' => 1,
            'logo_light' => $homepage?->logo_light,
            'logo_dark' => $homepage?->logo_dark,
            'maintenance_mode' => false,
            'whatsapp_chat_enabled' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
