<?php

namespace App\Support;

use InvalidArgumentException;

class FixedCmsPageRegistry
{
    public const HOME = 'home';
    public const ABOUT = 'about-us';
    public const SERVICES = 'services';
    public const GALLERY = 'gallery';
    public const CONTACT = 'contact-us';

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_keys(self::definitions());
    }

    /**
     * @return array<string, array{
     *     key:string,
     *     title:string,
     *     slug:string,
     *     public_path:string,
     *     admin_description:string,
     *     short_description:string,
     *     meta_title:string,
     *     meta_description:string,
     *     meta_keywords:string,
     *     sections:array<string, mixed>
     * }>
     */
    public static function definitions(): array
    {
        return [
            self::HOME => [
                'key' => self::HOME,
                'title' => 'Home',
                'slug' => 'home',
                'public_path' => '/',
                'admin_description' => 'Hero messaging, featured services, proof points, testimonials, and the closing CTA for the landing page.',
                'short_description' => 'A polished landing page that introduces the brand, highlights signature capabilities, and points visitors toward services and contact.',
                'meta_title' => 'Home | Default Panel',
                'meta_description' => 'A production-ready homepage with brand story, featured services, proof points, and testimonials.',
                'meta_keywords' => 'home, industrial, manufacturing, services, gallery, contact',
                'sections' => [
                    'hero' => [
                        'eyebrow' => 'Built for modern industrial brands',
                        'title' => 'Engineered storytelling for products, projects, and trust.',
                        'body' => 'Launch a premium web presence that turns operational depth into a clear customer narrative. The homepage balances credibility, conversion, and sharp visual pacing.',
                        'primaryCtaLabel' => 'Explore services',
                        'primaryCtaHref' => '/services',
                        'secondaryCtaLabel' => 'Talk to our team',
                        'secondaryCtaHref' => '/contact-us',
                    ],
                    'stats' => [
                        ['value' => '18+', 'label' => 'years of delivery insight'],
                        ['value' => '120+', 'label' => 'projects and catalogs shaped'],
                        ['value' => '24/7', 'label' => 'commercial response rhythm'],
                    ],
                    'reasons' => [
                        [
                            'title' => 'Clear positioning',
                            'body' => 'Translate technical capability into a message buyers, distributors, and procurement teams understand immediately.',
                        ],
                        [
                            'title' => 'Flexible content system',
                            'body' => 'Pair structured CMS copy with reusable services, galleries, testimonials, and team content managed elsewhere in admin.',
                        ],
                        [
                            'title' => 'Built to scale',
                            'body' => 'Move from a simple marketing presence to a richer catalog and inquiry workflow without rebuilding the site shell.',
                        ],
                    ],
                    'featuredServices' => [
                        'eyebrow' => 'Featured capabilities',
                        'title' => 'Services and products worth opening first.',
                        'body' => 'This section automatically pulls from published featured product/service records so the homepage stays current without duplicate entry.',
                    ],
                    'testimonials' => [
                        'eyebrow' => 'Client proof',
                        'title' => 'Signals of reliability from real delivery work.',
                        'body' => 'Published testimonials help the homepage feel credible and grounded instead of promotional.',
                    ],
                    'cta' => [
                        'title' => 'Need a site that feels precise, premium, and easier to manage?',
                        'body' => 'Use the five-page CMS to keep the public story tight while still giving editors control over messaging, visuals, SEO, and inquiry capture.',
                        'primaryCtaLabel' => 'Start a conversation',
                        'primaryCtaHref' => '/contact-us',
                    ],
                ],
            ],
            self::ABOUT => [
                'key' => self::ABOUT,
                'title' => 'About Us',
                'slug' => 'about-us',
                'public_path' => '/about-us',
                'admin_description' => 'Brand story, values, milestones, team framing, testimonial framing, and the About page CTA.',
                'short_description' => 'Tell the company story through a refined narrative, value pillars, milestone highlights, and team context.',
                'meta_title' => 'About Us | Default Panel',
                'meta_description' => 'A company story page with values, milestones, team highlights, and credibility sections.',
                'meta_keywords' => 'about us, company story, values, team, milestones',
                'sections' => [
                    'hero' => [
                        'eyebrow' => 'Company perspective',
                        'title' => 'The operating mindset behind the work.',
                        'body' => 'The About page should feel measured and credible, showing how the team thinks, works, and maintains standards over time.',
                    ],
                    'story' => [
                        'title' => 'Built on process discipline and long-horizon relationships.',
                        'body' => 'Use this space to explain how the company started, what it solves, and why buyers continue to trust it. Keep it strategic rather than autobiographical.',
                        'secondaryBody' => 'The goal is not volume of text. It is a sharper narrative that connects capability, consistency, and customer outcomes.',
                    ],
                    'values' => [
                        [
                            'title' => 'Precision in delivery',
                            'body' => 'Operational details, specifications, and timelines are treated as commitments, not marketing decoration.',
                        ],
                        [
                            'title' => 'Commercial clarity',
                            'body' => 'Internal teams and external buyers should understand exactly what is being offered, delivered, and supported.',
                        ],
                        [
                            'title' => 'Long-term trust',
                            'body' => 'The page should reinforce that repeat business is earned through responsiveness, consistency, and transparent communication.',
                        ],
                    ],
                    'milestones' => [
                        ['value' => '2006', 'label' => 'foundation year reference'],
                        ['value' => '5', 'label' => 'core verticals supported'],
                        ['value' => '12', 'label' => 'multi-year client partnerships'],
                        ['value' => '100%', 'label' => 'focus on managed content control'],
                    ],
                    'team' => [
                        'eyebrow' => 'People behind the process',
                        'title' => 'Meet the team shaping the experience.',
                        'body' => 'Active member records appear here so leadership or team edits stay synchronized with the public site.',
                    ],
                    'testimonials' => [
                        'eyebrow' => 'Reputation',
                        'title' => 'How clients describe the working relationship.',
                        'body' => 'Optional testimonials reinforce the story with signals of reliability and communication quality.',
                    ],
                    'cta' => [
                        'title' => 'Want the brand story to convert with more confidence?',
                        'body' => 'Guide visitors from trust-building content into a direct inquiry without sending them through unrelated pages.',
                        'primaryCtaLabel' => 'Contact us',
                        'primaryCtaHref' => '/contact-us',
                    ],
                ],
            ],
            self::SERVICES => [
                'key' => self::SERVICES,
                'title' => 'Services',
                'slug' => 'services',
                'public_path' => '/services',
                'admin_description' => 'Hero copy, intro messaging, category framing, listing framing, and the Services page CTA.',
                'short_description' => 'Use structured CMS messaging around the published product and service catalog without duplicating records.',
                'meta_title' => 'Services | Default Panel',
                'meta_description' => 'A catalog-style services page that reuses published product and service records grouped by category.',
                'meta_keywords' => 'services, products, catalog, categories, solutions',
                'sections' => [
                    'hero' => [
                        'eyebrow' => 'Structured offerings',
                        'title' => 'A public catalog that stays aligned with admin-managed records.',
                        'body' => 'The Services page uses CMS-controlled framing copy while the actual offering cards come directly from published product and service records.',
                    ],
                    'intro' => [
                        'title' => 'Organize technical offerings without rewriting the same data twice.',
                        'body' => 'Use this page to set buying context, explain how the catalog is structured, and guide visitors into the right inquiry path.',
                    ],
                    'categories' => [
                        'eyebrow' => 'Category structure',
                        'title' => 'Grouped by active categories for easier scanning.',
                        'body' => 'Published categories define the grouping logic. Featured records surface first to keep the page commercially focused.',
                    ],
                    'listing' => [
                        'eyebrow' => 'Available records',
                        'title' => 'Published products and services.',
                        'body' => 'Cards should expose the best summary, image, type, category, and next-step call to action from the existing module.',
                    ],
                    'cta' => [
                        'title' => 'Need a tailored recommendation instead of browsing the full catalog?',
                        'body' => 'Route the visitor into the contact flow with enough context to connect them to the right record quickly.',
                        'primaryCtaLabel' => 'Request a consultation',
                        'primaryCtaHref' => '/contact-us',
                    ],
                ],
            ],
            self::GALLERY => [
                'key' => self::GALLERY,
                'title' => 'Gallery',
                'slug' => 'gallery',
                'public_path' => '/gallery',
                'admin_description' => 'Hero messaging, gallery intro copy, albums section framing, and the Gallery page CTA.',
                'short_description' => 'A premium gallery page that reuses published albums and images managed in the existing gallery module.',
                'meta_title' => 'Gallery | Default Panel',
                'meta_description' => 'A visual gallery page driven by published albums and their images, with CMS-managed framing copy.',
                'meta_keywords' => 'gallery, projects, visuals, albums, images',
                'sections' => [
                    'hero' => [
                        'eyebrow' => 'Visual proof',
                        'title' => 'Show the work with editorial structure, not a loose media dump.',
                        'body' => 'The Gallery page combines CMS storytelling with published albums and image records so visual content can stay curated and maintainable.',
                    ],
                    'intro' => [
                        'title' => 'Every album should communicate context, not just decoration.',
                        'body' => 'Use this space to explain what visitors are seeing, how the work is grouped, and why the visual reference matters.',
                    ],
                    'albums' => [
                        'eyebrow' => 'Published albums',
                        'title' => 'Curated galleries managed from admin.',
                        'body' => 'Only published galleries and active images should appear here. Album descriptions, titles, and visuals all come from the existing gallery module.',
                    ],
                    'cta' => [
                        'title' => 'Want to discuss a project with visuals like these in mind?',
                        'body' => 'Pair the gallery with a direct contact path so visitors can move from inspiration to inquiry in one step.',
                        'primaryCtaLabel' => 'Contact us',
                        'primaryCtaHref' => '/contact-us',
                    ],
                ],
            ],
            self::CONTACT => [
                'key' => self::CONTACT,
                'title' => 'Contact Us',
                'slug' => 'contact-us',
                'public_path' => '/contact-us',
                'admin_description' => 'Hero copy, form framing, CMS-controlled success message, contact section framing, and the Contact page CTA.',
                'short_description' => 'A contact page with strong framing copy, a validated inquiry form, settings-backed contact details, and map/social blocks.',
                'meta_title' => 'Contact Us | Default Panel',
                'meta_description' => 'A contact page with a structured inquiry form, direct contact details, WhatsApp, map, and social links.',
                'meta_keywords' => 'contact us, inquiries, quote, whatsapp, map, support',
                'sections' => [
                    'hero' => [
                        'eyebrow' => 'Start the conversation',
                        'title' => 'Contact the team with enough context to get a useful response faster.',
                        'body' => 'The contact experience should feel deliberate: clear channels, a better inquiry form, and structured routing into admin review.',
                    ],
                    'intro' => [
                        'title' => 'Use the form for new discussions, quotes, and solution-specific questions.',
                        'body' => 'The form can adapt based on inquiry type, while direct channels stay visible for buyers who prefer a faster human handoff.',
                    ],
                    'form' => [
                        'eyebrow' => 'Inquiry form',
                        'title' => 'Send a structured inquiry',
                        'body' => 'Ask for the details needed to route the message well without making the form feel bloated.',
                        'successMessage' => 'Your inquiry has been received. The team will review it and get back to you shortly.',
                        'submitLabel' => 'Send inquiry',
                    ],
                    'contact' => [
                        'eyebrow' => 'Direct channels',
                        'title' => 'Use the route that matches your urgency.',
                        'body' => 'Show export email, phone, WhatsApp, address, map, and social connections from the existing settings module.',
                    ],
                    'cta' => [
                        'title' => 'Prefer to speak directly before outlining the full requirement?',
                        'body' => 'Keep one last invitation visible for visitors who need a faster route than a long form submission.',
                        'primaryCtaLabel' => 'Call the team',
                        'primaryCtaHref' => 'tel:+91-9000000001',
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array{key:string,title:string,slug:string,public_path:string,admin_description:string,short_description:string,meta_title:string,meta_description:string,meta_keywords:string,sections:array<string,mixed>}
     */
    public static function definition(string $key): array
    {
        $definition = self::definitions()[$key] ?? null;

        if (! $definition) {
            throw new InvalidArgumentException("Unknown CMS page key [{$key}].");
        }

        return $definition;
    }

    /**
     * @param  mixed  $sections
     * @return array<string, mixed>
     */
    public static function normalizeSections(string $key, mixed $sections): array
    {
        $defaults = self::definition($key)['sections'];

        if (! is_array($sections)) {
            return $defaults;
        }

        return self::mergeRecursive($defaults, $sections);
    }

    /**
     * @return array<string, mixed>
     */
    public static function seedAttributes(string $key, ?int $adminId = null): array
    {
        $definition = self::definition($key);

        return [
            'title' => $definition['title'],
            'slug' => $definition['slug'],
            'page_key' => $definition['key'],
            'logo' => null,
            'logo_light' => null,
            'logo_dark' => null,
            'banner_image' => null,
            'short_description' => $definition['short_description'],
            'content' => null,
            'sections_json' => $definition['sections'],
            'meta_title' => $definition['meta_title'],
            'meta_description' => $definition['meta_description'],
            'meta_keywords' => $definition['meta_keywords'],
            'status' => 'published',
            'sort_order' => array_search($key, self::keys(), true) + 1,
            'created_by' => $adminId,
            'updated_by' => $adminId,
        ];
    }

    /**
     * @param  array<string, mixed>  $defaults
     * @param  array<string, mixed>  $provided
     * @return array<string, mixed>
     */
    private static function mergeRecursive(array $defaults, array $provided): array
    {
        $normalized = $defaults;

        foreach ($defaults as $key => $defaultValue) {
            $providedValue = $provided[$key] ?? null;

            if (is_array($defaultValue)) {
                if (! is_array($providedValue)) {
                    continue;
                }

                if (array_is_list($defaultValue)) {
                    $normalized[$key] = self::normalizeList($defaultValue, $providedValue);
                    continue;
                }

                $normalized[$key] = self::mergeRecursive($defaultValue, $providedValue);

                continue;
            }

            if (is_string($defaultValue)) {
                $normalized[$key] = is_scalar($providedValue)
                    ? trim((string) $providedValue)
                    : $defaultValue;
                continue;
            }

            $normalized[$key] = $providedValue ?? $defaultValue;
        }

        return $normalized;
    }

    /**
     * @param  array<int, mixed>  $defaults
     * @param  array<int, mixed>  $provided
     * @return array<int, mixed>
     */
    private static function normalizeList(array $defaults, array $provided): array
    {
        $normalized = [];

        foreach ($defaults as $index => $defaultItem) {
            $providedItem = $provided[$index] ?? null;

            if (is_array($defaultItem)) {
                $normalized[] = is_array($providedItem)
                    ? self::mergeRecursive($defaultItem, $providedItem)
                    : $defaultItem;

                continue;
            }

            $normalized[] = is_scalar($providedItem)
                ? trim((string) $providedItem)
                : $defaultItem;
        }

        return $normalized;
    }
}
