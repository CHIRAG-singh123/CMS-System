<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'legal_name',
        'company_address',
        'header_tagline',
        'header_cta_label',
        'header_cta_url',
        'footer_heading',
        'footer_description',
        'footer_cta_label',
        'footer_cta_url',
        'footer_copyright',
        'maintenance_mode',
        'maintenance_message',
        'google_login_enabled',
        'logo_light',
        'logo_dark',
        'brochure_file',
        'export_email',
        'phone',
        'phone_country',
        'whatsapp_number',
        'whatsapp_number_country',
        'whatsapp_chat_enabled',
        'whatsapp_prefill_message',
        'map_title',
        'map_address',
        'map_embed',
        'linkedin_url',
        'facebook_url',
        'instagram_url',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'maintenance_mode' => 'boolean',
            'google_login_enabled' => 'boolean',
            'whatsapp_chat_enabled' => 'boolean',
        ];
    }

    public static function singleton(?Admin $admin = null): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'created_by' => $admin?->id,
                'updated_by' => $admin?->id,
            ],
        );
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'updated_by');
    }
}
