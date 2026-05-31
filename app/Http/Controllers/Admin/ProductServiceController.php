<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductServiceRequest;
use App\Models\Category;
use App\Models\ProductService;
use App\Support\AdminMediaService;
use App\Support\AdminPaginator;
use App\Support\AdminUiCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPaginator::resolve($request);
        $hasUid = Schema::hasColumn('product_services', 'uid');
        $categoryIds = collect($request->input('category_ids', []))
            ->when($request->filled('category_id'), fn ($collection) => $collection->push($request->input('category_id')))
            ->filter(fn ($value): bool => filter_var($value, FILTER_VALIDATE_INT) !== false)
            ->map(fn ($value): int => (int) $value)
            ->unique()
            ->values();
        $statuses = collect($request->input('statuses', []))
            ->when($request->filled('status'), fn ($collection) => $collection->push($request->input('status')))
            ->filter(fn ($value): bool => is_string($value) && $value !== '')
            ->map(fn ($value): string => (string) $value)
            ->intersect(ProductService::STATUSES)
            ->values();

        return Inertia::render('admin/products-services/Index', [
            'records' => fn () => tap(
                ProductService::query()
                    ->select(['id', 'title', 'slug', 'featured_image', 'type', 'status', 'category_id', 'created_at'])
                    ->with('category:id,name'),
                function ($query) use ($hasUid): void {
                    if ($hasUid) {
                        $query->addSelect('uid');
                    }
                },
            )
                ->when($request->string('search')->toString(), function ($query, string $search) use ($hasUid): void {
                    $like = "%{$search}%";

                    $query->where(function ($subQuery) use ($like, $hasUid): void {
                        $subQuery->where('title', 'like', $like)
                            ->orWhere('slug', 'like', $like)
                            ->orWhere('type', 'like', $like)
                            ->orWhere('status', 'like', $like)
                            ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', $like));

                        if ($hasUid) {
                            $subQuery->orWhere('uid', 'like', $like);
                        }
                    });
                })
                ->when($categoryIds->isNotEmpty(), fn ($query) => $query->whereIn('category_id', $categoryIds->all()))
                ->when($request->string('type')->toString(), fn ($query, string $type) => $query->where('type', $type))
                ->when($statuses->isNotEmpty(), fn ($query) => $query->whereIn('status', $statuses->all()))
                ->oldest('created_at')
                ->orderBy('id')
                ->paginate($perPage)
                ->withQueryString(),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'category_ids' => $categoryIds->map(fn (int $id): string => (string) $id)->all(),
                'type' => $request->string('type')->toString(),
                'statuses' => $statuses->all(),
                'per_page' => (string) $perPage,
            ],
            'categories' => fn () => Category::query()->orderBy('name')->get(['id', 'name']),
            'statuses' => ProductService::STATUSES,
            'types' => ProductService::TYPES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products-services/Create', [
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'statuses' => ProductService::STATUSES,
            'types' => ProductService::TYPES,
        ]);
    }

    public function store(ProductServiceRequest $request, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $data = $this->payload($request, $media, $admin);

        ProductService::query()->create($data);

        return redirect()
            ->route('admin.products-services.index')
            ->with('success', 'Product / service created successfully.');
    }

    public function edit(ProductService $productService): Response
    {
        return Inertia::render('admin/products-services/Edit', [
            'record' => [
                'id' => $productService->id,
                'uid' => $productService->uid,
                'category_id' => $productService->category_id,
                'type' => $productService->type,
                'title' => $productService->title,
                'slug' => $productService->slug,
                'short_description' => $productService->short_description,
                'description' => $productService->description,
                'featured_image' => $productService->featured_image,
                'gallery_images' => $this->existingGalleryImages($productService->gallery_images),
                'features_json' => $productService->features_json,
                'benefits_json' => $productService->benefits_json,
                'specifications_json' => $productService->specifications_json,
                'status' => $productService->status,
                'is_featured' => $productService->is_featured,
                'meta_title' => $productService->meta_title,
                'meta_description' => $productService->meta_description,
            ],
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'statuses' => ProductService::STATUSES,
            'types' => ProductService::TYPES,
        ]);
    }

    public function update(ProductServiceRequest $request, ProductService $productService, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $existingGalleryImages = $this->existingGalleryImages($request->input('existing_gallery_images'));
        $removedImages = array_diff($productService->gallery_images ?? [], $existingGalleryImages);

        foreach ($removedImages as $path) {
            $media->delete($path);
        }

        $data = $this->payload($request, $media, $admin, $productService);
        $productService->update($data);

        return redirect()
            ->route('admin.products-services.index')
            ->with('success', 'Product / service updated successfully.');
    }

    public function destroy(ProductService $productService, AdminMediaService $media): RedirectResponse
    {
        $media->delete($productService->featured_image);

        foreach ($productService->gallery_images ?? [] as $path) {
            $media->delete($path);
        }

        $productService->delete();

        if (request()->headers->get('X-Inertia-Partial-Component') === 'admin/products-services/Index') {
            return back(status: SymfonyResponse::HTTP_SEE_OTHER)
                ->with('success', 'Product / service deleted successfully.');
        }

        return redirect()
            ->route('admin.products-services.index')
            ->with('success', 'Product / service deleted successfully.');
    }

    private function payload(
        ProductServiceRequest $request,
        AdminMediaService $media,
        $admin,
        ?ProductService $productService = null,
    ): array {
        $data = $request->validated();
        $existingGalleryImages = $this->existingGalleryImages($request->input('existing_gallery_images'));
        $newGalleryImages = $media->storeMany($request->file('gallery_uploads', []), 'products', $admin);

        $data['category_id'] = $data['category_id'] ?: null;
        $data['slug'] = Str::slug($data['slug'] ?: $data['title']);
        $data['gallery_images'] = array_values(array_merge($existingGalleryImages, $newGalleryImages));
        $data['features_json'] = $this->linesToArray($request->string('features_text')->toString());
        $data['benefits_json'] = $this->linesToArray($request->string('benefits_text')->toString());
        $data['specifications_json'] = $this->linesToArray($request->string('specifications_text')->toString());
        $data['featured_image'] = $media->replace(
            $request->file('featured_image'),
            $productService?->featured_image,
            'products',
            $admin,
        );
        $data['is_featured'] = $request->boolean('is_featured');

        unset($data['gallery_uploads'], $data['existing_gallery_images'], $data['features_text'], $data['benefits_text'], $data['specifications_text']);

        return $data;
    }

    /**
     * @param  mixed  $value
     * @return list<string>
     */
    private function existingGalleryImages($value): array
    {
        if (! $value) {
            return [];
        }

        $items = is_array($value) ? $value : (json_decode((string) $value, true) ?: []);

        return collect($items)
            ->map(fn ($path): string => trim((string) $path))
            ->filter(fn (string $path): bool => $path !== '' && $this->galleryImageExists($path))
            ->values()
            ->all();
    }

    private function galleryImageExists(string $path): bool
    {
        $normalizedPath = str_replace('\\', '/', ltrim($path, '/'));
        $normalizedPath = Str::replaceFirst('storage/', '', $normalizedPath);
        $normalizedPath = Str::replaceFirst('media/', '', $normalizedPath);

        if ($normalizedPath === '' || Str::startsWith($normalizedPath, 'seed/')) {
            return false;
        }

        return Storage::disk('public')->exists($normalizedPath);
    }

    /**
     * @return list<string>
     */
    private function linesToArray(?string $value): array
    {
        return collect(preg_split('/\r\n|\r|\n/', $value ?? ''))
            ->map(fn (?string $line): string => trim((string) $line))
            ->filter()
            ->values()
            ->all();
    }
}
