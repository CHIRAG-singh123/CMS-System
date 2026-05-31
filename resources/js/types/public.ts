import type { GalleryImage, Inquiry, ProductService, SiteSetting } from './admin';

export type PublicSiteSetting = Pick<
    SiteSetting,
    | 'id'
    | 'maintenance_mode'
    | 'maintenance_message'
    | 'company_name'
    | 'company_address'
    | 'header_tagline'
    | 'header_cta_label'
    | 'header_cta_url'
    | 'footer_heading'
    | 'footer_description'
    | 'footer_cta_label'
    | 'footer_cta_url'
    | 'footer_copyright'
    | 'export_email'
    | 'phone'
    | 'phone_country'
    | 'whatsapp_number'
    | 'whatsapp_number_country'
    | 'whatsapp_chat_enabled'
    | 'map_title'
    | 'map_address'
    | 'map_embed'
    | 'linkedin_url'
    | 'facebook_url'
    | 'instagram_url'
>;

export interface PublicCategory {
    id: number;
    uid?: string;
    name: string;
    slug: string;
    description?: string | null;
    product_services?: PublicServiceCard[];
}

export interface PublicMember {
    id: number;
    uid?: string;
    name: string;
    designation?: string | null;
    image?: string | null;
    short_bio?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    instagram?: string | null;
}

export interface PublicTestimonial {
    id: number;
    uid?: string;
    client_name: string;
    company_name?: string | null;
    image?: string | null;
    message: string;
}

export interface PublicGallery {
    id: number;
    uid?: string;
    title: string;
    slug: string;
    description?: string | null;
    cover_image?: string | null;
    status: string;
    images_count?: number;
    images?: GalleryImage[];
}

export interface GalleryStats {
    albums: number;
    images: number;
}

export type PublicServiceCard = Pick<ProductService, 'id' | 'title' | 'slug' | 'type' | 'short_description' | 'featured_image'>;

export interface PublicCmsPage {
    id: number;
    title: string;
    slug: string;
    page_key: string;
    public_path: string;
    short_description?: string | null;
    banner_image?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    status: string;
    sort_order: number;
    updated_at?: string | null;
    admin_description?: string;
    sections: Record<string, unknown>;
}

export interface PublicNavItem {
    label: string;
    href: string;
}

export interface PublicPageSharedProps {
    page: PublicCmsPage;
    settings: PublicSiteSetting;
}

export interface PublicMaintenancePageProps {
    settings: PublicSiteSetting;
    maintenance: {
        message: string;
    };
}

export interface HomeSections {
    hero: {
        eyebrow: string;
        title: string;
        body: string;
        primaryCtaLabel: string;
        primaryCtaHref: string;
        secondaryCtaLabel: string;
        secondaryCtaHref: string;
    };
    stats: Array<{ value: string; label: string }>;
    reasons: Array<{ title: string; body: string }>;
    featuredServices: { eyebrow: string; title: string; body: string };
    testimonials: { eyebrow: string; title: string; body: string };
    cta: {
        title: string;
        body: string;
        primaryCtaLabel: string;
        primaryCtaHref: string;
    };
}

export interface AboutSections {
    hero: { eyebrow: string; title: string; body: string };
    story: { title: string; body: string; secondaryBody: string };
    values: Array<{ title: string; body: string }>;
    milestones: Array<{ value: string; label: string }>;
    team: { eyebrow: string; title: string; body: string };
    testimonials: { eyebrow: string; title: string; body: string };
    cta: {
        title: string;
        body: string;
        primaryCtaLabel: string;
        primaryCtaHref: string;
    };
}

export interface ServicesSections {
    hero: { eyebrow: string; title: string; body: string };
    intro: { title: string; body: string };
    categories: { eyebrow: string; title: string; body: string };
    listing: { eyebrow: string; title: string; body: string };
    cta: {
        title: string;
        body: string;
        primaryCtaLabel: string;
        primaryCtaHref: string;
    };
}

export interface GallerySections {
    hero: { eyebrow: string; title: string; body: string };
    intro: { title: string; body: string };
    albums: { eyebrow: string; title: string; body: string };
    cta: {
        title: string;
        body: string;
        primaryCtaLabel: string;
        primaryCtaHref: string;
    };
}

export interface ContactSections {
    hero: { eyebrow: string; title: string; body: string };
    intro: { title: string; body: string };
    form: {
        eyebrow: string;
        title: string;
        body: string;
        successMessage: string;
        submitLabel: string;
    };
    contact: { eyebrow: string; title: string; body: string };
    cta: {
        title: string;
        body: string;
        primaryCtaLabel: string;
        primaryCtaHref: string;
    };
}

export interface HomePageProps extends PublicPageSharedProps {
    featuredServices?: PublicServiceCard[];
    testimonials?: PublicTestimonial[];
    members?: Array<Pick<PublicMember, 'id' | 'uid' | 'name' | 'designation' | 'image' | 'short_bio'>>;
}

export interface AboutPageProps extends PublicPageSharedProps {
    members?: Array<Pick<PublicMember, 'id' | 'uid' | 'name' | 'designation' | 'image' | 'short_bio'>>;
    testimonials?: PublicTestimonial[];
}

export interface ServicesPageProps extends PublicPageSharedProps {
    catalogCount: number;
    categories?: PublicCategory[];
    uncategorizedServices?: PublicServiceCard[];
}

export interface GalleryPageProps extends PublicPageSharedProps {
    galleryStats: GalleryStats;
    featuredGallery?: PublicGallery | null;
    galleries?: PublicGallery[];
}

export interface ContactPageProps extends PublicPageSharedProps {
    productServices: Pick<ProductService, 'id' | 'title' | 'type'>[];
    inquiryTypes: Inquiry['inquiry_type'][];
}
