import type { PhoneCountryIso2 } from './phone';

export interface AdminUser {
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
    status?: string;
    last_login_at?: string | null;
    role?: {
        id: number;
        name: string;
        slug: string;
    } | null;
    permissions: string[];
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user?: AuthUser | null;
        admin: AdminUser | null;
    };
    branding: {
        logo?: string | null;
        logoLight?: string | null;
        logoDark?: string | null;
    };
    theme: {
        mode: 'light' | 'dark';
        scope: 'public' | 'admin';
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
};
