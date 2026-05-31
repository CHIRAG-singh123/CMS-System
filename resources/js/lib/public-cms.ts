import type { AboutSections, ContactSections, GallerySections, HomeSections, ServicesSections } from '@/types/public';

const ensureObject = <T extends Record<string, unknown>>(value: unknown, fallback: T): T => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return fallback;
    }

    return value as T;
};

export function asHomeSections(value: unknown): HomeSections {
    return ensureObject<HomeSections>(value, {
        hero: {
            eyebrow: '',
            title: '',
            body: '',
            primaryCtaLabel: '',
            primaryCtaHref: '/services',
            secondaryCtaLabel: '',
            secondaryCtaHref: '/contact-us',
        },
        stats: [],
        reasons: [],
        featuredServices: { eyebrow: '', title: '', body: '' },
        testimonials: { eyebrow: '', title: '', body: '' },
        cta: { title: '', body: '', primaryCtaLabel: '', primaryCtaHref: '/contact-us' },
    });
}

export function asAboutSections(value: unknown): AboutSections {
    return ensureObject<AboutSections>(value, {
        hero: { eyebrow: '', title: '', body: '' },
        story: { title: '', body: '', secondaryBody: '' },
        values: [],
        milestones: [],
        team: { eyebrow: '', title: '', body: '' },
        testimonials: { eyebrow: '', title: '', body: '' },
        cta: { title: '', body: '', primaryCtaLabel: '', primaryCtaHref: '/contact-us' },
    });
}

export function asServicesSections(value: unknown): ServicesSections {
    return ensureObject<ServicesSections>(value, {
        hero: { eyebrow: '', title: '', body: '' },
        intro: { title: '', body: '' },
        categories: { eyebrow: '', title: '', body: '' },
        listing: { eyebrow: '', title: '', body: '' },
        cta: { title: '', body: '', primaryCtaLabel: '', primaryCtaHref: '/contact-us' },
    });
}

export function asGallerySections(value: unknown): GallerySections {
    return ensureObject<GallerySections>(value, {
        hero: { eyebrow: '', title: '', body: '' },
        intro: { title: '', body: '' },
        albums: { eyebrow: '', title: '', body: '' },
        cta: { title: '', body: '', primaryCtaLabel: '', primaryCtaHref: '/contact-us' },
    });
}

export function asContactSections(value: unknown): ContactSections {
    return ensureObject<ContactSections>(value, {
        hero: { eyebrow: '', title: '', body: '' },
        intro: { title: '', body: '' },
        form: { eyebrow: '', title: '', body: '', successMessage: '', submitLabel: 'Send inquiry' },
        contact: { eyebrow: '', title: '', body: '' },
        cta: { title: '', body: '', primaryCtaLabel: '', primaryCtaHref: 'tel:' },
    });
}
