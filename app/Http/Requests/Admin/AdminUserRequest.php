<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use libphonenumber\PhoneNumberUtil;
use Propaganistas\LaravelPhone\Rules\Phone;

class AdminUserRequest extends FormRequest
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
        $adminId = $this->route('adminUser')?->id;
        $passwordRules = $adminId === null
            ? ['required', 'string', 'confirmed', Password::defaults()]
            : ['nullable', 'string', 'confirmed', Password::defaults()];

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('admins', 'email')->ignore($adminId)],
            'password' => $passwordRules,
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'phone' => ['nullable', new Phone()],
            'phone_country' => ['nullable', 'required_with:phone', 'string', Rule::in(PhoneNumberUtil::getInstance()->getSupportedRegions())],
            'job_title' => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'timezone'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'theme_preference' => ['required', Rule::in(['light', 'dark'])],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id')->where(fn ($query) => $query->where('guard_name', 'admin')),
            ],
            'permission_ids' => ['nullable', 'array'],
            'permission_ids.*' => [
                'integer',
                Rule::exists('permissions', 'id')->where(fn ($query) => $query->where('guard_name', 'admin')),
            ],
        ];
    }
}
