import clsx from 'clsx';
import type { ReactNode } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    backHref?: string;
    backLabel?: string;
    sticky?: boolean;
}

export default function AdminPageHeader({ title, description, actions, backHref, backLabel = 'Back', sticky = false }: AdminPageHeaderProps) {
    return (
        <div
            className={clsx(
                'mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:mb-6',
                sticky &&
                    'mb-0 border-b border-zinc-950/10 bg-white px-5 py-4 shadow-sm shadow-zinc-950/5 dark:border-white/10 dark:bg-zinc-900 lg:mb-0 lg:px-30'
            )}
        >
            <div className="min-w-0">
                <div className="flex items-start gap-4">
                    {backHref ? (
                        <Button
                            href={backHref}
                            plain
                            aria-label={backLabel}
                            title={backLabel}
                            className="mt-0.5 shrink-0 rounded-full px-2.5 py-2 shadow-md shadow-zinc-950/10 dark:shadow-black/25"
                        >
                            <ArrowLeftIcon data-slot="icon" />
                            <span className="sr-only">{backLabel}</span>
                        </Button>
                    ) : null}
                    <div className="min-w-0">
                        <Heading>{title}</Heading>
                        {description ? <Text className="mt-1.5 max-w-2xl text-pretty">{description}</Text> : null}
                    </div>
                </div>
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">{actions}</div> : null}
        </div>
    );
}
