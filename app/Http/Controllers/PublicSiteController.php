<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Gallery;
use App\Models\GalleryImage;
use App\Models\Inquiry;
use App\Models\Member;
use App\Models\ProductService;
use App\Models\Testimonial;
use App\Support\AdminUiCache;
use App\Support\FixedCmsPageRegistry;
use App\Support\FixedCmsPageService;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function home(FixedCmsPageService $pages, AdminUiCache $uiCache): Response
    {
        $page = $uiCache->publicCmsPage(FixedCmsPageRegistry::HOME, $pages);

        return Inertia::render('public/Home', [
            'page' => $page,
            'settings' => $uiCache->publicSettings(),
            'featuredServices' => Inertia::defer(
                fn () => $this->featuredServicesQuery()
                    ->limit(6)
                    ->get(),
                'home-content',
            ),
            'testimonials' => Inertia::defer(
                fn () => $this->testimonialsQuery()
                    ->limit(6)
                    ->get(),
                'home-content',
            ),
            'members' => Inertia::defer(
                fn () => $this->membersQuery()
                    ->limit(4)
                    ->get(),
                'home-content',
            ),
        ]);
    }

    public function about(FixedCmsPageService $pages, AdminUiCache $uiCache): Response
    {
        $page = $uiCache->publicCmsPage(FixedCmsPageRegistry::ABOUT, $pages);

        return Inertia::render('public/About', [
            'page' => $page,
            'settings' => $uiCache->publicSettings(),
            'members' => Inertia::defer(
                fn () => $this->membersQuery()->get(),
                'about-content',
            ),
            'testimonials' => Inertia::defer(
                fn () => $this->testimonialsQuery()->get(),
                'about-content',
            ),
        ]);
    }

    public function services(FixedCmsPageService $pages, AdminUiCache $uiCache): Response
    {
        $page = $uiCache->publicCmsPage(FixedCmsPageRegistry::SERVICES, $pages);

        return Inertia::render('public/Services', [
            'page' => $page,
            'settings' => $uiCache->publicSettings(),
            'catalogCount' => ProductService::query()
                ->where('status', 'published')
                ->where(function ($query): void {
                    $query->whereNull('category_id')
                        ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('status', 'active'));
                })
                ->count(),
            'categories' => Inertia::defer(
                fn () => $this->serviceCategoriesQuery()->get(
                    $this->publicColumns('categories', ['id', 'name', 'slug', 'description']),
                ),
                'services-content',
            ),
            'uncategorizedServices' => Inertia::defer(
                fn () => $this->uncategorizedServicesQuery()->get(),
                'services-content',
            ),
        ]);
    }

    public function gallery(FixedCmsPageService $pages, AdminUiCache $uiCache): Response
    {
        $page = $uiCache->publicCmsPage(FixedCmsPageRegistry::GALLERY, $pages);

        return Inertia::render('public/Gallery', [
            'page' => $page,
            'settings' => $uiCache->publicSettings(),
            'galleryStats' => [
                'albums' => Gallery::query()
                    ->where('status', 'published')
                    ->count(),
                'images' => GalleryImage::query()
                    ->where('status', 'active')
                    ->whereHas('gallery', fn ($query) => $query->where('status', 'published'))
                    ->count(),
            ],
            'featuredGallery' => $this->featuredGalleryQuery(),
            'galleries' => Inertia::defer(
                fn () => $this->galleriesQuery()->get(
                    $this->publicColumns('galleries', ['id', 'title', 'slug', 'description', 'cover_image', 'status']),
                ),
                'gallery-content',
            ),
        ]);
    }

    public function contact(FixedCmsPageService $pages, AdminUiCache $uiCache): Response
    {
        $page = $uiCache->publicCmsPage(FixedCmsPageRegistry::CONTACT, $pages);

        return Inertia::render('public/Contact', [
            'page' => $page,
            'settings' => $uiCache->publicSettings(),
            'productServices' => $this->orderPublicProductServices(
                ProductService::query()
                ->where('status', 'published')
            )
                ->get(['id', 'title', 'type']),
            'inquiryTypes' => Inquiry::TYPES,
        ]);
    }

    private function publicColumns(string $table, array $columns): array
    {
        return $this->hasColumn($table, 'uid')
            ? ['uid', ...$columns]
            : $columns;
    }

    private function featuredServicesQuery()
    {
        return $this->orderPublicProductServices(
            ProductService::query()
            ->select(['id', 'title', 'slug', 'type', 'short_description', 'featured_image'])
            ->where('status', 'published')
            ->where('is_featured', true),
        );
    }

    private function testimonialsQuery()
    {
        return Testimonial::query()
            ->select($this->publicColumns('testimonials', ['id', 'client_name', 'company_name', 'image', 'message']))
            ->where('status', 'published')
            ->oldest('created_at')
            ->orderBy('id');
    }

    private function membersQuery()
    {
        return Member::query()
            ->select($this->publicColumns('members', ['id', 'name', 'designation', 'image', 'short_bio']))
            ->where('status', 'active')
            ->oldest('created_at')
            ->orderBy('id');
    }

    private function serviceCategoriesQuery()
    {
        return Category::query()
            ->where('status', 'active')
            ->whereHas('productServices', fn ($query) => $query->where('status', 'published'))
            ->with(['productServices' => function ($query): void {
                $this->orderPublicProductServices(
                    $query->select(['id', 'category_id', 'type', 'title', 'slug', 'short_description', 'featured_image'])
                        ->where('status', 'published'),
                );
            }])
            ->orderBy($this->categoryOrderColumn())
            ->orderBy('id');
    }

    private function uncategorizedServicesQuery()
    {
        return $this->orderPublicProductServices(
            ProductService::query()
            ->select(['id', 'category_id', 'title', 'slug', 'type', 'short_description', 'featured_image'])
            ->where('status', 'published')
            ->whereNull('category_id'),
        );
    }

    private function orderPublicProductServices($query)
    {
        $query->orderByDesc('is_featured');

        if ($this->hasColumn('product_services', 'sort_order')) {
            return $query
                ->orderBy('sort_order')
                ->orderBy('title');
        }

        return $query
            ->oldest('created_at')
            ->orderBy('id');
    }

    private function featuredGalleryQuery(): ?Gallery
    {
        return Gallery::query()
            ->where('status', 'published')
            ->withCount(['images as images_count' => function ($query): void {
                $query->where('status', 'active');
            }])
            ->with(['images' => function ($query): void {
                $query->select($this->galleryImageColumns())
                    ->where('status', 'active')
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->limit(4);
            }])
            ->oldest('created_at')
            ->orderBy('id')
            ->first($this->publicColumns('galleries', ['id', 'title', 'slug', 'description', 'cover_image', 'status']));
    }

    private function galleriesQuery()
    {
        return Gallery::query()
            ->where('status', 'published')
            ->withCount(['images as images_count' => function ($query): void {
                $query->where('status', 'active');
            }])
            ->with(['images' => function ($query): void {
                $query->select($this->galleryImageColumns())
                    ->where('status', 'active')
                    ->orderBy('sort_order')
                    ->orderBy('id');
            }])
            ->oldest('created_at')
            ->orderBy('id');
    }

    private function galleryImageColumns(): array
    {
        return ['id', 'gallery_id', 'image', 'title', 'alt_text', 'caption', 'status', 'sort_order'];
    }

    private function categoryOrderColumn(): string
    {
        return $this->hasColumn('categories', 'position') ? 'position' : 'id';
    }

    private function hasColumn(string $table, string $column): bool
    {
        static $cache = [];

        $key = "{$table}.{$column}";

        return $cache[$key] ??= Schema::hasColumn($table, $column);
    }
}
