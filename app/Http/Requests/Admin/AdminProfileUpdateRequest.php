<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use libphonenumber\PhoneNumberUtil;
use Propaganistas\LaravelPhone\Rules\Phone;

class AdminProfileUpdateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $phone = trim((string) $this->input('phone'));
        $phoneCountry = strtoupper(trim((string) $this->input('phone_country')));

        $this->merge([
            'phone' => $phone !== '' ? $phone : null,
            'phone_country' => $phone !== '' && $phoneCountry !== '' ? $phoneCountry : null,
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $adminId = $this->user('admin')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('admins', 'email')->ignore($adminId)],
            'phone' => ['nullable', new Phone()],
            'phone_country' => ['nullable', 'required_with:phone', 'string', Rule::in(PhoneNumberUtil::getInstance()->getSupportedRegions())],
            'job_title' => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'timezone'],
            'bio' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
