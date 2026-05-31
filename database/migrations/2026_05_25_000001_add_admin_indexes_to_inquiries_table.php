<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table): void {
            $table->index('created_at', 'inquiries_created_at_index');
            $table->index('status', 'inquiries_status_index');
            $table->index('inquiry_type', 'inquiries_inquiry_type_index');
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table): void {
            $table->dropIndex('inquiries_created_at_index');
            $table->dropIndex('inquiries_status_index');
            $table->dropIndex('inquiries_inquiry_type_index');
        });
    }
};
