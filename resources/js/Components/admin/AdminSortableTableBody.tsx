'use client';

import { Bars3Icon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { Reorder, useDragControls } from 'motion/react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

type SortableItem = {
    id: number;
    uid?: string | null;
};

type UidMap = Record<number, string>;

interface AdminSortableTableBodyProps<T extends SortableItem> {
    items: T[];
    columnCount: number;
    minRows?: number;
    enabled?: boolean;
    onPersist: (orderedIds: number[]) => Promise<UidMap>;
    renderRow: (item: T, context: { dragHandle: React.ReactNode; isPending: boolean }) => React.ReactNode;
}

function hasOrderChanged(previousIds: number[], nextIds: number[]): boolean {
    return previousIds.length !== nextIds.length || previousIds.some((id, index) => id !== nextIds[index]);
}

function getItemsSignature<T extends SortableItem>(items: T[]): string {
    return JSON.stringify(items);
}

function fillerBarClassName(cellIndex: number, columnCount: number) {
    return clsx(
        'block h-4 rounded-md bg-zinc-950/5 dark:bg-white/10',
        cellIndex === 0 && 'mx-auto max-w-8',
        cellIndex > 0 && cellIndex < columnCount - 1 && 'w-full max-w-44',
        cellIndex === columnCount - 1 && 'mx-auto w-16 rounded-full',
    );
}

function SortableTableRow<T extends SortableItem>({
    item,
    canDrag,
    isDragging,
    onDragStart,
    onDragEnd,
    children,
}: {
    item: T;
    canDrag: boolean;
    isDragging: boolean;
    onDragStart: () => void;
    onDragEnd: () => void;
    children: (dragHandle: React.ReactNode) => React.ReactNode;
}) {
    const dragControls = useDragControls();

    const dragHandle = (
        <button
            type="button"
            aria-label="Reorder row"
            disabled={!canDrag}
            onPointerDown={(event) => {
                if (!canDrag) {
                    return;
                }

                event.preventDefault();
                dragControls.start(event);
            }}
            className={clsx(
                'inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition touch-none',
                canDrag
                    ? 'cursor-grab hover:bg-zinc-950/5 hover:text-zinc-600 active:cursor-grabbing dark:hover:bg-white/5 dark:hover:text-zinc-200'
                    : 'cursor-not-allowed opacity-40',
            )}
        >
            <Bars3Icon className="h-4 w-4" />
        </button>
    );

    return (
        <Reorder.Item
            as="tr"
            value={item}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            layout="position"
            transition={{ type: 'spring', stiffness: 540, damping: 42, mass: 0.7 }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={clsx(
                'transition-colors',
                isDragging && 'bg-zinc-950/3 dark:bg-white/4',
            )}
            style={{ position: 'relative', zIndex: isDragging ? 1 : 0 }}
        >
            {children(dragHandle)}
        </Reorder.Item>
    );
}

export default function AdminSortableTableBody<T extends SortableItem>({
    items,
    columnCount,
    minRows = 0,
    enabled = true,
    onPersist,
    renderRow,
}: AdminSortableTableBodyProps<T>) {
    const [rows, setRows] = useState(items);
    const [pending, setPending] = useState(false);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const rowsRef = useRef(rows);
    const dragSnapshotRef = useRef(items);
    const pendingRef = useRef(false);
    const lastItemsSignatureRef = useRef(getItemsSignature(items));

    useEffect(() => {
        rowsRef.current = rows;
    }, [rows]);

    useEffect(() => {
        const nextSignature = getItemsSignature(items);

        if (nextSignature === lastItemsSignatureRef.current) {
            return;
        }

        lastItemsSignatureRef.current = nextSignature;

        if (pendingRef.current) {
            return;
        }

        rowsRef.current = items;
        setRows(items);
        dragSnapshotRef.current = items;
    }, [items]);

    const canDrag = enabled && rows.length > 1 && !pending;
    const fillerCount = columnCount > 0 ? Math.max(minRows - rows.length, 0) : 0;

    return (
        <Reorder.Group
            as="tbody"
            axis="y"
            values={rows}
            onReorder={(nextRows) => {
                if (!canDrag) {
                    return;
                }

                rowsRef.current = nextRows as T[];
                setRows(nextRows as T[]);
            }}
            layoutScroll
        >
            {rows.map((item) => (
                <SortableTableRow
                    key={item.id}
                    item={item}
                    canDrag={canDrag}
                    isDragging={draggingId === item.id}
                    onDragStart={() => {
                        dragSnapshotRef.current = rowsRef.current;
                        setDraggingId(item.id);
                    }}
                    onDragEnd={() => {
                        setDraggingId(null);

                        const previousRows = dragSnapshotRef.current;
                        const nextRows = rowsRef.current;
                        const previousIds = previousRows.map((row) => row.id);
                        const nextIds = nextRows.map((row) => row.id);

                        if (!hasOrderChanged(previousIds, nextIds)) {
                            return;
                        }

                        pendingRef.current = true;
                        setPending(true);

                        void onPersist(nextIds)
                            .then((uidMap) => {
                                const persistedRows = nextRows.map((row) => ({
                                    ...row,
                                    uid: uidMap[row.id] ?? row.uid,
                                }));

                                rowsRef.current = persistedRows;
                                setRows(persistedRows);
                            })
                            .catch(() => {
                                rowsRef.current = previousRows;
                                setRows(previousRows);
                            })
                            .finally(() => {
                                pendingRef.current = false;
                                setPending(false);
                            });
                    }}
                >
                    {(dragHandle) => renderRow(item, { dragHandle, isPending: pending })}
                </SortableTableRow>
            ))}

            {Array.from({ length: fillerCount }).map((_, index) => (
                <tr key={`sortable-virtual-row-${index}`} aria-hidden="true" className="pointer-events-none select-none">
                    {Array.from({ length: columnCount }).map((__, cellIndex) => (
                        <td
                            key={`sortable-virtual-row-${index}-cell-${cellIndex}`}
                            className={clsx(
                                'px-4 py-0 border-b border-zinc-950/5 first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) dark:border-white/5 sm:first:pl-1 sm:last:pr-1',
                                cellIndex === columnCount - 1 && 'text-center',
                            )}
                        >
                            <div className="flex h-14 items-center opacity-40">
                                <span className={fillerBarClassName(cellIndex, columnCount)} />
                            </div>
                        </td>
                    ))}
                </tr>
            ))}
        </Reorder.Group>
    );
}
