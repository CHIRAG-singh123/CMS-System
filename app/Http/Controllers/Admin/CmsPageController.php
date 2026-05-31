<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CmsPageRequest;
use App\Models\CmsPage;
use App\Support\AdminMediaService;
use App\Support\FixedCmsPageRegistry;
use App\Support\FixedCmsPageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class CmsPageController extends Controller
{
    public function index(FixedCmsPageService $pages): Response
    {
        $admin = Auth::guard('admin')->user();
        $cmsPages = $pages->sync($admin)
            ->map(fn (CmsPage $page): array => $pages->viewData($page))
            ->values();

        return Inertia::render('admin/cms-pages/Index', [
            'pages' => $cmsPages,
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()
            ->route('admin.cms-pages.index')
            ->with('error', 'CMS pages are fixed. Edit one of the five managed pages instead.');
    }

    public function reorder(): RedirectResponse
    {
        return redirect()
            ->route('admin.cms-pages.index')
            ->with('error', 'The fixed CMS pages cannot be reordered.');
    }

    public function store(): RedirectResponse
    {
        return redirect()
            ->route('admin.cms-pages.index')
            ->with('error', 'New CMS pages are disabled. Use the fixed page manager instead.');
    }

    public function edit(CmsPage $cmsPage, FixedCmsPageService $pages): RedirectResponse|Response
    {
        if (! $cmsPage->isFixedPage()) {
            return redirect()
                ->route('admin.cms-pages.index')
                ->with('error', 'Only the five fixed CMS pages can be edited.');
        }

        $pages->sync(Auth::guard('admin')->user());
        $cmsPage->refresh();

        return Inertia::render('admin/cms-pages/Edit', [
            'cmsPage' => $pages->viewData($cmsPage),
            'statuses' => CmsPage::STATUSES,
        ]);
    }

    public function update(CmsPageRequest $request, CmsPage $cmsPage, AdminMediaService $media): RedirectResponse
    {
        if (! $cmsPage->isFixedPage()) {
            return redirect()
                ->route('admin.cms-pages.index')
                ->with('error', 'Only the five fixed CMS pages can be edited.');
        }

        $admin = Auth::guard('admin')->user();
        $data = $request->validated();
        $pageKey = (string) $cmsPage->page_key;
        $definition = FixedCmsPageRegistry::definition($pageKey);
        $payload = Arr::except($data, ['banner_image', 'remove_banner_image', 'sections']);

        $payload['title'] = $definition['title'];
        $payload['slug'] = $definition['slug'];
        $payload['page_key'] = $pageKey;
        $payload['sort_order'] = array_search($pageKey, FixedCmsPageRegistry::keys(), true) + 1;
        $payload['sections_json'] = FixedCmsPageRegistry::normalizeSections($pageKey, $data['sections'] ?? []);
        $payload['banner_image'] = $this->syncAsset(
            $request->file('banner_image'),
            (bool) ($data['remove_banner_image'] ?? false),
            $cmsPage->banner_image,
            'cms',
            $media,
        );
        $payload['updated_by'] = $admin?->id;

        $cmsPage->forceFill($payload)->save();
        app(\App\Support\AdminUiCache::class)->flushPublicCms();

        return redirect()
            ->route('admin.cms-pages.index')
            ->with('success', 'CMS page updated successfully.');
    }

    public function destroy(): RedirectResponse
    {
        return redirect()
            ->route('admin.cms-pages.index')
            ->with('error', 'The fixed CMS pages cannot be deleted.');
    }

    private function syncAsset(
        mixed $file,
        bool $remove,
        ?string $currentPath,
        string $directory,
        AdminMediaService $media,
    ): ?string
    {
        if ($file) {
            return $media->replace($file, $currentPath, $directory, Auth::guard('admin')->user());
        }

        if ($remove) {
            $media->delete($currentPath);

            return null;
        }

        return $currentPath;
    }
}
