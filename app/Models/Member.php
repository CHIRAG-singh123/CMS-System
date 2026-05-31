<?php

namespace App\Models;

use App\Models\Concerns\HasStablePrefixedUid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;
    use HasStablePrefixedUid;

    public const STATUSES = ['active', 'inactive'];

    protected $fillable = [
        'name',
        'designation',
        'image',
        'short_bio',
        'email',
        'phone',
        'phone_country',
        'linkedin',
        'twitter',
        'instagram',
        'role_id',
        'status',
    ];

    protected static function uidPrefix(): string
    {
        return 'MEM';
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
}
