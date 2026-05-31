<?php

namespace App\Http\Requests;

use App\Support\ThemeManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PublicThemeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'theme_mode' => ['required', 'string', Rule::in(ThemeManager::MODES)],
        ];
    }
}
