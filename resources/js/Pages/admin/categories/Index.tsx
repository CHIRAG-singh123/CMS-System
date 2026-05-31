import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminSortableTableBody from '@/components/admin/AdminSortableTableBody';
import { Button } from '@/components/ui/button';
import AdminTableActions from '@/components/admin/AdminTableActions';
import { Label } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';
import { Radio, RadioField, RadioGroup } from '@/components/ui/radio';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminCard from '@/components/admin/AdminCard';
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import { AdminFilterMenu, AdminFilterMenuSection } from '@/components/admin/AdminFilterMenu';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import AdminLayout from '@/layouts/AdminLayout';
import type { Category, Paginated } from '@/types/admin';
import { persistAdminSortOrder } from '@/utils/admin-reorder';
import { DEFAULT_PRODUCT_IMAGE, adminAutoSearchVisitOptions, adminIndexVisitOptions, handleImageFallback, resolveAdminIndexPageAfterDelete, resolveProductImage } from '@/utils/admin';
import { useAutoSubmitFilters } from '@/utils/useAutoSubmitFilters';

interface CategoryIndexProps {
    categories?: Paginated<Category>;
    filters: { search?: string; status?: string; per_page?: string };
    statuses: string[];
}

export default function Index({ categories, filters, statuses }: CategoryIndexProps) {
    const filterForm = useForm('admin.categories.filters', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        per_page: filters.per_page ?? String(categories?.per_page ?? 10),
    });
    const [selected, setSelected] = useState<Category | null>(null);
    const reloadOptions = adminIndexVisitOptions(['categories', 'filters']);
    const autoSearchOptions = adminAutoSearchVisitOptions(['categories', 'filters']);
    const submitFilters = (options = reloadOptions) => filterForm.get('/admin/categories', options);
    useAutoSubmitFilters(filterForm.data, () => submitFilters(autoSearchOptions), 180, filterForm.cancel);
    const activeFilterCount = [filterForm.data.status].filter(Boolean).length;
    const hasActiveSearch = filterForm.data.search.trim() !== '';

    return (
        <AdminLayout
            title="Categories"
            header={
                <AdminPageHeader
                    title="Categories"
                    description="Organize products and services with image-backed category records."
                    actions={<Button href="/admin/categories/create" color="blue">Add category</Button>}
                />
            }
        >
            <AdminCard className="relative flex min-h-0 flex-1 flex-col p-4 lg:p-5">
                <Table
                    scrollable
                    minRows={hasActiveSearch ? 0 : 8}
                    rowCount={categories?.data.length ?? 0}
                    virtualColumns={hasActiveSearch ? 0 : 6}
                    toolbar={(
                        <AdminFilterBar embedded>
                            <Input placeholder="Search categories" value={filterForm.data.search} onChange={(event) => filterForm.setData('search', event.target.value)} />
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
                    footer={categories ? <AdminPagination paginator={categories} {...reloadOptions} /> : null}
                >
                    <TableHead>
                        <TableRow>
                            <TableHeader className="w-12">
                                <span className="sr-only">Reorder</span>
                            </TableHeader>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Products</TableHeader>
                            <TableHeader>UID</TableHeader>
                            <TableHeader className="text-center">Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <AdminSortableTableBody
                        items={categories?.data ?? []}
                        minRows={hasActiveSearch ? 0 : 8}
                        columnCount={6}
                        onPersist={(orderedIds) => persistAdminSortOrder('/admin/categories/reorder', orderedIds)}
                        renderRow={(category, { dragHandle }) => (
                            <>
                                <TableCell>{dragHandle}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={resolveProductImage(category.image)}
                                            alt={category.name}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(event) => handleImageFallback(event, DEFAULT_PRODUCT_IMAGE)}
                                            className="h-12 w-12 rounded-[var(--app-surface-radius)] object-cover"
                                        />
                                        <div>
                                            <p className="font-medium">{category.name}</p>
                                            <p className="text-xs text-zinc-500">{category.slug}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><AdminStatusBadge status={category.status} /></TableCell>
                                <TableCell>{category.product_services_count ?? 0}</TableCell>
                                <TableCell className="font-mono text-xs text-zinc-500 sm:text-sm">{category.uid ?? '-'}</TableCell>
                                <TableCell className="text-center">
                                    <AdminTableActions
                                        items={[
                                            { label: 'Edit', href: `/admin/categories/${category.id}/edit`, kind: 'edit' },
                                            { label: 'Delete', onClick: () => setSelected(category), kind: 'delete' },
                                        ]}
                                    />
                                </TableCell>
                            </>
                        )}
                    />
                </Table>
            </AdminCard>

            <AdminDeleteDialog
                open={selected !== null}
                onClose={() => setSelected(null)}
                title="Delete category"
                description="This action permanently removes the category. Linked products and services must be cleared first."
                onConfirm={() => {
                    if (!selected) {
                        return;
                    }

                    const categoryId = selected.id;
                    const deleteRecoveryUrl = resolveAdminIndexPageAfterDelete(categories);
                    setSelected(null);

                    router.post(`/admin/categories/${categoryId}`, { _method: 'delete' }, {
                        ...reloadOptions,
                        only: ['categories', 'filters', 'flash'],
                        onSuccess: () => {
                            if (!deleteRecoveryUrl) {
                                return;
                            }

                            router.get(deleteRecoveryUrl, {}, {
                                ...reloadOptions,
                                only: ['categories', 'filters'],
                            });
                        },
                    });
                }}
            />
        </AdminLayout>
    );
}
