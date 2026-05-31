import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeNavigationState } from '@/lib/navigation-state';
import { normalizeThemeMode, normalizeThemeScope, persistThemeMode, readPersistedThemeMode, setThemeMode } from '@/lib/theme';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const eagerPublicPages = import.meta.glob('./Pages/public/*.tsx', { eager: true });
const lazyPages = import.meta.glob('./Pages/**/*.tsx');
const pages = {
    ...lazyPages,
    ...eagerPublicPages,
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            pages,
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const initialThemeScope = normalizeThemeScope(props.initialPage.props.theme?.scope);
        const initialThemeMode = readPersistedThemeMode(initialThemeScope)
            ?? normalizeThemeMode(props.initialPage.props.theme?.mode);

        setThemeMode(initialThemeMode);
        persistThemeMode(initialThemeMode, initialThemeScope);
        initializeNavigationState(router);

        router.on('success', (event) => {
            const serverThemeMode = event.detail.page.props.theme?.mode;
            const themeScope = normalizeThemeScope(event.detail.page.props.theme?.scope);
            const persistedThemeMode = readPersistedThemeMode(themeScope);
            const nextThemeMode = persistedThemeMode ?? (serverThemeMode ? normalizeThemeMode(serverThemeMode) : null);

            if (!nextThemeMode) {
                return;
            }

            const themeMode = setThemeMode(nextThemeMode);
            persistThemeMode(themeMode, themeScope);
        });

        root.render(<App {...props} />);
    },
    progress: {
        delay: 120,
        color: '#71717a',
        includeCSS: true,
        showSpinner: false,
    },
});
