<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GalleryImageRequest;
use App\Http\Requests\Admin\GalleryRequest;
use App\Models\Gallery;
use App\Models\GalleryImage;
use App\Support\AdminMediaService;
use App\Support\AdminPaginator;
use App\Support\AdminUiCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPaginator::resolve($request);
        $hasUid = app(AdminUiCache::class)->hasColumn('galleries', 'uid');

        return Inertia::render('admin/galleries/Index', [
            'galleries' => function () use ($request, $perPage, $hasUid) {
                $query = Gallery::query()
                    ->select(['id', 'title', 'slug', 'cover_image', 'status'])
                    ->withCount('images');

                if ($hasUid) {
                    $query->addSelect('uid');
                }

                return $query
                ->when($request->string('search')->toString(), function ($query, string $search) use ($hasUid): void {
                    $like = "%{$search}%";

                    $query->where(function ($subQuery) use ($like, $hasUid): void {
                        $subQuery->where('title', 'like', $like)
                            ->orWhere('slug', 'like', $like)
                            ->orWhere('status', 'like', $like);

                        if ($hasUid) {
                            $subQuery->orWhere('uid', 'like', $like);
                        }
                    });
                })
                ->when($request->string('status')->toString(), fn ($query, string $status) => $query->where('status', $status))
                ->oldest('created_at')
                ->orderBy('id')
                ->paginate($perPage)
                ->withQueryString();
            },
            'filters' => $request->only(['search', 'status', 'per_page']),
            'statuses' => Gallery::STATUSES,
            'imageStatuses' => GalleryImage::STATUSES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/galleries/Create', [
            'statuses' => Gallery::STATUSES,
            'imageStatuses' => GalleryImage::STATUSES,
        ]);
    }

    public function store(GalleryRequest $request, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $data = $request->validated();

        $data['slug'] = Str::slug($data['slug'] ?: $data['title']);
        $data['cover_image'] = $media->store($request->file('cover_image'), 'galleries', $admin);
        unset($data['gallery_uploads'], $data['gallery_uploads_meta']);

        $gallery = Gallery::query()->create($data);
        $this->storeGalleryUploads($request->file('gallery_uploads', []), $gallery, $media, $admin, $request->validated('gallery_uploads_meta', []));

        return redirect()
            ->route('admin.galleries.index')
            ->with('success', 'Gallery created successfully.');
    }

    public function edit(Gallery $gallery): Response
    {
        return Inertia::render('admin/galleries/Edit', [
            'gallery' => $gallery->load('images'),
            'statuses' => Gallery::STATUSES,
            'imageStatuses' => GalleryImage::STATUSES,
        ]);
    }

    public function update(GalleryRequest $request, Gallery $gallery, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $data = $request->validated();

        $data['slug'] = Str::slug($data['slug'] ?: $data['title']);
        $data['cover_image'] = $media->replace($request->file('cover_image'), $gallery->cover_image, 'galleries', $admin);
        unset($data['gallery_uploads'], $data['gallery_uploads_meta']);

        $gallery->update($data);
        $this->storeGalleryUploads($request->file('gallery_uploads', []), $gallery, $media, $admin);

        return redirect()
            ->route('admin.galleries.index')
            ->with('success', 'Gallery updated successfully.');
    }

    public function destroy(Gallery $gallery, AdminMediaService $media): RedirectResponse
    {
        $media->delete($gallery->cover_image);

        foreach ($gallery->images as $image) {
            $media->delete($image->image);
        }

        $gallery->delete();

        if (request()->headers->get('X-Inertia-Partial-Component') === 'admin/galleries/Index') {
            return back(status: SymfonyResponse::HTTP_SEE_OTHER)
                ->with('success', 'Gallery deleted successfully.');
        }

        return redirect()
            ->route('admin.galleries.index')
            ->with('success', 'Gallery deleted successfully.');
    }

    public function storeImage(GalleryImageRequest $request, Gallery $gallery, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $this->storeGalleryUploads($request->file('images', []), $gallery, $media, $admin);

        return back()->with('success', 'Gallery images uploaded successfully.');
    }

    public function updateImage(
        GalleryImageRequest $request,
        Gallery $gallery,
        GalleryImage $galleryImage,
        AdminMediaService $media,
    ): RedirectResponse {
        $this->ensureImageBelongsToGallery($gallery, $galleryImage);

        $admin = Auth::guard('admin')->user();
        $data = $request->validated();

        $data['image'] = $media->replace($request->file('image'), $galleryImage->image, 'galleries', $admin);

        $galleryImage->update($data);

        return back()->with('success', 'Gallery image updated successfully.');
    }

    public function destroyImage(Gallery $gallery, GalleryImage $galleryImage, AdminMediaService $media): RedirectResponse
    {
        $this->ensureImageBelongsToGallery($gallery, $galleryImage);

        $media->delete($galleryImage->image);
        $galleryImage->delete();

        return back()->with('success', 'Gallery image deleted successfully.');
    }

    private function ensureImageBelongsToGallery(Gallery $gallery, GalleryImage $galleryImage): void
    {
        abort_unless($galleryImage->gallery_id === $gallery->id, 404);
    }

    private function storeGalleryUploads(array $files, Gallery $gallery, AdminMediaService $media, $admin, array $metadata = []): void
    {
        if ($files === []) {
            return;
        }

        $sortOrder = (int) $gallery->images()->max('sort_order');

        foreach ($files as $index => $file) {
            $imageMeta = $metadata[$index] ?? [];
            $resolvedSortOrder = array_key_exists('sort_order', $imageMeta) && $imageMeta['sort_order'] !== null && $imageMeta['sort_order'] !== ''
                ? (int) $imageMeta['sort_order']
                : $sortOrder + 1;
            $sortOrder = max($sortOrder, $resolvedSortOrder);

            $gallery->images()->create([
                'image' => $media->store($file, 'galleries', $admin),
                'title' => filled($imageMeta['title'] ?? null) ? $imageMeta['title'] : null,
                'alt_text' => filled($imageMeta['alt_text'] ?? null) ? $imageMeta['alt_text'] : null,
                'caption' => filled($imageMeta['caption'] ?? null) ? $imageMeta['caption'] : null,
                'status' => $imageMeta['status'] ?? 'active',
                'sort_order' => $resolvedSortOrder,
            ]);
        }
    }
}
