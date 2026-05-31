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
import type { Inquiry, Paginated } from '@/types/admin';
import { adminAutoSearchVisitOptions, adminIndexVisitOptions, formatDate, resolveAdminIndexPageAfterDelete } from '@/utils/admin';
import { useAutoSubmitFilters } from '@/utils/useAutoSubmitFilters';

interface InquiryIndexProps {
    inquiries?: Paginated<Inquiry>;
    filters: { search?: string; inquiry_type?: string; status?: string; per_page?: string };
    statuses: string[];
    types: string[];
}

export default function Index({ inquiries, filters, statuses, types }: InquiryIndexProps) {
    const filterForm = useForm('admin.inquiries.filters', {
        search: filters.search ?? '',
        inquiry_type: filters.inquiry_type ?? '',
        status: filters.status ?? '',
        per_page: filters.per_page ?? String(inquiries?.per_page ?? 10),
    });
    const [selected, setSelected] = useState<Inquiry | null>(null);
    const reloadOptions = adminIndexVisitOptions(['inquiries', 'filters']);
    const autoSearchOptions = adminAutoSearchVisitOptions(['inquiries', 'filters']);
    const submitFilters = (options = reloadOptions) => filterForm.get('/admin/inquiries', options);
    useAutoSubmitFilters(filterForm.data, () => submitFilters(autoSearchOptions), 180, filterForm.cancel);
    const activeFilterCount = [filterForm.data.inquiry_type, filterForm.data.status].filter(Boolean).length;
    const hasActiveSearch = filterForm.data.search.trim() !== '';

    return (
        <AdminLayout
            title="Inquiries"
            header={<AdminPageHeader title="Inquiries" description="Review submitted inquiries, update workflow status, and add internal notes." />}
        >
            <AdminCard className="relative flex min-h-0 flex-1 flex-col p-4 lg:p-5">
                <Table
                    scrollable
                    minRows={hasActiveSearch ? 0 : 8}
                    rowCount={inquiries?.data.length ?? 0}
                    virtualColumns={hasActiveSearch ? 0 : 6}
                    toolbar={(
                        <AdminFilterBar embedded>
                            <Input placeholder="Search inquiries" value={filterForm.data.search} onChange={(event) => filterForm.setData('search', event.target.value)} />
                            <AdminFilterMenu activeCount={activeFilterCount}>
                                <AdminFilterMenuSection title="Inquiry type" contentClassName="space-y-3">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose one inquiry type.</p>
                                    <RadioGroup value={filterForm.data.inquiry_type} onChange={(value: string) => filterForm.setData('inquiry_type', value)}>
                                        <RadioField className="gap-x-3">
                                            <Radio value="" />
                                            <Label className="text-sm/5 text-zinc-700 dark:text-zinc-300">All types</Label>
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
                    footer={inquiries ? <AdminPagination paginator={inquiries} {...reloadOptions} /> : null}
                >
                    <TableHead>
                        <TableRow>
                            <TableHeader>Contact</TableHeader>
                            <TableHeader>Subject</TableHeader>
                            <TableHeader>Type</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Date</TableHeader>
                            <TableHeader className="text-center">Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(inquiries?.data ?? []).map((inquiry) => (
                            <TableRow key={inquiry.id}>
                                <TableCell>
                                    <div className="font-medium">{inquiry.name}</div>
                                    <div className="text-xs text-zinc-500">{inquiry.email}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{inquiry.subject || 'No subject'}</div>
                                    {inquiry.product_service ? (
                                        <div className="text-xs text-zinc-500">
                                            {inquiry.product_service.title} ({inquiry.product_service.type})
                                        </div>
                                    ) : null}
                                </TableCell>
                                <TableCell>{inquiry.inquiry_type}</TableCell>
                                <TableCell><AdminStatusBadge status={inquiry.status} /></TableCell>
                                <TableCell>{formatDate(inquiry.created_at)}</TableCell>
                                <TableCell className="text-center">
                                    <AdminTableActions
                                        items={[
                                            { label: 'View', href: `/admin/inquiries/${inquiry.id}`, kind: 'view' },
                                            { label: 'Delete', onClick: () => setSelected(inquiry), kind: 'delete' },
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
                title="Delete inquiry"
                description="This permanently removes the inquiry record."
                onConfirm={() => {
                    if (!selected) {
                        return;
                    }

                    const inquiryId = selected.id;
                    const deleteRecoveryUrl = resolveAdminIndexPageAfterDelete(inquiries);
                    setSelected(null);

                    router.post(`/admin/inquiries/${inquiryId}`, { _method: 'delete' }, {
                        ...reloadOptions,
                        only: ['inquiries', 'filters', 'flash'],
                        onSuccess: () => {
                            if (!deleteRecoveryUrl) {
                                return;
                            }

                            router.get(deleteRecoveryUrl, {}, {
                                ...reloadOptions,
                                only: ['inquiries', 'filters'],
                            });
                        },
                    });
                }}
            />
        </AdminLayout>
    );
}
