<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->addIndex('categories', ['position'], 'categories_position_index');
        $this->addIndex('members', ['created_at', 'id'], 'members_created_at_id_index');
        $this->addIndex('testimonials', ['created_at', 'id'], 'testimonials_created_at_id_index');
        $this->addIndex('galleries', ['created_at', 'id'], 'galleries_created_at_id_index');
    }

    public function down(): void
    {
        $this->dropIndex('categories', 'categories_position_index');
        $this->dropIndex('members', 'members_created_at_id_index');
        $this->dropIndex('testimonials', 'testimonials_created_at_id_index');
        $this->dropIndex('galleries', 'galleries_created_at_id_index');
    }

    private function addIndex(string $tableName, array $columns, string $indexName): void
    {
        if (! Schema::hasTable($tableName) || Schema::hasIndex($tableName, $indexName)) {
            return;
        }

        Schema::table($tableName, function (Blueprint $table) use ($columns, $indexName): void {
            $table->index($columns, $indexName);
        });
    }

    private function dropIndex(string $tableName, string $indexName): void
    {
        if (! Schema::hasTable($tableName) || ! Schema::hasIndex($tableName, $indexName)) {
            return;
        }

        Schema::table($tableName, function (Blueprint $table) use ($indexName): void {
            $table->dropIndex($indexName);
        });
    }
};
