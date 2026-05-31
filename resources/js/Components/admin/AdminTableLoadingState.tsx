import clsx from 'clsx';
import { useEffect, useState } from 'react';

const DISPLAY_DELAY_MS = 280;

export default function AdminTableLoadingState({
    overlay = false,
    className,
}: {
    overlay?: boolean;
    className?: string;
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setVisible(true);
        }, DISPLAY_DELAY_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <div
            className={clsx(
                overlay
                    ? 'pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4'
                    : 'flex min-h-[30rem] flex-1 items-center justify-center',
                className,
            )}
        >
            <div
                className={clsx(
                    'flex items-center gap-3 text-center',
                    overlay
                        ? 'rounded-full border border-white/10 bg-zinc-950/88 px-4 py-2 shadow-lg shadow-black/30 backdrop-blur-md'
                        : 'flex-col'
                )}
            >
                <span
                    className={clsx(
                        overlay
                            ? 'size-5 animate-spin rounded-full border-2 border-zinc-400/25 border-t-zinc-100 dark:border-zinc-700/30 dark:border-t-zinc-100'
                            : 'size-9 animate-spin rounded-full border-2 border-zinc-400/25 border-t-zinc-200 dark:border-zinc-700/30 dark:border-t-zinc-200'
                    )}
                    aria-hidden="true"
                />
                <p className={clsx(overlay ? 'text-xs font-medium text-zinc-200' : 'text-sm font-medium text-zinc-500 dark:text-zinc-300')}>
                    Loading results...
                </p>
            </div>
        </div>
    );
}
