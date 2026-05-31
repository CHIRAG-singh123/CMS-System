<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsurePublicSiteIsLive
{
    public function handle(Request $request, \Closure $next): Response
    {
        $siteSetting = SiteSetting::query()->first([
            'id',
            'company_name',
            'company_address',
            'maintenance_mode',
            'maintenance_message',
            'export_email',
            'phone',
            'phone_country',
            'whatsapp_number',
            'whatsapp_number_country',
            'whatsapp_chat_enabled',
            'map_title',
            'map_address',
            'map_embed',
            'linkedin_url',
            'facebook_url',
            'instagram_url',
            'header_tagline',
            'header_cta_label',
            'header_cta_url',
            'footer_heading',
            'footer_description',
            'footer_cta_label',
            'footer_cta_url',
            'footer_copyright',
        ]);
        $settings = $siteSetting?->toArray() ?? [];

        if (!($settings['maintenance_mode'] ?? false)) {
            return $next($request);
        }

        return Inertia::render('public/Maintenance', [
            'settings' => $settings,
            'maintenance' => [
                'message' => trim((string) ($settings['maintenance_message'] ?? '')) ?: 'We are performing a quick maintenance update. Please check back shortly.',
            ],
        ])->toResponse($request)->setStatusCode(503);
    }
}
