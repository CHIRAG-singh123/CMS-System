<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inquiry extends Model
{
    use HasFactory;

    public const TYPES = ['general', 'product', 'service', 'quote'];
    public const STATUSES = ['new', 'read', 'in_progress', 'replied', 'closed'];

    protected $fillable = [
        'inquiry_type',
        'product_service_id',
        'name',
        'email',
        'phone',
        'phone_country',
        'subject',
        'message',
        'status',
        'admin_note',
        'ip_address',
        'user_agent',
    ];

    public function productService(): BelongsTo
    {
        return $this->belongsTo(ProductService::class);
    }
}
