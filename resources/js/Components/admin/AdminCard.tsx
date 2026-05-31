import type { PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';
import { Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

interface AdminCardProps extends PropsWithChildren {
    title?: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

export default function AdminCard({ title, description, actions, className, children }: AdminCardProps) {
    return (
        <section className={clsx('rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-white/90 p-6 shadow-lg shadow-zinc-950/5 ring-1 ring-zinc-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75 dark:shadow-black/20 dark:ring-white/5', className)}>
            {(title || description || actions) && (
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        {title ? <Subheading>{title}</Subheading> : null}
                        {description ? <Text className="mt-1">{description}</Text> : null}
                    </div>
                    {actions}
                </div>
            )}
            {children}
        </section>
    );
}
