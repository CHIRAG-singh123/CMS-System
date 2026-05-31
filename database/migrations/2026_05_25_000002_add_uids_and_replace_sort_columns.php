<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->updateCategoriesTable();
        $this->updateStableUidTable('members', 'members_status_sort_order_index', 'members_status_index');
        $this->updateStableUidTable('testimonials', 'testimonials_status_sort_order_index', 'testimonials_status_index');
        $this->updateStableUidTable('galleries', 'galleries_status_sort_order_index', 'galleries_status_index');

        $this->backfillCategories();
        $this->backfillStableUidTable('members', 'MEM');
        $this->backfillStableUidTable('testimonials', 'TES');
        $this->backfillStableUidTable('galleries', 'GAL');

        $this->addIndexIfMissing('categories', ['uid'], 'categories_uid_unique', true);
        $this->addIndexIfMissing('members', ['uid'], 'members_uid_unique', true);
        $this->addIndexIfMissing('testimonials', ['uid'], 'testimonials_uid_unique', true);
        $this->addIndexIfMissing('galleries', ['uid'], 'galleries_uid_unique', true);
    }

    public function down(): void
    {
        $this->dropIndexIfExists('categories', 'categories_uid_unique');
        $this->dropIndexIfExists('categories', 'categories_status_position_index');
        $this->dropIndexIfExists('members', 'members_uid_unique');
        $this->dropIndexIfExists('members', 'members_status_index');
        $this->dropIndexIfExists('testimonials', 'testimonials_uid_unique');
        $this->dropIndexIfExists('testimonials', 'testimonials_status_index');
        $this->dropIndexIfExists('galleries', 'galleries_uid_unique');
        $this->dropIndexIfExists('galleries', 'galleries_status_index');

        $this->revertCategoriesTable();
        $this->revertStableUidTable('members');
        $this->revertStableUidTable('testimonials');
        $this->revertStableUidTable('galleries');

        $this->addIndexIfMissing('categories', ['status', 'sort_order'], 'categories_status_sort_order_index');
        $this->addIndexIfMissing('members', ['status', 'sort_order'], 'members_status_sort_order_index');
        $this->addIndexIfMissing('testimonials', ['status', 'sort_order'], 'testimonials_status_sort_order_index');
        $this->addIndexIfMissing('galleries', ['status', 'sort_order'], 'galleries_status_sort_order_index');
    }

    private function updateCategoriesTable(): void
    {
        if (! Schema::hasTable('categories')) {
            return;
        }

        $this->dropIndexIfExists('categories', 'categories_status_sort_order_index');

        if (Schema::hasColumn('categories', 'sort_order') && ! Schema::hasColumn('categories', 'position')) {
            Schema::table('categories', function (Blueprint $table): void {
                $table->renameColumn('sort_order', 'position');
            });
        }

        Schema::table('categories', function (Blueprint $table): void {
            if (! Schema::hasColumn('categories', 'uid')) {
                $table->string('uid')->nullable();
            }
        });

        $this->addIndexIfMissing('categories', ['status', 'position'], 'categories_status_position_index');
    }

    private function updateStableUidTable(string $tableName, string $oldIndex, string $newIndex): void
    {
        if (! Schema::hasTable($tableName)) {
            return;
        }

        $this->dropIndexIfExists($tableName, $oldIndex);

        Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
            if (! Schema::hasColumn($tableName, 'uid')) {
                $table->string('uid')->nullable();
            }
        });

        if (Schema::hasColumn($tableName, 'sort_order')) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropColumn('sort_order');
            });
        }

        $this->addIndexIfMissing($tableName, ['status'], $newIndex);
    }

    private function revertCategoriesTable(): void
    {
        if (! Schema::hasTable('categories')) {
            return;
        }

        if (Schema::hasColumn('categories', 'uid')) {
            Schema::table('categories', function (Blueprint $table): void {
                $table->dropColumn('uid');
            });
        }

        if (Schema::hasColumn('categories', 'position') && ! Schema::hasColumn('categories', 'sort_order')) {
            Schema::table('categories', function (Blueprint $table): void {
                $table->renameColumn('position', 'sort_order');
            });
        }
    }

    private function revertStableUidTable(string $tableName): void
    {
        if (! Schema::hasTable($tableName)) {
            return;
        }

        if (! Schema::hasColumn($tableName, 'sort_order')) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->unsignedInteger('sort_order')->default(0);
            });
        }

        $rows = DB::table($tableName)
            ->orderBy('id')
            ->get(['id']);

        foreach ($rows as $index => $row) {
            DB::table($tableName)
                ->where('id', $row->id)
                ->update(['sort_order' => $index + 1]);
        }

        if (Schema::hasColumn($tableName, 'uid')) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropColumn('uid');
            });
        }
    }

    private function backfillCategories(): void
    {
        if (! Schema::hasTable('categories')) {
            return;
        }

        $rows = DB::table('categories')
            ->orderBy('position')
            ->orderBy('id')
            ->get(['id']);

        foreach ($rows as $index => $row) {
            $position = $index + 1;

            DB::table('categories')
                ->where('id', $row->id)
                ->update([
                    'position' => $position,
                    'uid' => $this->formatUid('CAT', $position),
                ]);
        }
    }

    private function backfillStableUidTable(string $tableName, string $prefix): void
    {
        if (! Schema::hasTable($tableName)) {
            return;
        }

        $rows = DB::table($tableName)
            ->orderBy('id')
            ->get(['id']);

        foreach ($rows as $row) {
            DB::table($tableName)
                ->where('id', $row->id)
                ->update([
                    'uid' => $this->formatUid($prefix, (int) $row->id),
                ]);
        }
    }

    private function addIndexIfMissing(string $tableName, array $columns, string $indexName, bool $unique = false): void
    {
        if (! Schema::hasTable($tableName) || Schema::hasIndex($tableName, $indexName)) {
            return;
        }

        Schema::table($tableName, function (Blueprint $table) use ($columns, $indexName, $unique): void {
            if ($unique) {
                $table->unique($columns, $indexName);

                return;
            }

            $table->index($columns, $indexName);
        });
    }

    private function dropIndexIfExists(string $tableName, string $indexName): void
    {
        if (! Schema::hasTable($tableName) || ! Schema::hasIndex($tableName, $indexName)) {
            return;
        }

        Schema::table($tableName, function (Blueprint $table) use ($indexName): void {
            $table->dropIndex($indexName);
        });
    }

    private function formatUid(string $prefix, int $value): string
    {
        return sprintf('%s-%06d', $prefix, max($value, 0));
    }
};
