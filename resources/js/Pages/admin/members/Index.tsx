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
import type { Member, Paginated } from '@/types/admin';
import { resolvePhoneDisplay } from '@/types/phone';
import { DEFAULT_PERSON_IMAGE, adminAutoSearchVisitOptions, adminIndexVisitOptions, handleImageFallback, resolveAdminIndexPageAfterDelete, resolvePersonImage } from '@/utils/admin';
import { useAutoSubmitFilters } from '@/utils/useAutoSubmitFilters';

interface MemberIndexProps {
    members?: Paginated<Member>;
    filters: { search?: string; status?: string; per_page?: string };
    statuses: string[];
}

export default function Index({ members, filters, statuses }: MemberIndexProps) {
    const filterForm = useForm('admin.members.filters', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        per_page: filters.per_page ?? String(members?.per_page ?? 10),
    });
    const [selected, setSelected] = useState<Member | null>(null);
    const reloadOptions = adminIndexVisitOptions(['members', 'filters']);
    const autoSearchOptions = adminAutoSearchVisitOptions(['members', 'filters']);
    const submitFilters = (options = reloadOptions) => filterForm.get('/admin/members', options);
    useAutoSubmitFilters(filterForm.data, () => submitFilters(autoSearchOptions), 180, filterForm.cancel);
    const activeFilterCount = [filterForm.data.status].filter(Boolean).length;
    const hasActiveSearch = filterForm.data.search.trim() !== '';

    return (
        <AdminLayout
            title="Members"
            header={
                <AdminPageHeader
                    title="Members / Team"
                    description="Maintain public team profiles and assign shared roles."
                    actions={<Button href="/admin/members/create" color="blue">Add member</Button>}
                />
            }
        >
            <AdminCard className="relative flex min-h-0 flex-1 flex-col p-4 lg:p-5">
                <Table
                    scrollable
                    minRows={hasActiveSearch ? 0 : 8}
                    rowCount={members?.data.length ?? 0}
                    virtualColumns={hasActiveSearch ? 0 : 6}
                    toolbar={(
                        <AdminFilterBar embedded>
                            <Input placeholder="Search members" value={filterForm.data.search} onChange={(event) => filterForm.setData('search', event.target.value)} />
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
                    footer={members ? <AdminPagination paginator={members} {...reloadOptions} /> : null}
                >
                    <TableHead>
                        <TableRow>
                            <TableHeader>Member</TableHeader>
                            <TableHeader>Role</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Contact</TableHeader>
                            <TableHeader>UID</TableHeader>
                            <TableHeader className="text-center">Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(members?.data ?? []).map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={resolvePersonImage(member.image)}
                                            alt={member.name}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(event) => handleImageFallback(event, DEFAULT_PERSON_IMAGE)}
                                            className="h-12 w-12 rounded-[var(--app-surface-radius)] object-cover"
                                        />
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-xs text-zinc-500">{member.designation}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{member.role?.name ?? 'Unassigned'}</TableCell>
                                <TableCell><AdminStatusBadge status={member.status} /></TableCell>
                                <TableCell>{member.email || resolvePhoneDisplay(member.phone, member.phone_country) || '-'}</TableCell>
                                <TableCell className="font-mono text-xs text-zinc-500 sm:text-sm">{member.uid ?? '-'}</TableCell>
                                <TableCell className="text-center">
                                    <AdminTableActions
                                        items={[
                                            { label: 'Edit', href: `/admin/members/${member.id}/edit`, kind: 'edit' },
                                            { label: 'Delete', onClick: () => setSelected(member), kind: 'delete' },
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
                title="Delete member"
                description="This permanently removes the public team profile."
                onConfirm={() => {
                    if (!selected) {
                        return;
                    }

                    const memberId = selected.id;
                    const deleteRecoveryUrl = resolveAdminIndexPageAfterDelete(members);
                    setSelected(null);

                    router.post(`/admin/members/${memberId}`, { _method: 'delete' }, {
                        ...reloadOptions,
                        only: ['members', 'filters', 'flash'],
                        onSuccess: () => {
                            if (!deleteRecoveryUrl) {
                                return;
                            }

                            router.get(deleteRecoveryUrl, {}, {
                                ...reloadOptions,
                                only: ['members', 'filters'],
                            });
                        },
                    });
                }}
            />
        </AdminLayout>
    );
}
