<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TestimonialRequest;
use App\Models\Testimonial;
use App\Support\AdminMediaService;
use App\Support\AdminPaginator;
use App\Support\AdminUiCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPaginator::resolve($request);
        $hasUid = app(AdminUiCache::class)->hasColumn('testimonials', 'uid');

        return Inertia::render('admin/testimonials/Index', [
            'testimonials' => function () use ($request, $perPage, $hasUid) {
                $query = Testimonial::query()
                    ->select(['id', 'client_name', 'company_name', 'image', 'status', 'rating']);

                if ($hasUid) {
                    $query->addSelect('uid');
                }

                return $query->when($request->string('search')->toString(), function ($query, string $search) use ($hasUid): void {
                    $like = "%{$search}%";

                    $query->where(function ($subQuery) use ($like, $search, $hasUid): void {
                        $subQuery->where('client_name', 'like', $like)
                            ->orWhere('company_name', 'like', $like)
                            ->orWhere('status', 'like', $like);

                        if ($hasUid) {
                            $subQuery->orWhere('uid', 'like', $like);
                        }

                        if (is_numeric($search)) {
                            $subQuery->orWhere('rating', (int) $search);
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
            'statuses' => Testimonial::STATUSES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/testimonials/Create', [
            'statuses' => Testimonial::STATUSES,
        ]);
    }

    public function store(TestimonialRequest $request, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $data = $request->validated();

        $data['image'] = $media->store($request->file('image'), 'testimonials', $admin);

        Testimonial::query()->create($data);

        return redirect()
            ->route('admin.testimonials.index')
            ->with('success', 'Testimonial created successfully.');
    }

    public function edit(Testimonial $testimonial): Response
    {
        return Inertia::render('admin/testimonials/Edit', [
            'testimonial' => $testimonial,
            'statuses' => Testimonial::STATUSES,
        ]);
    }

    public function update(TestimonialRequest $request, Testimonial $testimonial, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $data = $request->validated();

        $data['image'] = $media->replace($request->file('image'), $testimonial->image, 'testimonials', $admin);

        $testimonial->update($data);

        return redirect()
            ->route('admin.testimonials.index')
            ->with('success', 'Testimonial updated successfully.');
    }

    public function destroy(Testimonial $testimonial, AdminMediaService $media): RedirectResponse
    {
        $media->delete($testimonial->image);
        $testimonial->delete();

        if (request()->headers->get('X-Inertia-Partial-Component') === 'admin/testimonials/Index') {
            return back(status: SymfonyResponse::HTTP_SEE_OTHER)
                ->with('success', 'Testimonial deleted successfully.');
        }

        return redirect()
            ->route('admin.testimonials.index')
            ->with('success', 'Testimonial deleted successfully.');
    }
}
