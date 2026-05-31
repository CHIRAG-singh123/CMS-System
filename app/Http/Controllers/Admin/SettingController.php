<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SiteMaintenanceUpdateRequest;
use App\Http\Requests\Admin\SiteSettingUpdateRequest;
use App\Models\Admin;
use App\Models\SiteSetting;
use App\Support\AdminMediaService;
use App\Support\AdminUiCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        /** @var Admin $admin */
        $admin = Auth::guard('admin')->user();

        return Inertia::render('admin/settings/Edit', [
            'settings' => SiteSetting::singleton($admin),
        ]);
    }

    public function update(SiteSettingUpdateRequest $request, AdminMediaService $media): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');
        $settings = SiteSetting::singleton($admin);
        $data = $request->validated();

        DB::transaction(function () use ($request, $media, $admin, $settings, $data): void {
            $payload = Arr::except($data, [
                'logo_light',
                'logo_dark',
                'brochure_file',
                'remove_logo_light',
                'remove_logo_dark',
                'remove_brochure_file',
            ]);

            $payload['maintenance_mode'] = (bool) ($data['maintenance_mode'] ?? false);
            $payload['whatsapp_chat_enabled'] = (bool) ($data['whatsapp_chat_enabled'] ?? false);
            $payload['logo_light'] = $this->syncAsset(
                $request->file('logo_light'),
                (bool) ($data['remove_logo_light'] ?? false),
                $settings->logo_light,
                'settings/logos',
                $media,
                $admin,
            );
            $payload['logo_dark'] = $this->syncAsset(
                $request->file('logo_dark'),
                (bool) ($data['remove_logo_dark'] ?? false),
                $settings->logo_dark,
                'settings/logos',
                $media,
                $admin,
            );
            $payload['brochure_file'] = $this->syncAsset(
                $request->file('brochure_file'),
                (bool) ($data['remove_brochure_file'] ?? false),
                $settings->brochure_file,
                'settings/brochures',
                $media,
                $admin,
            );
            $payload['created_by'] = $settings->created_by ?? $admin->id;
            $payload['updated_by'] = $admin->id;

            $settings->forceFill($payload)->save();
        });

        app(AdminUiCache::class)->flushBranding();

        return redirect()
            ->route('admin.settings.edit')
            ->with('success', 'Settings updated successfully.');
    }

    public function updateMaintenance(SiteMaintenanceUpdateRequest $request): RedirectResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');
        $settings = SiteSetting::singleton($admin);
        $data = $request->validated();

        $settings->forceFill([
            'maintenance_mode' => (bool) $data['maintenance_mode'],
            'maintenance_message' => $data['maintenance_message'] ?: null,
            'created_by' => $settings->created_by ?? $admin->id,
            'updated_by' => $admin->id,
        ])->save();

        app(AdminUiCache::class)->flushBranding();

        return redirect()
            ->route('admin.settings.edit');
    }

    private function syncAsset(
        ?UploadedFile $file,
        bool $remove,
        ?string $currentPath,
        string $directory,
        AdminMediaService $media,
        Admin $admin,
    ): ?string {
        if ($file) {
            return $media->replace($file, $currentPath, $directory, $admin);
        }

        if ($remove) {
            $media->delete($currentPath);

            return null;
        }

        return $currentPath;
    }
}
