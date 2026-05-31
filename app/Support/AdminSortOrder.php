<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminSortOrder
{
    /**
     * @return array<int, int>
     */
    public static function reorderVisibleSubset(Builder $query, string $table, array $orderedIds): array
    {
        $orderedIds = array_values(array_map('intval', array_unique($orderedIds)));

        if ($orderedIds === []) {
            return [];
        }

        $allIds = $query->pluck('id')->map(static fn ($id): int => (int) $id)->all();
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

        DB::transaction(function () use ($table, $reorderedIds): void {
            foreach ($reorderedIds as $index => $id) {
                DB::table($table)
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
}
