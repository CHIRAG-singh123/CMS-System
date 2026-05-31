<?php

namespace App\Http\Requests\Admin;

use App\Models\ProductService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $record = $this->route('productService');
        $recordId = $record?->id;

        return [
            'category_id' => ['nullable', 'exists:categories,id'],
            'type' => ['required', Rule::in(ProductService::TYPES)],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('product_services', 'slug')->ignore($recordId)],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'featured_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'gallery_uploads' => ['nullable', 'array', 'max:'.ProductService::GALLERY_IMAGE_LIMIT],
            'gallery_uploads.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'existing_gallery_images' => ['nullable', 'array', 'max:'.ProductService::GALLERY_IMAGE_LIMIT],
            'existing_gallery_images.*' => ['string'],
            'features_text' => ['nullable', 'string'],
            'benefits_text' => ['nullable', 'string'],
            'specifications_text' => ['nullable', 'string'],
            'status' => ['required', Rule::in(ProductService::STATUSES)],
            'is_featured' => ['nullable', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $existingCount = collect($this->input('existing_gallery_images', []))
                ->filter(fn ($path): bool => is_string($path) && $path !== '')
                ->count();

            $uploadCount = count($this->file('gallery_uploads', []));

            if (($existingCount + $uploadCount) > ProductService::GALLERY_IMAGE_LIMIT) {
                $validator->errors()->add(
                    'gallery_uploads',
                    'You can keep a maximum of 5 gallery images.',
                );
            }
        });
    }
}
