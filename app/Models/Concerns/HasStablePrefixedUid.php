<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;

trait HasStablePrefixedUid
{
    abstract protected static function uidPrefix(): string;

    protected static function bootHasStablePrefixedUid(): void
    {
        static::saving(function (Model $model): void {
            if (! $model->exists) {
                $model->setAttribute('uid', null);

                return;
            }

            if ($model->exists && $model->isDirty('uid')) {
                $model->setAttribute('uid', $model->getOriginal('uid'));
            }
        });

        static::created(function (Model $model): void {
            $model->forceFill([
                'uid' => static::formatStableUid((int) $model->getKey()),
            ])->saveQuietly();
        });
    }

    protected static function formatStableUid(int $value): string
    {
        return sprintf('%s-%06d', static::uidPrefix(), max($value, 0));
    }
}
