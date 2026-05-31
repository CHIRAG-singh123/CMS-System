<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $permissionIds = [];

        foreach (['view', 'create', 'edit', 'delete', 'publish', 'export'] as $action) {
            DB::table('permissions')->updateOrInsert(
                ['slug' => "settings.{$action}"],
                [
                    'module' => 'settings',
                    'name' => 'Settings '.Str::headline($action),
                    'updated_at' => $now,
                    'created_at' => $now,
                ],
            );

            if (in_array($action, ['view', 'edit'], true)) {
                $permissionIds[] = DB::table('permissions')->where('slug', "settings.{$action}")->value('id');
            }
        }

        $adminRoleId = DB::table('roles')->where('slug', 'admin')->value('id');

        if ($adminRoleId) {
            foreach (array_filter($permissionIds) as $permissionId) {
                DB::table('permission_role')->updateOrInsert(
                    [
                        'role_id' => $adminRoleId,
                        'permission_id' => $permissionId,
                    ],
                    [
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                );
            }
        }
    }

    public function down(): void
    {
        DB::table('permissions')->where('module', 'settings')->delete();
    }
};
