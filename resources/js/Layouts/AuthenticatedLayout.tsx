import { type PropsWithChildren, type ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRightStartOnRectangleIcon,
    HomeIcon,
    Squares2X2Icon,
    UserCircleIcon,
} from '@heroicons/react/20/solid';
import { Avatar } from '@/components/ui/avatar';
import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/ui/dropdown';
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/ui/navbar';
import {
    Sidebar,
    SidebarBody,
    SidebarFooter,
    SidebarHeader,
    SidebarItem,
    SidebarLabel,
    SidebarSection,
} from '@/components/ui/sidebar';
import { StackedLayout } from '@/components/ui/stacked-layout';
import { useThemeMode } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import type { AuthUser, PageProps } from '@/types';
import { DEFAULT_PERSON_IMAGE } from '@/utils/admin';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { label: 'Profile', href: '/profile', icon: UserCircleIcon },
];

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage<PageProps>();
    const user = page.props.auth.user as AuthUser | null | undefined;
    const currentUrl = page.url;
    const themeMode = useThemeMode();

    const navbar = (
        <Navbar>
            <NavbarSection>
                <Link href="/" className="flex items-center gap-3 rounded-2xl px-1 py-1">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20">
                        <Squares2X2Icon className="size-5" />
                    </span>
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-zinc-950 dark:text-white">Workspace</p>
                        <Text className="text-xs !text-zinc-500 dark:!text-zinc-400">Unified account area</Text>
                    </div>
                </Link>
            </NavbarSection>
            <NavbarSection className="hidden lg:flex">
                {navItems.map((item) => (
                    <NavbarItem key={item.href} href={item.href} current={currentUrl === item.href}>
                        <item.icon data-slot="icon" />
                        <span>{item.label}</span>
                    </NavbarItem>
                ))}
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection>
                <Dropdown>
                    <DropdownButton plain className="rounded-full">
                        <span className="flex items-center gap-3">
                            <Avatar
                                fallbackSrc={DEFAULT_PERSON_IMAGE}
                                initials={user?.name?.slice(0, 2).toUpperCase() ?? 'US'}
                                alt={user?.name ?? 'User'}
                                className="size-9 bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                            <span className="hidden min-w-0 text-right sm:block">
                                <span className="block truncate text-sm font-medium text-zinc-950 dark:text-white">{user?.name ?? 'User'}</span>
                                <span className="block truncate text-xs text-zinc-400">{user?.email ?? ''}</span>
                            </span>
                        </span>
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                        <DropdownItem href="/profile">
                            <UserCircleIcon data-slot="icon" />
                            <DropdownLabel>Profile</DropdownLabel>
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem onClick={() => router.post(route('logout'))}>
                            <ArrowRightStartOnRectangleIcon data-slot="icon" />
                            <DropdownLabel>Log Out</DropdownLabel>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </NavbarSection>
        </Navbar>
    );

    const sidebar = (
        <Sidebar className="bg-white/90 text-zinc-950 dark:bg-zinc-950/95 dark:text-white">
            <SidebarHeader>
                <div className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-white/90 p-5 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/5">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">Account</p>
                    <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-white">{user?.name ?? 'User'}</p>
                    <Text className="mt-1 !text-zinc-500 dark:!text-zinc-300">{user?.email ?? ''}</Text>
                </div>
            </SidebarHeader>
            <SidebarBody>
                <SidebarSection>
                    {navItems.map((item) => (
                        <SidebarItem key={item.href} href={item.href} current={currentUrl === item.href}>
                            <item.icon data-slot="icon" />
                            <SidebarLabel>{item.label}</SidebarLabel>
                        </SidebarItem>
                    ))}
                </SidebarSection>
            </SidebarBody>
            <SidebarFooter>
                <SidebarSection>
                    <Text className="px-2 !text-zinc-500 dark:!text-zinc-400">
                        {themeMode === 'dark' ? 'Dark Catalyst account shell' : 'Light Catalyst account shell'}
                    </Text>
                </SidebarSection>
            </SidebarFooter>
        </Sidebar>
    );

    return (
        <StackedLayout navbar={navbar} sidebar={sidebar}>
            {header ? <div className="mb-8">{header}</div> : null}
            {children}
        </StackedLayout>
    );
}
