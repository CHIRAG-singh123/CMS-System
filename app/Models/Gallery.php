<?php

namespace App\Models;

use App\Models\Concerns\HasStablePrefixedUid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gallery extends Model
{
    use HasFactory;
    use HasStablePrefixedUid;

    public const STATUSES = ['published', 'hidden'];

    protected $fillable = [
        'title',
        'slug',
        'description',
        'cover_image',
        'status',
    ];

    protected static function uidPrefix(): string
    {
        return 'GAL';
    }

    public function images(): HasMany
    {
        return $this->hasMany(GalleryImage::class)->orderBy('sort_order')->orderByDesc('id');
    }
}
