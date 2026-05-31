import type { SyntheticEvent } from 'react';
import type { ThemeMode } from '@/lib/theme';
import type { PageProps } from '@/types';
import type { Paginated, PaginationLink } from '@/types/admin';

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const dateOnlyFormatter = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
});

export const DEFAULT_PERSON_IMAGE = '/images/default-person.svg';
export const DEFAULT_PRODUCT_IMAGE = '/images/default-product.svg';

export function storageUrl(path?: string | null): string | null {
    if (!path) {
        return null;
    }

    if (/^(?:https?:)?\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) {
        return path;
    }

    if (path.startsWith('/images/') || path.startsWith('images/')) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    const normalizedPath = path
        .replace(/^\/+/, '')
        .replace(/^storage\//, '')
        .replace(/^media\//, '');

    if (normalizedPath.startsWith('seed/')) {
        return null;
    }

    return `/storage/${normalizedPath
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/')}`;
}

export function resolvePersonImage(path?: string | null): string {
    return storageUrl(path) ?? DEFAULT_PERSON_IMAGE;
}

export function resolveProductImage(path?: string | null): string {
    return storageUrl(path) ?? DEFAULT_PRODUCT_IMAGE;
}

export function handleImageFallback(event: SyntheticEvent<HTMLImageElement>, fallbackSrc: string): void {
    const image = event.currentTarget;

    if (image.dataset.fallbackApplied === 'true' || image.currentSrc.endsWith(fallbackSrc)) {
        return;
    }

    image.dataset.fallbackApplied = 'true';
    image.src = fallbackSrc;
}

export function formatDate(value?: string | null): string {
    if (!value) {
        return '--';
    }

    return dateTimeFormatter.format(new Date(value));
}

export function formatDateOnly(value?: string | null): string {
    if (!value) {
        return '--';
    }

    return dateOnlyFormatter.format(new Date(value));
}

export function humanize(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function paginationSegments(links: PaginationLink[]): {
    previous: string | null;
    next: string | null;
    pages: PaginationLink[];
} {
    return {
        previous: links[0]?.url ?? null,
        next: links[links.length - 1]?.url ?? null,
        pages: links.filter((link) => /^\d+$/.test(link.label)),
    };
}

export function resolveAdminIndexPageAfterDelete<T>(paginator?: Paginated<T>): string | null {
    if (!paginator || paginator.current_page <= 1 || paginator.data.length !== 1) {
        return null;
    }

    const url = new URL(window.location.href);

    if (paginator.current_page <= 2) {
        url.searchParams.delete('page');
    } else {
        url.searchParams.set('page', String(paginator.current_page - 1));
    }

    return `${url.pathname}${url.search}`;
}

export function adminIndexVisitOptions(only: string[]) {
    return {
        only,
        async: true,
        showProgress: true,
        preserveScroll: true,
        preserveState: true,
        replace: true,
        prefetch: false,
    } as const;
}

export function adminAutoSearchVisitOptions(only: string[]) {
    return {
        only,
        async: true,
        showProgress: false,
        preserveScroll: true,
        preserveState: false,
        replace: true,
        prefetch: false,
    } as const;
}

export function hasPermission(permissions: string[] | undefined, permission: string): boolean {
    return permissions?.includes('*') || permissions?.includes(permission) || false;
}

export function dispatchAdminToast(tone: 'success' | 'error', message: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent('admin-toast', {
        detail: { tone, message },
    }));
}

export function resolveBrandingLogo(branding: PageProps['branding'], mode: ThemeMode): string | null {
    const path = mode === 'dark'
        ? branding.logoDark ?? branding.logoLight ?? branding.logo
        : branding.logoLight ?? branding.logoDark ?? branding.logo;

    return storageUrl(path);
}
