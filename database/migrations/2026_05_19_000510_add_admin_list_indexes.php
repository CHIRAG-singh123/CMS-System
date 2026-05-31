<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->addIndex('admins', ['status'], 'admins_status_index');
        $this->addIndex('roles', ['status'], 'roles_status_index');
        $this->addIndex('cms_pages', ['status', 'sort_order'], 'cms_pages_status_sort_order_index');
        $this->addIndex('categories', ['status', 'sort_order'], 'categories_status_sort_order_index');
        $this->addIndex('product_services', ['category_id', 'status', 'type'], 'product_services_category_status_type_index');
        $this->addIndex('product_services', ['sort_order'], 'product_services_sort_order_index');
        $this->addIndex('members', ['status', 'sort_order'], 'members_status_sort_order_index');
        $this->addIndex('testimonials', ['status', 'sort_order'], 'testimonials_status_sort_order_index');
        $this->addIndex('galleries', ['status', 'sort_order'], 'galleries_status_sort_order_index');
        $this->addIndex('inquiries', ['status', 'inquiry_type', 'created_at'], 'inquiries_status_type_created_at_index');
    }

    public function down(): void
    {
        $this->dropIndex('admins', 'admins_status_index');
        $this->dropIndex('roles', 'roles_status_index');
        $this->dropIndex('cms_pages', 'cms_pages_status_sort_order_index');
        $this->dropIndex('categories', 'categories_status_sort_order_index');
        $this->dropIndex('product_services', 'product_services_category_status_type_index');
        $this->dropIndex('product_services', 'product_services_sort_order_index');
        $this->dropIndex('members', 'members_status_sort_order_index');
        $this->dropIndex('testimonials', 'testimonials_status_sort_order_index');
        $this->dropIndex('galleries', 'galleries_status_sort_order_index');
        $this->dropIndex('inquiries', 'inquiries_status_type_created_at_index');
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
