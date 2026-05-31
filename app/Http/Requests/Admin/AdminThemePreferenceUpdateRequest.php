<?php

namespace App\Http\Requests\Admin;

use App\Support\ThemeManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminThemePreferenceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('admin') !== null;
    }

    public function rules(): array
    {
        return [
            'theme_preference' => ['required', 'string', Rule::in(ThemeManager::MODES)],
        ];
    }
}
