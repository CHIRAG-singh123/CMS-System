<?php

namespace App\Http\Requests;

use App\Models\Inquiry;
use App\Models\ProductService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use libphonenumber\PhoneNumberUtil;
use Propaganistas\LaravelPhone\Rules\Phone;

class PublicInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $phone = trim((string) $this->input('phone'));
        $phoneCountry = strtoupper(trim((string) $this->input('phone_country')));

        $this->merge([
            'name' => trim((string) $this->input('name')),
            'email' => trim((string) $this->input('email')),
            'phone' => $phone !== '' ? $phone : null,
            'phone_country' => $phone !== '' && $phoneCountry !== '' ? $phoneCountry : null,
            'subject' => trim((string) $this->input('subject')),
            'message' => trim((string) $this->input('message')),
            'website' => trim((string) $this->input('website')),
        ]);
    }

    public function rules(): array
    {
        return [
            'inquiry_type' => ['required', Rule::in(Inquiry::TYPES)],
            'product_service_id' => [
                'nullable',
                'integer',
                Rule::exists('product_services', 'id')->where(fn ($query) => $query->where('status', 'published')),
            ],
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => [
                'nullable',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if ($value === null || $value === '') {
                        return;
                    }

                    (new Phone())
                        ->countryField('phone_country')
                        ->setData($this->validationData())
                        ->validate($attribute, $value, function () use ($fail): void {
                            $fail('Enter a valid phone number for the selected country.');
                        });
                },
            ],
            'phone_country' => ['nullable', 'required_with:phone', 'string', Rule::in(PhoneNumberUtil::getInstance()->getSupportedRegions())],
            'subject' => ['required', 'string', 'min:5', 'max:150'],
            'message' => ['required', 'string', 'min:20', 'max:3000'],
            'website' => ['nullable', 'max:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $requiresRecord = in_array($this->input('inquiry_type'), ['product', 'service', 'quote'], true);
            $recordId = $this->input('product_service_id');

            if ($requiresRecord && ! $recordId) {
                $validator->errors()->add('product_service_id', 'Select a product or service for this inquiry type.');
                return;
            }

            if (! $requiresRecord && $recordId) {
                return;
            }

            if (! $requiresRecord) {
                return;
            }

            $record = ProductService::query()->select(['id', 'type', 'status'])->find($recordId);

            if (! $record || $record->status !== 'published') {
                $validator->errors()->add('product_service_id', 'Select a published product or service.');
                return;
            }

            if ($this->input('inquiry_type') !== 'quote' && $record->type !== $this->input('inquiry_type')) {
                $validator->errors()->add('product_service_id', 'Selected record does not match the chosen inquiry type.');
            }
        });
    }
}
