import { Head, usePage } from '@inertiajs/react';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import type { PageProps } from '@/types';
import type { PublicMaintenancePageProps } from '@/types/public';
import { resolveBrandingLogo } from '@/utils/admin';

function BrandMark({ logo, companyName }: { logo?: string | null; companyName: string }) {
    if (logo) {
        return (
            <img
                src={logo}
                alt={companyName}
                loading="eager"
                decoding="async"
                className="max-h-14 w-auto max-w-[11rem] object-contain"
            />
        );
    }

    return (
        <div className="flex size-14 items-center justify-center rounded-2xl border border-zinc-950/10 bg-zinc-950/5 text-lg font-semibold tracking-[0.2em] text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-white">
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

export default function Maintenance({ settings, maintenance }: PublicMaintenancePageProps) {
    const page = usePage<PageProps>();
    const brandingLogo = resolveBrandingLogo(page.props.branding, page.props.theme.mode);
    const companyName = settings.company_name || 'Our website';
    const maintenanceMessage = maintenance.message;

    return (
        <>
            <Head title="Maintenance" />
            <div className="min-h-dvh bg-[#f7f4ee] text-zinc-950 dark:bg-zinc-950 dark:text-white">
                <div className="mx-auto flex min-h-dvh w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
                    <div className="w-full overflow-hidden rounded-[2rem] border border-zinc-950/10 bg-white/90 shadow-2xl shadow-zinc-950/10 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/30 dark:ring-white/5">
                        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                            <div className="border-b border-zinc-950/10 bg-zinc-950/[0.03] p-8 dark:border-white/10 dark:bg-white/[0.04] lg:border-b-0 lg:border-r">
                                <div className="flex items-center gap-4">
                                    <BrandMark logo={brandingLogo} companyName={companyName} />
                                    <div className="min-w-0">
                                        <Subheading className="truncate uppercase tracking-[0.22em] !text-zinc-950 dark:!text-white">
                                            {companyName}
                                        </Subheading>
                                        <Text className="mt-1 !text-zinc-500 dark:!text-zinc-400">Scheduled maintenance in progress</Text>
                                    </div>
                                </div>
                                <div className="mt-10 rounded-[1.6rem] border border-zinc-950/10 bg-white/70 p-6 dark:border-white/10 dark:bg-zinc-900/60">
                                    <div className="flex items-start gap-4">
                                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                                            <WrenchScrewdriverIcon className="size-6" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Status</p>
                                            <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-white">Temporarily unavailable</p>
                                            <Text className="mt-2 !text-zinc-500 dark:!text-zinc-400">
                                                We are applying updates to improve the public website experience.
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 sm:p-10 lg:p-12">
                                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">Maintenance mode</p>
                                <Heading className="mt-4 text-4xl !text-zinc-950 dark:!text-white sm:text-5xl">
                                    We&apos;ll be back shortly.
                                </Heading>
                                <Text className="mt-6 max-w-2xl text-base !text-zinc-600 dark:!text-zinc-300 sm:text-lg">
                                    {maintenanceMessage}
                                </Text>
                                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-[1.5rem] border border-zinc-950/10 bg-zinc-950/[0.03] px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                                        <p className="text-sm font-medium text-zinc-950 dark:text-white">Public access</p>
                                        <Text className="mt-2 !text-zinc-500 dark:!text-zinc-400">All public pages are temporarily disabled until maintenance mode is turned off.</Text>
                                    </div>
                                    <div className="rounded-[1.5rem] border border-zinc-950/10 bg-zinc-950/[0.03] px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                                        <p className="text-sm font-medium text-zinc-950 dark:text-white">Admin access</p>
                                        <Text className="mt-2 !text-zinc-500 dark:!text-zinc-400">The admin panel remains available so settings and content can still be managed.</Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
