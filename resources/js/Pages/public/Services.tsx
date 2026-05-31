import { Deferred, Link } from '@inertiajs/react';
import { ArrowRightIcon, CheckCircleIcon, SparklesIcon, Squares2X2Icon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import {
    PublicCard,
    PublicEyebrow,
    PublicPanel,
    PublicSectionHeader,
} from '@/components/public/PublicPageShell';
import PublicReveal from '@/components/public/PublicReveal';
import PublicLayout from '@/layouts/PublicLayout';
import { asServicesSections } from '@/lib/public-cms';
import type { PublicCategory, PublicServiceCard, ServicesPageProps } from '@/types/public';
import { resolveProductImage, storageUrl } from '@/utils/admin';

const serviceAccents = [
    {
        accent: '#2f7d72',
        soft: 'rgba(47, 125, 114, 0.14)',
        border: 'rgba(47, 125, 114, 0.32)',
        dark: '#123f3a',
    },
    {
        accent: '#8d4e7f',
        soft: 'rgba(141, 78, 127, 0.14)',
        border: 'rgba(141, 78, 127, 0.30)',
        dark: '#4a2141',
    },
    {
        accent: '#4f68a8',
        soft: 'rgba(79, 104, 168, 0.14)',
        border: 'rgba(79, 104, 168, 0.30)',
        dark: '#263867',
    },
    {
        accent: '#b65f2f',
        soft: 'rgba(182, 95, 47, 0.14)',
        border: 'rgba(182, 95, 47, 0.30)',
        dark: '#683116',
    },
];

function accentStyle(index: number): CSSProperties {
    const accent = serviceAccents[index % serviceAccents.length];

    return {
        '--service-accent': accent.accent,
        '--service-accent-soft': accent.soft,
        '--service-accent-border': accent.border,
        '--service-accent-dark': accent.dark,
    } as CSSProperties;
}

function formatChapter(index: number): string {
    return String(index + 1).padStart(2, '0');
}

function collectServiceTypes(services: PublicServiceCard[]): string[] {
    return Array.from(new Set(services.map((service) => service.type).filter(Boolean))).slice(0, 3);
}

function ServiceMetric({ value, label, tone = 'light' }: { value: string | number; label: string; tone?: 'light' | 'dark' | 'hero' }) {
    return (
        <div
            className={clsx(
                'rounded-[1.25rem] border px-5 py-4 shadow-[var(--public-shadow)]',
                tone === 'dark' && 'border-white/15 bg-white/10 text-white',
                tone === 'hero' && 'border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] text-[color:var(--public-text)] dark:border-white/15 dark:bg-white/10 dark:text-white',
                tone === 'light' && 'border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] text-[color:var(--public-text)]',
            )}
        >
            <p className="public-display text-4xl font-normal">{value}</p>
            <p className={clsx(
                'mt-1 text-sm font-medium',
                tone === 'dark' && 'text-white/70',
                tone === 'hero' && 'text-[color:var(--public-text-soft)] dark:text-white/70',
                tone === 'light' && 'text-[color:var(--public-text-soft)]',
            )}>
                {label}
            </p>
        </div>
    );
}

function ServiceCard({
    service,
    index,
    featured = false,
}: {
    service: PublicServiceCard;
    index: number;
    featured?: boolean;
}) {
    return (
        <PublicReveal
            as="article"
            delay={Math.min(index, 5) * 60}
            style={accentStyle(index)}
            className={clsx(
                'services-service-card group relative overflow-hidden rounded-[1.7rem] border bg-[color:var(--public-bg-soft)] shadow-[var(--public-shadow)] transition duration-300 hover:-translate-y-1',
                'border-[color:var(--service-accent-border)]',
                featured && 'md:col-span-2 xl:col-span-2',
            )}
        >
            <div className={clsx('grid min-h-full', featured && 'md:grid-cols-[0.95fr_1.05fr]')}>
                <div className="relative min-h-64 overflow-hidden">
                    <img
                        src={resolveProductImage(service.featured_image)}
                        alt={service.title}
                        loading="lazy"
                        decoding="async"
                        className="services-service-image h-full min-h-64 w-full object-cover transition duration-700"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,9,8,0.06)_0%,rgba(10,9,8,0.62)_100%)]" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-semibold uppercase text-white/90 backdrop-blur">
                        <SparklesIcon className="h-4 w-4 text-[color:var(--service-accent)]" />
                        {service.type}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="services-signal-track relative h-1 overflow-hidden rounded-full bg-white/20" />
                    </div>
                </div>

                <div className="flex min-h-full flex-col p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <span className="rounded-full border border-[color:var(--service-accent-border)] bg-[color:var(--service-accent-soft)] px-3 py-1 text-[0.68rem] font-semibold uppercase text-[color:var(--service-accent-dark)] dark:text-[color:var(--service-accent)]">
                            Published
                        </span>
                        <span className="text-xs font-semibold uppercase text-[color:var(--public-text-muted)]">
                            #{service.id}
                        </span>
                    </div>

                    <Heading className="mt-5 text-2xl/8 font-semibold !text-[color:var(--public-text)] sm:text-3xl/9">
                        {service.title}
                    </Heading>
                    <Text className="mt-4 text-base/7 !text-[color:var(--public-text-soft)]">
                        {service.short_description}
                    </Text>

                    <div className="mt-6 grid gap-3 text-sm">
                        <div className="flex items-start gap-3 rounded-[1rem] bg-[color:var(--service-accent-soft)] px-4 py-3">
                            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--service-accent)]" />
                            <span className="font-medium text-[color:var(--public-text)]">
                                Ready for public inquiry and CMS-managed presentation.
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto pt-6">
                        <Link
                            href="/contact-us"
                            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--public-surface-dark)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--public-shadow)] transition duration-300 hover:-translate-y-0.5"
                        >
                            Ask about this
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </PublicReveal>
    );
}

function ServicesListingFallback() {
    return (
        <section className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <PublicCard key={index} className="min-h-80 animate-pulse bg-[color:var(--public-surface)]" />
                ))}
            </div>
        </section>
    );
}

function CatalogIndex({ categories, uncategorizedCount }: { categories: PublicCategory[]; uncategorizedCount: number }) {
    const visibleCategories = categories.slice(0, 6);

    return (
        <PublicPanel className="overflow-hidden">
            <PublicSectionHeader
                eyebrow="Catalog map"
                title="A clearer path through every public capability."
                body="Categories now read like chapters, so visitors can scan the full offer before committing to a deeper service area."
            />

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleCategories.map((category, index) => {
                    const services = category.product_services ?? [];

                    return (
                        <a
                            key={category.id}
                            href={`#services-category-${category.id}`}
                            style={accentStyle(index)}
                            className="group rounded-[1.35rem] border border-[color:var(--service-accent-border)] bg-[color:var(--service-accent-soft)] p-5 transition duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <span className="public-display text-4xl font-normal text-[color:var(--service-accent-dark)] dark:text-[color:var(--service-accent)]">
                                    {formatChapter(index)}
                                </span>
                                <span className="rounded-full bg-[color:var(--public-surface)] px-3 py-1 text-xs font-semibold text-[color:var(--public-text-soft)]">
                                    {services.length} records
                                </span>
                            </div>
                            <Heading className="mt-6 text-xl/7 font-semibold !text-[color:var(--public-text)]">
                                {category.name}
                            </Heading>
                            {category.description ? (
                                <Text className="mt-3 line-clamp-2 !text-[color:var(--public-text-soft)]">
                                    {category.description}
                                </Text>
                            ) : null}
                        </a>
                    );
                })}
            </div>

            {uncategorizedCount > 0 ? (
                <div className="mt-5 rounded-[1.25rem] border border-dashed border-[color:var(--public-border-strong)] bg-[color:var(--public-bg-soft)] px-5 py-4 text-sm font-medium text-[color:var(--public-text-soft)]">
                    {uncategorizedCount} additional published record{uncategorizedCount === 1 ? '' : 's'} sit outside the visible category map.
                </div>
            ) : null}
        </PublicPanel>
    );
}

function CategoryChapter({
    category,
    index,
}: {
    category: PublicCategory;
    index: number;
}) {
    const services = category.product_services ?? [];
    const serviceTypes = collectServiceTypes(services);

    return (
        <section
            id={`services-category-${category.id}`}
            style={accentStyle(index)}
            className="services-chapter-band relative scroll-mt-32 overflow-hidden rounded-[2.2rem] border border-[color:var(--service-accent-border)] bg-[color:var(--public-surface)] p-5 shadow-[var(--public-shadow)] sm:p-7"
        >
            <div className="relative grid gap-7 xl:grid-cols-[0.42fr_1.58fr] xl:items-start">
                <aside className="xl:sticky xl:top-28">
                    <div className="rounded-[1.7rem] border border-[color:var(--service-accent-border)] bg-[color:var(--service-accent-soft)] p-6">
                        <p className="text-xs font-semibold uppercase text-[color:var(--public-text-muted)]">
                            Category chapter
                        </p>
                        <p className="public-display mt-4 text-7xl font-normal text-[color:var(--service-accent-dark)] dark:text-[color:var(--service-accent)]">
                            {formatChapter(index)}
                        </p>
                        <Heading className="mt-4 text-3xl/9 font-semibold !text-[color:var(--public-text)]">
                            {category.name}
                        </Heading>
                        {category.description ? (
                            <Text className="mt-4 !text-[color:var(--public-text-soft)]">
                                {category.description}
                            </Text>
                        ) : null}

                        <div className="mt-6 grid gap-3">
                            <ServiceMetric value={services.length} label="published records" />
                            {serviceTypes.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {serviceTypes.map((type) => (
                                        <span
                                            key={type}
                                            className="rounded-full border border-[color:var(--service-accent-border)] bg-[color:var(--public-surface)] px-3 py-1 text-xs font-semibold uppercase text-[color:var(--public-text-soft)]"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </aside>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {services.map((service, serviceIndex) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            index={serviceIndex + index}
                            featured={serviceIndex === 0 && services.length > 2}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Services({ page, catalogCount, categories, uncategorizedServices }: ServicesPageProps) {
    const sections = asServicesSections(page.sections);
    const bannerImage = storageUrl(page.banner_image);
    const categoryList = categories ?? [];
    const uncategorizedList = uncategorizedServices ?? [];
    const categoryMetric = categories ? categoryList.length : '...';
    const uncategorizedMetric = uncategorizedServices ? uncategorizedList.length : '...';

    return (
        <PublicLayout title={page.meta_title ?? page.title} description={page.meta_description}>
            <div className="services-route space-y-8 sm:space-y-10">
                <PublicReveal
                    as="section"
                    className="public-grain relative min-h-[min(72svh,44rem)] overflow-hidden rounded-[2.8rem] border border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] shadow-[var(--public-shadow-strong)] dark:bg-[color:var(--public-surface-dark)]"
                >
                    {bannerImage ? (
                        <img
                            src={bannerImage}
                            alt={sections.hero.title}
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                            className="services-hero-image absolute inset-0 h-full w-full object-cover opacity-20 dark:opacity-60"
                        />
                    ) : null}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,240,0.98)_0%,rgba(255,248,240,0.9)_46%,rgba(255,248,240,0.52)_100%)] dark:bg-[linear-gradient(90deg,rgba(13,12,10,0.92)_0%,rgba(13,12,10,0.72)_44%,rgba(13,12,10,0.18)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(0deg,rgba(255,248,240,0.92),transparent)] dark:bg-[linear-gradient(0deg,rgba(13,12,10,0.88),transparent)]" />

                    <div className="relative grid min-h-[min(72svh,44rem)] gap-8 p-6 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:p-10">
                        <div className="max-w-4xl self-center lg:self-end">
                            <PublicEyebrow className="border-[color:var(--public-border)] bg-[color:var(--public-accent-soft)] text-[color:var(--public-text-soft)] dark:border-white/15 dark:bg-white/10 dark:text-white/75">
                                {sections.hero.eyebrow}
                            </PublicEyebrow>
                            <Heading className="public-display mt-6 max-w-4xl text-5xl/13 font-normal !text-[color:var(--public-text)] dark:!text-white sm:text-6xl/[1.04] lg:text-7xl/[1.02]">
                                {sections.hero.title}
                            </Heading>
                            <Text className="mt-5 max-w-2xl text-base/8 !text-[color:var(--public-text-soft)] dark:!text-white/75 sm:text-lg/8">
                                {sections.hero.body}
                            </Text>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <a
                                    href="#services-catalog"
                                    className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-amber-950 shadow-[var(--public-shadow)] transition duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                                >
                                    Explore catalog
                                </a>
                                <Button href={sections.cta.primaryCtaHref} outline className="!rounded-full !border-[color:var(--public-border)] !bg-[color:var(--public-bg-soft)] !text-[color:var(--public-text)] dark:!border-white/20 dark:!bg-white/10 dark:!text-white">
                                    {sections.cta.primaryCtaLabel}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-4 self-end sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                            <ServiceMetric value={catalogCount} label="live records" tone="hero" />
                            <ServiceMetric value={categoryMetric} label="categories" tone="hero" />
                            <ServiceMetric value={uncategorizedMetric} label="extra records" tone="hero" />
                        </div>
                    </div>
                </PublicReveal>

                <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                    <PublicPanel className="overflow-hidden">
                        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
                            <div className="rounded-[1.6rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] p-5">
                                <Squares2X2Icon className="h-7 w-7 text-[color:var(--public-accent)]" />
                                <p className="mt-8 text-xs font-semibold uppercase text-[color:var(--public-text-muted)]">
                                    Service architecture
                                </p>
                                <p className="public-display mt-3 text-5xl font-normal text-[color:var(--public-text)]">
                                    {catalogCount}
                                </p>
                                <Text className="mt-2 !text-[color:var(--public-text-soft)]">
                                    active products and services organized for faster discovery.
                                </Text>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-[color:var(--public-text-muted)]">
                                    Introduction
                                </p>
                                <Heading className="mt-4 text-4xl/10 font-semibold !text-[color:var(--public-text)] sm:text-5xl/[1.08]">
                                    {sections.intro.title}
                                </Heading>
                                <Text className="mt-5 max-w-3xl text-base/8 !text-[color:var(--public-text-soft)]">
                                    {sections.intro.body}
                                </Text>
                            </div>
                        </div>
                    </PublicPanel>

                    <PublicPanel className="bg-[color:var(--public-surface-dark)] text-white">
                        <div className="grid min-h-full content-between gap-8">
                            <PublicSectionHeader
                                eyebrow={sections.categories.eyebrow}
                                title={sections.categories.title}
                                body={sections.categories.body}
                                invert
                            />
                            <div className="grid gap-3 sm:grid-cols-3">
                                <ServiceMetric value={categoryMetric} label="chapters" tone="dark" />
                                <ServiceMetric value={catalogCount} label="records" tone="dark" />
                                <ServiceMetric value="24/7" label="public access" tone="dark" />
                            </div>
                        </div>
                    </PublicPanel>
                </section>

                <Deferred
                    data={['categories', 'uncategorizedServices']}
                    fallback={<ServicesListingFallback />}
                >
                    {() => (
                        <section id="services-catalog" className="space-y-7">
                            <CatalogIndex
                                categories={categoryList}
                                uncategorizedCount={uncategorizedList.length}
                            />

                            <PublicPanel>
                                <PublicSectionHeader
                                    eyebrow={sections.listing.eyebrow}
                                    title={sections.listing.title}
                                    body={sections.listing.body}
                                />
                            </PublicPanel>

                            {categoryList.map((category, index) => (
                                <CategoryChapter key={category.id} category={category} index={index} />
                            ))}

                            {uncategorizedList.length ? (
                                <PublicPanel>
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-[color:var(--public-text-muted)]">
                                                Additional records
                                            </p>
                                            <Heading className="mt-4 text-4xl/10 font-semibold !text-[color:var(--public-text)]">
                                                Published outside the visible category map.
                                            </Heading>
                                            <Text className="mt-4 max-w-3xl !text-[color:var(--public-text-soft)]">
                                                These records remain discoverable and inquiry-ready while staying independent from category chapters.
                                            </Text>
                                        </div>
                                        <ServiceMetric value={uncategorizedList.length} label="uncategorized" />
                                    </div>
                                    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                        {uncategorizedList.map((service, index) => (
                                            <ServiceCard key={service.id} service={service} index={index + categoryList.length} />
                                        ))}
                                    </div>
                                </PublicPanel>
                            ) : null}
                        </section>
                    )}
                </Deferred>

                <PublicPanel className="bg-[color:var(--public-surface-dark)] text-white">
                    <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                        <div>
                            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-[color:var(--public-accent)]">
                                <SparklesIcon className="h-4 w-4" />
                                Inquiry ready
                            </p>
                            <Heading className="mt-4 text-4xl/10 font-semibold !text-white sm:text-5xl/[1.08]">
                                {sections.cta.title}
                            </Heading>
                            <Text className="mt-4 max-w-2xl !text-white/70">{sections.cta.body}</Text>
                        </div>
                        <div className="flex flex-wrap gap-3 lg:justify-end">
                            <Button href={sections.cta.primaryCtaHref} color="amber" className="!rounded-full">
                                {sections.cta.primaryCtaLabel}
                            </Button>
                        </div>
                    </div>
                </PublicPanel>
            </div>
        </PublicLayout>
    );
}
