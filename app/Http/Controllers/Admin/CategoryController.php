<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use App\Support\AdminMediaService;
use App\Support\AdminPaginator;
use App\Support\AdminUiCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPaginator::resolve($request);
        $uiCache = app(AdminUiCache::class);
        $hasUid = $uiCache->hasColumn('categories', 'uid');
        $hasPosition = $uiCache->hasColumn('categories', 'position');

        return Inertia::render('admin/categories/Index', [
            'categories' => function () use ($request, $perPage, $hasUid, $hasPosition) {
                $query = Category::query()
                    ->select(['id', 'name', 'slug', 'image', 'status'])
                    ->withCount('productServices');

                if ($hasUid) {
                    $query->addSelect('uid');
                }

                return $query->when($request->string('search')->toString(), function ($query, string $search) use ($hasUid): void {
                    $like = "%{$search}%";

                    $query->where(function ($subQuery) use ($like, $hasUid): void {
                        $subQuery->where('name', 'like', $like)
                            ->orWhere('slug', 'like', $like)
                            ->orWhere('status', 'like', $like)
                            ->orWhereHas('productServices', fn ($productQuery) => $productQuery->where('title', 'like', $like));

                        if ($hasUid) {
                            $subQuery->orWhere('uid', 'like', $like);
                        }
                    });
                })
                ->when($request->string('status')->toString(), fn ($query, string $status) => $query->where('status', $status))
                ->orderBy($hasPosition ? 'position' : 'sort_order')
                ->orderBy('name')
                ->paginate($perPage)
                ->withQueryString();
            },
            'filters' => $request->only(['search', 'status', 'per_page']),
            'statuses' => Category::STATUSES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/Create', [
            'statuses' => Category::STATUSES,
        ]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $uiCache = app(AdminUiCache::class);
        $hasUid = $uiCache->hasColumn('categories', 'uid');
        $hasPosition = $uiCache->hasColumn('categories', 'position');

        if (! $hasUid || ! $hasPosition) {
            $payload = $request->validate([
                'ordered_ids' => ['required', 'array', 'min:2'],
                'ordered_ids.*' => ['required', 'integer', 'distinct'],
            ]);

            $sortOrders = $this->reorderBySortOrder($payload['ordered_ids']);

            return response()->json([
                'sort_orders' => $sortOrders,
            ]);
        }

        $payload = $request->validate([
            'ordered_ids' => ['nullable', 'array', 'min:2', 'required_without:ordered_uids'],
            'ordered_ids.*' => ['required', 'integer', 'distinct'],
            'ordered_uids' => ['nullable', 'array', 'min:2', 'required_without:ordered_ids'],
            'ordered_uids.*' => ['required', 'string', 'distinct'],
        ]);

        $orderedIds = $payload['ordered_ids'] ?? [];

        if ($orderedIds === []) {
            $orderedIds = $this->mapOrderedUidsToIds($payload['ordered_uids'] ?? []);
        }

        return response()->json([
            'uid_map' => $this->reorderByPosition($orderedIds),
        ]);
    }

    public function store(CategoryRequest $request, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $data = $request->validated();

        $data['slug'] = Str::slug($data['slug'] ?: $data['name']);
        $data['image'] = $media->store($request->file('image'), 'categories', $admin);

        Category::query()->create($data);

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/Edit', [
            'category' => $category,
            'statuses' => Category::STATUSES,
        ]);
    }

    public function update(CategoryRequest $request, Category $category, AdminMediaService $media): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $data = $request->validated();

        $data['slug'] = Str::slug($data['slug'] ?: $data['name']);
        $data['image'] = $media->replace($request->file('image'), $category->image, 'categories', $admin);

        $category->update($data);

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category, AdminMediaService $media): RedirectResponse
    {
        if ($category->productServices()->exists()) {
            return back()->with('error', 'Reassign or remove related products / services before deleting this category.');
        }

        $media->delete($category->image);
        $category->delete();

        if (request()->headers->get('X-Inertia-Partial-Component') === 'admin/categories/Index') {
            return back(status: SymfonyResponse::HTTP_SEE_OTHER)
                ->with('success', 'Category deleted successfully.');
        }

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    private function reorderBySortOrder(array $orderedIds): array
    {
        $orderedIds = array_values(array_map('intval', array_unique($orderedIds)));

        if ($orderedIds === []) {
            return [];
        }

        $allIds = Category::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->pluck('id')
            ->map(static fn ($id): int => (int) $id)
            ->all();

        $requestedLookup = array_flip($orderedIds);
        $matchedIds = array_values(array_filter(
            $allIds,
            static fn (int $id): bool => isset($requestedLookup[$id]),
        ));

        if (count($matchedIds) !== count($orderedIds)) {
            throw ValidationException::withMessages([
                'ordered_ids' => 'One or more records could not be reordered.',
            ]);
        }

        $replacementQueue = $orderedIds;
        $reorderedIds = array_map(
            static function (int $id) use (&$replacementQueue, $requestedLookup): int {
                if (! isset($requestedLookup[$id])) {
                    return $id;
                }

                return array_shift($replacementQueue);
            },
            $allIds,
        );

        DB::transaction(function () use ($reorderedIds): void {
            foreach ($reorderedIds as $index => $id) {
                DB::table('categories')
                    ->where('id', $id)
                    ->update([
                        'sort_order' => $index + 1,
                    ]);
            }
        });

        $sortOrders = [];

        foreach ($reorderedIds as $index => $id) {
            if (isset($requestedLookup[$id])) {
                $sortOrders[$id] = $index + 1;
            }
        }

        return $sortOrders;
    }

    private function mapOrderedUidsToIds(array $orderedUids): array
    {
        $orderedUids = array_values(array_unique(array_map('strval', $orderedUids)));

        if ($orderedUids === []) {
            return [];
        }

        $idsByUid = Category::query()
            ->whereIn('uid', $orderedUids)
            ->pluck('id', 'uid')
            ->all();

        $orderedIds = [];

        foreach ($orderedUids as $uid) {
            $id = $idsByUid[$uid] ?? null;

            if (! is_numeric($id)) {
                throw ValidationException::withMessages([
                    'ordered_uids' => 'One or more records could not be reordered.',
                ]);
            }

            $orderedIds[] = (int) $id;
        }

        return $orderedIds;
    }

    private function reorderByPosition(array $orderedIds): array
    {
        $orderedIds = array_values(array_map('intval', array_unique($orderedIds)));

        if ($orderedIds === []) {
            return [];
        }

        $allIds = Category::query()
            ->orderBy('position')
            ->orderBy('id')
            ->pluck('id')
            ->map(static fn ($id): int => (int) $id)
            ->all();

        $requestedLookup = array_flip($orderedIds);
        $matchedUids = array_values(array_filter(
            $allIds,
            static fn (int $id): bool => isset($requestedLookup[$id]),
        ));

        if (count($matchedUids) !== count($orderedIds)) {
            throw ValidationException::withMessages([
                'ordered_ids' => 'One or more records could not be reordered.',
            ]);
        }

        $replacementQueue = $orderedIds;
        $reorderedIds = array_map(
            static function (int $id) use (&$replacementQueue, $requestedLookup): int {
                if (! isset($requestedLookup[$id])) {
                    return $id;
                }

                return array_shift($replacementQueue);
            },
            $allIds,
        );

        DB::transaction(function () use ($reorderedIds): void {
            DB::table('categories')
                ->whereIn('id', $reorderedIds)
                ->update(['uid' => null]);

            foreach ($reorderedIds as $index => $id) {
                DB::table('categories')
                    ->where('id', $id)
                    ->update([
                        'position' => $index + 1,
                        'uid' => $this->formatCategoryUid($index + 1),
                    ]);
            }
        });

        $uidMap = [];

        foreach ($reorderedIds as $index => $id) {
            if (isset($requestedLookup[$id])) {
                $uidMap[$id] = $this->formatCategoryUid($index + 1);
            }
        }

        return $uidMap;
    }

    private function formatCategoryUid(int $position): string
    {
        return sprintf('CAT-%06d', max($position, 0));
    }
}
