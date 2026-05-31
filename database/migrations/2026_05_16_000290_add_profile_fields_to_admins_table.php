<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table): void {
            $table->string('phone', 50)->nullable();
            $table->string('job_title')->nullable();
            $table->string('timezone')->nullable();
            $table->text('bio')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table): void {
            $table->dropColumn(['phone', 'job_title', 'timezone', 'bio']);
        });
    }
};
