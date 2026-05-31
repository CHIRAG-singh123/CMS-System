<?php

namespace App\Http\Requests\Admin;

use App\Models\Admin;
use Illuminate\Foundation\Http\FormRequest;

class AdminSidebarLogoUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Admin|null $admin */
        $admin = $this->user('admin');

        return $admin?->isSuperAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'logo_light' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
            'logo_dark' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! $this->hasFile('logo_light') && ! $this->hasFile('logo_dark')) {
                $validator->errors()->add('logo_light', 'Upload at least one logo file.');
            }
        });
    }
}
