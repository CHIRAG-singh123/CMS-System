<?php

namespace App\Models;

use App\Support\FixedCmsPageRegistry;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsPage extends Model
{
    use HasFactory;

    public const STATUSES = ['draft', 'published', 'hidden'];
    public const FIXED_PAGE_KEYS = [
        FixedCmsPageRegistry::HOME,
        FixedCmsPageRegistry::ABOUT,
        FixedCmsPageRegistry::SERVICES,
        FixedCmsPageRegistry::GALLERY,
        FixedCmsPageRegistry::CONTACT,
    ];

    protected $fillable = [
        'title',
        'slug',
        'page_key',
        'logo',
        'logo_light',
        'logo_dark',
        'banner_image',
        'short_description',
        'content',
        'sections_json',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'status',
        'sort_order',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'sections_json' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'updated_by');
    }

    public function isProtected(): bool
    {
        return in_array($this->page_key, self::FIXED_PAGE_KEYS, true);
    }

    public function isFixedPage(): bool
    {
        return $this->isProtected();
    }
}
