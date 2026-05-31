<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table): void {
            $table->id();
            $table->string('client_name');
            $table->string('client_designation')->nullable();
            $table->string('company_name')->nullable();
            $table->string('image')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->longText('message');
            $table->string('status', 20)->default('published');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
