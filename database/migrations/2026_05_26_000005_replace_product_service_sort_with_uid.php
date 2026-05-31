<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('product_services')) {
            return;
        }

        Schema::table('product_services', function (Blueprint $table): void {
            if (! Schema::hasColumn('product_services', 'uid')) {
                $table->string('uid')->nullable()->after('id');
            }
        });

        DB::table('product_services')
            ->orderBy('id')
            ->get(['id'])
            ->each(function (object $row): void {
                DB::table('product_services')
                    ->where('id', $row->id)
                    ->update([
                        'uid' => sprintf('PSR-%06d', max((int) $row->id, 0)),
                    ]);
            });

        if (Schema::hasIndex('product_services', 'product_services_sort_order_index')) {
            Schema::table('product_services', function (Blueprint $table): void {
                $table->dropIndex('product_services_sort_order_index');
            });
        }

        if (Schema::hasColumn('product_services', 'sort_order')) {
            Schema::table('product_services', function (Blueprint $table): void {
                $table->dropColumn('sort_order');
            });
        }

        if (! Schema::hasIndex('product_services', 'product_services_uid_unique')) {
            Schema::table('product_services', function (Blueprint $table): void {
                $table->unique('uid', 'product_services_uid_unique');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('product_services')) {
            return;
        }

        if (Schema::hasColumn('product_services', 'uid') && Schema::hasIndex('product_services', 'product_services_uid_unique')) {
            Schema::table('product_services', function (Blueprint $table): void {
                $table->dropUnique('product_services_uid_unique');
            });
        }

        if (! Schema::hasColumn('product_services', 'sort_order')) {
            Schema::table('product_services', function (Blueprint $table): void {
                $table->unsignedInteger('sort_order')->default(0);
            });
        }

        DB::table('product_services')
            ->orderBy('id')
            ->get(['id'])
            ->each(function (object $row, int $index): void {
                DB::table('product_services')
                    ->where('id', $row->id)
                    ->update([
                        'sort_order' => $index + 1,
                    ]);
            });

        if (! Schema::hasIndex('product_services', 'product_services_sort_order_index')) {
            Schema::table('product_services', function (Blueprint $table): void {
                $table->index('sort_order', 'product_services_sort_order_index');
            });
        }

        if (Schema::hasColumn('product_services', 'uid')) {
            Schema::table('product_services', function (Blueprint $table): void {
                $table->dropColumn('uid');
            });
        }
    }
};
