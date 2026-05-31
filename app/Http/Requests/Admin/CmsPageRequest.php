<?php

namespace App\Http\Requests\Admin;

use App\Models\CmsPage;
use App\Support\FixedCmsPageRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CmsPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $page = $this->route('cms_page') ?? $this->route('cmsPage');

        return $page instanceof CmsPage && $page->isFixedPage();
    }

    public function rules(): array
    {
        /** @var CmsPage|null $page */
        $page = $this->route('cms_page') ?? $this->route('cmsPage');
        $pageKey = (string) $page?->page_key;

        return array_merge([
            'short_description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_banner_image' => ['nullable', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'meta_keywords' => ['nullable', 'string'],
            'status' => ['required', Rule::in(CmsPage::STATUSES)],
        ], $this->sectionRules($pageKey));
    }

    public function messages(): array
    {
        return [
            'sections.stats.size' => 'Home stats must contain exactly 3 items.',
            'sections.reasons.size' => 'Why choose us cards must contain exactly 3 items.',
            'sections.values.size' => 'About values must contain exactly 3 cards.',
            'sections.milestones.size' => 'About milestones must contain exactly 4 items.',
        ];
    }

    public function attributes(): array
    {
        return [
            'short_description' => 'short description',
            'banner_image' => 'banner image',
            'meta_title' => 'SEO title',
            'meta_description' => 'SEO description',
            'meta_keywords' => 'SEO keywords',
            'sections.hero.eyebrow' => 'hero eyebrow',
            'sections.hero.title' => 'hero title',
            'sections.hero.body' => 'hero body',
            'sections.hero.primaryCtaLabel' => 'primary button label',
            'sections.hero.primaryCtaHref' => 'primary button link',
            'sections.hero.secondaryCtaLabel' => 'secondary button label',
            'sections.hero.secondaryCtaHref' => 'secondary button link',
            'sections.stats.*.value' => 'stat value',
            'sections.stats.*.label' => 'stat label',
            'sections.reasons.*.title' => 'reason card title',
            'sections.reasons.*.body' => 'reason card body',
            'sections.featuredServices.eyebrow' => 'featured services eyebrow',
            'sections.featuredServices.title' => 'featured services title',
            'sections.featuredServices.body' => 'featured services body',
            'sections.testimonials.eyebrow' => 'testimonials eyebrow',
            'sections.testimonials.title' => 'testimonials title',
            'sections.testimonials.body' => 'testimonials body',
            'sections.story.title' => 'story title',
            'sections.story.body' => 'story primary copy',
            'sections.story.secondaryBody' => 'story secondary copy',
            'sections.values.*.title' => 'value card title',
            'sections.values.*.body' => 'value card body',
            'sections.milestones.*.value' => 'milestone value',
            'sections.milestones.*.label' => 'milestone label',
            'sections.team.eyebrow' => 'team eyebrow',
            'sections.team.title' => 'team title',
            'sections.team.body' => 'team body',
            'sections.intro.title' => 'intro title',
            'sections.intro.body' => 'intro body',
            'sections.categories.eyebrow' => 'category eyebrow',
            'sections.categories.title' => 'category title',
            'sections.categories.body' => 'category body',
            'sections.listing.eyebrow' => 'listing eyebrow',
            'sections.listing.title' => 'listing title',
            'sections.listing.body' => 'listing body',
            'sections.albums.eyebrow' => 'albums eyebrow',
            'sections.albums.title' => 'albums title',
            'sections.albums.body' => 'albums body',
            'sections.form.eyebrow' => 'form eyebrow',
            'sections.form.title' => 'form title',
            'sections.form.body' => 'form body',
            'sections.form.successMessage' => 'success message',
            'sections.form.submitLabel' => 'submit button label',
            'sections.contact.eyebrow' => 'contact eyebrow',
            'sections.contact.title' => 'contact title',
            'sections.contact.body' => 'contact body',
            'sections.cta.title' => 'closing CTA title',
            'sections.cta.body' => 'closing CTA body',
            'sections.cta.primaryCtaLabel' => 'closing CTA button label',
            'sections.cta.primaryCtaHref' => 'closing CTA button link',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ($this->linkFields() as $field) {
                $value = trim((string) $this->input($field));

                if ($value === '' || $this->isValidLinkTarget($value)) {
                    continue;
                }

                $validator->errors()->add($field, 'Use a valid internal path, http(s) URL, phone link, email link, or anchor link.');
            }
        });
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function sectionRules(string $pageKey): array
    {
        return match ($pageKey) {
            FixedCmsPageRegistry::HOME => $this->homeRules(),
            FixedCmsPageRegistry::ABOUT => $this->aboutRules(),
            FixedCmsPageRegistry::SERVICES => $this->servicesRules(),
            FixedCmsPageRegistry::GALLERY => $this->galleryRules(),
            FixedCmsPageRegistry::CONTACT => $this->contactRules(),
            default => [],
        };
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function homeRules(): array
    {
        return [
            'sections.hero.eyebrow' => ['required', 'string', 'max:120'],
            'sections.hero.title' => ['required', 'string', 'max:255'],
            'sections.hero.body' => ['required', 'string', 'max:2000'],
            'sections.hero.primaryCtaLabel' => ['required', 'string', 'max:80'],
            'sections.hero.primaryCtaHref' => ['required', 'string', 'max:255'],
            'sections.hero.secondaryCtaLabel' => ['required', 'string', 'max:80'],
            'sections.hero.secondaryCtaHref' => ['required', 'string', 'max:255'],
            'sections.stats' => ['required', 'array', 'size:3'],
            'sections.stats.*.value' => ['required', 'string', 'max:40'],
            'sections.stats.*.label' => ['required', 'string', 'max:120'],
            'sections.reasons' => ['required', 'array', 'size:3'],
            'sections.reasons.*.title' => ['required', 'string', 'max:120'],
            'sections.reasons.*.body' => ['required', 'string', 'max:800'],
            'sections.featuredServices.eyebrow' => ['required', 'string', 'max:120'],
            'sections.featuredServices.title' => ['required', 'string', 'max:255'],
            'sections.featuredServices.body' => ['required', 'string', 'max:1200'],
            'sections.testimonials.eyebrow' => ['required', 'string', 'max:120'],
            'sections.testimonials.title' => ['required', 'string', 'max:255'],
            'sections.testimonials.body' => ['required', 'string', 'max:1200'],
            'sections.cta.title' => ['required', 'string', 'max:255'],
            'sections.cta.body' => ['required', 'string', 'max:1200'],
            'sections.cta.primaryCtaLabel' => ['required', 'string', 'max:80'],
            'sections.cta.primaryCtaHref' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function aboutRules(): array
    {
        return [
            'sections.hero.eyebrow' => ['required', 'string', 'max:120'],
            'sections.hero.title' => ['required', 'string', 'max:255'],
            'sections.hero.body' => ['required', 'string', 'max:2000'],
            'sections.story.title' => ['required', 'string', 'max:255'],
            'sections.story.body' => ['required', 'string', 'max:2500'],
            'sections.story.secondaryBody' => ['required', 'string', 'max:2500'],
            'sections.values' => ['required', 'array', 'size:3'],
            'sections.values.*.title' => ['required', 'string', 'max:120'],
            'sections.values.*.body' => ['required', 'string', 'max:800'],
            'sections.milestones' => ['required', 'array', 'size:4'],
            'sections.milestones.*.value' => ['required', 'string', 'max:40'],
            'sections.milestones.*.label' => ['required', 'string', 'max:120'],
            'sections.team.eyebrow' => ['required', 'string', 'max:120'],
            'sections.team.title' => ['required', 'string', 'max:255'],
            'sections.team.body' => ['required', 'string', 'max:1200'],
            'sections.testimonials.eyebrow' => ['nullable', 'string', 'max:120'],
            'sections.testimonials.title' => ['nullable', 'string', 'max:255'],
            'sections.testimonials.body' => ['nullable', 'string', 'max:1200'],
            'sections.cta.title' => ['required', 'string', 'max:255'],
            'sections.cta.body' => ['required', 'string', 'max:1200'],
            'sections.cta.primaryCtaLabel' => ['required', 'string', 'max:80'],
            'sections.cta.primaryCtaHref' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function servicesRules(): array
    {
        return [
            'sections.hero.eyebrow' => ['required', 'string', 'max:120'],
            'sections.hero.title' => ['required', 'string', 'max:255'],
            'sections.hero.body' => ['required', 'string', 'max:2000'],
            'sections.intro.title' => ['required', 'string', 'max:255'],
            'sections.intro.body' => ['required', 'string', 'max:2000'],
            'sections.categories.eyebrow' => ['required', 'string', 'max:120'],
            'sections.categories.title' => ['required', 'string', 'max:255'],
            'sections.categories.body' => ['required', 'string', 'max:1200'],
            'sections.listing.eyebrow' => ['required', 'string', 'max:120'],
            'sections.listing.title' => ['required', 'string', 'max:255'],
            'sections.listing.body' => ['required', 'string', 'max:1200'],
            'sections.cta.title' => ['required', 'string', 'max:255'],
            'sections.cta.body' => ['required', 'string', 'max:1200'],
            'sections.cta.primaryCtaLabel' => ['required', 'string', 'max:80'],
            'sections.cta.primaryCtaHref' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function galleryRules(): array
    {
        return [
            'sections.hero.eyebrow' => ['required', 'string', 'max:120'],
            'sections.hero.title' => ['required', 'string', 'max:255'],
            'sections.hero.body' => ['required', 'string', 'max:2000'],
            'sections.intro.title' => ['required', 'string', 'max:255'],
            'sections.intro.body' => ['required', 'string', 'max:2000'],
            'sections.albums.eyebrow' => ['required', 'string', 'max:120'],
            'sections.albums.title' => ['required', 'string', 'max:255'],
            'sections.albums.body' => ['required', 'string', 'max:1200'],
            'sections.cta.title' => ['required', 'string', 'max:255'],
            'sections.cta.body' => ['required', 'string', 'max:1200'],
            'sections.cta.primaryCtaLabel' => ['required', 'string', 'max:80'],
            'sections.cta.primaryCtaHref' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function contactRules(): array
    {
        return [
            'sections.hero.eyebrow' => ['required', 'string', 'max:120'],
            'sections.hero.title' => ['required', 'string', 'max:255'],
            'sections.hero.body' => ['required', 'string', 'max:2000'],
            'sections.intro.title' => ['required', 'string', 'max:255'],
            'sections.intro.body' => ['required', 'string', 'max:2000'],
            'sections.form.eyebrow' => ['required', 'string', 'max:120'],
            'sections.form.title' => ['required', 'string', 'max:255'],
            'sections.form.body' => ['required', 'string', 'max:1200'],
            'sections.form.successMessage' => ['required', 'string', 'max:500'],
            'sections.form.submitLabel' => ['required', 'string', 'max:80'],
            'sections.contact.eyebrow' => ['required', 'string', 'max:120'],
            'sections.contact.title' => ['required', 'string', 'max:255'],
            'sections.contact.body' => ['required', 'string', 'max:1200'],
            'sections.cta.title' => ['nullable', 'string', 'max:255'],
            'sections.cta.body' => ['nullable', 'string', 'max:1200'],
            'sections.cta.primaryCtaLabel' => ['nullable', 'string', 'max:80'],
            'sections.cta.primaryCtaHref' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return list<string>
     */
    private function linkFields(): array
    {
        return [
            'sections.hero.primaryCtaHref',
            'sections.hero.secondaryCtaHref',
            'sections.cta.primaryCtaHref',
        ];
    }

    private function isValidLinkTarget(string $value): bool
    {
        if (preg_match('/[\x00-\x1F\x7F]/', $value) === 1) {
            return false;
        }

        if (str_starts_with($value, '/') && ! str_starts_with($value, '//')) {
            return true;
        }

        if (str_starts_with($value, '#')) {
            return strlen($value) > 1;
        }

        if (str_starts_with($value, 'tel:')) {
            return preg_match('/^tel:\+?[0-9().\-\s]{7,30}$/', $value) === 1;
        }

        if (str_starts_with($value, 'mailto:')) {
            $email = strtok(substr($value, 7), '?') ?: '';

            return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
        }

        if (filter_var($value, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        return in_array(strtolower((string) parse_url($value, PHP_URL_SCHEME)), ['http', 'https'], true);
    }
}
