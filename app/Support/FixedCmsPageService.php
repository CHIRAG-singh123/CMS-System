<?php

namespace App\Support;

use App\Models\Admin;
use App\Models\CmsPage;
use Illuminate\Database\Eloquent\Collection;

class FixedCmsPageService
{
    private const LEGACY_KEY_MAP = [
        'homepage' => FixedCmsPageRegistry::HOME,
        'about' => FixedCmsPageRegistry::ABOUT,
        'products-services' => FixedCmsPageRegistry::SERVICES,
        'contact-us' => FixedCmsPageRegistry::CONTACT,
    ];

    /**
     * @return Collection<int, CmsPage>
     */
    public function sync(?Admin $admin = null): Collection
    {
        $adminId = $admin?->id ?? Admin::query()->orderBy('id')->value('id');
        $keys = FixedCmsPageRegistry::keys();
        $pages = CmsPage::query()->whereIn('page_key', $keys)->get()->keyBy('page_key');

        foreach ($keys as $index => $key) {
            $definition = FixedCmsPageRegistry::definition($key);
            $page = $pages->get($key);

            if (! $page) {
                $legacyPage = $this->legacyPage($key);

                if ($legacyPage) {
                    $this->hydratePage($legacyPage, $definition, $index + 1);
                    continue;
                }

                CmsPage::query()->create(FixedCmsPageRegistry::seedAttributes($key, $adminId));
                continue;
            }

            $this->hydratePage($page, $definition, $index + 1);
        }

        return CmsPage::query()
            ->whereIn('page_key', $keys)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function page(string $key): CmsPage
    {
        $page = CmsPage::query()
            ->where('page_key', $key)
            ->first();

        if ($page) {
            return $page;
        }

        $this->sync();

        return CmsPage::query()
            ->where('page_key', $key)
            ->firstOrFail();
    }

    /**
     * @return array<string, mixed>
     */
    public function viewData(CmsPage $page): array
    {
        $definition = FixedCmsPageRegistry::definition((string) $page->page_key);

        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'page_key' => $page->page_key,
            'public_path' => $definition['public_path'],
            'short_description' => $page->short_description,
            'banner_image' => $page->banner_image,
            'meta_title' => $page->meta_title,
            'meta_description' => $page->meta_description,
            'meta_keywords' => $page->meta_keywords,
            'status' => $page->status,
            'sort_order' => $page->sort_order,
            'updated_at' => $page->updated_at?->toIso8601String(),
            'sections' => FixedCmsPageRegistry::normalizeSections((string) $page->page_key, $page->sections_json),
            'admin_description' => $definition['admin_description'],
        ];
    }

    private function legacyPage(string $targetKey): ?CmsPage
    {
        $legacyKey = array_search($targetKey, self::LEGACY_KEY_MAP, true);

        if (! is_string($legacyKey)) {
            return null;
        }

        return CmsPage::query()
            ->where('page_key', $legacyKey)
            ->first();
    }

    /**
     * @param  array{key:string,title:string,slug:string,public_path:string,admin_description:string,short_description:string,meta_title:string,meta_description:string,meta_keywords:string,sections:array<string,mixed>}  $definition
     */
    private function hydratePage(CmsPage $page, array $definition, int $sortOrder): void
    {
        $page->forceFill([
            'title' => $definition['title'],
            'slug' => $definition['slug'],
            'page_key' => $definition['key'],
            'short_description' => filled($page->short_description) ? $page->short_description : $definition['short_description'],
            'meta_title' => filled($page->meta_title) ? $page->meta_title : $definition['meta_title'],
            'meta_description' => filled($page->meta_description) ? $page->meta_description : $definition['meta_description'],
            'meta_keywords' => filled($page->meta_keywords) ? $page->meta_keywords : $definition['meta_keywords'],
            'sections_json' => FixedCmsPageRegistry::normalizeSections($definition['key'], $page->sections_json),
            'sort_order' => $sortOrder,
        ]);

        if ($page->isDirty()) {
            $page->save();
        }
    }
}
