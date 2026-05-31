<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    use HasFactory;

    public const MODULES = [
        'dashboard',
        'cms_pages',
        'products_services',
        'categories',
        'inquiries',
        'members',
        'admin_users',
        'roles_permissions',
        'testimonials',
        'galleries',
        'settings',
    ];

    public const ACTIONS = [
        'view',
        'create',
        'edit',
        'delete',
        'publish',
        'export',
    ];

    protected $attributes = [
        'guard_name' => 'admin',
    ];

    protected $fillable = [
        'name',
        'guard_name',
        'label',
        'slug',
        'module',
    ];
}
