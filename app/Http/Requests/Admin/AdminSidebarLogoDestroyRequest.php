<?php

namespace App\Http\Requests\Admin;

use App\Models\Admin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminSidebarLogoDestroyRequest extends FormRequest
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
            'variant' => ['required', 'string', Rule::in(['light', 'dark'])],
        ];
    }
}
