import { isValidElement, useEffect, useRef, useState, type ComponentType, type PropsWithChildren, type ReactNode, type SVGProps } from 'react';
import clsx from 'clsx';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRightStartOnRectangleIcon,
    BriefcaseIcon,
    ChatBubbleLeftRightIcon,
    ChevronUpIcon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    HomeIcon,
    InboxIcon,
    MoonIcon,
    PhotoIcon,
    ShieldCheckIcon,
    SunIcon,
    TagIcon,
    UserCircleIcon,
    UserGroupIcon,
    XMarkIcon,
} from '@heroicons/react/20/solid';
import { Avatar } from '@/components/ui/avatar';
import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/ui/dropdown';
import { Navbar, NavbarSection, NavbarSpacer } from '@/components/ui/navbar';
import {
    Sidebar,
    SidebarBody,
    SidebarFooter,
    SidebarHeader,
    SidebarItem,
    SidebarLabel,
    SidebarSection,
} from '@/components/ui/sidebar';
import { SidebarLayout } from '@/components/ui/sidebar-layout';
import { persistThemeMode, setThemeMode, useThemeMode } from '@/lib/theme';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import type { PageProps } from '@/types';
import { DEFAULT_PERSON_IMAGE, hasPermission, resolveBrandingLogo, storageUrl } from '@/utils/admin';

interface AdminLayoutProps extends PropsWithChildren {
    title: string;
    header?: ReactNode;
    panelClassName?: string;
    contentClassName?: string;
}

type NavItem = {
    label: string;
    href: string;
    permission: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const items: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', permission: 'dashboard.view', icon: HomeIcon },
    { label: 'CMS Pages', href: '/admin/cms-pages', permission: 'cms_pages.view', icon: DocumentDuplicateIcon },
    { label: 'Products / Services', href: '/admin/products-services', permission: 'products_services.view', icon: BriefcaseIcon },
    { label: 'Categories', href: '/admin/categories', permission: 'categories.view', icon: TagIcon },
    { label: 'Inquiries', href: '/admin/inquiries', permission: 'inquiries.view', icon: InboxIcon },
    { label: 'Users', href: '/admin/admin-users', permission: 'admin_users.view', icon: UserCircleIcon },
    { label: 'Members / Team', href: '/admin/members', permission: 'members.view', icon: UserGroupIcon },
    { label: 'Roles & Permissions', href: '/admin/roles-permissions', permission: 'roles_permissions.view', icon: ShieldCheckIcon },
    { label: 'Testimonials', href: '/admin/testimonials', permission: 'testimonials.view', icon: ChatBubbleLeftRightIcon },
    { label: 'Gallery Management', href: '/admin/galleries', permission: 'galleries.view', icon: PhotoIcon },
    { label: 'Settings', href: '/admin/settings', permission: 'settings.view', icon: Cog6ToothIcon },
];

type ToastState = {
    tone: 'success' | 'error';
    message: string;
} | null;

type AdminToastDetail = {
    tone: 'success' | 'error';
    message: string;
};

function csrfToken(): string | null {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null;
}

export default function AdminLayout({ title, header, panelClassName, contentClassName, children }: AdminLayoutProps) {
    const page = usePage<PageProps>();
    const admin = page.props.auth.admin;
    const flash = page.props.flash;
    const success = flash.success;
    const error = flash.error;
    const currentUrl = page.url;
    const themeMode = useThemeMode();
    const brandingLogo = resolveBrandingLogo(page.props.branding, themeMode);
    const [toast, setToast] = useState<ToastState>(null);
    const [isFooterProfileMenuOpen, setIsFooterProfileMenuOpen] = useState(false);
    const [isFooterProfileMenuVisible, setIsFooterProfileMenuVisible] = useState(false);
    const footerProfileMenuRef = useRef<HTMLDivElement | null>(null);
    const footerProfileMenuCloseTimeoutRef = useRef<number | null>(null);
    const footerProfileMenuHideTimeoutRef = useRef<number | null>(null);

    const visibleItems = items.filter((item) => hasPermission(admin?.permissions, item.permission));
    const hasStickyHeader = isValidElement(header) && Boolean((header.props as { sticky?: boolean }).sticky);

    useEffect(() => {
        if (!toast) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setToast(null);
        }, 12000);

        return () => window.clearTimeout(timeoutId);
    }, [toast]);

    useEffect(() => {
        if (!success && !error) {
            return;
        }

        setToast(error ? { tone: 'error', message: error } : { tone: 'success', message: success });
    }, [flash, error, success]);

    useEffect(() => router.on('flash', (event) => {
        const nextError = event.detail.flash?.error;
        const nextSuccess = event.detail.flash?.success;

        if (!nextError && !nextSuccess) {
            return;
        }

        setToast(nextError ? { tone: 'error', message: nextError } : { tone: 'success', message: nextSuccess });
    }), []);

    useEffect(() => {
        const handleAdminToast = (event: Event) => {
            const detail = (event as CustomEvent<AdminToastDetail>).detail;

            if (!detail?.message) {
                return;
            }

            setToast({
                tone: detail.tone,
                message: detail.message,
            });
        };

        window.addEventListener('admin-toast', handleAdminToast as EventListener);

        return () => {
            window.removeEventListener('admin-toast', handleAdminToast as EventListener);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (footerProfileMenuCloseTimeoutRef.current !== null) {
                window.clearTimeout(footerProfileMenuCloseTimeoutRef.current);
            }

            if (footerProfileMenuHideTimeoutRef.current !== null) {
                window.clearTimeout(footerProfileMenuHideTimeoutRef.current);
            }
        };
    }, []);

    const openFooterProfileMenu = () => {
        if (footerProfileMenuCloseTimeoutRef.current !== null) {
            window.clearTimeout(footerProfileMenuCloseTimeoutRef.current);
            footerProfileMenuCloseTimeoutRef.current = null;
        }

        if (footerProfileMenuHideTimeoutRef.current !== null) {
            window.clearTimeout(footerProfileMenuHideTimeoutRef.current);
            footerProfileMenuHideTimeoutRef.current = null;
        }

        setIsFooterProfileMenuVisible(true);
        setIsFooterProfileMenuOpen(true);
    };

    const closeFooterProfileMenuWithDelay = () => {
        if (footerProfileMenuCloseTimeoutRef.current !== null) {
            window.clearTimeout(footerProfileMenuCloseTimeoutRef.current);
        }

        footerProfileMenuCloseTimeoutRef.current = window.setTimeout(() => {
            setIsFooterProfileMenuOpen(false);
            footerProfileMenuCloseTimeoutRef.current = null;

            if (footerProfileMenuHideTimeoutRef.current !== null) {
                window.clearTimeout(footerProfileMenuHideTimeoutRef.current);
            }

            footerProfileMenuHideTimeoutRef.current = window.setTimeout(() => {
                setIsFooterProfileMenuVisible(false);
                footerProfileMenuHideTimeoutRef.current = null;
            }, 180);
        }, 3000);
    };

    const closeFooterProfileMenuImmediately = () => {
        if (footerProfileMenuCloseTimeoutRef.current !== null) {
            window.clearTimeout(footerProfileMenuCloseTimeoutRef.current);
            footerProfileMenuCloseTimeoutRef.current = null;
        }

        if (footerProfileMenuHideTimeoutRef.current !== null) {
            window.clearTimeout(footerProfileMenuHideTimeoutRef.current);
            footerProfileMenuHideTimeoutRef.current = null;
        }

        setIsFooterProfileMenuOpen(false);
        setIsFooterProfileMenuVisible(false);
    };

    const switchTheme = (mode: 'light' | 'dark') => {
        const previousMode = themeMode;
        const nextMode = setThemeMode(mode);
        persistThemeMode(nextMode, 'admin');

        void fetch(route('admin.profile.theme.update'), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrfToken() ? { 'X-CSRF-TOKEN': csrfToken() as string } : {}),
            },
            body: new URLSearchParams({
                _method: 'put',
                theme_preference: nextMode,
            }).toString(),
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Theme preference update failed.');
            }
        }).catch(() => {
            setThemeMode(previousMode);
            persistThemeMode(previousMode, 'admin');
            setToast({
                tone: 'error',
                message: 'Theme preference could not be saved.',
            });
        });
    };

    const toggleTheme = () => {
        switchTheme(themeMode === 'light' ? 'dark' : 'light');
    };

    const navbar = (
        <Navbar>
            <NavbarSection>
                <div className="min-w-0">
                    <Subheading>{title}</Subheading>
                    <Text className="hidden sm:block">Catalyst-styled reusable admin workspace</Text>
                </div>
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection>
                <Dropdown>
                    <DropdownButton plain className="rounded-full">
                        <span className="flex items-center gap-3">
                            <Avatar
                                src={storageUrl(admin?.avatar) ?? undefined}
                                fallbackSrc={DEFAULT_PERSON_IMAGE}
                                initials={admin?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
                                alt={admin?.name ?? 'Admin'}
                                className="size-9 bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                            <span className="hidden min-w-0 text-right sm:block">
                                <span className="block truncate text-sm font-medium text-zinc-950 dark:text-white">{admin?.name ?? 'Admin'}</span>
                                <span className="block truncate text-xs text-zinc-400">{admin?.role?.name ?? 'Administrator'}</span>
                            </span>
                        </span>
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                        <DropdownItem href={route('admin.profile.edit')}>
                            <UserCircleIcon data-slot="icon" />
                            <DropdownLabel>My account</DropdownLabel>
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem href={route('admin.logout')} method="post">
                            <ArrowRightStartOnRectangleIcon data-slot="icon" />
                            <DropdownLabel>Sign out</DropdownLabel>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </NavbarSection>
        </Navbar>
    );

    const sidebar = (
        <Sidebar className="bg-white/90 text-zinc-950 dark:bg-zinc-950/95 dark:text-white">
            <SidebarHeader className="px-3 pt-2 pb-3">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.dashboard')} className="flex min-w-0 flex-1 items-center gap-3">
                        {brandingLogo ? (
                            <>
                                <img
                                    src={brandingLogo}
                                    alt="Site logo"
                                    loading="eager"
                                    decoding="async"
                                    className="max-h-14 w-auto max-w-full shrink-0 object-contain"
                                />
                                <span className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-zinc-950 dark:text-white">
                                    Admin
                                </span>
                            </>
                        ) : (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">Admin</p>
                                <Heading className="mt-1 !text-zinc-950 dark:!text-white">Default Panel</Heading>
                            </div>
                        )}
                    </Link>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        className="ml-auto inline-flex shrink-0 items-center justify-center rounded-full p-2 text-zinc-700 transition hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-100 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                        {themeMode === 'light' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
                    </button>
                </div>
            </SidebarHeader>
            <SidebarBody>
                <SidebarSection>
                    {visibleItems.map((item) => (
                        <SidebarItem key={item.href} href={item.href} current={currentUrl.startsWith(item.href)}>
                            <item.icon data-slot="icon" />
                            <SidebarLabel>{item.label}</SidebarLabel>
                        </SidebarItem>
                    ))}
                </SidebarSection>
            </SidebarBody>
            <SidebarFooter>
                <SidebarSection>
                    <div
                        ref={footerProfileMenuRef}
                        className="relative"
                        onMouseEnter={openFooterProfileMenu}
                        onMouseLeave={closeFooterProfileMenuWithDelay}
                        onFocus={openFooterProfileMenu}
                        onBlur={(event) => {
                            const nextTarget = event.relatedTarget;

                            if (nextTarget instanceof Node && footerProfileMenuRef.current?.contains(nextTarget)) {
                                return;
                            }

                            closeFooterProfileMenuImmediately();
                        }}
                    >
                        <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={isFooterProfileMenuOpen}
                            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm/5 font-medium text-zinc-950 transition hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5"
                        >
                            <Avatar
                                src={storageUrl(admin?.avatar) ?? undefined}
                                fallbackSrc={DEFAULT_PERSON_IMAGE}
                                initials={admin?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
                                alt={admin?.name ?? 'Admin'}
                                className="size-10 bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">{admin?.name ?? 'Admin'}</span>
                                <span className="block truncate text-xs/5 font-normal text-zinc-400">
                                    {admin?.email ?? ''}
                                </span>
                            </span>
                            <ChevronUpIcon
                                className={clsx(
                                    'size-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out dark:text-zinc-400',
                                    isFooterProfileMenuOpen ? 'rotate-0' : 'rotate-180',
                                )}
                            />
                        </button>
                        {isFooterProfileMenuVisible ? (
                            <div
                                className={clsx(
                                    'absolute inset-x-0 bottom-full z-30 mb-2 isolate rounded-[var(--app-surface-radius)] bg-white p-1 shadow-xl shadow-zinc-950/10 ring-1 ring-zinc-950/10 ring-inset transition duration-180 ease-out dark:bg-zinc-900 dark:shadow-black/30 dark:ring-white/10',
                                    isFooterProfileMenuOpen
                                        ? 'translate-y-0 opacity-100'
                                        : 'translate-y-1 opacity-0 pointer-events-none',
                                )}
                            >
                                <Link
                                    href={route('admin.profile.edit')}
                                    onClick={() => closeFooterProfileMenuImmediately()}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm/6 text-zinc-950 transition hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10"
                                >
                                    <UserCircleIcon className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
                                    <span>My account</span>
                                </Link>
                                <div className="mx-3 my-1 h-px bg-zinc-950/10 dark:bg-white/10" />
                                <Link
                                    href={route('admin.logout')}
                                    method="post"
                                    as="button"
                                    preserveScroll={false}
                                    preserveState={false}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm/6 text-zinc-950 transition hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10"
                                >
                                    <ArrowRightStartOnRectangleIcon className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
                                    <span>Sign out</span>
                                </Link>
                            </div>
                        ) : null}
                    </div>
                </SidebarSection>
            </SidebarFooter>
        </Sidebar>
    );

    return (
        <>
            <Head title={title} />
            {toast ? (
                <div
                    role={toast.tone === 'error' ? 'alert' : 'status'}
                    aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
                    className={`pointer-events-auto fixed top-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-[var(--app-surface-radius)] border py-3 pr-10 pl-4 text-sm shadow-xl lg:right-6 ${
                        toast.tone === 'error'
                            ? 'border-red-500/20 bg-white text-red-700 dark:bg-zinc-900 dark:text-red-300'
                            : 'border-emerald-500/20 bg-white text-emerald-700 dark:bg-zinc-900 dark:text-emerald-300'
                    }`}
                >
                    <p className="font-medium">{toast.message}</p>
                    <button
                        type="button"
                        aria-label="Close notification"
                        onClick={() => setToast(null)}
                        className="absolute top-2.5 right-2.5 inline-flex size-6 items-center justify-center rounded-full text-current opacity-70 transition hover:bg-current/10 hover:opacity-100 focus:outline-2 focus:outline-offset-2 focus:outline-current"
                    >
                        <XMarkIcon className="size-4" />
                    </button>
                </div>
            ) : null}
            <SidebarLayout
                navbar={navbar}
                sidebar={sidebar}
                stickyHeader={hasStickyHeader ? header : undefined}
                panelClassName={panelClassName}
                contentClassName={contentClassName}
            >
                {hasStickyHeader ? null : header}
                <div className={hasStickyHeader ? 'flex flex-col' : 'flex min-h-0 flex-1 flex-col'}>{children}</div>
            </SidebarLayout>
        </>
    );
}
