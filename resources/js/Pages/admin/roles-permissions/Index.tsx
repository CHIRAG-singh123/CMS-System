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
import type { Paginated, Role } from '@/types/admin';
import { adminAutoSearchVisitOptions, adminIndexVisitOptions, resolveAdminIndexPageAfterDelete } from '@/utils/admin';
import { useAutoSubmitFilters } from '@/utils/useAutoSubmitFilters';

export default function Index({
    roles,
    filters,
}: {
    roles?: Paginated<Role>;
    filters: { search?: string; status?: string; per_page?: string };
}) {
    const filterForm = useForm('admin.roles.filters', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        per_page: filters.per_page ?? String(roles?.per_page ?? 10),
    });
    const [selected, setSelected] = useState<Role | null>(null);
    const reloadOptions = adminIndexVisitOptions(['roles', 'filters']);
    const autoSearchOptions = adminAutoSearchVisitOptions(['roles', 'filters']);
    const submitFilters = (options = reloadOptions) => filterForm.get('/admin/roles-permissions', options);
    useAutoSubmitFilters(filterForm.data, () => submitFilters(autoSearchOptions), 180, filterForm.cancel);
    const activeFilterCount = [filterForm.data.status].filter(Boolean).length;
    const hasActiveSearch = filterForm.data.search.trim() !== '';

    return (
        <AdminLayout
            title="Roles & Permissions"
            header={
                <AdminPageHeader
                    title="Roles & Permissions"
                    description="Control backend access boundaries for admin accounts and reusable panel modules."
                    actions={<Button href="/admin/roles-permissions/roles/create" color="blue">Add role</Button>}
                />
            }
        >
            <AdminCard className="relative flex min-h-0 flex-1 flex-col p-4 lg:p-5">
                <Table
                    scrollable
                    minRows={hasActiveSearch ? 0 : 8}
                    rowCount={roles?.data.length ?? 0}
                    virtualColumns={hasActiveSearch ? 0 : 5}
                    toolbar={(
                        <AdminFilterBar embedded>
                            <Input placeholder="Search roles" value={filterForm.data.search} onChange={(event) => filterForm.setData('search', event.target.value)} />
                            <AdminFilterMenu activeCount={activeFilterCount}>
                                <AdminFilterMenuSection title="Status" contentClassName="space-y-3">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose one status.</p>
                                    <RadioGroup value={filterForm.data.status} onChange={(value: string) => filterForm.setData('status', value)}>
                                        <RadioField className="gap-x-3">
                                            <Radio value="" />
                                            <Label className="text-sm/5 text-zinc-700 dark:text-zinc-300">All statuses</Label>
                                        </RadioField>
                                        <RadioField className="gap-x-3">
                                            <Radio value="active" />
                                            <Label className="text-sm/5 text-zinc-700 dark:text-zinc-300">active</Label>
                                        </RadioField>
                                        <RadioField className="gap-x-3">
                                            <Radio value="inactive" />
                                            <Label className="text-sm/5 text-zinc-700 dark:text-zinc-300">inactive</Label>
                                        </RadioField>
                                    </RadioGroup>
                                </AdminFilterMenuSection>
                            </AdminFilterMenu>
                        </AdminFilterBar>
                    )}
                    footer={roles ? <AdminPagination paginator={roles} {...reloadOptions} /> : null}
                >
                    <TableHead>
                        <TableRow>
                            <TableHeader>Role</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Admins</TableHeader>
                            <TableHeader>Permissions</TableHeader>
                            <TableHeader className="text-center">Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(roles?.data ?? []).map((role) => (
                            <TableRow key={role.id}>
                                <TableCell>
                                    <div className="font-medium">{role.name}</div>
                                    <div className="text-xs text-zinc-500">{role.slug}</div>
                                </TableCell>
                                <TableCell><AdminStatusBadge status={role.status} /></TableCell>
                                <TableCell>{role.admins_count ?? 0}</TableCell>
                                <TableCell>{role.permissions_count ?? 0}</TableCell>
                                <TableCell className="text-center">
                                    <AdminTableActions
                                        items={[
                                            { label: 'Edit', href: `/admin/roles-permissions/roles/${role.id}/edit`, kind: 'edit' },
                                            ...(role.slug !== 'super-admin' ? [{ label: 'Delete', onClick: () => setSelected(role), kind: 'delete' as const }] : []),
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
                title="Delete role"
                description="This permanently removes the role. Reassign any linked admin users first."
                onConfirm={() => {
                    if (!selected) {
                        return;
                    }

                    const roleId = selected.id;
                    const deleteRecoveryUrl = resolveAdminIndexPageAfterDelete(roles);
                    setSelected(null);

                    router.post(`/admin/roles-permissions/roles/${roleId}`, { _method: 'delete' }, {
                        ...reloadOptions,
                        only: ['roles', 'filters', 'flash'],
                        onSuccess: () => {
                            if (!deleteRecoveryUrl) {
                                return;
                            }

                            router.get(deleteRecoveryUrl, {}, {
                                ...reloadOptions,
                                only: ['roles', 'filters'],
                            });
                        },
                    });
                }}
            />
        </AdminLayout>
    );
}
