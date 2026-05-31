<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MemberRequest;
use App\Models\Member;
use App\Models\Role;
use App\Support\AdminMediaService;
use App\Support\AdminPaginator;
use App\Support\AdminUiCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPaginator::resolve($request);
        $hasUid = app(AdminUiCache::class)->hasColumn('members', 'uid');

        return Inertia::render('admin/members/Index', [
            'members' => function () use ($request, $perPage, $hasUid) {
                $query = Member::query()
                    ->select(['id', 'name', 'image', 'designation', 'status', 'email', 'phone', 'phone_country', 'role_id'])
                    ->with(['role:id,name,slug']);

                if ($hasUid) {
                    $query->addSelect('uid');
                }

                return $query
                ->when($request->string('search')->toString(), function ($query, string $search) use ($hasUid): void {
                    $like = "%{$search}%";

                    $query->where(function ($subQuery) use ($like, $hasUid): void {
                        $subQuery->where('name', 'like', $like)
                            ->orWhere('designation', 'like', $like)
                            ->orWhere('email', 'like', $like)
                            ->orWhere('phone', 'like', $like)
                            ->orWhere('status', 'like', $like)
                            ->orWhereHas('role', function ($roleQuery) use ($like): void {
                                $roleQuery->where(function ($nestedQuery) use ($like): void {
                                    $nestedQuery->where('name', 'like', $like)
                                        ->orWhere('slug', 'like', $like);
                                });
                            });

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
            'statuses' => Member::STATUSES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/members/Create', [
            'roles' => $this->roles(),
            'statuses' => Member::STATUSES,
        ]);
    }

    public function store(MemberRequest $request, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $data = $request->validated();

        DB::transaction(function () use ($request, $media, $admin, $data): void {
            $payload = $data;
            $payload['image'] = $media->store($request->file('image'), 'members', $admin);

            Member::query()->create($payload);
        });

        return redirect()
            ->route('admin.members.index')
            ->with('success', 'Member created successfully.');
    }

    public function edit(Member $member): Response
    {
        return Inertia::render('admin/members/Edit', [
            'member' => [
                'id' => $member->id,
                'uid' => $member->uid,
                'name' => $member->name,
                'designation' => $member->designation,
                'image' => $member->image,
                'short_bio' => $member->short_bio,
                'email' => $member->email,
                'phone' => $member->phone,
                'phone_country' => $member->phone_country,
                'linkedin' => $member->linkedin,
                'twitter' => $member->twitter,
                'instagram' => $member->instagram,
                'role_id' => $member->role_id,
                'status' => $member->status,
            ],
            'roles' => $this->roles(),
            'statuses' => Member::STATUSES,
        ]);
    }

    public function update(MemberRequest $request, Member $member, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $data = $request->validated();

        DB::transaction(function () use ($request, $media, $admin, $member, $data): void {
            $payload = $data;
            $payload['image'] = $media->replace($request->file('image'), $member->image, 'members', $admin);

            $member->update($payload);
        });

        return redirect()
            ->route('admin.members.index')
            ->with('success', 'Member updated successfully.');
    }

    public function destroy(Member $member, AdminMediaService $media): RedirectResponse
    {
        $media->delete($member->image);
        $member->delete();

        if (request()->headers->get('X-Inertia-Partial-Component') === 'admin/members/Index') {
            return back(status: SymfonyResponse::HTTP_SEE_OTHER)
                ->with('success', 'Member deleted successfully.');
        }

        return redirect()
            ->route('admin.members.index')
            ->with('success', 'Member deleted successfully.');
    }

    private function roles(): array
    {
        return app(AdminUiCache::class)->roleOptions();
    }
}
