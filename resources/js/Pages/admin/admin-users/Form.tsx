import { Deferred, useForm } from '@inertiajs/react';
import PhoneInput from '@/components/phone/PhoneInput';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminCard from '@/components/admin/AdminCard';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
import FormField from '@/components/admin/FormField';
import PermissionMatrix from '@/components/admin/PermissionMatrix';
import { isPhoneCountryIso2, parsePhoneValue, type PhoneCountryIso2 } from '@/types/phone';
import type { AdminAccount, Permission, Role } from '@/types/admin';
import { DEFAULT_PERSON_IMAGE } from '@/utils/admin';

type AdminAccountFormRecord = AdminAccount & {
    phone_country?: string | null;
};

interface AdminUserFormProps {
    adminUser?: AdminAccountFormRecord;
    statuses: string[];
    roles: Array<Pick<Role, 'id' | 'name' | 'slug' | 'permission_ids'>>;
    permissionGroups?: Record<string, Permission[]>;
}

function resolvePhoneCountry(country: string | null | undefined, phone: string | null | undefined): PhoneCountryIso2 {
    return isPhoneCountryIso2(country ?? '') ? country : parsePhoneValue(phone).countryIso2;
}

export default function AdminUserForm({ adminUser, statuses, roles, permissionGroups }: AdminUserFormProps) {
    const form = useForm({
        name: adminUser?.name ?? '',
        email: adminUser?.email ?? '',
        password: '',
        password_confirmation: '',
        phone: adminUser?.phone ?? '',
        phone_country: resolvePhoneCountry(adminUser?.phone_country, adminUser?.phone),
        job_title: adminUser?.job_title ?? '',
        timezone: adminUser?.timezone ?? '',
        bio: adminUser?.bio ?? '',
        theme_preference: adminUser?.theme_preference ?? 'dark',
        status: adminUser?.status ?? statuses[0],
        role_id: adminUser?.role?.id ? String(adminUser.role.id) : '',
        permission_ids: adminUser?.permission_ids ?? [],
        avatar: null as File | null,
    });

    const selectedRole = roles.find((role) => String(role.id) === form.data.role_id);
    const isSuperAdminRole = selectedRole?.slug === 'super-admin';
    const inheritedPermissionIds = selectedRole?.permission_ids ?? [];
    const selectedPermissionIds = Array.from(new Set([...inheritedPermissionIds, ...form.data.permission_ids]));

    const togglePermission = (id: number, checked: boolean) => {
        if (isSuperAdminRole || inheritedPermissionIds.includes(id)) {
            return;
        }

        form.setData(
            'permission_ids',
            checked ? [...form.data.permission_ids, id] : form.data.permission_ids.filter((item) => item !== id),
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (adminUser) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/admin-users/${adminUser.id}`, {
                forceFormData: true,
            });
            return;
        }

        form.post('/admin/admin-users', { forceFormData: true });
    };

    return (
        <form id="admin-user-form" className="space-y-6 pb-6" onSubmit={submit}>
            <AdminCard title="Account details" description="Manage the authenticated admin identity and account metadata." className="relative z-30">
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Name" error={form.errors.name}>
                        <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                    </FormField>
                    <FormField label="Email" error={form.errors.email}>
                        <Input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
                    </FormField>
                    <FormField label={adminUser ? 'New password' : 'Password'} error={form.errors.password}>
                        <Input type="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} />
                    </FormField>
                    <FormField label={adminUser ? 'Confirm new password' : 'Confirm password'} error={form.errors.password_confirmation}>
                        <Input type="password" value={form.data.password_confirmation} onChange={(event) => form.setData('password_confirmation', event.target.value)} />
                    </FormField>
                    <FormField label="Phone" error={form.errors.phone || form.errors.phone_country}>
                        <PhoneInput
                            id="phone"
                            autoComplete="tel"
                            value={form.data.phone}
                            country={form.data.phone_country}
                            onChange={(value) => form.setData('phone', value)}
                            onCountryChange={(country) => form.setData('phone_country', country)}
                        />
                    </FormField>
                    <FormField label="Job title" error={form.errors.job_title}>
                        <Input value={form.data.job_title} onChange={(event) => form.setData('job_title', event.target.value)} />
                    </FormField>
                    <FormField label="Timezone" error={form.errors.timezone}>
                        <Input value={form.data.timezone} onChange={(event) => form.setData('timezone', event.target.value)} />
                    </FormField>
                    <FormField label="Theme preference" error={form.errors.theme_preference}>
                        <Select value={form.data.theme_preference} onChange={(event) => form.setData('theme_preference', event.target.value as 'light' | 'dark')}>
                            <option value="dark">dark</option>
                            <option value="light">light</option>
                        </Select>
                    </FormField>
                    <FormField label="Status" error={form.errors.status}>
                        <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                            {statuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Select>
                    </FormField>
                    <div className="md:col-span-2">
                        <FormField label="Bio" error={form.errors.bio}>
                            <Textarea rows={4} value={form.data.bio} onChange={(event) => form.setData('bio', event.target.value)} />
                        </FormField>
                    </div>
                </div>
            </AdminCard>

            <AdminCard
                title="Access assignment"
                description={isSuperAdminRole
                    ? 'Super Admin retains full access through Gate bypass, so direct permission overrides are ignored.'
                    : 'Assign one primary role and optional direct permission overrides.'}
                className="relative z-20"
            >
                <div className="mb-6">
                    <FormField label="Primary role" error={form.errors.role_id}>
                        <Select value={form.data.role_id} onChange={(event) => form.setData('role_id', event.target.value)}>
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </Select>
                    </FormField>
                </div>

                {isSuperAdminRole ? null : (
                    <Deferred
                        data="permissionGroups"
                        fallback={<div className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-zinc-50/90 p-4 text-sm text-zinc-500 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/45 dark:text-zinc-300 dark:ring-white/5">Loading permissions...</div>}
                    >
                        {() => permissionGroups ? (
                            <PermissionMatrix
                                groups={permissionGroups}
                                selected={selectedPermissionIds}
                                locked={inheritedPermissionIds}
                                onToggle={togglePermission}
                            />
                        ) : null}
                    </Deferred>
                )}
                {form.errors.permission_ids ? <p className="mt-3 text-sm text-red-600">{form.errors.permission_ids}</p> : null}
            </AdminCard>

            <AdminCard title="Avatar" className="relative z-10">
                <AdminImageUpload
                    label="Admin avatar"
                    file={form.data.avatar}
                    existing={adminUser?.avatar}
                    fallbackSrc={DEFAULT_PERSON_IMAGE}
                    onChange={(file) => form.setData('avatar', file)}
                    error={form.errors.avatar}
                />
            </AdminCard>

        </form>
    );
}
