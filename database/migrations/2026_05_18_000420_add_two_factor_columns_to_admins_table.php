<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table): void {
            $table->timestamp('two_factor_enabled_at')->nullable()->after('last_login_at');
            $table->string('two_factor_code_hash')->nullable()->after('two_factor_enabled_at');
            $table->timestamp('two_factor_code_expires_at')->nullable()->after('two_factor_code_hash');
            $table->timestamp('two_factor_code_sent_at')->nullable()->after('two_factor_code_expires_at');
            $table->unsignedSmallInteger('two_factor_code_attempts')->default(0)->after('two_factor_code_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table): void {
            $table->dropColumn([
                'two_factor_enabled_at',
                'two_factor_code_hash',
                'two_factor_code_expires_at',
                'two_factor_code_sent_at',
                'two_factor_code_attempts',
            ]);
        });
    }
};
