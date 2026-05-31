<?php

namespace App\Models;

use App\Models\Concerns\HasStablePrefixedUid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductService extends Model
{
    use HasFactory;
    use HasStablePrefixedUid;

    public const TYPES = ['product', 'service'];
    public const STATUSES = ['draft', 'published', 'hidden'];
    public const GALLERY_IMAGE_LIMIT = 5;

    protected $fillable = [
        'category_id',
        'type',
        'title',
        'slug',
        'short_description',
        'description',
        'featured_image',
        'gallery_images',
        'features_json',
        'benefits_json',
        'specifications_json',
        'status',
        'is_featured',
        'meta_title',
        'meta_description',
    ];

    protected function casts(): array
    {
        return [
            'gallery_images' => 'array',
            'features_json' => 'array',
            'benefits_json' => 'array',
            'specifications_json' => 'array',
            'is_featured' => 'boolean',
        ];
    }

    protected static function uidPrefix(): string
    {
        return 'PSR';
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
