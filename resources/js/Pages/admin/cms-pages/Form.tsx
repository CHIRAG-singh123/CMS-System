import { useEffect, useState, type FormEvent, type PropsWithChildren } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import AdminCard from '@/components/admin/AdminCard';
import AdminSeoFields from '@/components/admin/AdminSeoFields';
import FormField from '@/components/admin/FormField';
import type { CmsPage } from '@/types/admin';
import { asAboutSections, asContactSections, asGallerySections, asHomeSections, asServicesSections } from '@/lib/public-cms';
import { storageUrl } from '@/utils/admin';

interface CmsPageFormProps {
    cmsPage: CmsPage;
    statuses: string[];
}

type SectionRecord = Record<string, unknown>;

function SectionCard({
    title,
    description,
    children,
}: PropsWithChildren<{ title: string; description?: string }>) {
    return (
        <AdminCard title={title} description={description ?? 'CMS-controlled content block for the live page.'}>
            <div className="grid gap-5 md:grid-cols-2">{children}</div>
        </AdminCard>
    );
}

function updateListItem<T extends SectionRecord>(
    items: T[],
    index: number,
    key: keyof T,
    value: string,
): T[] {
    return items.map((item, itemIndex) => (
        itemIndex === index
            ? { ...item, [key]: value }
            : item
    ));
}

export default function CmsPageForm({ cmsPage, statuses }: CmsPageFormProps) {
    const initialSections = cmsPage.sections ?? {};
    const form = useForm({
        short_description: cmsPage.short_description ?? '',
        status: cmsPage.status ?? statuses[0],
        meta_title: cmsPage.meta_title ?? '',
        meta_description: cmsPage.meta_description ?? '',
        meta_keywords: cmsPage.meta_keywords ?? '',
        remove_banner_image: false,
        banner_image: null as File | null,
        sections: initialSections as SectionRecord,
    });
    const [bannerPreview, setBannerPreview] = useState<string | null>(storageUrl(cmsPage.banner_image));

    useEffect(() => {
        if (form.data.remove_banner_image && !form.data.banner_image) {
            setBannerPreview(null);

            return;
        }

        if (!form.data.banner_image) {
            setBannerPreview(storageUrl(cmsPage.banner_image));

            return;
        }

        const objectUrl = URL.createObjectURL(form.data.banner_image);
        setBannerPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [cmsPage.banner_image, form.data.banner_image, form.data.remove_banner_image]);

    const setSectionValue = (path: string[], value: string) => {
        const nextSections = structuredClone(form.data.sections);
        let target: SectionRecord = nextSections;

        path.slice(0, -1).forEach((segment) => {
            target[segment] = typeof target[segment] === 'object' && target[segment] !== null
                ? target[segment] as SectionRecord
                : {};
            target = target[segment] as SectionRecord;
        });

        target[path[path.length - 1]] = value;
        form.setData('sections', nextSections);
    };

    const setSectionArray = (path: string, value: unknown[]) => {
        form.setData('sections', {
            ...form.data.sections,
            [path]: value,
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post(`/admin/cms-pages/${cmsPage.id}`, {
            forceFormData: true,
        });
    };

    const sectionsDescription = cmsPage.page_key === 'home'
        ? 'Homepage content feeds the public website dynamically.'
        : `${cmsPage.title} content feeds the public website dynamically.`;

    const renderPageSections = () => {
        switch (cmsPage.page_key) {
            case 'home': {
                const sections = asHomeSections(form.data.sections);

                return (
                    <>
                        <SectionCard title="Hero" description="Landing-page messaging and the two main calls to action.">
                            <FormField label="Eyebrow" error={form.errors['sections.hero.eyebrow']}>
                                <Input value={sections.hero.eyebrow} onChange={(event) => setSectionValue(['hero', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.hero.title']}>
                                <Input value={sections.hero.title} onChange={(event) => setSectionValue(['hero', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.hero.body']}>
                                    <Textarea rows={4} value={sections.hero.body} onChange={(event) => setSectionValue(['hero', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                            <FormField label="Primary CTA label" error={form.errors['sections.hero.primaryCtaLabel']}>
                                <Input value={sections.hero.primaryCtaLabel} onChange={(event) => setSectionValue(['hero', 'primaryCtaLabel'], event.target.value)} />
                            </FormField>
                            <FormField label="Primary CTA link" error={form.errors['sections.hero.primaryCtaHref']}>
                                <Input value={sections.hero.primaryCtaHref} onChange={(event) => setSectionValue(['hero', 'primaryCtaHref'], event.target.value)} />
                            </FormField>
                            <FormField label="Secondary CTA label" error={form.errors['sections.hero.secondaryCtaLabel']}>
                                <Input value={sections.hero.secondaryCtaLabel} onChange={(event) => setSectionValue(['hero', 'secondaryCtaLabel'], event.target.value)} />
                            </FormField>
                            <FormField label="Secondary CTA link" error={form.errors['sections.hero.secondaryCtaHref']}>
                                <Input value={sections.hero.secondaryCtaHref} onChange={(event) => setSectionValue(['hero', 'secondaryCtaHref'], event.target.value)} />
                            </FormField>
                        </SectionCard>

                        <SectionCard title="Stats" description="Three quick proof points shown in the homepage side rail.">
                            {sections.stats.map((stat, index) => (
                                <div key={`home-stat-${index}`} className="grid gap-5 md:col-span-2 md:grid-cols-2">
                                    <FormField label={`Stat ${index + 1} value`} error={form.errors[`sections.stats.${index}.value`]}>
                                        <Input value={stat.value} onChange={(event) => setSectionArray('stats', updateListItem(sections.stats, index, 'value', event.target.value))} />
                                    </FormField>
                                    <FormField label={`Stat ${index + 1} label`} error={form.errors[`sections.stats.${index}.label`]}>
                                        <Input value={stat.label} onChange={(event) => setSectionArray('stats', updateListItem(sections.stats, index, 'label', event.target.value))} />
                                    </FormField>
                                </div>
                            ))}
                        </SectionCard>

                        <SectionCard title="Why Choose Us" description="Three reason cards under the homepage hero.">
                            {sections.reasons.map((reason, index) => (
                                <div key={`home-reason-${index}`} className="grid gap-5 md:col-span-2 md:grid-cols-2">
                                    <FormField label={`Card ${index + 1} title`} error={form.errors[`sections.reasons.${index}.title`]}>
                                        <Input value={reason.title} onChange={(event) => setSectionArray('reasons', updateListItem(sections.reasons, index, 'title', event.target.value))} />
                                    </FormField>
                                    <div className="md:col-span-2">
                                        <FormField label={`Card ${index + 1} body`} error={form.errors[`sections.reasons.${index}.body`]}>
                                            <Textarea rows={3} value={reason.body} onChange={(event) => setSectionArray('reasons', updateListItem(sections.reasons, index, 'body', event.target.value))} />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                        </SectionCard>

                        <SectionCard title="Featured Services Section">
                            <FormField label="Eyebrow" error={form.errors['sections.featuredServices.eyebrow']}>
                                <Input value={sections.featuredServices.eyebrow} onChange={(event) => setSectionValue(['featuredServices', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.featuredServices.title']}>
                                <Input value={sections.featuredServices.title} onChange={(event) => setSectionValue(['featuredServices', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.featuredServices.body']}>
                                    <Textarea rows={3} value={sections.featuredServices.body} onChange={(event) => setSectionValue(['featuredServices', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>

                        <SectionCard title="Testimonials Section">
                            <FormField label="Eyebrow" error={form.errors['sections.testimonials.eyebrow']}>
                                <Input value={sections.testimonials.eyebrow} onChange={(event) => setSectionValue(['testimonials', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.testimonials.title']}>
                                <Input value={sections.testimonials.title} onChange={(event) => setSectionValue(['testimonials', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.testimonials.body']}>
                                    <Textarea rows={3} value={sections.testimonials.body} onChange={(event) => setSectionValue(['testimonials', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>

                        <SectionCard title="Closing CTA">
                            <FormField label="Title" error={form.errors['sections.cta.title']}>
                                <Input value={sections.cta.title} onChange={(event) => setSectionValue(['cta', 'title'], event.target.value)} />
                            </FormField>
                            <FormField label="Button label" error={form.errors['sections.cta.primaryCtaLabel']}>
                                <Input value={sections.cta.primaryCtaLabel} onChange={(event) => setSectionValue(['cta', 'primaryCtaLabel'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.cta.body']}>
                                    <Textarea rows={3} value={sections.cta.body} onChange={(event) => setSectionValue(['cta', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                            <FormField label="Button link" error={form.errors['sections.cta.primaryCtaHref']}>
                                <Input value={sections.cta.primaryCtaHref} onChange={(event) => setSectionValue(['cta', 'primaryCtaHref'], event.target.value)} />
                            </FormField>
                        </SectionCard>
                    </>
                );
            }

            case 'about-us': {
                const sections = asAboutSections(form.data.sections);

                return (
                    <>
                        <SectionCard title="Hero">
                            <FormField label="Eyebrow" error={form.errors['sections.hero.eyebrow']}>
                                <Input value={sections.hero.eyebrow} onChange={(event) => setSectionValue(['hero', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.hero.title']}>
                                <Input value={sections.hero.title} onChange={(event) => setSectionValue(['hero', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.hero.body']}>
                                    <Textarea rows={4} value={sections.hero.body} onChange={(event) => setSectionValue(['hero', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>

                        <SectionCard title="Story Section">
                            <FormField label="Title" error={form.errors['sections.story.title']}>
                                <Input value={sections.story.title} onChange={(event) => setSectionValue(['story', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Primary copy" error={form.errors['sections.story.body']}>
                                    <Textarea rows={4} value={sections.story.body} onChange={(event) => setSectionValue(['story', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                            <div className="md:col-span-2">
                                <FormField label="Secondary copy" error={form.errors['sections.story.secondaryBody']}>
                                    <Textarea rows={4} value={sections.story.secondaryBody} onChange={(event) => setSectionValue(['story', 'secondaryBody'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>

                        <SectionCard title="Value Cards">
                            {sections.values.map((value, index) => (
                                <div key={`about-value-${index}`} className="grid gap-5 md:col-span-2 md:grid-cols-2">
                                    <FormField label={`Value ${index + 1} title`} error={form.errors[`sections.values.${index}.title`]}>
                                        <Input value={value.title} onChange={(event) => setSectionArray('values', updateListItem(sections.values, index, 'title', event.target.value))} />
                                    </FormField>
                                    <div className="md:col-span-2">
                                        <FormField label={`Value ${index + 1} body`} error={form.errors[`sections.values.${index}.body`]}>
                                            <Textarea rows={3} value={value.body} onChange={(event) => setSectionArray('values', updateListItem(sections.values, index, 'body', event.target.value))} />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                        </SectionCard>

                        <SectionCard title="Milestones">
                            {sections.milestones.map((milestone, index) => (
                                <div key={`about-milestone-${index}`} className="grid gap-5 md:col-span-2 md:grid-cols-2">
                                    <FormField label={`Milestone ${index + 1} value`} error={form.errors[`sections.milestones.${index}.value`]}>
                                        <Input value={milestone.value} onChange={(event) => setSectionArray('milestones', updateListItem(sections.milestones, index, 'value', event.target.value))} />
                                    </FormField>
                                    <FormField label={`Milestone ${index + 1} label`} error={form.errors[`sections.milestones.${index}.label`]}>
                                        <Input value={milestone.label} onChange={(event) => setSectionArray('milestones', updateListItem(sections.milestones, index, 'label', event.target.value))} />
                                    </FormField>
                                </div>
                            ))}
                        </SectionCard>

                        <SectionCard title="Team Section">
                            <FormField label="Eyebrow" error={form.errors['sections.team.eyebrow']}>
                                <Input value={sections.team.eyebrow} onChange={(event) => setSectionValue(['team', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.team.title']}>
                                <Input value={sections.team.title} onChange={(event) => setSectionValue(['team', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.team.body']}>
                                    <Textarea rows={3} value={sections.team.body} onChange={(event) => setSectionValue(['team', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>

                        <SectionCard title="Testimonials Framing">
                            <FormField label="Eyebrow" error={form.errors['sections.testimonials.eyebrow']}>
                                <Input value={sections.testimonials.eyebrow} onChange={(event) => setSectionValue(['testimonials', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.testimonials.title']}>
                                <Input value={sections.testimonials.title} onChange={(event) => setSectionValue(['testimonials', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.testimonials.body']}>
                                    <Textarea rows={3} value={sections.testimonials.body} onChange={(event) => setSectionValue(['testimonials', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>

                        <SectionCard title="Closing CTA">
                            <FormField label="Title" error={form.errors['sections.cta.title']}>
                                <Input value={sections.cta.title} onChange={(event) => setSectionValue(['cta', 'title'], event.target.value)} />
                            </FormField>
                            <FormField label="Button label" error={form.errors['sections.cta.primaryCtaLabel']}>
                                <Input value={sections.cta.primaryCtaLabel} onChange={(event) => setSectionValue(['cta', 'primaryCtaLabel'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.cta.body']}>
                                    <Textarea rows={3} value={sections.cta.body} onChange={(event) => setSectionValue(['cta', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                            <FormField label="Button link" error={form.errors['sections.cta.primaryCtaHref']}>
                                <Input value={sections.cta.primaryCtaHref} onChange={(event) => setSectionValue(['cta', 'primaryCtaHref'], event.target.value)} />
                            </FormField>
                        </SectionCard>
                    </>
                );
            }

            case 'services': {
                const sections = asServicesSections(form.data.sections);

                return (
                    <>
                        <SectionCard title="Hero">
                            <FormField label="Eyebrow" error={form.errors['sections.hero.eyebrow']}>
                                <Input value={sections.hero.eyebrow} onChange={(event) => setSectionValue(['hero', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.hero.title']}>
                                <Input value={sections.hero.title} onChange={(event) => setSectionValue(['hero', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.hero.body']}>
                                    <Textarea rows={4} value={sections.hero.body} onChange={(event) => setSectionValue(['hero', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>
                        <SectionCard title="Intro">
                            <FormField label="Title" error={form.errors['sections.intro.title']}>
                                <Input value={sections.intro.title} onChange={(event) => setSectionValue(['intro', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.intro.body']}>
                                    <Textarea rows={4} value={sections.intro.body} onChange={(event) => setSectionValue(['intro', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>
                        <SectionCard title="Category Section">
                            <FormField label="Eyebrow" error={form.errors['sections.categories.eyebrow']}>
                                <Input value={sections.categories.eyebrow} onChange={(event) => setSectionValue(['categories', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.categories.title']}>
                                <Input value={sections.categories.title} onChange={(event) => setSectionValue(['categories', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.categories.body']}>
                                    <Textarea rows={3} value={sections.categories.body} onChange={(event) => setSectionValue(['categories', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>
                        <SectionCard title="Listing Section">
                            <FormField label="Eyebrow" error={form.errors['sections.listing.eyebrow']}>
                                <Input value={sections.listing.eyebrow} onChange={(event) => setSectionValue(['listing', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.listing.title']}>
                                <Input value={sections.listing.title} onChange={(event) => setSectionValue(['listing', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.listing.body']}>
                                    <Textarea rows={3} value={sections.listing.body} onChange={(event) => setSectionValue(['listing', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>
                        <SectionCard title="Closing CTA">
                            <FormField label="Title" error={form.errors['sections.cta.title']}>
                                <Input value={sections.cta.title} onChange={(event) => setSectionValue(['cta', 'title'], event.target.value)} />
                            </FormField>
                            <FormField label="Button label" error={form.errors['sections.cta.primaryCtaLabel']}>
                                <Input value={sections.cta.primaryCtaLabel} onChange={(event) => setSectionValue(['cta', 'primaryCtaLabel'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.cta.body']}>
                                    <Textarea rows={3} value={sections.cta.body} onChange={(event) => setSectionValue(['cta', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                            <FormField label="Button link" error={form.errors['sections.cta.primaryCtaHref']}>
                                <Input value={sections.cta.primaryCtaHref} onChange={(event) => setSectionValue(['cta', 'primaryCtaHref'], event.target.value)} />
                            </FormField>
                        </SectionCard>
                    </>
                );
            }

            case 'gallery': {
                const sections = asGallerySections(form.data.sections);

                return (
                    <>
                        <SectionCard title="Hero">
                            <FormField label="Eyebrow" error={form.errors['sections.hero.eyebrow']}>
                                <Input value={sections.hero.eyebrow} onChange={(event) => setSectionValue(['hero', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.hero.title']}>
                                <Input value={sections.hero.title} onChange={(event) => setSectionValue(['hero', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.hero.body']}>
                                    <Textarea rows={4} value={sections.hero.body} onChange={(event) => setSectionValue(['hero', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>
                        <SectionCard title="Intro">
                            <FormField label="Title" error={form.errors['sections.intro.title']}>
                                <Input value={sections.intro.title} onChange={(event) => setSectionValue(['intro', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.intro.body']}>
                                    <Textarea rows={4} value={sections.intro.body} onChange={(event) => setSectionValue(['intro', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>
                        <SectionCard title="Albums Section">
                            <FormField label="Eyebrow" error={form.errors['sections.albums.eyebrow']}>
                                <Input value={sections.albums.eyebrow} onChange={(event) => setSectionValue(['albums', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.albums.title']}>
                                <Input value={sections.albums.title} onChange={(event) => setSectionValue(['albums', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.albums.body']}>
                                    <Textarea rows={3} value={sections.albums.body} onChange={(event) => setSectionValue(['albums', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>
                        <SectionCard title="Closing CTA">
                            <FormField label="Title" error={form.errors['sections.cta.title']}>
                                <Input value={sections.cta.title} onChange={(event) => setSectionValue(['cta', 'title'], event.target.value)} />
                            </FormField>
                            <FormField label="Button label" error={form.errors['sections.cta.primaryCtaLabel']}>
                                <Input value={sections.cta.primaryCtaLabel} onChange={(event) => setSectionValue(['cta', 'primaryCtaLabel'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.cta.body']}>
                                    <Textarea rows={3} value={sections.cta.body} onChange={(event) => setSectionValue(['cta', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                            <FormField label="Button link" error={form.errors['sections.cta.primaryCtaHref']}>
                                <Input value={sections.cta.primaryCtaHref} onChange={(event) => setSectionValue(['cta', 'primaryCtaHref'], event.target.value)} />
                            </FormField>
                        </SectionCard>
                    </>
                );
            }

            case 'contact-us': {
                const sections = asContactSections(form.data.sections);

                return (
                    <>
                        <SectionCard title="Hero">
                            <FormField label="Eyebrow" error={form.errors['sections.hero.eyebrow']}>
                                <Input value={sections.hero.eyebrow} onChange={(event) => setSectionValue(['hero', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.hero.title']}>
                                <Input value={sections.hero.title} onChange={(event) => setSectionValue(['hero', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.hero.body']}>
                                    <Textarea rows={4} value={sections.hero.body} onChange={(event) => setSectionValue(['hero', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>
                        <SectionCard title="Intro">
                            <FormField label="Title" error={form.errors['sections.intro.title']}>
                                <Input value={sections.intro.title} onChange={(event) => setSectionValue(['intro', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.intro.body']}>
                                    <Textarea rows={4} value={sections.intro.body} onChange={(event) => setSectionValue(['intro', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>
                        <SectionCard title="Inquiry Form">
                            <FormField label="Eyebrow" error={form.errors['sections.form.eyebrow']}>
                                <Input value={sections.form.eyebrow} onChange={(event) => setSectionValue(['form', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.form.title']}>
                                <Input value={sections.form.title} onChange={(event) => setSectionValue(['form', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.form.body']}>
                                    <Textarea rows={3} value={sections.form.body} onChange={(event) => setSectionValue(['form', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                            <FormField label="Success message" error={form.errors['sections.form.successMessage']}>
                                <Input value={sections.form.successMessage} onChange={(event) => setSectionValue(['form', 'successMessage'], event.target.value)} />
                            </FormField>
                            <FormField label="Submit button label" error={form.errors['sections.form.submitLabel']}>
                                <Input value={sections.form.submitLabel} onChange={(event) => setSectionValue(['form', 'submitLabel'], event.target.value)} />
                            </FormField>
                        </SectionCard>
                        <SectionCard title="Contact Details Section">
                            <FormField label="Eyebrow" error={form.errors['sections.contact.eyebrow']}>
                                <Input value={sections.contact.eyebrow} onChange={(event) => setSectionValue(['contact', 'eyebrow'], event.target.value)} />
                            </FormField>
                            <FormField label="Title" error={form.errors['sections.contact.title']}>
                                <Input value={sections.contact.title} onChange={(event) => setSectionValue(['contact', 'title'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.contact.body']}>
                                    <Textarea rows={3} value={sections.contact.body} onChange={(event) => setSectionValue(['contact', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                        </SectionCard>
                        <SectionCard title="Closing CTA">
                            <FormField label="Title" error={form.errors['sections.cta.title']}>
                                <Input value={sections.cta.title} onChange={(event) => setSectionValue(['cta', 'title'], event.target.value)} />
                            </FormField>
                            <FormField label="Button label" error={form.errors['sections.cta.primaryCtaLabel']}>
                                <Input value={sections.cta.primaryCtaLabel} onChange={(event) => setSectionValue(['cta', 'primaryCtaLabel'], event.target.value)} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Body" error={form.errors['sections.cta.body']}>
                                    <Textarea rows={3} value={sections.cta.body} onChange={(event) => setSectionValue(['cta', 'body'], event.target.value)} />
                                </FormField>
                            </div>
                            <FormField label="Button link" error={form.errors['sections.cta.primaryCtaHref']}>
                                <Input value={sections.cta.primaryCtaHref} onChange={(event) => setSectionValue(['cta', 'primaryCtaHref'], event.target.value)} />
                            </FormField>
                        </SectionCard>
                    </>
                );
            }

            default:
                return null;
        }
    };

    return (
        <form id="cms-page-form" className="space-y-6 pb-6" onSubmit={submit}>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
                <div className="space-y-6">
                    <AdminCard
                        title="Website Sections"
                        description={sectionsDescription}
                    />

                    {renderPageSections()}
                </div>

                <div className="space-y-6">
                    <AdminCard
                        title="Page Settings"
                        description="Manage publishing state, summary copy, and supporting page metadata."
                        className="relative z-30"
                    >
                        <div className="grid gap-5">
                            <FormField label="Public route">
                                <Input value={cmsPage.public_path ?? ''} readOnly disabled />
                            </FormField>
                            <FormField label="Status" error={form.errors.status}>
                                <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                </Select>
                            </FormField>
                            <FormField label="Short description" error={form.errors.short_description}>
                                <Textarea
                                    rows={4}
                                    value={form.data.short_description}
                                    onChange={(event) => form.setData('short_description', event.target.value)}
                                />
                            </FormField>
                            <FormField label="Editor guidance">
                                <Textarea value={cmsPage.admin_description ?? ''} readOnly rows={3} disabled />
                            </FormField>
                        </div>
                    </AdminCard>

                    <AdminCard
                        title="Banner Upload"
                        description="Use clean manufacturing, warehouse, product, or certification imagery."
                        className="relative z-20"
                    >
                        <div className="space-y-4">
                            <div className="rounded-[var(--app-surface-radius)] border border-dashed border-zinc-950/10 bg-zinc-50/90 p-4 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/40 dark:ring-white/5">
                                <div className="flex min-h-48 items-center justify-center rounded-[var(--app-surface-radius)] bg-white px-4 ring-1 ring-zinc-950/5 dark:bg-zinc-950/70 dark:ring-white/5">
                                    {bannerPreview ? (
                                        <img
                                            src={bannerPreview}
                                            alt={`${cmsPage.title} banner preview`}
                                            loading="lazy"
                                            decoding="async"
                                            className="max-h-56 w-auto max-w-full rounded-[var(--app-surface-radius)] object-contain"
                                        />
                                    ) : (
                                        <Text className="text-center !text-zinc-500">
                                            No banner selected for this page.
                                        </Text>
                                    )}
                                </div>
                            </div>

                            <FormField label="Replace banner" error={form.errors.banner_image} hint="JPG, PNG or WEBP up to 2MB.">
                                <Input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(event) => {
                                        form.setData('remove_banner_image', false);
                                        form.setData('banner_image', event.target.files?.[0] ?? null);
                                    }}
                                />
                            </FormField>

                            <Button
                                type="button"
                                outline
                                aria-pressed={form.data.remove_banner_image}
                                className={`w-full justify-center sm:w-auto ${
                                    form.data.remove_banner_image
                                        ? '!border-red-300 !bg-red-50 !text-red-700 dark:!border-red-500/40 dark:!bg-red-500/10 dark:!text-red-200'
                                        : ''
                                }`}
                                onClick={() => {
                                    const shouldRemove = !form.data.remove_banner_image;
                                    form.setData('remove_banner_image', shouldRemove);

                                    if (shouldRemove) {
                                        form.setData('banner_image', null);
                                    }
                                }}
                            >
                                <TrashIcon data-slot="icon" />
                                {form.data.remove_banner_image ? 'Keep banner' : 'Remove banner'}
                            </Button>
                        </div>
                    </AdminCard>

                    <AdminCard
                        title="SEO Settings"
                        description="Update metadata used by search engines and social previews."
                        className="relative z-10"
                    >
                        <AdminSeoFields data={form.data} errors={form.errors as Record<string, string>} setData={form.setData} />
                    </AdminCard>
                </div>
            </div>
        </form>
    );
}
