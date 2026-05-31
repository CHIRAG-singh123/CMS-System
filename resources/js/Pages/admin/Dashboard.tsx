import { Deferred, usePage } from '@inertiajs/react';
import { LockClosedIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import AdminLayout from '@/layouts/AdminLayout';
import type { PageProps } from '@/types';
import { dispatchAdminToast, formatDateOnly, hasPermission, humanize } from '@/utils/admin';

interface DashboardProps {
    counts: Record<string, number>;
    recentInquiries?: Array<{
        id: number;
        name: string;
        email: string;
        inquiry_type: string;
        status: string;
        created_at: string;
        product_service?: { title: string } | null;
    }>;
    recentCmsPages?: Array<{
        id: number;
        title: string;
        status: string;
        updated_at?: string;
    }>;
}

const overviewItems = [
    ['CMS Pages', 'cmsPages', 'Content records'],
    ['Products / Services', 'productServices', 'Catalog entries'],
    ['Categories', 'categories', 'Navigation groups'],
    ['Inquiries', 'inquiries', 'Messages received'],
    ['Members', 'members', 'Team profiles'],
    ['Roles', 'roles', 'Access control roles'],
    ['Testimonials', 'testimonials', 'Client reviews'],
    ['Galleries', 'galleries', 'Media collections'],
] as const;

function DashboardTableFallback({
    columns,
    headers,
}: {
    columns: number;
    headers: string[];
}) {
    return (
        <Table className="mt-6 max-h-80" scrollable minRows={6} rowCount={1} virtualColumns={columns}>
            <TableHead>
                <TableRow>
                    {headers.map((header, index) => (
                        <TableHeader key={header} className={index === headers.length - 1 ? 'text-right' : undefined}>
                            {header}
                        </TableHeader>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody />
        </Table>
    );
}

export default function Dashboard({ counts, recentInquiries, recentCmsPages }: DashboardProps) {
    const page = usePage<PageProps>();
    const adminName = page.props.auth.admin?.name?.trim() || 'Admin';
    const canEditCmsPages = hasPermission(page.props.auth.admin?.permissions, 'cms_pages.edit');

    return (
        <AdminLayout
            title="Dashboard"
            panelClassName="bg-white/92 dark:bg-zinc-900/82"
            contentClassName="max-w-[78rem]"
            header={
                <AdminPageHeader
                    title={`Welcome back, ${adminName}!`}
                    description="Overview of content, catalog, team, and inquiry activity across the admin workspace."
                    actions={
                        <div className="flex flex-wrap gap-3">
                            <Button href="/admin/cms-pages" color="blue">Manage CMS Pages</Button>
                            <Button href="/admin/products-services/create" outline>Add Product / Service</Button>
                        </div>
                    }
                />
            }
        >
            <div className="space-y-12">
                <section>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-zinc-950 dark:text-white">Overview</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
                        {overviewItems.map(([label, key, description]) => (
                            <div key={key} className="border-t border-zinc-950/10 pt-6 dark:border-white/10">
                                <p className="text-sm text-zinc-400">{label}</p>
                                <p className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">{counts[key]}</p>
                                <p className="mt-2 text-sm text-zinc-500">{description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div>
                        <p className="text-base font-semibold text-zinc-950 dark:text-white">Recent inquiries</p>
                        <p className="mt-1 text-sm text-zinc-500">Latest contact activity in a full-width table layout.</p>
                    </div>

                    <Deferred
                        data="recentInquiries"
                        fallback={<DashboardTableFallback columns={5} headers={['Inquiry number', 'Received', 'Customer', 'Topic', 'Status']} />}
                    >
                        {() => (
                            <Table
                                className="mt-6 max-h-80"
                                scrollable
                                minRows={6}
                                rowCount={recentInquiries?.length ?? 0}
                                virtualColumns={5}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Inquiry number</TableHeader>
                                        <TableHeader>Received</TableHeader>
                                        <TableHeader>Customer</TableHeader>
                                        <TableHeader>Topic</TableHeader>
                                        <TableHeader className="text-right">Status</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentInquiries && recentInquiries.length > 0 ? recentInquiries.map((item) => (
                                        <TableRow key={item.id} href={`/admin/inquiries/${item.id}`} title={item.name}>
                                            <TableCell linkTabbable className="font-medium text-zinc-950 dark:text-white">#{String(item.id).padStart(4, '0')}</TableCell>
                                            <TableCell className="text-zinc-400">{formatDateOnly(item.created_at)}</TableCell>
                                            <TableCell>
                                                <div className="font-medium text-zinc-950 dark:text-white">{item.name}</div>
                                                <div className="text-xs text-zinc-500">{item.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-zinc-950 dark:text-white">{item.product_service?.title ?? humanize(item.inquiry_type)}</div>
                                                <div className="text-xs text-zinc-500">{humanize(item.inquiry_type)}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end">
                                                    <AdminStatusBadge status={item.status} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-12 text-center text-sm text-zinc-500">
                                                No recent inquiries yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </Deferred>
                </section>

                <section>
                    <div>
                        <p className="text-base font-semibold text-zinc-950 dark:text-white">Recently updated pages</p>
                        <p className="mt-1 text-sm text-zinc-500">Latest CMS page updates from the protected content set.</p>
                    </div>

                    <Deferred
                        data="recentCmsPages"
                        fallback={<DashboardTableFallback columns={3} headers={['Page', 'Updated', 'Status']} />}
                    >
                        {() => (
                            <Table
                                className="mt-6 max-h-80"
                                scrollable
                                minRows={6}
                                rowCount={recentCmsPages?.length ?? 0}
                                virtualColumns={3}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Page</TableHeader>
                                        <TableHeader>Updated</TableHeader>
                                        <TableHeader className="text-right">Status</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentCmsPages && recentCmsPages.length > 0 ? recentCmsPages.map((item) => (
                                        <TableRow key={item.id} href={canEditCmsPages ? `/admin/cms-pages/${item.id}/edit` : undefined} title={item.title}>
                                            <TableCell linkTabbable={canEditCmsPages} className="font-medium text-zinc-950 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    <span>{item.title}</span>
                                                    {!canEditCmsPages ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => dispatchAdminToast('error', 'You can view CMS pages, but edit access is restricted for your account.')}
                                                            className="inline-flex size-7 items-center justify-center rounded-full border border-zinc-950/10 text-zinc-500 transition hover:bg-zinc-950/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
                                                            aria-label={`Edit access restricted for ${item.title}`}
                                                            title="Edit access restricted"
                                                        >
                                                            <LockClosedIcon className="size-3.5" />
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-zinc-400">{formatDateOnly(item.updated_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end">
                                                    <AdminStatusBadge status={item.status} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-12 text-center text-sm text-zinc-500">
                                                No recent page updates yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </Deferred>
                </section>
            </div>
        </AdminLayout>
    );
}
