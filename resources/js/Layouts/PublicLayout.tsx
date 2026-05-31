import { Head, Link, usePage } from '@inertiajs/react';
import { Bars3Icon, MoonIcon, SunIcon, XMarkIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useEffect, useRef, useState, type ComponentType, type PropsWithChildren, type SVGProps } from 'react';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { persistThemeMode, setThemeMode, useThemeMode } from '@/lib/theme';
import type { PageProps } from '@/types';
import { resolveInternationalPhone, resolvePhoneDisplay, sanitizePhoneDigits } from '@/types/phone';
import type { PublicSiteSetting } from '@/types/public';
import { resolveBrandingLogo } from '@/utils/admin';

interface PublicLayoutProps extends PropsWithChildren {
    title: string;
    description?: string | null;
}

interface ActionLinkProps extends PropsWithChildren {
    href: string;
    className: string;
    title?: string;
    onClick?: () => void;
}

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Services', href: '/services' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact Us', href: '/contact-us' },
];

const footerNavItems = navItems.filter((item) => item.href !== '/');

const fallbackFooterDescription = 'A premium editorial web presence powered by admin-managed CMS content, structured services, galleries, and inquiry workflows.';

function csrfToken(): string | null {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null;
}

function isInternalHref(href: string): boolean {
    return href.startsWith('/') && !href.startsWith('//');
}

function resolvePhoneLink(value?: string | null, countryIso2?: string | null): { href: string; text: string } | null {
    const text = resolvePhoneDisplay(value, countryIso2);

    if (!text) {
        return null;
    }

    const internationalValue = resolveInternationalPhone(value, countryIso2);
    const fallbackDigits = sanitizePhoneDigits(value ?? '');
    const hrefValue = internationalValue ?? (fallbackDigits || text);

    return {
        href: `tel:${hrefValue}`,
        text,
    };
}

function ActionLink({ href, className, title, children, onClick }: ActionLinkProps) {
    if (isInternalHref(href)) {
        return (
            <Link
                href={href}
                className={className}
                title={title}
                onClick={onClick}
            >
                {children}
            </Link>
        );
    }

    return (
        <a
            href={href}
            className={className}
            title={title}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noreferrer' : undefined}
            onClick={onClick}
        >
            {children}
        </a>
    );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.75h3.96V21H3V9.75Zm6.25 0h3.79v1.54h.05c.53-.94 1.82-1.93 3.75-1.93 4.01 0 4.76 2.64 4.76 6.08V21h-3.95v-4.93c0-1.18-.02-2.69-1.64-2.69-1.64 0-1.89 1.28-1.89 2.6V21H9.25V9.75Z" />
        </svg>
    );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.23.2 2.23.2v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.89h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
        </svg>
    );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm8.75 1.55a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
        </svg>
    );
}

function BrandMark({ logo, companyName }: { logo?: string | null; companyName: string }) {
    if (logo) {
        return (
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.35rem] border border-[color:var(--public-border)] bg-[color:var(--public-surface)] shadow-[var(--public-shadow)]">
                <img
                    src={logo}
                    alt={companyName}
                    loading="eager"
                    decoding="async"
                    className="max-h-10 w-auto max-w-[2.5rem] object-contain"
                />
            </div>
        );
    }

    return (
        <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-[color:var(--public-border)] bg-[color:var(--public-accent-soft)] text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--public-text)] shadow-[var(--public-shadow)]">
            {companyName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join('')
                .toUpperCase() || 'DP'}
        </div>
    );
}

function FooterSocialLink({ href, label, icon: Icon }: { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }) {
    return (
        <a
            className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-surface)] text-[color:var(--public-text-soft)] shadow-[var(--public-shadow)] transition duration-300 hover:-translate-y-1 hover:bg-[color:var(--public-accent)] hover:text-zinc-950"
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
        >
            <Icon className="h-5 w-5 transition group-hover:scale-110" />
        </a>
    );
}

export default function PublicLayout({ title, description, children }: PublicLayoutProps) {
    const page = usePage<PageProps & { settings?: PublicSiteSetting }>();
    const currentPath = page.url;
    const themeMode = useThemeMode();
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isCompact, setIsCompact] = useState(false);
    const brandingLogo = resolveBrandingLogo(page.props.branding, themeMode);
    const settings = page.props.settings;
    const companyName = settings?.company_name || 'Default Panel';
    const headerTagline = settings?.header_tagline || 'Admin-managed digital presence';
    const headerCtaLabel = settings?.header_cta_label || 'Contact us';
    const headerCtaUrl = settings?.header_cta_url || '/contact-us';
    const footerHeading = settings?.footer_heading || companyName;
    const footerDescription = settings?.footer_description || fallbackFooterDescription;
    const footerCtaLabel = settings?.footer_cta_label || 'Start a conversation';
    const footerCtaUrl = settings?.footer_cta_url || '/contact-us';
    const footerCopyright = settings?.footer_copyright || `Copyright ${new Date().getFullYear()} ${companyName}. All rights reserved.`;
    const contactPhone = resolvePhoneLink(settings?.phone, settings?.phone_country);
    const socialLinks = [
        settings?.linkedin_url ? { href: settings.linkedin_url, label: 'LinkedIn', icon: LinkedInIcon } : null,
        settings?.facebook_url ? { href: settings.facebook_url, label: 'Facebook', icon: FacebookIcon } : null,
        settings?.instagram_url ? { href: settings.instagram_url, label: 'Instagram', icon: InstagramIcon } : null,
    ].filter(Boolean) as Array<{ href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }>;

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer) {
            return;
        }

        const syncCompactState = () => {
            setIsCompact(scrollContainer.scrollTop > 22);
        };

        syncCompactState();
        scrollContainer.addEventListener('scroll', syncCompactState);

        return () => scrollContainer.removeEventListener('scroll', syncCompactState);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [currentPath]);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer) {
            return;
        }

        const previousOverflow = scrollContainer.style.overflowY;

        if (menuOpen) {
            scrollContainer.style.overflowY = 'hidden';
        } else {
            scrollContainer.style.overflowY = previousOverflow || 'auto';
        }

        return () => {
            scrollContainer.style.overflowY = previousOverflow;
        };
    }, [menuOpen]);

    const switchTheme = (mode: 'light' | 'dark') => {
        const previousMode = themeMode;
        const nextMode = setThemeMode(mode);
        persistThemeMode(nextMode, 'public');

        void fetch('/theme', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrfToken() ? { 'X-CSRF-TOKEN': csrfToken() as string } : {}),
            },
            body: JSON.stringify({
                theme_mode: nextMode,
            }),
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Theme update failed.');
            }
        }).catch(() => {
            const restored = setThemeMode(previousMode);
            persistThemeMode(restored, 'public');
        });
    };

    return (
        <>
            <Head title={title}>
                {description ? <meta name="description" content={description} /> : null}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                ref={scrollContainerRef}
                className="public-theme page-scrollbar relative h-dvh overflow-x-hidden overflow-y-auto bg-[color:var(--public-bg)] text-[color:var(--public-text)]"
            >
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(219,154,60,0.18),_transparent_26rem),radial-gradient(circle_at_top_right,_rgba(120,86,54,0.12),_transparent_24rem),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.75),_transparent_22rem)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(240,175,82,0.12),_transparent_24rem),radial-gradient(circle_at_top_right,_rgba(118,87,57,0.16),_transparent_26rem),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.04),_transparent_24rem)]" />
                <div className="public-grain pointer-events-none fixed inset-0 opacity-70" />

                <div className="relative mx-auto flex min-h-full w-full max-w-[96rem] flex-col px-4 py-4 sm:px-6 lg:px-8">
                    <header
                        className={clsx(
                            'sticky top-4 z-50 rounded-[2rem] border backdrop-blur-2xl transition-all duration-500',
                            'border-[color:var(--public-border)] bg-[color:var(--public-surface)] shadow-[var(--public-shadow)]',
                            isCompact ? 'px-4 py-3' : 'px-4 py-4 sm:px-5 sm:py-5',
                        )}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <Link href="/" className="flex min-w-0 items-center gap-4">
                                <BrandMark logo={brandingLogo} companyName={companyName} />
                                <div className="min-w-0">
                                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[color:var(--public-text-soft)]">
                                        {companyName}
                                    </p>
                                    <p className="public-display mt-1 truncate text-xl font-normal tracking-[-0.03em] text-[color:var(--public-text)] sm:text-2xl">
                                        {headerTagline}
                                    </p>
                                </div>
                            </Link>

                            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
                                {navItems.map((item) => {
                                    const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={clsx(
                                                'rounded-full px-4 py-2 text-sm font-semibold transition',
                                                isActive
                                                    ? 'bg-[color:var(--public-surface-dark)] text-white shadow-[var(--public-shadow)]'
                                                    : 'text-[color:var(--public-text-soft)] hover:bg-[color:var(--public-accent-soft)] hover:text-[color:var(--public-text)]',
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="hidden items-center gap-3 lg:flex">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--public-text-soft)] transition hover:-translate-y-0.5 hover:text-[color:var(--public-text)]"
                                    onClick={() => switchTheme(themeMode === 'light' ? 'dark' : 'light')}
                                >
                                    {themeMode === 'light' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
                                    {themeMode === 'light' ? 'Dark mode' : 'Light mode'}
                                </button>
                                <ActionLink
                                    href={headerCtaUrl}
                                    className="inline-flex items-center justify-center rounded-full bg-[color:var(--public-accent)] px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-[var(--public-shadow)] transition duration-300 hover:-translate-y-0.5"
                                >
                                    {headerCtaLabel}
                                </ActionLink>
                            </div>

                            <div className="flex items-center gap-2 lg:hidden">
                                <button
                                    type="button"
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] text-[color:var(--public-text)] shadow-[var(--public-shadow)]"
                                    onClick={() => switchTheme(themeMode === 'light' ? 'dark' : 'light')}
                                    aria-label={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                                >
                                    {themeMode === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-surface-dark)] text-white shadow-[var(--public-shadow)]"
                                    onClick={() => setMenuOpen((current) => !current)}
                                    aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                                >
                                    {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {menuOpen ? (
                            <div className="mt-4 rounded-[1.6rem] border border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] p-4 shadow-[var(--public-shadow)] lg:hidden">
                                <nav className="grid gap-2" aria-label="Mobile primary navigation">
                                    {navItems.map((item) => {
                                        const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={clsx(
                                                    'rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition',
                                                    isActive
                                                        ? 'bg-[color:var(--public-surface-dark)] text-white'
                                                        : 'bg-[color:var(--public-bg-soft)] text-[color:var(--public-text)] hover:bg-[color:var(--public-accent-soft)]',
                                                )}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <ActionLink
                                    href={headerCtaUrl}
                                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--public-accent)] px-5 py-3 text-sm font-semibold text-zinc-950 shadow-[var(--public-shadow)]"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {headerCtaLabel}
                                </ActionLink>
                            </div>
                        ) : null}
                    </header>

                    <main className="flex-1 py-8">{children}</main>

                    <footer className="public-grain relative mt-10 overflow-hidden rounded-[calc(var(--public-radius-panel)+0.6rem)] border border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] shadow-[var(--public-shadow-strong)]">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(219,154,60,0.18),_transparent_22rem),radial-gradient(circle_at_bottom_right,_rgba(78,58,40,0.12),_transparent_26rem)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(240,175,82,0.14),_transparent_24rem),radial-gradient(circle_at_bottom_right,_rgba(120,90,60,0.18),_transparent_26rem)]" />
                        <div className="relative grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="border-b border-[color:var(--public-border)] p-7 sm:p-9 lg:border-b-0 lg:border-r">
                                <div className="flex items-start gap-4">
                                    <BrandMark logo={brandingLogo} companyName={companyName} />
                                    <div className="min-w-0">
                                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--public-text-soft)]">
                                            Editorial CMS
                                        </p>
                                        <Heading className="public-display mt-4 text-4xl/11 font-normal tracking-[-0.03em] !text-[color:var(--public-text)] sm:text-5xl/[1.08]">
                                            {footerHeading}
                                        </Heading>
                                        <Text className="mt-4 max-w-2xl text-base/8 !text-[color:var(--public-text-soft)]">
                                            {footerDescription}
                                        </Text>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-wrap items-center gap-3">
                                    <ActionLink
                                        href={footerCtaUrl}
                                        className="inline-flex items-center justify-center rounded-full bg-[color:var(--public-surface-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--public-shadow)] transition duration-300 hover:-translate-y-0.5"
                                    >
                                        {footerCtaLabel}
                                    </ActionLink>
                                    {socialLinks.length ? (
                                        <div className="flex items-center gap-2">
                                            {socialLinks.map((link) => (
                                                <FooterSocialLink key={link.label} {...link} />
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="grid gap-7 p-7 sm:grid-cols-2 sm:p-9">
                                <div>
                                    <Subheading className="public-display text-2xl font-normal !text-[color:var(--public-text)]">
                                        Contact
                                    </Subheading>
                                    <div className="mt-4 space-y-3">
                                        {settings?.export_email ? (
                                            <a className="block text-sm text-[color:var(--public-text-soft)] transition hover:text-[color:var(--public-text)]" href={`mailto:${settings.export_email}`}>
                                                {settings.export_email}
                                            </a>
                                        ) : null}
                                        {contactPhone ? (
                                            <a className="block text-sm text-[color:var(--public-text-soft)] transition hover:text-[color:var(--public-text)]" href={contactPhone.href}>
                                                {contactPhone.text}
                                            </a>
                                        ) : null}
                                        {settings?.company_address ? (
                                            <Text className="!text-[color:var(--public-text-soft)]">
                                                {settings.company_address}
                                            </Text>
                                        ) : null}
                                    </div>
                                </div>

                                <div>
                                    <Subheading className="public-display text-2xl font-normal !text-[color:var(--public-text)]">
                                        Explore
                                    </Subheading>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {footerNavItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)] px-3.5 py-1.5 text-sm font-medium text-[color:var(--public-text-soft)] transition hover:bg-[color:var(--public-accent-soft)] hover:text-[color:var(--public-text)]"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <Text className="!text-xs !text-[color:var(--public-text-muted)]">{footerCopyright}</Text>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
