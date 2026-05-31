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
import type { AdminAccount, Paginated } from '@/types/admin';
import { DEFAULT_PERSON_IMAGE, adminAutoSearchVisitOptions, adminIndexVisitOptions, formatDate, handleImageFallback, resolveAdminIndexPageAfterDelete, resolvePersonImage } from '@/utils/admin';
import { useAutoSubmitFilters } from '@/utils/useAutoSubmitFilters';

interface AdminUserIndexProps {
    adminUsers?: Paginated<AdminAccount>;
    filters: { search?: string; status?: string; per_page?: string };
    statuses: string[];
}

export default function Index({ adminUsers, filters, statuses }: AdminUserIndexProps) {
    const filterForm = useForm('admin.admin-users.filters', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        per_page: filters.per_page ?? String(adminUsers?.per_page ?? 10),
    });
    const [selected, setSelected] = useState<AdminAccount | null>(null);
    const reloadOptions = adminIndexVisitOptions(['adminUsers', 'filters']);
    const autoSearchOptions = adminAutoSearchVisitOptions(['adminUsers', 'filters']);
    const submitFilters = (options = reloadOptions) => filterForm.get('/admin/admin-users', options);
    useAutoSubmitFilters(filterForm.data, () => submitFilters(autoSearchOptions), 180, filterForm.cancel);
    const activeFilterCount = [filterForm.data.status].filter(Boolean).length;
    const hasActiveSearch = filterForm.data.search.trim() !== '';

    return (
        <AdminLayout
            title="Users"
            header={
                <AdminPageHeader
                    title="Users"
                    description="Manage backend access accounts, assigned roles, and direct permission overrides."
                    actions={<Button href="/admin/admin-users/create" color="blue">Add user</Button>}
                />
            }
        >
            <AdminCard className="relative flex min-h-0 flex-1 flex-col p-4 lg:p-5">
                <Table
                    scrollable
                    minRows={hasActiveSearch ? 0 : 8}
                    rowCount={adminUsers?.data.length ?? 0}
                    virtualColumns={hasActiveSearch ? 0 : 6}
                    toolbar={(
                        <AdminFilterBar embedded>
                            <Input placeholder="Search users" value={filterForm.data.search} onChange={(event) => filterForm.setData('search', event.target.value)} />
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
                    footer={adminUsers ? <AdminPagination paginator={adminUsers} {...reloadOptions} /> : null}
                >
                    <TableHead>
                        <TableRow>
                            <TableHeader>User</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Role</TableHeader>
                            <TableHeader>Direct permissions</TableHeader>
                            <TableHeader>Last login</TableHeader>
                            <TableHeader className="text-center">Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(adminUsers?.data ?? []).map((adminUser) => (
                            <TableRow key={adminUser.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={resolvePersonImage(adminUser.avatar)}
                                            alt={adminUser.name}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(event) => handleImageFallback(event, DEFAULT_PERSON_IMAGE)}
                                            className="h-12 w-12 rounded-[var(--app-surface-radius)] object-cover"
                                        />
                                        <div>
                                            <p className="font-medium">{adminUser.name}</p>
                                            <p className="text-xs text-zinc-500">{adminUser.email}</p>
                                            {adminUser.is_current ? <p className="text-xs text-blue-400">Current session</p> : null}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><AdminStatusBadge status={adminUser.status} /></TableCell>
                                <TableCell>{adminUser.role?.name ?? 'Unassigned'}</TableCell>
                                <TableCell>{adminUser.permissions_count ?? 0}</TableCell>
                                <TableCell>{adminUser.last_login_at ? formatDate(adminUser.last_login_at) : 'Never'}</TableCell>
                                <TableCell className="text-center">
                                    <AdminTableActions
                                        items={[
                                            { label: 'Edit', href: `/admin/admin-users/${adminUser.id}/edit`, kind: 'edit' },
                                            { label: 'Delete', onClick: () => setSelected(adminUser), kind: 'delete' },
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
                title="Delete user"
                description="This permanently removes the backend access account. Last-super-admin and current-session protections still apply."
                onConfirm={() => {
                    if (!selected) {
                        return;
                    }

                    const adminUserId = selected.id;
                    const deleteRecoveryUrl = resolveAdminIndexPageAfterDelete(adminUsers);
                    setSelected(null);

                    router.post(`/admin/admin-users/${adminUserId}`, { _method: 'delete' }, {
                        ...reloadOptions,
                        only: ['adminUsers', 'filters', 'flash'],
                        onSuccess: () => {
                            if (!deleteRecoveryUrl) {
                                return;
                            }

                            router.get(deleteRecoveryUrl, {}, {
                                ...reloadOptions,
                                only: ['adminUsers', 'filters'],
                            });
                        },
                    });
                }}
            />
        </AdminLayout>
    );
}
