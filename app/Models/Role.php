<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    use HasFactory;

    public const SUPER_ADMIN_SLUG = 'super-admin';

    protected $attributes = [
        'guard_name' => 'admin',
        'status' => 'active',
    ];

    protected $fillable = [
        'name',
        'guard_name',
        'slug',
        'description',
        'status',
    ];

    public function admins(): MorphToMany
    {
        return $this->morphedByMany(
            Admin::class,
            'model',
            config('permission.table_names.model_has_roles'),
            app(\Spatie\Permission\PermissionRegistrar::class)->pivotRole,
            config('permission.column_names.model_morph_key'),
        );
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->slug === self::SUPER_ADMIN_SLUG;
    }
}
