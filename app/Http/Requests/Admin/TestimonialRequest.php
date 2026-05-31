<?php

namespace App\Http\Requests\Admin;

use App\Models\Testimonial;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_name' => ['required', 'string', 'max:255'],
            'client_designation' => ['nullable', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'message' => ['required', 'string'],
            'status' => ['required', Rule::in(Testimonial::STATUSES)],
        ];
    }
}
