import { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Strong, Text } from '@/components/ui/text';
import type { Permission } from '@/types/admin';

interface PermissionMatrixProps {
    groups: Record<string, Permission[]>;
    selected: number[];
    locked?: number[];
    onToggle: (id: number, checked: boolean) => void;
}

export default function PermissionMatrix({ groups, selected, locked = [], onToggle }: PermissionMatrixProps) {
    const modules = useMemo(() => Object.entries(groups), [groups]);
    const selectedLookup = useMemo(() => new Set(selected), [selected]);
    const lockedLookup = useMemo(() => new Set(locked), [locked]);
    const preferredOpenModule = useMemo(() => {
        const firstSelectedModule = modules.find(([, permissions]) => permissions.some((permission) => selectedLookup.has(permission.id)));

        return firstSelectedModule?.[0] ?? modules[0]?.[0] ?? null;
    }, [modules, selectedLookup]);
    const [openModule, setOpenModule] = useState<string | null>(() => {
        return preferredOpenModule;
    });

    useEffect(() => {
        if (openModule !== null && !modules.some(([module]) => module === openModule)) {
            setOpenModule(preferredOpenModule);
        }
    }, [modules, openModule, preferredOpenModule]);

    return (
        <div className="space-y-5">
            {modules.map(([module, permissions]) => {
                const isOpen = openModule === module;
                const selectedCount = permissions.reduce((count, permission) => count + (selectedLookup.has(permission.id) ? 1 : 0), 0);

                return (
                    <div key={module} className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-zinc-50/90 p-4 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/45 dark:ring-white/5">
                        <button
                            type="button"
                            onClick={() => setOpenModule((current) => current === module ? null : module)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-3 text-left"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <Strong className="capitalize">{module.replace(/_/g, ' ')}</Strong>
                                {selectedCount > 0 ? (
                                    <span className="rounded-full bg-zinc-950/6 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                                        {selectedCount}
                                    </span>
                                ) : null}
                            </div>
                            <ChevronDownIcon
                                className={clsx(
                                    'size-4 shrink-0 text-zinc-500 transition-transform dark:text-zinc-400',
                                    isOpen && 'rotate-180',
                                )}
                            />
                        </button>
                        {isOpen ? (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {permissions.map((permission) => {
                                    const isLocked = lockedLookup.has(permission.id);

                                    return (
                                        <label
                                            key={permission.id}
                                            className="flex items-center gap-3 rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-white/90 p-3 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/5"
                                        >
                                            <Checkbox
                                                checked={selectedLookup.has(permission.id)}
                                                disabled={isLocked}
                                                onChange={(checked) => onToggle(permission.id, checked)}
                                            />
                                            <div className="min-w-0">
                                                <Text className="!text-zinc-700 dark:!text-zinc-200">
                                                    {permission.label ?? permission.name}
                                                </Text>
                                                {isLocked ? (
                                                    <Text className="!text-xs !text-zinc-500 dark:!text-zinc-400">
                                                        Inherited from primary role
                                                    </Text>
                                                ) : null}
                                                {permission.label && permission.label !== permission.name ? (
                                                    <Text className="truncate !text-xs !text-zinc-500 dark:!text-zinc-400">
                                                        {permission.name}
                                                    </Text>
                                                ) : null}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
