<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\InquiryNoteRequest;
use App\Http\Requests\Admin\InquiryStatusRequest;
use App\Models\Inquiry;
use App\Support\AdminPaginator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPaginator::resolve($request);

        return Inertia::render('admin/inquiries/Index', [
            'inquiries' => fn () => Inquiry::query()
                ->select(['id', 'name', 'email', 'subject', 'status', 'inquiry_type', 'product_service_id', 'created_at'])
                ->with('productService:id,title,type')
                ->when($request->string('search')->toString(), function ($query, string $search): void {
                    $like = "%{$search}%";

                    $query->where(function ($subQuery) use ($like): void {
                        $subQuery->where('name', 'like', $like)
                            ->orWhere('email', 'like', $like)
                            ->orWhere('phone', 'like', $like)
                            ->orWhere('subject', 'like', $like)
                            ->orWhere('status', 'like', $like)
                            ->orWhere('inquiry_type', 'like', $like)
                            ->orWhereHas('productService', function ($productQuery) use ($like): void {
                                $productQuery->where(function ($nestedQuery) use ($like): void {
                                    $nestedQuery->where('title', 'like', $like)
                                        ->orWhere('type', 'like', $like);
                                });
                            });
                    });
                })
                ->when($request->string('inquiry_type')->toString(), fn ($query, string $type) => $query->where('inquiry_type', $type))
                ->when($request->string('status')->toString(), fn ($query, string $status) => $query->where('status', $status))
                ->latest()
                ->paginate($perPage)
                ->withQueryString(),
            'filters' => $request->only(['search', 'inquiry_type', 'status', 'per_page']),
            'statuses' => Inquiry::STATUSES,
            'types' => Inquiry::TYPES,
        ]);
    }

    public function show(Inquiry $inquiry): Response
    {
        if ($inquiry->status === 'new') {
            $inquiry->update(['status' => 'read']);
            $inquiry->refresh();
        }

        return Inertia::render('admin/inquiries/Show', [
            'inquiry' => $inquiry->load('productService:id,title,type'),
            'statuses' => Inquiry::STATUSES,
        ]);
    }

    public function updateStatus(InquiryStatusRequest $request, Inquiry $inquiry): RedirectResponse
    {
        $inquiry->update($request->validated());

        return back()->with('success', 'Inquiry status updated successfully.');
    }

    public function updateNote(InquiryNoteRequest $request, Inquiry $inquiry): RedirectResponse
    {
        $inquiry->update($request->validated());

        return back()->with('success', 'Inquiry note updated successfully.');
    }

    public function destroy(Request $request, Inquiry $inquiry): RedirectResponse
    {
        $inquiry->delete();

        if ($request->headers->get('X-Inertia-Partial-Component') === 'admin/inquiries/Index') {
            return back(status: SymfonyResponse::HTTP_SEE_OTHER)
                ->with('success', 'Inquiry deleted successfully.');
        }

        return redirect()
            ->route('admin.inquiries.index')
            ->with('success', 'Inquiry deleted successfully.');
    }
}
