<?php

namespace App\Models;

use App\Models\Concerns\HasStablePrefixedUid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use HasFactory;
    use HasStablePrefixedUid;

    public const STATUSES = ['published', 'hidden'];

    protected $fillable = [
        'client_name',
        'client_designation',
        'company_name',
        'image',
        'rating',
        'message',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    protected static function uidPrefix(): string
    {
        return 'TES';
    }
}
