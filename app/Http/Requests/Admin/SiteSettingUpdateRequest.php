<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use libphonenumber\PhoneNumberUtil;
class SiteSettingUpdateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $phone = trim((string) $this->input('phone'));
        $phoneCountry = strtoupper(trim((string) $this->input('phone_country')));
        $whatsappNumber = trim((string) $this->input('whatsapp_number'));
        $whatsappNumberCountry = strtoupper(trim((string) $this->input('whatsapp_number_country')));

        $this->merge([
            'maintenance_mode' => $this->boolean('maintenance_mode'),
            'phone' => $phone !== '' ? $phone : null,
            'phone_country' => $phone !== '' && $phoneCountry !== '' ? $phoneCountry : null,
            'whatsapp_number' => $whatsappNumber !== '' ? $whatsappNumber : null,
            'whatsapp_number_country' => $whatsappNumber !== '' && $whatsappNumberCountry !== '' ? $whatsappNumberCountry : null,
            'whatsapp_chat_enabled' => $this->boolean('whatsapp_chat_enabled'),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['nullable', 'string', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'company_address' => ['nullable', 'string'],
            'header_tagline' => ['nullable', 'string', 'max:140'],
            'header_cta_label' => ['nullable', 'string', 'max:60'],
            'header_cta_url' => ['nullable', 'string', 'max:255', 'regex:/^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i'],
            'footer_heading' => ['nullable', 'string', 'max:120'],
            'footer_description' => ['nullable', 'string', 'max:800'],
            'footer_cta_label' => ['nullable', 'string', 'max:60'],
            'footer_cta_url' => ['nullable', 'string', 'max:255', 'regex:/^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i'],
            'footer_copyright' => ['nullable', 'string', 'max:180'],
            'maintenance_mode' => ['nullable', 'boolean'],
            'maintenance_message' => ['nullable', 'string', 'max:500'],
            'logo_light' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
            'logo_dark' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
            'remove_logo_light' => ['nullable', 'boolean'],
            'remove_logo_dark' => ['nullable', 'boolean'],
            'brochure_file' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'remove_brochure_file' => ['nullable', 'boolean'],
            'export_email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'phone:phone_country'],
            'phone_country' => ['nullable', 'required_with:phone', 'string', Rule::in(PhoneNumberUtil::getInstance()->getSupportedRegions())],
            'whatsapp_number' => ['nullable', 'phone:whatsapp_number_country'],
            'whatsapp_number_country' => ['nullable', 'required_with:whatsapp_number', 'string', Rule::in(PhoneNumberUtil::getInstance()->getSupportedRegions())],
            'whatsapp_chat_enabled' => ['nullable', 'boolean'],
            'whatsapp_prefill_message' => ['nullable', 'string', 'max:500'],
            'map_title' => ['nullable', 'string', 'max:255'],
            'map_address' => ['nullable', 'string', 'max:255'],
            'map_embed' => ['nullable', 'string'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.phone' => 'Enter a valid phone number for the selected country.',
            'whatsapp_number.phone' => 'Enter a valid WhatsApp number for the selected country.',
            'phone_country.required_with' => 'Select a country code before entering a phone number.',
            'whatsapp_number_country.required_with' => 'Select a country code before entering a WhatsApp number.',
            'phone_country.in' => 'Select a valid phone country code.',
            'whatsapp_number_country.in' => 'Select a valid WhatsApp country code.',
        ];
    }
}
