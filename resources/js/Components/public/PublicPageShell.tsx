import clsx from 'clsx';
import type { PropsWithChildren, ReactNode } from 'react';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import PublicReveal from './PublicReveal';

export function PublicEyebrow({ children, className }: PropsWithChildren<{ className?: string }>) {
    return (
        <p
            className={clsx(
                'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.34em]',
                'border-[color:var(--public-border)] bg-[color:var(--public-accent-soft)] text-[color:var(--public-text-soft)]',
                className,
            )}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--public-accent)]" />
            {children}
        </p>
    );
}

export function PublicHero({
    eyebrow,
    title,
    body,
    bannerImage,
    children,
}: PropsWithChildren<{
    eyebrow: string;
    title: string;
    body: string;
    bannerImage?: string | null;
}>) {
    return (
        <PublicReveal
            as="section"
            className={clsx(
                'public-grain relative overflow-hidden rounded-[calc(var(--public-radius-panel)+0.8rem)] border px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10',
                'border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] shadow-[var(--public-shadow-strong)]',
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(219,154,60,0.20),_transparent_24rem),radial-gradient(circle_at_bottom_right,_rgba(78,58,40,0.16),_transparent_28rem)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(240,175,82,0.18),_transparent_24rem),radial-gradient(circle_at_bottom_right,_rgba(130,101,66,0.20),_transparent_30rem)]" />
            <div className="pointer-events-none absolute -top-24 right-10 h-56 w-56 rounded-full border border-[color:var(--public-border)] bg-[radial-gradient(circle,_rgba(219,154,60,0.16),_transparent_68%)] blur-2xl" />
            <div className="pointer-events-none absolute bottom-10 left-8 h-28 w-28 rounded-[32%] border border-[color:var(--public-border)] bg-[color:var(--public-accent-soft)] opacity-70" />

            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:items-end">
                <div className="max-w-4xl">
                    <PublicEyebrow>{eyebrow}</PublicEyebrow>
                    <Heading
                        className={clsx(
                            'public-display mt-6 text-5xl/13 font-normal tracking-[-0.04em] !text-[color:var(--public-text)]',
                            'sm:text-6xl/16 lg:text-7xl/[1.03]',
                        )}
                    >
                        {title}
                    </Heading>
                    <Text className="mt-5 max-w-3xl text-base/8 !text-[color:var(--public-text-soft)] sm:text-lg/8">
                        {body}
                    </Text>
                </div>

                {(bannerImage || children) ? (
                    <div className="grid gap-4">
                        {bannerImage ? (
                            <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--public-border)] bg-[color:var(--public-surface)] p-2 shadow-[var(--public-shadow)]">
                                <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(219,154,60,0.14),transparent_45%,rgba(24,18,15,0.28))]" />
                                <img
                                    src={bannerImage}
                                    alt={title}
                                    loading="eager"
                                    fetchPriority="high"
                                    decoding="async"
                                    className="h-72 w-full rounded-[1.45rem] object-cover shadow-2xl shadow-black/15 sm:h-80 lg:h-[25rem]"
                                />
                            </div>
                        ) : null}
                        {children ? <div className="grid gap-4">{children}</div> : null}
                    </div>
                ) : null}
            </div>
        </PublicReveal>
    );
}

export function PublicPanel({ children, className }: PropsWithChildren<{ className?: string }>) {
    return (
        <PublicReveal
            as="section"
            className={clsx(
                'public-grain relative overflow-hidden rounded-[var(--public-radius-panel)] border p-6 sm:p-8',
                'border-[color:var(--public-border)] bg-[color:var(--public-surface)] shadow-[var(--public-shadow)]',
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(219,154,60,0.75),transparent)]" />
            <div className="relative">{children}</div>
        </PublicReveal>
    );
}

export function PublicCard({ children, className }: PropsWithChildren<{ className?: string }>) {
    return (
        <PublicReveal
            as="article"
            className={clsx(
                'group relative overflow-hidden rounded-[var(--public-radius-card)] border p-5 transition duration-300 hover:-translate-y-1',
                'border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] shadow-[var(--public-shadow)]',
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(219,154,60,0.10),transparent_36%,rgba(255,255,255,0.16))] opacity-0 transition duration-300 group-hover:opacity-100 dark:bg-[linear-gradient(145deg,rgba(240,175,82,0.08),transparent_34%,rgba(255,255,255,0.04))]" />
            <div className="relative">{children}</div>
        </PublicReveal>
    );
}

export function PublicSectionHeader({
    eyebrow,
    title,
    body,
    actions,
    className,
    invert = false,
}: {
    eyebrow?: string;
    title: string;
    body?: string | null;
    actions?: ReactNode;
    className?: string;
    invert?: boolean;
}) {
    return (
        <div className={clsx('flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between', className)}>
            <div className="max-w-3xl">
                {eyebrow ? (
                    <PublicEyebrow className={invert ? 'border-white/12 bg-white/8 text-white/70' : undefined}>
                        {eyebrow}
                    </PublicEyebrow>
                ) : null}
                <Heading className={clsx(
                    'public-display mt-4 text-4xl/11 font-normal tracking-[-0.03em] sm:text-5xl/[1.08]',
                    invert ? '!text-white' : '!text-[color:var(--public-text)]',
                )}>
                    {title}
                </Heading>
                {body ? (
                    <Text className={clsx(
                        'mt-4 max-w-3xl text-base/8 sm:text-lg/8',
                        invert ? '!text-white/72' : '!text-[color:var(--public-text-soft)]',
                    )}>
                        {body}
                    </Text>
                ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
    );
}

export function PublicMediaFrame({
    src,
    alt,
    className,
    imageClassName,
}: {
    src: string;
    alt: string;
    className?: string;
    imageClassName?: string;
}) {
    return (
        <div
            className={clsx(
                'relative overflow-hidden rounded-[1.45rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)]',
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,transparent_0%,transparent_52%,rgba(19,13,9,0.32)_100%)]" />
            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className={clsx('h-full w-full object-cover transition duration-700 hover:scale-[1.045]', imageClassName)}
            />
        </div>
    );
}

export function PublicSubheading({ children, className }: PropsWithChildren<{ className?: string }>) {
    return (
        <Subheading className={clsx('public-display text-xl/8 font-normal tracking-[-0.02em] !text-[color:var(--public-text)] sm:text-2xl/9', className)}>
            {children}
        </Subheading>
    );
}
