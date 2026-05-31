import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AdminTableActions from '@/components/admin/AdminTableActions';
import { Checkbox, CheckboxField, CheckboxGroup } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/fieldset';
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
import type { Category, Paginated, ProductService } from '@/types/admin';
import { DEFAULT_PRODUCT_IMAGE, adminAutoSearchVisitOptions, adminIndexVisitOptions, handleImageFallback, resolveAdminIndexPageAfterDelete, resolveProductImage } from '@/utils/admin';
import { useAutoSubmitFilters } from '@/utils/useAutoSubmitFilters';

interface ProductServiceIndexProps {
    records?: Paginated<ProductService>;
    filters: { search?: string; category_ids?: string[] | string; type?: string; statuses?: string[] | string; per_page?: string };
    categories: Array<Pick<Category, 'id' | 'name'>>;
    statuses: string[];
    types: string[];
}

function normalizeFilterArray(value: string[] | string | undefined): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string' && item !== '');
    }

    return typeof value === 'string' && value !== '' ? [value] : [];
}

export default function Index({ records, filters, categories, statuses, types }: ProductServiceIndexProps) {
    const filterForm = useForm('admin.products-services.filters', {
        search: filters.search ?? '',
        category_ids: normalizeFilterArray(filters.category_ids),
        type: filters.type ?? '',
        statuses: normalizeFilterArray(filters.statuses),
        per_page: filters.per_page ?? String(records?.per_page ?? 10),
    });
    const [selected, setSelected] = useState<ProductService | null>(null);
    const reloadOptions = adminIndexVisitOptions(['records', 'filters']);
    const autoSearchOptions = adminAutoSearchVisitOptions(['records', 'filters']);
    const submitFilters = (options = reloadOptions) => filterForm.get('/admin/products-services', options);
    useAutoSubmitFilters(filterForm.data, () => submitFilters(autoSearchOptions), 180, filterForm.cancel);
    const activeFilterCount = filterForm.data.category_ids.length + filterForm.data.statuses.length + (filterForm.data.type ? 1 : 0);
    const hasActiveSearch = filterForm.data.search.trim() !== '';

    const toggleArrayFilter = (field: 'category_ids' | 'statuses', value: string, checked: boolean) => {
        const currentValues = filterForm.data[field];
        const nextValues = checked
            ? Array.from(new Set([...currentValues, value]))
            : currentValues.filter((item) => item !== value);

        filterForm.setData(field, nextValues);
    };

    return (
        <AdminLayout
            title="Products / Services"
            header={
                <AdminPageHeader
                    title="Products / Services"
                    description="Manage the combined product and service catalog with gallery support."
                    actions={<Button href="/admin/products-services/create" color="blue">Add product / service</Button>}
                />
            }
        >
            <AdminCard className="relative flex min-h-0 flex-1 flex-col p-4 lg:p-5">
                <Table
                    scrollable
                    minRows={hasActiveSearch ? 0 : 8}
                    rowCount={records?.data.length ?? 0}
                    virtualColumns={hasActiveSearch ? 0 : 6}
                    toolbar={(
                        <AdminFilterBar embedded>
                            <Input placeholder="Search records" value={filterForm.data.search} onChange={(event) => filterForm.setData('search', event.target.value)} />
                            <AdminFilterMenu activeCount={activeFilterCount}>
                                <AdminFilterMenuSection title="Category" contentClassName="space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Select one or more categories.</p>
                                        <button
                                            type="button"
                                            onClick={() => filterForm.setData('category_ids', [])}
                                            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                                        >
                                            Clear Filter
                                        </button>
                                    </div>
                                    <CheckboxGroup className="table-scrollbar max-h-60 space-y-2 overflow-y-auto overscroll-contain px-1">
                                        {categories.map((category) => {
                                            const value = String(category.id);

                                            return (
                                                <CheckboxField key={category.id} className="gap-x-3">
                                                    <Checkbox
                                                        checked={filterForm.data.category_ids.includes(value)}
                                                        onChange={(checked) => toggleArrayFilter('category_ids', value, checked)}
                                                    />
                                                    <Label className="text-sm/5 text-zinc-700 dark:text-zinc-300">
                                                        {category.name}
                                                    </Label>
                                                </CheckboxField>
                                            );
                                        })}
                                    </CheckboxGroup>
                                </AdminFilterMenuSection>
                                <AdminFilterMenuSection title="Record type" divided contentClassName="space-y-3">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Only one record type can be selected.</p>
                                    <RadioGroup value={filterForm.data.type} onChange={(value: string) => filterForm.setData('type', value)}>
                                        <RadioField className="gap-x-3">
                                            <Radio value="" />
                                            <Label className="text-sm/5 text-zinc-700 dark:text-zinc-300">All record types</Label>
                                        </RadioField>
                                        {types.map((type) => (
                                            <RadioField key={type} className="gap-x-3">
                                                <Radio value={type} />
                                                <Label className="text-sm/5 text-zinc-700 dark:text-zinc-300">{type}</Label>
                                            </RadioField>
                                        ))}
                                    </RadioGroup>
                                </AdminFilterMenuSection>
                                <AdminFilterMenuSection title="Status" divided contentClassName="space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Select one or more statuses.</p>
                                        <button
                                            type="button"
                                            onClick={() => filterForm.setData('statuses', [])}
                                            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                                        >
                                            All statuses
                                        </button>
                                    </div>
                                    <CheckboxGroup className="space-y-2 px-1">
                                        {statuses.map((status) => (
                                            <CheckboxField key={status} className="gap-x-3">
                                                <Checkbox
                                                    checked={filterForm.data.statuses.includes(status)}
                                                    onChange={(checked) => toggleArrayFilter('statuses', status, checked)}
                                                />
                                                <Label className="text-sm/5 text-zinc-700 dark:text-zinc-300">{status}</Label>
                                            </CheckboxField>
                                        ))}
                                    </CheckboxGroup>
                                </AdminFilterMenuSection>
                            </AdminFilterMenu>
                        </AdminFilterBar>
                    )}
                    footer={records ? <AdminPagination paginator={records} {...reloadOptions} /> : null}
                >
                    <TableHead>
                        <TableRow>
                            <TableHeader>Title</TableHeader>
                            <TableHeader>Type</TableHeader>
                            <TableHeader>Category</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>UID</TableHeader>
                            <TableHeader className="text-center">Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(records?.data ?? []).map((record) => (
                            <TableRow key={record.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={resolveProductImage(record.featured_image)}
                                            alt={record.title}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(event) => handleImageFallback(event, DEFAULT_PRODUCT_IMAGE)}
                                            className="h-12 w-12 rounded-[var(--app-surface-radius)] object-cover"
                                        />
                                        <div>
                                            <p className="font-medium">{record.title}</p>
                                            <p className="text-xs text-zinc-500">{record.slug}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="uppercase">{record.type}</TableCell>
                                <TableCell>{record.category?.name ?? 'Unassigned'}</TableCell>
                                <TableCell><AdminStatusBadge status={record.status} /></TableCell>
                                <TableCell className="font-mono text-xs text-zinc-500 sm:text-sm">{record.uid ?? '-'}</TableCell>
                                <TableCell className="text-center">
                                    <AdminTableActions
                                        items={[
                                            { label: 'Edit', href: `/admin/products-services/${record.id}/edit`, kind: 'edit' },
                                            { label: 'Delete', onClick: () => setSelected(record), kind: 'delete' },
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
                title="Delete record"
                description="This permanently removes the selected product or service record and its stored media."
                onConfirm={() => {
                    if (!selected) {
                        return;
                    }

                    const recordId = selected.id;
                    const deleteRecoveryUrl = resolveAdminIndexPageAfterDelete(records);
                    setSelected(null);

                    router.post(`/admin/products-services/${recordId}`, { _method: 'delete' }, {
                        ...reloadOptions,
                        only: ['records', 'filters', 'flash'],
                        onSuccess: () => {
                            if (!deleteRecoveryUrl) {
                                return;
                            }

                            router.get(deleteRecoveryUrl, {}, {
                                ...reloadOptions,
                                only: ['records', 'filters'],
                            });
                        },
                    });
                }}
            />
        </AdminLayout>
    );
}
