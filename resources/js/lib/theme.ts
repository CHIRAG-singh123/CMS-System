import { useSyncExternalStore } from 'react';

export const THEME_MAX_AGE = 60 * 60 * 24 * 365 * 5;
export const THEME_MODES = ['light', 'dark'] as const;
export const THEME_SCOPES = ['public', 'admin'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];
export type ThemeScope = (typeof THEME_SCOPES)[number];

let currentThemeMode: ThemeMode = 'dark';
const listeners = new Set<() => void>();
const THEME_COOKIE_NAMES: Record<ThemeScope, string> = {
    public: 'public_theme',
    admin: 'admin_theme',
};

export function normalizeThemeMode(value?: string | null): ThemeMode {
    return value === 'light' ? 'light' : 'dark';
}

export function normalizeThemeScope(value?: string | null): ThemeScope {
    return value === 'admin' ? 'admin' : 'public';
}

export function setThemeMode(value?: string | null): ThemeMode {
    const nextThemeMode = normalizeThemeMode(value);

    if (nextThemeMode === currentThemeMode) {
        return currentThemeMode;
    }

    currentThemeMode = nextThemeMode;

    if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = currentThemeMode;
        document.documentElement.classList.toggle('dark', currentThemeMode === 'dark');
    }

    listeners.forEach((listener) => listener());

    return currentThemeMode;
}

export function persistThemeMode(mode: ThemeMode, scope: ThemeScope = 'public'): void {
    if (typeof document === 'undefined') {
        return;
    }

    document.cookie = `${THEME_COOKIE_NAMES[normalizeThemeScope(scope)]}=${mode}; path=/; max-age=${THEME_MAX_AGE}; samesite=lax`;
}

export function readPersistedThemeMode(scope: ThemeScope = 'public'): ThemeMode | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const cookieName = THEME_COOKIE_NAMES[normalizeThemeScope(scope)];
    const cookie = document.cookie
        .split('; ')
        .find((item) => item.startsWith(`${cookieName}=`));

    if (!cookie) {
        return null;
    }

    const value = decodeURIComponent(cookie.slice(cookieName.length + 1));

    return THEME_MODES.includes(value as ThemeMode) ? value as ThemeMode : null;
}

export function useThemeMode(): ThemeMode {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener);

            return () => listeners.delete(listener);
        },
        () => currentThemeMode,
        () => currentThemeMode,
    );
}
