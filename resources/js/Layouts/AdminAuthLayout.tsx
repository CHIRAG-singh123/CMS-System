import type { PropsWithChildren } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useThemeMode } from '@/lib/theme';
import type { PageProps } from '@/types';
import { resolveBrandingLogo } from '@/utils/admin';

interface AdminAuthLayoutProps extends PropsWithChildren {
    title: string;
    description?: string;
}

export default function AdminAuthLayout({ title, description, children }: AdminAuthLayoutProps) {
    const { branding } = usePage<PageProps>().props;
    const themeMode = useThemeMode();
    const brandingLogo = resolveBrandingLogo(branding, themeMode);

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-transparent">
                <AuthLayout>
                    <div className="grid w-full max-w-lg grid-cols-1 gap-8">
                        <div className="flex items-center gap-3">
                            {brandingLogo ? (
                                <img
                                    src={brandingLogo}
                                    alt="Site logo"
                                    loading="eager"
                                    decoding="async"
                                    className="max-h-14 w-auto max-w-full shrink-0 object-contain"
                                />
                            ) : null}
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Default Admin</p>
                        </div>
                        <div className="space-y-2">
                            <Heading>{title}</Heading>
                            {description ? <Text>{description}</Text> : null}
                        </div>
                        <div>{children}</div>
                    </div>
                </AuthLayout>
            </div>
        </>
    );
}
