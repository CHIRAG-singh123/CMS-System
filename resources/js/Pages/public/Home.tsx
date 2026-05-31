import clsx from 'clsx';
import { Deferred } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import {
    PublicCard,
    PublicHero,
    PublicMediaFrame,
    PublicPanel,
    PublicSectionHeader,
    PublicSubheading,
} from '@/components/public/PublicPageShell';
import PublicLayout from '@/layouts/PublicLayout';
import { asHomeSections } from '@/lib/public-cms';
import type { HomePageProps } from '@/types/public';
import { resolvePersonImage, resolveProductImage, storageUrl } from '@/utils/admin';

function HomeCollectionFallback({ title, body }: { title: string; body: string }) {
    return (
        <PublicPanel>
            <Heading className="public-display text-4xl/11 font-normal tracking-[-0.03em] !text-[color:var(--public-text)] sm:text-5xl/[1.08]">
                {title}
            </Heading>
            <Text className="mt-4 max-w-3xl !text-[color:var(--public-text-soft)]">{body}</Text>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <PublicCard key={index} className="min-h-64 animate-pulse bg-[color:var(--public-surface)]" />
                ))}
            </div>
        </PublicPanel>
    );
}

export default function Home({ page, featuredServices, testimonials, members }: HomePageProps) {
    const sections = asHomeSections(page.sections);
    const bannerImage = storageUrl(page.banner_image);

    return (
        <PublicLayout title={page.meta_title ?? page.title} description={page.meta_description}>
            <div className="space-y-8 sm:space-y-10">
                <PublicHero
                    eyebrow={sections.hero.eyebrow}
                    title={sections.hero.title}
                    body={sections.hero.body}
                    bannerImage={bannerImage}
                >
                    <div className="grid gap-4 sm:grid-cols-3">
                        {sections.stats.map((stat, index) => (
                            <PublicCard
                                key={`${stat.label}-${index}`}
                                className="border-[color:var(--public-border-strong)] bg-[color:var(--public-surface-strong)]"
                            >
                                <p className="public-display text-4xl font-normal tracking-[-0.04em] text-[color:var(--public-text)]">
                                    {stat.value}
                                </p>
                                <Text className="mt-2 !text-[color:var(--public-text-soft)]">{stat.label}</Text>
                            </PublicCard>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button href={sections.hero.primaryCtaHref} color="amber" className="!rounded-full">
                            {sections.hero.primaryCtaLabel}
                        </Button>
                        <Button href={sections.hero.secondaryCtaHref} outline className="!rounded-full !border-[color:var(--public-border)] !bg-[color:var(--public-bg-soft)] !text-[color:var(--public-text)]">
                            {sections.hero.secondaryCtaLabel}
                        </Button>
                    </div>
                </PublicHero>

                <section className="grid gap-5 lg:grid-cols-12">
                    {sections.reasons.map((reason, index) => (
                        <PublicCard
                            key={`${reason.title}-${index}`}
                            className={clsx(
                                'flex min-h-full flex-col justify-between',
                                index === 0 && 'lg:col-span-5 lg:row-span-2',
                                index === 1 && 'lg:col-span-7',
                                index === 2 && 'lg:col-span-7',
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <span className="public-display inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--public-surface-dark)] text-xl font-normal text-white">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="h-px flex-1 bg-[linear-gradient(90deg,var(--public-accent),transparent)]" />
                            </div>
                            <div className="mt-10">
                                <PublicSubheading className={index === 0 ? 'text-3xl/10 sm:text-4xl/11' : ''}>{reason.title}</PublicSubheading>
                                <Text className="mt-4 max-w-2xl !text-[color:var(--public-text-soft)]">{reason.body}</Text>
                            </div>
                        </PublicCard>
                    ))}
                </section>

                <Deferred
                    data={['featuredServices', 'testimonials', 'members']}
                    fallback={<HomeCollectionFallback title={sections.featuredServices.title} body={sections.featuredServices.body} />}
                >
                    {() => (
                        <>
                            <PublicPanel>
                                <PublicSectionHeader
                                    eyebrow={sections.featuredServices.eyebrow}
                                    title={sections.featuredServices.title}
                                    body={sections.featuredServices.body}
                                />
                                <div className="mt-8 grid gap-5 lg:grid-cols-12">
                                    {(featuredServices ?? []).map((service, index) => (
                                        <PublicCard
                                            key={service.id}
                                            className={clsx(
                                                'overflow-hidden !p-0',
                                                index === 0 ? 'lg:col-span-7' : 'lg:col-span-5',
                                            )}
                                        >
                                            <div className={clsx('grid gap-0', index === 0 ? 'lg:grid-cols-[1.1fr_0.9fr]' : '')}>
                                                <PublicMediaFrame
                                                    src={resolveProductImage(service.featured_image)}
                                                    alt={service.title}
                                                    className={clsx(index === 0 ? 'h-full rounded-none lg:rounded-r-none' : 'aspect-[16/10] rounded-none')}
                                                />
                                                <div className="flex flex-col justify-between p-5 sm:p-6">
                                                    <div>
                                                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--public-text-muted)]">
                                                            {service.type}
                                                        </p>
                                                        <PublicSubheading className="mt-4">{service.title}</PublicSubheading>
                                                        <Text className="mt-4 !text-[color:var(--public-text-soft)]">{service.short_description}</Text>
                                                    </div>
                                                    <div className="mt-6 flex items-center gap-3">
                                                        <span className="h-px flex-1 bg-[linear-gradient(90deg,var(--public-accent),transparent)]" />
                                                        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--public-text-muted)]">
                                                            Published
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </PublicCard>
                                    ))}
                                </div>
                            </PublicPanel>

                            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                                <PublicPanel className="bg-[color:var(--public-surface-dark)] text-white">
                                    <PublicSectionHeader
                                        eyebrow={sections.testimonials.eyebrow}
                                        title={sections.testimonials.title}
                                        body={sections.testimonials.body}
                                        invert
                                    />
                                    <div className="mt-8 space-y-4">
                                        {(testimonials ?? []).slice(0, 3).map((testimonial, index) => (
                                            <article
                                                key={testimonial.id}
                                                className={clsx(
                                                    'rounded-[var(--public-radius-card)] border p-5 transition duration-300',
                                                    'border-white/10 bg-white/6 backdrop-blur-sm',
                                                    index === 0 ? 'lg:mr-14' : index === 1 ? 'lg:ml-10' : 'lg:mr-6',
                                                )}
                                            >
                                                <p className="public-display text-3xl leading-none text-[color:var(--public-accent)]">&ldquo;</p>
                                                <p className="mt-4 text-sm/7 text-white/80">{testimonial.message}</p>
                                                <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                                                    <img
                                                        src={resolvePersonImage(testimonial.image)}
                                                        alt={testimonial.client_name}
                                                        className="h-12 w-12 rounded-full object-cover ring-1 ring-white/15"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-white">{testimonial.client_name}</p>
                                                        <p className="text-sm text-white/55">{testimonial.company_name}</p>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </PublicPanel>

                                <PublicPanel>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[color:var(--public-text-muted)]">
                                                Team signal
                                            </p>
                                            <Heading className="public-display mt-3 text-4xl/11 font-normal tracking-[-0.03em] !text-[color:var(--public-text)]">
                                                Editorial people layer
                                            </Heading>
                                        </div>
                                        <Text className="max-w-md !text-[color:var(--public-text-soft)]">
                                            Human credibility stays visible on the homepage without turning it into a staff directory.
                                        </Text>
                                    </div>

                                    <div className="mt-8 grid gap-4">
                                        {(members ?? []).map((member, index) => (
                                            <PublicCard
                                                key={member.id}
                                                className={clsx(
                                                    'flex items-start gap-4 border-[color:var(--public-border-strong)] bg-[color:var(--public-surface-strong)]',
                                                    index === 1 && 'lg:ml-8',
                                                    index === 2 && 'lg:mr-10',
                                                )}
                                            >
                                                <img
                                                    src={resolvePersonImage(member.image)}
                                                    alt={member.name}
                                                    className="h-20 w-20 rounded-[1.2rem] object-cover ring-1 ring-[color:var(--public-border)]"
                                                />
                                                <div className="min-w-0">
                                                    <p className="public-display text-2xl font-normal tracking-[-0.02em] text-[color:var(--public-text)]">
                                                        {member.name}
                                                    </p>
                                                    <Text className="mt-1 !text-[color:var(--public-text-muted)]">{member.designation}</Text>
                                                    <Text className="mt-3 !text-[color:var(--public-text-soft)]">{member.short_bio}</Text>
                                                </div>
                                            </PublicCard>
                                        ))}
                                    </div>
                                </PublicPanel>
                            </section>
                        </>
                    )}
                </Deferred>

                <PublicPanel className="overflow-hidden bg-[color:var(--public-surface-dark)] text-white">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                        <div>
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--public-accent)]">
                                Final invitation
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
