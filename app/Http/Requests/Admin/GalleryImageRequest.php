<?php

namespace App\Http\Requests\Admin;

use App\Models\GalleryImage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GalleryImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->routeIs('admin.galleries.images.store')) {
            return [
                'images' => ['required', 'array', 'min:1'],
                'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            ];
        }

        return [
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'title' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string'],
            'status' => ['required', Rule::in(GalleryImage::STATUSES)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
