import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

interface AdminFilterBarProps extends PropsWithChildren, React.ComponentPropsWithoutRef<'div'> {
    className?: string;
    embedded?: boolean;
}

export default function AdminFilterBar({ className, children, embedded = false, ...props }: AdminFilterBarProps) {
    return (
        <div
            {...props}
            className={clsx(
                embedded
                    ? 'min-h-0 flex flex-col gap-3 md:flex-row md:items-center md:[&>*:first-child]:min-w-0 md:[&>*:first-child]:max-w-md md:[&>*:first-child]:flex-1 md:[&>*:nth-child(2)]:ml-auto md:[&>*:not(:first-child)]:w-full md:[&>*:not(:first-child)]:max-w-56'
                    : 'mb-6 min-h-0 flex flex-col gap-3 rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-white/90 p-4 shadow-lg shadow-zinc-950/5 ring-1 ring-zinc-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/72 dark:shadow-black/15 dark:ring-white/5 md:flex-row md:items-center md:[&>*:first-child]:min-w-0 md:[&>*:first-child]:max-w-md md:[&>*:first-child]:flex-1 md:[&>*:nth-child(2)]:ml-auto md:[&>*:not(:first-child)]:w-full md:[&>*:not(:first-child)]:max-w-56',
                className,
            )}
        >
            {children}
        </div>
    );
}
