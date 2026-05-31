import clsx from 'clsx';
import { Deferred } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import {
    PublicCard,
    PublicHero,
    PublicPanel,
    PublicSectionHeader,
    PublicSubheading,
} from '@/components/public/PublicPageShell';
import PublicLayout from '@/layouts/PublicLayout';
import { asAboutSections } from '@/lib/public-cms';
import type { AboutPageProps } from '@/types/public';
import { resolvePersonImage, storageUrl } from '@/utils/admin';

const TEAM_PAGE_SIZE = 3;
const TESTIMONIAL_PAGE_SIZE = 3;

function AboutCollectionFallback({ title, body }: { title: string; body: string }) {
    return (
        <PublicPanel>
            <PublicSectionHeader title={title} body={body} />
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <PublicCard key={index} className="min-h-72 animate-pulse bg-[color:var(--public-surface)]" />
                ))}
            </div>
        </PublicPanel>
    );
}

export default function About({ page, members, testimonials }: AboutPageProps) {
    const sections = asAboutSections(page.sections);
    const bannerImage = storageUrl(page.banner_image);
    const allMembers = members ?? [];
    const allTestimonials = testimonials ?? [];
    const [teamPage, setTeamPage] = useState(0);
    const [testimonialPage, setTestimonialPage] = useState(0);
    const teamPageCount = Math.max(1, Math.ceil(allMembers.length / TEAM_PAGE_SIZE));
    const visibleMembers = allMembers.slice(
        teamPage * TEAM_PAGE_SIZE,
        teamPage * TEAM_PAGE_SIZE + TEAM_PAGE_SIZE,
    );
    const canShowPreviousTeam = teamPage > 0;
    const canShowNextTeam = teamPage < teamPageCount - 1;
    const testimonialPageCount = Math.max(1, Math.ceil(allTestimonials.length / TESTIMONIAL_PAGE_SIZE));
    const visibleTestimonials = allTestimonials.slice(
        testimonialPage * TESTIMONIAL_PAGE_SIZE,
        testimonialPage * TESTIMONIAL_PAGE_SIZE + TESTIMONIAL_PAGE_SIZE,
    );
    const canShowPreviousTestimonials = testimonialPage > 0;
    const canShowNextTestimonials = testimonialPage < testimonialPageCount - 1;

    return (
        <PublicLayout title={page.meta_title ?? page.title} description={page.meta_description}>
            <div className="space-y-8 sm:space-y-10">
                <PublicHero
                    eyebrow={sections.hero.eyebrow}
                    title={sections.hero.title}
                    body={sections.hero.body}
                    bannerImage={bannerImage}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        {sections.milestones.slice(0, 2).map((milestone, index) => (
                            <PublicCard key={`${milestone.label}-${index}`} className="border-[color:var(--public-border-strong)] bg-[color:var(--public-surface-strong)]">
                                <p className="public-display text-4xl font-normal tracking-[-0.04em] text-[color:var(--public-text)]">
                                    {milestone.value}
                                </p>
                                <Text className="mt-2 !text-[color:var(--public-text-soft)]">{milestone.label}</Text>
                            </PublicCard>
                        ))}
                    </div>
                </PublicHero>

                <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                    <PublicPanel className="overflow-hidden">
                        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                            <div>
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--public-text-muted)]">
                                    Brand story
                                </p>
                                <Heading className="public-display mt-4 text-4xl/11 font-normal tracking-[-0.03em] !text-[color:var(--public-text)] sm:text-5xl/[1.08]">
                                    {sections.story.title}
                                </Heading>
                                <Text className="mt-5 text-base/8 !text-[color:var(--public-text-soft)]">
                                    {sections.story.body}
                                </Text>
                            </div>

                            <div className="rounded-[1.75rem] border border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] p-5">
                                <div className="h-px w-16 bg-[linear-gradient(90deg,var(--public-accent),transparent)]" />
                                <Text className="public-display mt-6 text-2xl/9 font-normal italic !text-[color:var(--public-text)]">
                                    {sections.story.secondaryBody}
                                </Text>
                            </div>
                        </div>
                    </PublicPanel>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {sections.milestones.map((milestone, index) => (
                            <PublicCard
                                key={`${milestone.label}-${index}`}
                                className={clsx(
                                    'border-[color:var(--public-border-strong)] bg-[color:var(--public-surface-strong)]',
                                    index === 0 && 'sm:col-span-2',
                                )}
                            >
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--public-text-muted)]">
                                    Milestone {String(index + 1).padStart(2, '0')}
                                </p>
                                <p className="public-display mt-4 text-5xl font-normal tracking-[-0.05em] text-[color:var(--public-text)]">
                                    {milestone.value}
                                </p>
                                <Text className="mt-3 !text-[color:var(--public-text-soft)]">{milestone.label}</Text>
                            </PublicCard>
                        ))}
                    </div>
                </section>

                <section className="grid gap-5 lg:grid-cols-12">
                    {sections.values.map((value, index) => (
                        <PublicCard
                            key={`${value.title}-${index}`}
                            className={clsx(
                                index === 0 && 'lg:col-span-4',
                                index === 1 && 'lg:col-span-4 lg:translate-y-10',
                                index === 2 && 'lg:col-span-4',
                            )}
                        >
                            <div className="mb-6 h-px w-14 bg-[linear-gradient(90deg,var(--public-accent),transparent)]" />
                            <PublicSubheading>{value.title}</PublicSubheading>
                            <Text className="mt-4 !text-[color:var(--public-text-soft)]">{value.body}</Text>
                        </PublicCard>
                    ))}
                </section>

                <Deferred
                    data={['members', 'testimonials']}
                    fallback={<AboutCollectionFallback title={sections.team.title} body={sections.team.body} />}
                >
                    {() => (
                        <>
                            <PublicPanel>
                                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                                    <PublicSectionHeader
                                        eyebrow={sections.team.eyebrow}
                                        title={sections.team.title}
                                        body={sections.team.body}
                                    />
                                    {allMembers.length > TEAM_PAGE_SIZE ? (
                                        <div className="flex shrink-0 items-center gap-3">
                                            <button
                                                type="button"
                                                aria-label="Show previous team members"
                                                disabled={!canShowPreviousTeam}
                                                onClick={() => setTeamPage((current) => Math.max(0, current - 1))}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] text-[color:var(--public-text)] shadow-[var(--public-shadow)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <ChevronLeftIcon className="h-5 w-5" />
                                            </button>
                                            <span className="rounded-full border border-[color:var(--public-border)] px-3 py-1 text-sm font-medium text-[color:var(--public-text-soft)]">
                                                {teamPage + 1} / {teamPageCount}
                                            </span>
                                            <button
                                                type="button"
                                                aria-label="Show next team members"
                                                disabled={!canShowNextTeam}
                                                onClick={() => setTeamPage((current) => Math.min(teamPageCount - 1, current + 1))}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-surface-dark)] text-white shadow-[var(--public-shadow)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <ChevronRightIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                                    {visibleMembers.map((member, index) => (
                                        <PublicCard
                                            key={member.id}
                                            className={clsx(
                                                'border-[color:var(--public-border-strong)] bg-[color:var(--public-surface-strong)]',
                                                index === 1 && 'lg:-translate-y-4',
                                            )}
                                        >
                                            <img src={resolvePersonImage(member.image)} alt={member.name} className="h-24 w-24 rounded-[1.35rem] object-cover ring-1 ring-[color:var(--public-border)]" />
                                            <PublicSubheading className="mt-5">{member.name}</PublicSubheading>
                                            <Text className="mt-1 !text-[color:var(--public-text-muted)]">{member.designation}</Text>
                                            <Text className="mt-4 !text-[color:var(--public-text-soft)]">{member.short_bio}</Text>
                                        </PublicCard>
                                    ))}
                                </div>
                            </PublicPanel>

                            <PublicPanel className="bg-[color:var(--public-surface-dark)] text-white">
                                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                                    <PublicSectionHeader
                                        eyebrow={sections.testimonials.eyebrow}
                                        title={sections.testimonials.title}
                                        body={sections.testimonials.body}
                                        invert
                                    />
                                    {allTestimonials.length > TESTIMONIAL_PAGE_SIZE ? (
                                        <div className="flex shrink-0 items-center gap-3">
                                            <button
                                                type="button"
                                                aria-label="Show previous testimonials"
                                                disabled={!canShowPreviousTestimonials}
                                                onClick={() => setTestimonialPage((current) => Math.max(0, current - 1))}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white shadow-[var(--public-shadow)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <ChevronLeftIcon className="h-5 w-5" />
                                            </button>
                                            <span className="rounded-full border border-white/12 px-3 py-1 text-sm font-medium text-white/60">
                                                {testimonialPage + 1} / {testimonialPageCount}
                                            </span>
                                            <button
                                                type="button"
                                                aria-label="Show next testimonials"
                                                disabled={!canShowNextTestimonials}
                                                onClick={() => setTestimonialPage((current) => Math.min(testimonialPageCount - 1, current + 1))}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[color:var(--public-accent)] text-zinc-950 shadow-[var(--public-shadow)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <ChevronRightIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                                    {visibleTestimonials.map((testimonial, index) => (
                                        <article
                                            key={testimonial.id}
                                            className={clsx(
                                                'rounded-[var(--public-radius-card)] border border-white/10 bg-white/6 p-5 backdrop-blur-sm',
                                                index === 1 && 'lg:translate-y-5',
                                            )}
                                        >
                                            <p className="public-display text-3xl leading-none text-[color:var(--public-accent)]">&ldquo;</p>
                                            <Text className="mt-4 !text-white/76">{testimonial.message}</Text>
                                            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                                                <img
                                                    src={resolvePersonImage(testimonial.image)}
                                                    alt={testimonial.client_name}
                                                    className="h-12 w-12 rounded-full object-cover ring-1 ring-white/15"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-white">{testimonial.client_name}</p>
                                                    <Text className="!text-white/52">{testimonial.company_name}</Text>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </PublicPanel>
                        </>
                    )}
                </Deferred>

                <PublicPanel className="bg-[color:var(--public-surface-dark)] text-white">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                        <div>
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--public-accent)]">
                                Continue the conversation
                            </p>
                            <Heading className="public-display mt-4 text-4xl/11 font-normal tracking-[-0.03em] !text-white sm:text-5xl/[1.06]">
                                {sections.cta.title}
                            </Heading>
                            <Text className="mt-4 max-w-2xl !text-white/72">{sections.cta.body}</Text>
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
