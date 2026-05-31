<?php

use App\Models\Admin;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table): void {
            $table->string('guard_name', 50)->default('admin')->after('name');
        });

        DB::table('roles')
            ->whereNull('guard_name')
            ->orWhere('guard_name', '')
            ->update(['guard_name' => 'admin']);

        Schema::table('roles', function (Blueprint $table): void {
            $table->unique(['name', 'guard_name'], 'roles_name_guard_name_unique');
        });

        Schema::table('permissions', function (Blueprint $table): void {
            $table->string('guard_name', 50)->default('admin')->after('name');
            $table->string('label')->default('')->after('guard_name');
        });

        $permissions = DB::table('permissions')->select(['id', 'name', 'slug', 'label'])->get();

        foreach ($permissions as $permission) {
            DB::table('permissions')
                ->where('id', $permission->id)
                ->update([
                    'name' => $permission->slug ?: $permission->name,
                    'label' => $permission->label !== '' ? $permission->label : $permission->name,
                    'guard_name' => 'admin',
                ]);
        }

        Schema::table('permissions', function (Blueprint $table): void {
            $table->unique(['name', 'guard_name'], 'permissions_name_guard_name_unique');
        });

        Schema::create('model_has_permissions', function (Blueprint $table): void {
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->index(['model_id', 'model_type'], 'model_has_permissions_model_id_model_type_index');
            $table->primary(['permission_id', 'model_id', 'model_type'], 'model_has_permissions_permission_model_type_primary');
        });

        Schema::create('model_has_roles', function (Blueprint $table): void {
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->index(['model_id', 'model_type'], 'model_has_roles_model_id_model_type_index');
            $table->primary(['role_id', 'model_id', 'model_type'], 'model_has_roles_role_model_type_primary');
        });

        $adminRoleAssignments = DB::table('admins')
            ->whereNotNull('role_id')
            ->get(['id', 'role_id']);

        if ($adminRoleAssignments->isNotEmpty()) {
            DB::table('model_has_roles')->insertOrIgnore(
                $adminRoleAssignments
                    ->map(fn (object $assignment): array => [
                        'role_id' => $assignment->role_id,
                        'model_type' => Admin::class,
                        'model_id' => $assignment->id,
                    ])
                    ->all()
            );
        }

        Schema::table('admins', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('role_id');
        });

        Schema::table('members', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('role_id');
        });

        Schema::dropIfExists('member_permission');

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table): void {
            $table->foreignId('role_id')->nullable()->after('avatar')->constrained()->nullOnDelete();
        });

        $adminPrimaryRoles = DB::table('model_has_roles')
            ->where('model_type', Admin::class)
            ->select(['model_id', 'role_id'])
            ->orderBy('role_id')
            ->get()
            ->groupBy('model_id')
            ->map(fn ($roles) => $roles->first());

        foreach ($adminPrimaryRoles as $adminId => $assignment) {
            DB::table('admins')
                ->where('id', $adminId)
                ->update(['role_id' => $assignment->role_id]);
        }

        Schema::create('member_permission', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['member_id', 'permission_id']);
        });

        Schema::table('members', function (Blueprint $table): void {
            $table->foreignId('role_id')->nullable()->after('instagram')->constrained()->nullOnDelete();
        });

        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('model_has_roles');

        Schema::table('permissions', function (Blueprint $table): void {
            $table->dropUnique('permissions_name_guard_name_unique');
        });

        $permissions = DB::table('permissions')->select(['id', 'name', 'label'])->get();

        foreach ($permissions as $permission) {
            DB::table('permissions')
                ->where('id', $permission->id)
                ->update([
                    'name' => $permission->label !== '' ? $permission->label : $permission->name,
                ]);
        }

        Schema::table('permissions', function (Blueprint $table): void {
            $table->dropColumn(['guard_name', 'label']);
        });

        Schema::table('roles', function (Blueprint $table): void {
            $table->dropUnique('roles_name_guard_name_unique');
            $table->dropColumn('guard_name');
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
