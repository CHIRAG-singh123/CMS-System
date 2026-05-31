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
import type { Paginated, Testimonial } from '@/types/admin';
import { DEFAULT_PERSON_IMAGE, adminAutoSearchVisitOptions, adminIndexVisitOptions, handleImageFallback, resolveAdminIndexPageAfterDelete, resolvePersonImage } from '@/utils/admin';
import { useAutoSubmitFilters } from '@/utils/useAutoSubmitFilters';

interface TestimonialIndexProps {
    testimonials?: Paginated<Testimonial>;
    filters: { search?: string; status?: string; per_page?: string };
    statuses: string[];
}

export default function Index({ testimonials, filters, statuses }: TestimonialIndexProps) {
    const filterForm = useForm('admin.testimonials.filters', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        per_page: filters.per_page ?? String(testimonials?.per_page ?? 10),
    });
    const [selected, setSelected] = useState<Testimonial | null>(null);
    const reloadOptions = adminIndexVisitOptions(['testimonials', 'filters']);
    const autoSearchOptions = adminAutoSearchVisitOptions(['testimonials', 'filters']);
    const submitFilters = (options = reloadOptions) => filterForm.get('/admin/testimonials', options);
    useAutoSubmitFilters(filterForm.data, () => submitFilters(autoSearchOptions), 180, filterForm.cancel);
    const activeFilterCount = [filterForm.data.status].filter(Boolean).length;
    const hasActiveSearch = filterForm.data.search.trim() !== '';

    return (
        <AdminLayout
            title="Testimonials"
            header={
                <AdminPageHeader
                    title="Testimonials"
                    description="Curate published client feedback with ratings and media."
                    actions={<Button href="/admin/testimonials/create" color="blue">Add testimonial</Button>}
                />
            }
        >
            <AdminCard className="relative flex min-h-0 flex-1 flex-col p-4 lg:p-5">
                <Table
                    scrollable
                    minRows={hasActiveSearch ? 0 : 8}
                    rowCount={testimonials?.data.length ?? 0}
                    virtualColumns={hasActiveSearch ? 0 : 5}
                    toolbar={(
                        <AdminFilterBar embedded>
                            <Input placeholder="Search testimonials" value={filterForm.data.search} onChange={(event) => filterForm.setData('search', event.target.value)} />
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
                    footer={testimonials ? <AdminPagination paginator={testimonials} {...reloadOptions} /> : null}
                >
                    <TableHead>
                        <TableRow>
                            <TableHeader>Client</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Rating</TableHeader>
                            <TableHeader>UID</TableHeader>
                            <TableHeader className="text-center">Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(testimonials?.data ?? []).map((testimonial) => (
                            <TableRow key={testimonial.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={resolvePersonImage(testimonial.image)}
                                            alt={testimonial.client_name}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(event) => handleImageFallback(event, DEFAULT_PERSON_IMAGE)}
                                            className="h-12 w-12 rounded-[var(--app-surface-radius)] object-cover"
                                        />
                                        <div>
                                            <p className="font-medium">{testimonial.client_name}</p>
                                            <p className="text-xs text-zinc-500">{testimonial.company_name}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><AdminStatusBadge status={testimonial.status} /></TableCell>
                                <TableCell>{testimonial.rating} / 5</TableCell>
                                <TableCell className="font-mono text-xs text-zinc-500 sm:text-sm">{testimonial.uid ?? '-'}</TableCell>
                                <TableCell className="text-center">
                                    <AdminTableActions
                                        items={[
                                            { label: 'Edit', href: `/admin/testimonials/${testimonial.id}/edit`, kind: 'edit' },
                                            { label: 'Delete', onClick: () => setSelected(testimonial), kind: 'delete' },
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
                title="Delete testimonial"
                description="This permanently removes the testimonial entry."
                onConfirm={() => {
                    if (!selected) {
                        return;
                    }

                    const testimonialId = selected.id;
                    const deleteRecoveryUrl = resolveAdminIndexPageAfterDelete(testimonials);
                    setSelected(null);

                    router.post(`/admin/testimonials/${testimonialId}`, { _method: 'delete' }, {
                        ...reloadOptions,
                        only: ['testimonials', 'filters', 'flash'],
                        onSuccess: () => {
                            if (!deleteRecoveryUrl) {
                                return;
                            }

                            router.get(deleteRecoveryUrl, {}, {
                                ...reloadOptions,
                                only: ['testimonials', 'filters'],
                            });
                        },
                    });
                }}
            />
        </AdminLayout>
    );
}
