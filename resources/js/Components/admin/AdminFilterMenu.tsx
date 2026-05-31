import { type PropsWithChildren, useState } from 'react';
import { AdjustmentsHorizontalIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { Dropdown, DropdownButton, DropdownDivider, DropdownMenu } from '@/components/ui/dropdown';

interface AdminFilterMenuProps extends PropsWithChildren {
    activeCount?: number;
    className?: string;
}

export function AdminFilterMenu({ activeCount = 0, className, children }: AdminFilterMenuProps) {
    return (
        <div className="w-full md:!ml-auto md:!w-auto md:!max-w-none">
            <Dropdown>
                <DropdownButton as={Button} outline className={clsx('w-full justify-center gap-2 px-3 md:w-auto md:min-w-[6.5rem]', className)}>
                    <AdjustmentsHorizontalIcon className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
                    <span>Filter</span>
                    {activeCount > 0 ? (
                        <span className="rounded-full bg-zinc-950/6 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                            {activeCount}
                        </span>
                    ) : null}
                </DropdownButton>
                <DropdownMenu anchor="bottom end" className="min-w-[22rem] max-w-md p-0">
                    <div className="table-scrollbar col-span-full max-h-[min(32rem,calc(100vh-10rem))] w-full min-w-0 overflow-y-auto overscroll-contain p-3">
                        <div className="space-y-4">
                            {children}
                        </div>
                    </div>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}

interface AdminFilterMenuSectionProps extends PropsWithChildren {
    title: string;
    className?: string;
    divided?: boolean;
    defaultOpen?: boolean;
    contentClassName?: string;
}

export function AdminFilterMenuSection({
    title,
    className,
    divided = false,
    defaultOpen = !divided,
    contentClassName,
    children,
}: AdminFilterMenuSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={clsx('w-full min-w-0', className)}>
            {divided ? <DropdownDivider className="mx-0 my-0 mb-4" /> : null}
            <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                        {title}
                    </span>
                    <ChevronDownIcon
                        className={clsx(
                            'size-4 text-zinc-500 transition-transform dark:text-zinc-400',
                            open && 'rotate-180',
                        )}
                    />
                </button>
                <div className={clsx('min-h-0 w-full min-w-0 px-1', !open && 'hidden', contentClassName)}>
                    {children}
                </div>
            </div>
        </div>
    );
}
