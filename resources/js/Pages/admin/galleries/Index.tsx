import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AdminTableActions from '@/components/admin/AdminTableActions';
import { Label } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';
import { Radio, RadioField, RadioGroup } from '@/components/ui/radio';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminCard from '@/components/admin/AdminCard';
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import { AdminFilterMenu, AdminFilterMenuSection } from '@/components/admin/AdminFilterMenu';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import AdminLayout from '@/layouts/AdminLayout';
import type { Gallery, Paginated } from '@/types/admin';
import { DEFAULT_PRODUCT_IMAGE, adminAutoSearchVisitOptions, adminIndexVisitOptions, handleImageFallback, resolveAdminIndexPageAfterDelete, resolveProductImage } from '@/utils/admin';
import { useAutoSubmitFilters } from '@/utils/useAutoSubmitFilters';

interface GalleryIndexProps {
    galleries?: Paginated<Gallery>;
    filters: { search?: string; status?: string; per_page?: string };
    statuses: string[];
}

export default function Index({ galleries, filters, statuses }: GalleryIndexProps) {
    const filterForm = useForm('admin.galleries.filters', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        per_page: filters.per_page ?? String(galleries?.per_page ?? 10),
    });
    const [selected, setSelected] = useState<Gallery | null>(null);
    const reloadOptions = adminIndexVisitOptions(['galleries', 'filters']);
    const autoSearchOptions = adminAutoSearchVisitOptions(['galleries', 'filters']);
    const submitFilters = (options = reloadOptions) => filterForm.get('/admin/galleries', options);
    useAutoSubmitFilters(filterForm.data, () => submitFilters(autoSearchOptions), 180, filterForm.cancel);
    const activeFilterCount = [filterForm.data.status].filter(Boolean).length;
    const hasActiveSearch = filterForm.data.search.trim() !== '';

    return (
        <AdminLayout
            title="Gallery Management"
            header={
                <AdminPageHeader
                    title="Gallery Management"
                    description="Organize albums, cover imagery, and nested gallery assets."
                    actions={<Button href="/admin/galleries/create" color="blue">Add gallery</Button>}
                />
            }
        >
            <AdminCard className="relative flex min-h-0 flex-1 flex-col p-4 lg:p-5">
                <Table
                    scrollable
                    minRows={hasActiveSearch ? 0 : 8}
                    rowCount={galleries?.data.length ?? 0}
                    virtualColumns={hasActiveSearch ? 0 : 5}
                    toolbar={(
                        <AdminFilterBar embedded>
                            <Input placeholder="Search galleries" value={filterForm.data.search} onChange={(event) => filterForm.setData('search', event.target.value)} />
                            <AdminFilterMenu activeCount={activeFilterCount}>
                                <AdminFilterMenuSection title="Status" contentClassName="space-y-3">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose one status.</p>
                                    <RadioGroup value={filterForm.data.status} onChange={(value: string) => filterForm.setData('status', value)}>
                                        <RadioField className="gap-x-3">
                                            <Radio value="" />
                                            <Label className="text-sm/5 text-zinc-700 dark:text-zinc-300">All statuses</Label>
                                        </RadioField>
                                        {statuses.map((status) => (
                                            <RadioField key={status} className="gap-x-3">
                                                <Radio value={status} />
                                                <Label className="text-sm/5 text-zinc-700 dark:text-zinc-300">{status}</Label>
                                            </RadioField>
                                        ))}
                                    </RadioGroup>
                                </AdminFilterMenuSection>
                            </AdminFilterMenu>
                        </AdminFilterBar>
                    )}
                    footer={galleries ? <AdminPagination paginator={galleries} {...reloadOptions} /> : null}
                >
                    <TableHead>
                        <TableRow>
                            <TableHeader>Gallery</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Images</TableHeader>
                            <TableHeader>UID</TableHeader>
                            <TableHeader className="text-center">Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(galleries?.data ?? []).map((gallery) => (
                            <TableRow key={gallery.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={resolveProductImage(gallery.cover_image)}
                                            alt={gallery.title}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(event) => handleImageFallback(event, DEFAULT_PRODUCT_IMAGE)}
                                            className="h-12 w-12 rounded-[var(--app-surface-radius)] object-cover"
                                        />
                                        <div>
                                            <p className="font-medium">{gallery.title}</p>
                                            <p className="text-xs text-zinc-500">{gallery.slug}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><AdminStatusBadge status={gallery.status} /></TableCell>
                                <TableCell>{gallery.images_count ?? 0}</TableCell>
                                <TableCell className="font-mono text-xs text-zinc-500 sm:text-sm">{gallery.uid ?? '-'}</TableCell>
                                <TableCell className="text-center">
                                    <AdminTableActions
                                        items={[
                                            { label: 'Edit', href: `/admin/galleries/${gallery.id}/edit`, kind: 'edit' },
                                            { label: 'Delete', onClick: () => setSelected(gallery), kind: 'delete' },
                                        ]}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AdminCard>

            <AdminDeleteDialog
                open={selected !== null}
                onClose={() => setSelected(null)}
                title="Delete gallery"
                description="This permanently removes the gallery and all nested images."
                onConfirm={() => {
                    if (!selected) {
                        return;
                    }

                    const galleryId = selected.id;
                    const deleteRecoveryUrl = resolveAdminIndexPageAfterDelete(galleries);
                    setSelected(null);

                    router.post(`/admin/galleries/${galleryId}`, { _method: 'delete' }, {
                        ...reloadOptions,
                        only: ['galleries', 'filters', 'flash'],
                        onSuccess: () => {
                            if (!deleteRecoveryUrl) {
                                return;
                            }

                            router.get(deleteRecoveryUrl, {}, {
                                ...reloadOptions,
                                only: ['galleries', 'filters'],
                            });
                        },
                    });
                }}
            />
        </AdminLayout>
    );
}
