import { EyeIcon, LockClosedIcon, PencilSquareIcon } from '@heroicons/react/20/solid';
import AdminCard from '@/components/admin/AdminCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Link } from '@/components/ui/link';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import AdminLayout from '@/layouts/AdminLayout';
import type { PageProps } from '@/types';
import type { CmsPage } from '@/types/admin';
import { formatDateOnly, humanize, dispatchAdminToast, hasPermission } from '@/utils/admin';
import { usePage } from '@inertiajs/react';

interface CmsPageIndexProps {
    pages: CmsPage[];
}

const pageTypeLabels: Record<string, string> = {
    home: 'Homepage',
    'about-us': 'Content page',
    services: 'Catalog page',
    gallery: 'Media page',
    'contact-us': 'Contact page',
};

export default function Index({ pages }: CmsPageIndexProps) {
    const page = usePage<PageProps>();
    const canEditCmsPages = hasPermission(page.props.auth.admin?.permissions, 'cms_pages.edit');

    return (
        <AdminLayout
            title="CMS Pages"
            header={(
                <AdminPageHeader
                    title="CMS Pages"
                    description="Edit public website pages, section visibility, banners, and SEO content."
                />
            )}
        >
            <div className="space-y-7">
                <AdminCard className="p-4 lg:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="w-full max-w-2xl">
                            <Input placeholder="Search pages or website sections" disabled />
                        </div>
                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-[var(--app-surface-radius)] border border-zinc-950/10 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-950/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                        >
                            <EyeIcon className="size-4" />
                             Website
                        </a>
                    </div>
                </AdminCard>

                <div className="grid gap-5 xl:grid-cols-3">
                    {pages.map((page) => (
                        <article
                            key={page.id}
                            className="flex min-h-80 flex-col rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/45 dark:ring-white/5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <span className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                                    {pageTypeLabels[page.page_key ?? ''] ?? 'CMS page'}
                                </span>
                                <div className="text-right">
                                    <AdminStatusBadge status={page.status} />
                                    <div className="mt-2 text-xs text-zinc-500">
                                        {page.updated_at ? `Updated ${formatDateOnly(page.updated_at)}` : 'Not edited yet'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">{page.title}</h2>
                                <Text className="mt-4 overflow-hidden text-ellipsis">{page.short_description || page.admin_description}</Text>
                                <div className="mt-4 text-xs text-zinc-500">{humanize(page.page_key ?? page.slug)}</div>
                            </div>

                            <div className="mt-auto border-t border-zinc-950/10 pt-5 dark:border-white/10">
                                <div className="flex justify-end">
                                    {canEditCmsPages ? (
                                        <Link
                                            href={`/admin/cms-pages/${page.id}/edit`}
                                            preserveScroll={false}
                                            preserveState={false}
                                            className="inline-flex items-center justify-center rounded-[var(--app-surface-radius)] border border-zinc-950/10 px-3 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-950/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                                            aria-label={`Edit ${page.title}`}
                                            title={`Edit ${page.title}`}
                                        >
                                            <PencilSquareIcon className="size-4" />
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => dispatchAdminToast('error', 'You can view CMS pages, but edit access is restricted for your account.')}
                                            className="inline-flex items-center justify-center rounded-[var(--app-surface-radius)] border border-zinc-950/10 px-3 py-2 text-sm font-semibold text-zinc-500 shadow-sm transition hover:bg-zinc-950/5 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/5"
                                            aria-label={`Edit access restricted for ${page.title}`}
                                            title="Edit access restricted"
                                        >
                                            <LockClosedIcon className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
