<?php

namespace App\Http\Requests\Admin;

use App\Models\Member;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use libphonenumber\PhoneNumberUtil;
use Propaganistas\LaravelPhone\Rules\Phone;

class MemberRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'designation' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'short_bio' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', new Phone()],
            'phone_country' => ['nullable', 'required_with:phone', 'string', Rule::in(PhoneNumberUtil::getInstance()->getSupportedRegions())],
            'linkedin' => ['nullable', 'url', 'max:255'],
            'twitter' => ['nullable', 'url', 'max:255'],
            'instagram' => ['nullable', 'url', 'max:255'],
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id')->where(fn ($query) => $query->where('guard_name', 'admin')),
            ],
            'status' => ['required', Rule::in(Member::STATUSES)],
        ];
    }
}
