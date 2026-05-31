import { useForm } from '@inertiajs/react';
import PhoneInput from '@/components/phone/PhoneInput';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminCard from '@/components/admin/AdminCard';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
import FormField from '@/components/admin/FormField';
import { isPhoneCountryIso2, parsePhoneValue, type PhoneCountryIso2 } from '@/types/phone';
import type { Member, Role } from '@/types/admin';
import { DEFAULT_PERSON_IMAGE } from '@/utils/admin';

type MemberFormRecord = Member & {
    phone_country?: string | null;
};

interface MemberFormProps {
    member?: MemberFormRecord;
    roles: Array<Pick<Role, 'id' | 'name' | 'slug'>>;
    statuses: string[];
}

function resolvePhoneCountry(country: string | null | undefined, phone: string | null | undefined): PhoneCountryIso2 {
    return isPhoneCountryIso2(country ?? '') ? country : parsePhoneValue(phone).countryIso2;
}

export default function MemberForm({ member, roles, statuses }: MemberFormProps) {
    const form = useForm({
        name: member?.name ?? '',
        designation: member?.designation ?? '',
        short_bio: member?.short_bio ?? '',
        email: member?.email ?? '',
        phone: member?.phone ?? '',
        phone_country: resolvePhoneCountry(member?.phone_country, member?.phone),
        linkedin: member?.linkedin ?? '',
        twitter: member?.twitter ?? '',
        instagram: member?.instagram ?? '',
        role_id: member?.role?.id ? String(member.role.id) : member?.role_id ? String(member.role_id) : '',
        status: member?.status ?? statuses[0],
        image: null as File | null,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (member) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/members/${member.id}`, {
                forceFormData: true,
            });
            return;
        }

        form.post('/admin/members', { forceFormData: true });
    };

    return (
        <form id="member-form" className="space-y-6 pb-6" onSubmit={submit}>
            <AdminCard title="Member profile" description="Maintain public team-facing details and contact information." className="relative z-20">
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Name" error={form.errors.name}>
                        <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                    </FormField>
                    <FormField label="Designation" error={form.errors.designation}>
                        <Input value={form.data.designation} onChange={(event) => form.setData('designation', event.target.value)} />
                    </FormField>
                    <div className="md:col-span-2">
                        <FormField label="Short bio" error={form.errors.short_bio}>
                            <Textarea rows={4} value={form.data.short_bio} onChange={(event) => form.setData('short_bio', event.target.value)} />
                        </FormField>
                    </div>
                    <FormField label="Email" error={form.errors.email}>
                        <Input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
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
                    <FormField label="LinkedIn" error={form.errors.linkedin}>
                        <Input type="url" value={form.data.linkedin} onChange={(event) => form.setData('linkedin', event.target.value)} />
                    </FormField>
                    <FormField label="Twitter" error={form.errors.twitter}>
                        <Input type="url" value={form.data.twitter} onChange={(event) => form.setData('twitter', event.target.value)} />
                    </FormField>
                    <FormField label="Instagram" error={form.errors.instagram}>
                        <Input type="url" value={form.data.instagram} onChange={(event) => form.setData('instagram', event.target.value)} />
                    </FormField>
                    <FormField label="Role" error={form.errors.role_id}>
                        <Select value={form.data.role_id} onChange={(event) => form.setData('role_id', event.target.value)}>
                            <option value="">Select role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </Select>
                    </FormField>
                    <FormField label="Status" error={form.errors.status}>
                        <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                            {statuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Select>
                    </FormField>
                    {member ? (
                        <FormField label="UID">
                            <Input value={member.uid ?? ''} readOnly disabled />
                        </FormField>
                    ) : null}
                </div>
            </AdminCard>

            <AdminCard title="Profile image" className="relative z-10">
                <AdminImageUpload
                    label="Member image"
                    file={form.data.image}
                    existing={member?.image}
                    fallbackSrc={DEFAULT_PERSON_IMAGE}
                    onChange={(file) => form.setData('image', file)}
                    error={form.errors.image}
                />
            </AdminCard>

        </form>
    );
}
