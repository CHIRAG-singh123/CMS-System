import { Deferred } from '@inertiajs/react';
import clsx from 'clsx';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowTopRightOnSquareIcon, ChevronLeftIcon, ChevronRightIcon, PhotoIcon, Squares2X2Icon, XMarkIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import {
    PublicCard,
    PublicEyebrow,
    PublicHero,
    PublicMediaFrame,
    PublicPanel,
    PublicSectionHeader,
    PublicSubheading,
} from '@/components/public/PublicPageShell';
import PublicLayout from '@/layouts/PublicLayout';
import { asGallerySections } from '@/lib/public-cms';
import type { GalleryPageProps, PublicGallery } from '@/types/public';
import { resolveProductImage, storageUrl } from '@/utils/admin';

const ALBUM_PAGE_SIZE = 3;

function GalleryListingFallback() {
    return (
        <PublicPanel>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <PublicCard key={index} className="min-h-80 animate-pulse bg-[color:var(--public-surface)]" />
                ))}
            </div>
        </PublicPanel>
    );
}

function HoverMarqueeText({
    text,
    active,
    className,
    textClassName,
    overlayClassName,
}: {
    text: string;
    active: boolean;
    className?: string;
    textClassName?: string;
    overlayClassName?: string;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLSpanElement | null>(null);
    const [overflowOffset, setOverflowOffset] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;

        if (!container || !content) {
            return;
        }

        const updateOverflow = () => {
            setOverflowOffset(Math.max(0, content.scrollWidth - container.clientWidth));
        };

        updateOverflow();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', updateOverflow);

            return () => window.removeEventListener('resize', updateOverflow);
        }

        const observer = new ResizeObserver(updateOverflow);
        observer.observe(container);
        observer.observe(content);

        return () => observer.disconnect();
    }, [text]);

    const shouldAnimate = active && overflowOffset > 0;
    const transitionDuration = shouldAnimate
        ? `${Math.max(4, overflowOffset / 36)}s`
        : '220ms';

    return (
        <div className={className}>
            <div ref={containerRef} className="relative overflow-hidden">
                <span
                    ref={contentRef}
                    className={clsx('block whitespace-nowrap will-change-transform', textClassName)}
                    style={{
                        transform: shouldAnimate ? `translateX(-${overflowOffset}px)` : 'translateX(0)',
                        transition: `transform ${transitionDuration} ${shouldAnimate ? 'linear' : 'ease-out'}`,
                    }}
                >
                    {text}
                </span>
                {overflowOffset > 0 ? (
                    <span
                        aria-hidden="true"
                        className={clsx(
                            'pointer-events-none absolute inset-y-0 right-0 flex items-center pl-5 transition-opacity duration-150',
                            shouldAnimate ? 'opacity-0' : 'opacity-100',
                            overlayClassName,
                        )}
                    >
                        ...
                    </span>
                ) : null}
            </div>
        </div>
    );
}

function normalizeCoverflowOffset(index: number, currentIndex: number, totalItems: number): number {
    let offset = index - currentIndex;

    if (offset > totalItems / 2) {
        offset -= totalItems;
    } else if (offset < -totalItems / 2) {
        offset += totalItems;
    }

    return offset;
}

function coverflowItemStyle(offset: number, totalItems: number): CSSProperties {
    const absoluteOffset = Math.abs(offset);
    const translate = offset * (absoluteOffset === 0 ? 0 : absoluteOffset === 1 ? 250 : absoluteOffset === 2 ? 430 : 560);
    const depth = absoluteOffset === 0 ? 130 : absoluteOffset === 1 ? 15 : absoluteOffset === 2 ? -90 : -170;
    const rotate = offset === 0 ? 0 : offset > 0 ? -42 - (absoluteOffset - 1) * 7 : 42 + (absoluteOffset - 1) * 7;
    const scale = absoluteOffset === 0 ? 1 : absoluteOffset === 1 ? 0.86 : absoluteOffset === 2 ? 0.72 : 0.58;
    const opacity = absoluteOffset === 0 ? 1 : absoluteOffset === 1 ? 0.72 : absoluteOffset === 2 ? 0.42 : 0.18;
    const blur = absoluteOffset > 1 ? `${Math.min(5, absoluteOffset * 1.5)}px` : '0px';
    const saturate = absoluteOffset === 0 ? '1.02' : absoluteOffset === 1 ? '0.88' : '0.68';

    return {
        '--public-translate': `${translate}px`,
        '--public-depth': `${depth}px`,
        '--public-rotate': `${rotate}deg`,
        '--public-scale': String(scale),
        '--public-opacity': String(opacity),
        '--public-z': String(Math.max(1, totalItems - absoluteOffset)),
        '--public-blur': blur,
        '--public-saturate': saturate,
    } as CSSProperties;
}

function GalleryCoverflow({
    galleries,
    currentIndex,
    onSelectIndex,
    onOpenGallery,
}: {
    galleries: PublicGallery[];
    currentIndex: number;
    onSelectIndex: (index: number) => void;
    onOpenGallery: (gallery: PublicGallery) => void;
}) {
    const currentGallery = galleries[currentIndex] ?? galleries[0];
    const currentImages = currentGallery?.images ?? [];

    if (!currentGallery) {
        return null;
    }

    return (
        <PublicPanel className="overflow-hidden">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <PublicSectionHeader
                    eyebrow="Coverflow spotlight"
                    title={currentGallery.title}
                    body={currentGallery.description || 'Explore the featured visual collection through a richer editorial gallery preview.'}
                />
                <div className="flex shrink-0 items-center gap-3">
                    <button
                        type="button"
                        aria-label="Show previous featured album"
                        onClick={() => onSelectIndex((currentIndex - 1 + galleries.length) % galleries.length)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] text-[color:var(--public-text)] shadow-[var(--public-shadow)] transition hover:-translate-y-0.5"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <span className="rounded-full border border-[color:var(--public-border)] px-3 py-1 text-sm font-medium text-[color:var(--public-text-soft)]">
                        {currentIndex + 1} / {galleries.length}
                    </span>
                    <button
                        type="button"
                        aria-label="Show next featured album"
                        onClick={() => onSelectIndex((currentIndex + 1) % galleries.length)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-surface-dark)] text-white shadow-[var(--public-shadow)] transition hover:-translate-y-0.5"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="mt-8 public-coverflow-stage">
                {galleries.map((gallery, index) => {
                    const offset = normalizeCoverflowOffset(index, currentIndex, galleries.length);
                    const isActive = offset === 0;

                    return (
                        <button
                            key={gallery.id}
                            type="button"
                            data-active={isActive}
                            className="public-coverflow-item text-left"
                            style={coverflowItemStyle(offset, galleries.length)}
                            onClick={() => (isActive ? onOpenGallery(gallery) : onSelectIndex(index))}
                            aria-label={isActive ? `Open ${gallery.title}` : `Focus ${gallery.title}`}
                        >
                            <div className="public-coverflow-surface">
                                <img
                                    src={resolveProductImage(gallery.cover_image)}
                                    alt={gallery.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_38%,rgba(14,10,8,0.82)_100%)]" />
                                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/65">
                                        Featured album
                                    </p>
                                    <p className="public-display mt-3 text-3xl font-normal tracking-[-0.03em]">
                                        {gallery.title}
                                    </p>
                                    <p className="mt-3 line-clamp-2 text-sm text-white/72">
                                        {gallery.description || 'Open the album to review the published gallery narrative and imagery.'}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-accent-soft)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--public-text-soft)]">
                            {currentGallery.status}
                        </span>
                        <span className="rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--public-text-soft)]">
                            {currentImages.length} images
                        </span>
                    </div>
                    <Heading className="public-display mt-4 text-4xl/11 font-normal tracking-[-0.03em] !text-[color:var(--public-text)] sm:text-5xl/[1.08]">
                        {currentGallery.title}
                    </Heading>
                    <Text className="mt-4 max-w-3xl !text-[color:var(--public-text-soft)]">
                        {currentGallery.description || 'This featured collection leads the gallery experience with a richer editorial presentation and direct access to the full modal view.'}
                    </Text>
                    <div className="mt-6">
                        <Button
                            type="button"
                            color="amber"
                            className="!rounded-full"
                            onClick={() => onOpenGallery(currentGallery)}
                        >
                            Open featured album
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                    {currentImages.slice(0, 4).map((image) => (
                        <PublicMediaFrame
                            key={image.id}
                            src={resolveProductImage(image.image)}
                            alt={image.alt_text ?? image.title ?? currentGallery.title}
                            className="aspect-square rounded-[1rem]"
                        />
                    ))}
                </div>
            </div>
        </PublicPanel>
    );
}

export default function Gallery({ page, galleryStats, featuredGallery, galleries }: GalleryPageProps) {
    const sections = asGallerySections(page.sections);
    const bannerImage = storageUrl(page.banner_image);
    const [albumPage, setAlbumPage] = useState(0);
    const [selectedGallery, setSelectedGallery] = useState<PublicGallery | null>(null);
    const allGalleries = galleries ?? [];
    const initialCoverflowIndex = featuredGallery
        ? Math.max(0, allGalleries.findIndex((gallery) => gallery.id === featuredGallery.id))
        : 0;
    const [coverflowIndex, setCoverflowIndex] = useState(initialCoverflowIndex);
    const albumPageCount = Math.max(1, Math.ceil(allGalleries.length / ALBUM_PAGE_SIZE));
    const visibleGalleries = allGalleries.slice(
        albumPage * ALBUM_PAGE_SIZE,
        albumPage * ALBUM_PAGE_SIZE + ALBUM_PAGE_SIZE,
    );
    const canShowPreviousAlbums = albumPage > 0;
    const canShowNextAlbums = albumPage < albumPageCount - 1;
    const selectedImages = selectedGallery?.images ?? [];
    const selectedCoverImage = selectedImages[0] ?? null;
    const [isAlbumDescriptionHovered, setIsAlbumDescriptionHovered] = useState(false);
    const [hoveredImageId, setHoveredImageId] = useState<number | null>(null);

    useEffect(() => {
        if (!allGalleries.length) {
            return;
        }

        setCoverflowIndex((current) => (current < allGalleries.length ? current : 0));
    }, [allGalleries.length]);

    return (
        <PublicLayout title={page.meta_title ?? page.title} description={page.meta_description}>
            <div className="space-y-8 sm:space-y-10">
                <PublicHero
                    eyebrow={sections.hero.eyebrow}
                    title={sections.hero.title}
                    body={sections.hero.body}
                    bannerImage={bannerImage}
                >
                    <PublicCard className="border-[color:var(--public-border-strong)] bg-[color:var(--public-surface-strong)]">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--public-text-muted)]">
                            Gallery library
                        </p>
                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <div className="rounded-[1.25rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] p-4">
                                <p className="public-display text-4xl font-normal tracking-[-0.04em] text-[color:var(--public-text)]">{galleryStats.albums}</p>
                                <Text className="mt-1 !text-[color:var(--public-text-soft)]">albums</Text>
                            </div>
                            <div className="rounded-[1.25rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] p-4">
                                <p className="public-display text-4xl font-normal tracking-[-0.04em] text-[color:var(--public-text)]">{galleryStats.images}</p>
                                <Text className="mt-1 !text-[color:var(--public-text-soft)]">images</Text>
                            </div>
                        </div>
                    </PublicCard>
                </PublicHero>

                <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <PublicPanel className="flex flex-col justify-between">
                        <PublicSectionHeader title={sections.intro.title} body={sections.intro.body} />
                        <div className="mt-8 grid grid-cols-2 gap-3">
                            <div className="rounded-[1.25rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] p-4">
                                <p className="public-display text-3xl font-normal tracking-[-0.04em] text-[color:var(--public-text)]">{galleryStats.albums}</p>
                                <Text className="mt-1 !text-[color:var(--public-text-soft)]">published albums</Text>
                            </div>
                            <div className="rounded-[1.25rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] p-4">
                                <p className="public-display text-3xl font-normal tracking-[-0.04em] text-[color:var(--public-text)]">{galleryStats.images}</p>
                                <Text className="mt-1 !text-[color:var(--public-text-soft)]">active visuals</Text>
                            </div>
                        </div>
                    </PublicPanel>

                    {allGalleries.length ? (
                        <GalleryCoverflow
                            galleries={allGalleries}
                            currentIndex={coverflowIndex}
                            onSelectIndex={setCoverflowIndex}
                            onOpenGallery={setSelectedGallery}
                        />
                    ) : featuredGallery ? (
                        <PublicPanel className="!p-4 sm:!p-5">
                            <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-stretch">
                                <PublicMediaFrame
                                    src={resolveProductImage(featuredGallery.cover_image)}
                                    alt={featuredGallery.title}
                                    className="aspect-[4/3] md:aspect-auto"
                                />
                                <div className="flex flex-col justify-between p-2">
                                    <div>
                                        <PublicEyebrow>Featured album</PublicEyebrow>
                                        <PublicSubheading className="mt-5 text-xl">{featuredGallery.title}</PublicSubheading>
                                        {featuredGallery.description ? (
                                            <Text className="mt-3 !text-[color:var(--public-text-soft)]">{featuredGallery.description}</Text>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </PublicPanel>
                    ) : null}
                </section>

                <PublicPanel>
                    <PublicSectionHeader
                        eyebrow={sections.albums.eyebrow}
                        title={sections.albums.title}
                        body={sections.albums.body}
                        actions={allGalleries.length > ALBUM_PAGE_SIZE ? (
                            <div className="flex shrink-0 items-center gap-3">
                                <button
                                    type="button"
                                    aria-label="Show previous albums"
                                    disabled={!canShowPreviousAlbums}
                                    onClick={() => setAlbumPage((current) => Math.max(0, current - 1))}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] text-[color:var(--public-text)] shadow-[var(--public-shadow)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>
                                <span className="rounded-full border border-[color:var(--public-border)] px-3 py-1 text-sm font-medium text-[color:var(--public-text-soft)]">
                                    {albumPage + 1} / {albumPageCount}
                                </span>
                                <button
                                    type="button"
                                    aria-label="Show next albums"
                                    disabled={!canShowNextAlbums}
                                    onClick={() => setAlbumPage((current) => Math.min(albumPageCount - 1, current + 1))}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-surface-dark)] text-white shadow-[var(--public-shadow)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ) : null}
                    />
                    <Deferred data="galleries" fallback={<GalleryListingFallback />}>
                        {() => (
                            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {visibleGalleries.map((gallery, index) => (
                                    <button key={gallery.id} type="button" className="text-left" onClick={() => setSelectedGallery(gallery)}>
                                        <PublicCard
                                            className={clsx(
                                                'flex min-h-full cursor-pointer flex-col !p-4',
                                                index === 1 && 'xl:-translate-y-4',
                                            )}
                                        >
                                            <div className="relative">
                                                <PublicMediaFrame
                                                    src={resolveProductImage(gallery.cover_image)}
                                                    alt={gallery.title}
                                                    className="aspect-[16/11]"
                                                />
                                                <span className="absolute right-3 top-3 rounded-full bg-[color:var(--public-surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--public-text)] shadow-[var(--public-shadow)]">
                                                    {gallery.images_count ?? (gallery.images ?? []).length} photos
                                                </span>
                                            </div>
                                            <div className="flex flex-1 flex-col pt-5">
                                                <PublicSubheading className="text-2xl">{gallery.title}</PublicSubheading>
                                                {gallery.description ? (
                                                    <Text className="mt-3 line-clamp-3 !text-[color:var(--public-text-soft)]">{gallery.description}</Text>
                                                ) : null}
                                                <div className="mt-auto pt-5">
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {(gallery.images ?? []).slice(0, 4).map((image) => (
                                                            <PublicMediaFrame
                                                                key={image.id}
                                                                src={resolveProductImage(image.image)}
                                                                alt={image.alt_text ?? image.title ?? gallery.title}
                                                                className="aspect-square rounded-[0.95rem]"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </PublicCard>
                                    </button>
                                ))}
                            </div>
                        )}
                    </Deferred>
                </PublicPanel>

                <PublicPanel className="bg-[color:var(--public-surface-dark)] text-white">
                    <Heading className="public-display text-4xl/11 font-normal tracking-[-0.03em] !text-white sm:text-5xl/[1.06]">
                        {sections.cta.title}
                    </Heading>
                    <Text className="mt-4 max-w-2xl !text-white/72">{sections.cta.body}</Text>
                    <div className="mt-6">
                        <Button href={sections.cta.primaryCtaHref} color="amber" className="!rounded-full">
                            {sections.cta.primaryCtaLabel}
                        </Button>
                    </div>
                </PublicPanel>
            </div>

            <Dialog
                open={selectedGallery !== null}
                onClose={() => setSelectedGallery(null)}
                size="5xl"
                className="public-theme gallery-modal-panel overflow-hidden !flex !max-h-[calc(100dvh-1.5rem)] !flex-col !rounded-[2.35rem] !border-[color:var(--public-border-strong)] !bg-[color:var(--public-bg-soft)] !p-0 sm:!max-h-[calc(100dvh-3rem)]"
            >
                {selectedGallery ? (
                    <>
                        <div className="gallery-modal-hero relative shrink-0 overflow-hidden px-5 py-5 sm:px-7 sm:py-7">
                            <img
                                src={resolveProductImage(selectedGallery.cover_image)}
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 h-full w-full object-cover opacity-30"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(13,10,8,0.94)_0%,rgba(20,15,12,0.86)_46%,rgba(40,26,14,0.66)_100%)]" />
                            <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.46),transparent)]" />

                            <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <PublicEyebrow className="border-white/20 bg-white/10 text-white/80">
                                            Album details
                                        </PublicEyebrow>
                                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                                            {selectedImages.length} asset{selectedImages.length === 1 ? '' : 's'}
                                        </span>
                                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                                            {selectedGallery.status}
                                        </span>
                                    </div>

                                    <DialogTitle className="mt-5 !text-3xl/9 font-semibold tracking-normal !text-white sm:!text-5xl/[1.04]">
                                        {selectedGallery.title}
                                    </DialogTitle>

                                    <div
                                        className="mt-4 min-w-0 max-w-3xl"
                                        onMouseEnter={() => setIsAlbumDescriptionHovered(true)}
                                        onMouseLeave={() => setIsAlbumDescriptionHovered(false)}
                                    >
                                        <HoverMarqueeText
                                            text={selectedGallery.description || 'A curated collection of published visuals prepared for the public gallery experience.'}
                                            active={isAlbumDescriptionHovered}
                                            textClassName="text-base/7 text-white/80"
                                            overlayClassName="bg-[#160f0b] text-white/80"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    aria-label="Close gallery details"
                                    onClick={() => setSelectedGallery(null)}
                                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[var(--public-shadow)] transition hover:-translate-y-0.5 hover:bg-white/15"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <DialogBody className="gallery-modal-scroll page-scrollbar !mt-0 min-h-0 flex-1 overflow-y-auto">
                            <div className="gallery-modal-body px-5 py-5 sm:px-7 sm:py-7">
                                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_22rem] xl:grid-cols-[minmax(0,1.28fr)_24rem]">
                                    <div className="grid gap-5">
                                        <section className="gallery-modal-spotlight overflow-hidden rounded-[1.8rem] border border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] shadow-[var(--public-shadow)]">
                                            <div className="relative aspect-[16/9] overflow-hidden">
                                                <img
                                                    src={resolveProductImage(selectedGallery.cover_image)}
                                                    alt={selectedGallery.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="h-full w-full object-cover transition duration-700 hover:scale-[1.025]"
                                                />
                                                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_44%,rgba(13,10,8,0.74)_100%)]" />
                                                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4 text-white">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">Cover image</p>
                                                        <p className="mt-2 text-xl font-semibold">{selectedCoverImage?.title ?? selectedGallery.title}</p>
                                                    </div>
                                                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                                                        {selectedImages.length} visual{selectedImages.length === 1 ? '' : 's'}
                                                    </span>
                                                </div>
                                            </div>
                                        </section>

                                        {selectedImages.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                                                {selectedImages.slice(0, 5).map((image) => (
                                                    <div
                                                        key={image.id}
                                                        className="group relative aspect-square overflow-hidden rounded-[1.1rem] border border-[color:var(--public-border)] bg-[color:var(--public-surface)] shadow-[var(--public-shadow)]"
                                                    >
                                                        <img
                                                            src={resolveProductImage(image.image)}
                                                            alt={image.alt_text ?? image.title ?? selectedGallery.title}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(13,10,8,0.62)_100%)] opacity-0 transition group-hover:opacity-100" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>

                                    <aside className="gallery-modal-summary rounded-[1.8rem] border border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] p-5 shadow-[var(--public-shadow)] lg:sticky lg:top-5">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[color:var(--public-surface-dark)] text-white">
                                                <Squares2X2Icon className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-muted)]">Collection summary</p>
                                                <p className="mt-1 text-sm font-semibold text-[color:var(--public-text)]">Published public album</p>
                                            </div>
                                        </div>

                                        <dl className="mt-6 grid gap-3 text-sm">
                                            <div className="rounded-[1.1rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] px-4 py-3">
                                                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--public-text-muted)]">Album</dt>
                                                <dd className="mt-2 font-semibold text-[color:var(--public-text)]">{selectedGallery.title}</dd>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-[1.1rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] px-4 py-3">
                                                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--public-text-muted)]">Images</dt>
                                                    <dd className="mt-2 text-lg font-semibold text-[color:var(--public-text)]">{selectedImages.length}</dd>
                                                </div>
                                                <div className="rounded-[1.1rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] px-4 py-3">
                                                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--public-text-muted)]">State</dt>
                                                    <dd className="mt-2 text-sm font-semibold capitalize text-[color:var(--public-text)]">{selectedGallery.status}</dd>
                                                </div>
                                            </div>
                                            <div className="rounded-[1.1rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] px-4 py-3">
                                                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--public-text-muted)]">Cover detail</dt>
                                                <dd className="mt-2 font-medium text-[color:var(--public-text-soft)]">{selectedCoverImage?.title ?? 'Gallery cover'}</dd>
                                            </div>
                                        </dl>

                                        <div className="mt-5 rounded-[1.35rem] border border-[color:var(--public-border)] bg-[color:var(--public-accent-soft)] p-4">
                                            <div className="flex items-center gap-3">
                                                <PhotoIcon className="h-5 w-5 text-[color:var(--public-accent)]" />
                                                <p className="text-sm font-semibold text-[color:var(--public-text)]">Image metadata</p>
                                            </div>
                                            <Text className="mt-2 !text-[color:var(--public-text-soft)]">
                                                Titles, captions, alt text, status, and display order remain visible for each published asset.
                                            </Text>
                                        </div>
                                    </aside>
                                </div>

                                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--public-text-muted)]">Image gallery</p>
                                        <PublicSubheading className="mt-2 text-3xl/10">Published visuals in this album</PublicSubheading>
                                    </div>
                                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] px-4 py-2 text-sm font-medium text-[color:var(--public-text-soft)] shadow-[var(--public-shadow)]">
                                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                        {selectedImages.length} asset{selectedImages.length === 1 ? '' : 's'}
                                    </span>
                                </div>

                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    {selectedImages.length > 0 ? selectedImages.map((image) => (
                                        <article
                                            key={image.id}
                                            className="overflow-hidden rounded-[1.7rem] border border-[color:var(--public-border)] bg-[color:var(--public-surface)] shadow-[var(--public-shadow)]"
                                            onMouseEnter={() => setHoveredImageId(image.id)}
                                            onMouseLeave={() => setHoveredImageId((current) => (current === image.id ? null : current))}
                                        >
                                            <PublicMediaFrame
                                                src={resolveProductImage(image.image)}
                                                alt={image.alt_text ?? image.title ?? selectedGallery.title}
                                                className="aspect-[16/10] rounded-none"
                                                imageClassName="hover:scale-[1.03]"
                                            />
                                            <div className="space-y-5 p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <HoverMarqueeText
                                                            text={image.title ?? 'Untitled image'}
                                                            active={hoveredImageId === image.id}
                                                            textClassName="public-display text-2xl font-normal tracking-[-0.02em] text-[color:var(--public-text)]"
                                                            overlayClassName="bg-[color:var(--public-surface)] text-[color:var(--public-text)]"
                                                        />
                                                        {image.caption ? (
                                                            <HoverMarqueeText
                                                                text={image.caption}
                                                                active={hoveredImageId === image.id}
                                                                className="mt-2"
                                                                textClassName="text-sm text-[color:var(--public-text-soft)]"
                                                                overlayClassName="bg-[color:var(--public-surface)] text-[color:var(--public-text-soft)]"
                                                            />
                                                        ) : (
                                                            <Text className="mt-2 !text-[color:var(--public-text-muted)]">No caption added for this visual.</Text>
                                                        )}
                                                    </div>
                                                    <span className="rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] px-3 py-1 text-xs font-semibold capitalize text-[color:var(--public-text-soft)]">
                                                        {image.status}
                                                    </span>
                                                </div>
                                                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                                    <div className="rounded-[1rem] bg-[color:var(--public-bg-soft)] px-4 py-3">
                                                        <dt className="font-semibold text-[color:var(--public-text)]">Alt text</dt>
                                                        <dd className="mt-1 text-[color:var(--public-text-soft)]">{image.alt_text ?? 'Not set'}</dd>
                                                    </div>
                                                    <div className="rounded-[1rem] bg-[color:var(--public-bg-soft)] px-4 py-3">
                                                        <dt className="font-semibold text-[color:var(--public-text)]">Sort order</dt>
                                                        <dd className="mt-1 text-[color:var(--public-text-soft)]">{image.sort_order}</dd>
                                                    </div>
                                                    <div className="rounded-[1rem] bg-[color:var(--public-bg-soft)] px-4 py-3 sm:col-span-2">
                                                        <dt className="font-semibold text-[color:var(--public-text)]">Image ID</dt>
                                                        <dd className="mt-1 text-[color:var(--public-text-soft)]">#{image.id}</dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        </article>
                                    )) : (
                                        <div className="rounded-[1.7rem] border border-dashed border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] px-6 py-12 text-center md:col-span-2">
                                            <PublicSubheading>No images available</PublicSubheading>
                                            <Text className="mt-2 !text-[color:var(--public-text-soft)]">This album does not have active public images yet.</Text>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DialogBody>
                    </>
                ) : null}
            </Dialog>
        </PublicLayout>
    );
}
