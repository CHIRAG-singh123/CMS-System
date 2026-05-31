<?php

namespace App\Http\Requests\Admin;

use App\Models\Gallery;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GalleryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $galleryId = $this->route('gallery')?->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('galleries', 'slug')->ignore($galleryId)],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'gallery_uploads' => ['nullable', 'array'],
            'gallery_uploads.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'gallery_uploads_meta' => ['nullable', 'array'],
            'gallery_uploads_meta.*.title' => ['nullable', 'string', 'max:255'],
            'gallery_uploads_meta.*.alt_text' => ['nullable', 'string', 'max:255'],
            'gallery_uploads_meta.*.caption' => ['nullable', 'string'],
            'gallery_uploads_meta.*.status' => ['required_with:gallery_uploads_meta', Rule::in(\App\Models\GalleryImage::STATUSES)],
            'gallery_uploads_meta.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(Gallery::STATUSES)],
        ];
    }
}
