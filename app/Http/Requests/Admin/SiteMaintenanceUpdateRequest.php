<?php

namespace App\Http\Requests\Admin;

use App\Models\SiteSetting;
use Illuminate\Foundation\Http\FormRequest;

class SiteMaintenanceUpdateRequest extends FormRequest
{
    private ?bool $maintenanceModeChanged = null;

    protected function prepareForValidation(): void
    {
        $currentPassword = $this->input('current_password');

        $this->merge([
            'maintenance_mode' => $this->boolean('maintenance_mode'),
            'maintenance_message' => trim((string) $this->input('maintenance_message')),
            'current_password' => $currentPassword === '' ? null : $currentPassword,
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'maintenance_mode' => ['required', 'boolean'],
            'maintenance_message' => ['nullable', 'string', 'max:500'],
            'current_password' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->sometimes('current_password', ['required', 'current_password:admin'], fn (): bool => $this->maintenanceModeChanged());
    }

    private function maintenanceModeChanged(): bool
    {
        if ($this->maintenanceModeChanged !== null) {
            return $this->maintenanceModeChanged;
        }

        $currentMaintenanceMode = (bool) SiteSetting::query()->value('maintenance_mode');

        return $this->maintenanceModeChanged = $currentMaintenanceMode !== $this->boolean('maintenance_mode');
    }
}
