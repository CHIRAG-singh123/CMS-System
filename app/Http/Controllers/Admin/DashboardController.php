<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CmsPage;
use App\Models\Gallery;
use App\Models\Inquiry;
use App\Models\Member;
use App\Models\ProductService;
use App\Models\Role;
use App\Models\Testimonial;
use App\Support\FixedCmsPageRegistry;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/Dashboard', [
            'counts' => fn (): array => [
                'cmsPages' => CmsPage::query()->whereIn('page_key', CmsPage::FIXED_PAGE_KEYS)->count(),
                'productServices' => ProductService::query()->count(),
                'categories' => Category::query()->count(),
                'inquiries' => Inquiry::query()->count(),
                'members' => Member::query()->count(),
                'roles' => Role::query()->count(),
                'testimonials' => Testimonial::query()->count(),
                'galleries' => Gallery::query()->count(),
            ],
            'recentInquiries' => Inertia::defer(fn () => Inquiry::query()
                ->latest()
                ->with('productService:id,title')
                ->limit(8)
                ->get(['id', 'product_service_id', 'name', 'email', 'inquiry_type', 'status', 'created_at'])),
            'recentCmsPages' => Inertia::defer(fn () => CmsPage::query()
                ->whereIn('page_key', FixedCmsPageRegistry::keys())
                ->latest('updated_at')
                ->limit(5)
                ->get(['id', 'title', 'status', 'updated_at'])),
        ]);
    }
}
