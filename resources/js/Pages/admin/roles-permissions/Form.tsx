import { Deferred, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminCard from '@/components/admin/AdminCard';
import FormField from '@/components/admin/FormField';
import PermissionMatrix from '@/components/admin/PermissionMatrix';
import type { Permission, Role } from '@/types/admin';
import { normalizeSlug } from '@/utils/slug';
import { useAutoSlug } from '@/utils/useAutoSlug';

interface RoleFormProps {
    role?: Role;
    permissionGroups?: Record<string, Permission[]>;
    statuses: string[];
}

export default function RoleForm({ role, permissionGroups, statuses }: RoleFormProps) {
    const isSuperAdmin = role?.slug === 'super-admin';

    const form = useForm({
        name: role?.name ?? '',
        slug: role?.slug ?? '',
        description: role?.description ?? '',
        status: role?.status ?? statuses[0],
        permission_ids: role?.permissions?.map((permission) => permission.id) ?? [],
    });

    useAutoSlug({
        source: form.data.name,
        slug: form.data.slug,
        setSlug: (value) => form.setData('slug', value),
    });

    const togglePermission = (id: number, checked: boolean) => {
        if (isSuperAdmin) {
            return;
        }

        form.setData(
            'permission_ids',
            checked ? [...form.data.permission_ids, id] : form.data.permission_ids.filter((item) => item !== id),
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (role) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/roles-permissions/roles/${role.id}`);
            return;
        }

        form.post('/admin/roles-permissions/roles');
    };

    return (
        <form id="role-form" className="space-y-6 pb-6" onSubmit={submit}>
            <AdminCard title="Role details" className="relative z-20">
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Role name" error={form.errors.name}>
                        <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                    </FormField>
                    <FormField label="Slug" error={form.errors.slug}>
                        <Input value={form.data.slug} onChange={(event) => form.setData('slug', normalizeSlug(event.target.value))} />
                    </FormField>
                    <div className="md:col-span-2">
                        <FormField label="Description" error={form.errors.description}>
                            <Textarea rows={4} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                        </FormField>
                    </div>
                    <FormField label="Status" error={form.errors.status}>
                        <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)} disabled={isSuperAdmin}>
                            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </Select>
                    </FormField>
                </div>
            </AdminCard>

            <AdminCard
                title="Permission matrix"
                description={isSuperAdmin ? 'Super Admin always retains all permissions.' : 'Assign module permissions for this role.'}
                className="relative z-10"
            >
                {isSuperAdmin ? null : (
                    <Deferred
                        data="permissionGroups"
                        fallback={<div className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-zinc-50/90 p-4 text-sm text-zinc-500 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/45 dark:text-zinc-300 dark:ring-white/5">Loading permissions...</div>}
                    >
                        {() => permissionGroups ? <PermissionMatrix groups={permissionGroups} selected={form.data.permission_ids} onToggle={togglePermission} /> : null}
                    </Deferred>
                )}
                {form.errors.permission_ids ? <p className="mt-3 text-sm text-red-600">{form.errors.permission_ids}</p> : null}
            </AdminCard>

        </form>
    );
}
