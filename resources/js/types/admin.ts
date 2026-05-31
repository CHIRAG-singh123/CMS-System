import type { PhoneCountryIso2 } from './phone';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

export interface CmsPage {
    id: number;
    title: string;
    slug: string;
    page_key?: string | null;
    banner_image?: string | null;
    short_description?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    status: string;
    sort_order: number;
    updated_at?: string;
    public_path?: string;
    admin_description?: string;
    sections?: Record<string, unknown>;
}

export interface Category {
    id: number;
    uid?: string | null;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    status: string;
    product_services_count?: number;
}

export interface ProductService {
    id: number;
    uid?: string | null;
    category_id?: number | null;
    category?: Pick<Category, 'id' | 'name'> | null;
    type: string;
    title: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    featured_image?: string | null;
    gallery_images?: string[];
    features_json?: string[];
    benefits_json?: string[];
    specifications_json?: string[];
    status: string;
    is_featured: boolean;
    meta_title?: string | null;
    meta_description?: string | null;
    created_at?: string;
}

export interface Inquiry {
    id: number;
    inquiry_type: string;
    product_service_id?: number | null;
    product_service?: Pick<ProductService, 'id' | 'title' | 'type'> | null;
    name: string;
    email: string;
    phone?: string | null;
    phone_country?: PhoneCountryIso2 | null;
    subject?: string | null;
    message: string;
    status: string;
    admin_note?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
}

export interface Member {
    id: number;
    uid?: string | null;
    name: string;
    designation?: string | null;
    image?: string | null;
    short_bio?: string | null;
    email?: string | null;
    phone?: string | null;
    phone_country?: PhoneCountryIso2 | null;
    linkedin?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    role_id?: number | null;
    role?: Pick<Role, 'id' | 'name' | 'slug'> | null;
    status: string;
}

export interface Permission {
    id: number;
    name: string;
    label?: string;
}

export interface Role {
    id: number;
    name: string;
    slug: string;
    permission_ids?: number[];
    description?: string | null;
    status: string;
    admins_count?: number;
    permissions_count?: number;
    permissions?: Array<Pick<Permission, 'id'>>;
}

export interface AdminAccount {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    phone_country?: PhoneCountryIso2 | null;
    job_title?: string | null;
    timezone?: string | null;
    bio?: string | null;
    theme_preference?: 'light' | 'dark';
    status: string;
    last_login_at?: string | null;
    role?: Pick<Role, 'id' | 'name' | 'slug'> | null;
    permissions?: Permission[];
    permission_ids?: number[];
    permissions_count?: number;
    is_current?: boolean;
}

export interface Testimonial {
    id: number;
    uid?: string | null;
    client_name: string;
    client_designation?: string | null;
    company_name?: string | null;
    image?: string | null;
    rating: number;
    message: string;
    status: string;
}

export interface GalleryImage {
    id: number;
    gallery_id: number;
    image: string;
    title?: string | null;
    alt_text?: string | null;
    caption?: string | null;
    status: string;
    sort_order: number;
}

export interface Gallery {
    id: number;
    uid?: string | null;
    title: string;
    slug: string;
    description?: string | null;
    cover_image?: string | null;
    status: string;
    images_count?: number;
    images?: GalleryImage[];
}

export interface SiteSetting {
    id: number;
    company_name?: string | null;
    legal_name?: string | null;
    company_address?: string | null;
    header_tagline?: string | null;
    header_cta_label?: string | null;
    header_cta_url?: string | null;
    footer_heading?: string | null;
    footer_description?: string | null;
    footer_cta_label?: string | null;
    footer_cta_url?: string | null;
    footer_copyright?: string | null;
    maintenance_mode: boolean;
    maintenance_message?: string | null;
    google_login_enabled: boolean;
    logo_light?: string | null;
    logo_dark?: string | null;
    brochure_file?: string | null;
    export_email?: string | null;
    phone?: string | null;
    phone_country?: PhoneCountryIso2 | null;
    whatsapp_number?: string | null;
    whatsapp_number_country?: PhoneCountryIso2 | null;
    whatsapp_chat_enabled: boolean;
    whatsapp_prefill_message?: string | null;
    map_title?: string | null;
    map_address?: string | null;
    map_embed?: string | null;
    linkedin_url?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    updated_at?: string | null;
}

export interface AdminSessionContext {
    browser: string;
    platform: string;
    ip_address?: string | null;
    user_agent?: string | null;
    last_active_at?: string | null;
    last_login_at?: string | null;
}
