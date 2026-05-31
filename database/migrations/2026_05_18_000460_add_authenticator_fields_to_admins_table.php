<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->string('two_factor_method')->nullable()->after('two_factor_enabled_at');
            $table->text('authenticator_secret')->nullable()->after('two_factor_method');
        });

        DB::table('admins')
            ->whereNotNull('two_factor_enabled_at')
            ->whereNull('two_factor_method')
            ->update([
                'two_factor_method' => 'email',
            ]);
    }

    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn([
                'two_factor_method',
                'authenticator_secret',
            ]);
        });
    }
};
