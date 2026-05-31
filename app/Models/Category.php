<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Category extends Model
{
    use HasFactory;

    public const STATUSES = ['active', 'inactive'];

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'status',
        'position',
    ];

    protected $hidden = [
        'position',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (self $category): void {
            $position = $category->position;

            if ($position === null) {
                $position = $category->exists
                    ? $category->getOriginal('position')
                    : null;
            }

            if ($position === null && $category->exists) {
                $position = static::query()
                    ->whereKey($category->getKey())
                    ->value('position');
            }

            if ($position === null) {
                $position = ((int) static::query()->max('position')) + 1;
            }

            $position = max(1, (int) $position);

            $category->position = $position;

            if (! $category->exists) {
                $category->uid = null;
            }
        });

        static::saved(function (self $category): void {
            if ($category->wasRecentlyCreated || $category->wasChanged('position')) {
                static::normalizePositionsAndUids();
            }
        });

        static::deleted(function (): void {
            static::normalizePositionsAndUids();
        });
    }

    public function productServices(): HasMany
    {
        return $this->hasMany(ProductService::class);
    }

    private static function normalizePositionsAndUids(): void
    {
        $categories = static::query()
            ->orderBy('position')
            ->orderBy('id')
            ->get(['id', 'position', 'uid']);

        $updates = [];

        foreach ($categories as $index => $category) {
            $position = $index + 1;
            $uid = static::formatUid($position);

            if ((int) $category->position === $position && $category->uid === $uid) {
                continue;
            }

            $updates[$category->id] = [
                'position' => $position,
                'uid' => $uid,
            ];
        }

        if ($updates === []) {
            return;
        }

        DB::transaction(function () use ($updates): void {
            static::query()
                ->whereKey(array_keys($updates))
                ->update(['uid' => null]);

            foreach ($updates as $categoryId => $values) {
                static::query()
                    ->whereKey($categoryId)
                    ->update($values);
            }
        });
    }

    private static function formatUid(int $position): string
    {
        return sprintf('CAT-%06d', max($position, 0));
    }
}
