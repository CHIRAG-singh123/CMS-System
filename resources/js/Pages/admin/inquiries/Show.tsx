import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminCard from '@/components/admin/AdminCard';
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import FormField from '@/components/admin/FormField';
import AdminLayout from '@/layouts/AdminLayout';
import type { Inquiry } from '@/types/admin';
import { resolvePhoneDisplay } from '@/types/phone';
import { formatDate } from '@/utils/admin';

export default function Show({ inquiry, statuses }: { inquiry: Inquiry; statuses: string[] }) {
    const statusForm = useForm({ status: inquiry.status });
    const noteForm = useForm({ admin_note: inquiry.admin_note ?? '' });
    const [openDelete, setOpenDelete] = useState(false);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    return (
        <AdminLayout
            title="Inquiry Details"
            header={(
                <AdminPageHeader
                    title={`Inquiry from ${inquiry.name}`}
                    description="Review the submitted details and update internal handling state."
                    backHref="/admin/inquiries"
                    backLabel="Back to inquiries"
                />
            )}
        >
            <div className="grid gap-6 xl:grid-cols-3">
                <AdminCard title="Submitted details" className="xl:col-span-2">
                    <DescriptionList>
                        <DescriptionTerm>Name</DescriptionTerm>
                        <DescriptionDetails className="font-medium">{inquiry.name}</DescriptionDetails>
                        <DescriptionTerm>Email</DescriptionTerm>
                        <DescriptionDetails className="font-medium">{inquiry.email}</DescriptionDetails>
                        <DescriptionTerm>Phone</DescriptionTerm>
                        <DescriptionDetails>{resolvePhoneDisplay(inquiry.phone, inquiry.phone_country) || 'N/A'}</DescriptionDetails>
                        <DescriptionTerm>Type</DescriptionTerm>
                        <DescriptionDetails>{inquiry.inquiry_type}</DescriptionDetails>
                        <DescriptionTerm>Subject</DescriptionTerm>
                        <DescriptionDetails className="font-medium">{inquiry.subject || 'N/A'}</DescriptionDetails>
                        <DescriptionTerm>Linked product / service</DescriptionTerm>
                        <DescriptionDetails>
                            {inquiry.product_service ? `${inquiry.product_service.title} (${inquiry.product_service.type})` : 'N/A'}
                        </DescriptionDetails>
                        <DescriptionTerm>Created</DescriptionTerm>
                        <DescriptionDetails>{formatDate(inquiry.created_at)}</DescriptionDetails>
                        <DescriptionTerm>IP address</DescriptionTerm>
                        <DescriptionDetails>{inquiry.ip_address || 'N/A'}</DescriptionDetails>
                        <DescriptionTerm>User agent</DescriptionTerm>
                        <DescriptionDetails>{inquiry.user_agent || 'N/A'}</DescriptionDetails>
                        <DescriptionTerm>Message</DescriptionTerm>
                        <DescriptionDetails>
                            <div className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">
                                {inquiry.message}
                            </div>
                        </DescriptionDetails>
                    </DescriptionList>
                </AdminCard>

                <div className="space-y-6">
                    <AdminCard title="Status" className="relative z-30">
                        <div className="mb-4"><AdminStatusBadge status={inquiry.status} /></div>
                        <form
                            className="space-y-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                statusForm.transform((data) => ({ ...data, _method: 'put' }));
                                statusForm.post(`/admin/inquiries/${inquiry.id}/status`);
                            }}
                        >
                            <FormField label="Workflow status" error={statusForm.errors.status}>
                                <Select value={statusForm.data.status} onChange={(event) => statusForm.setData('status', event.target.value)}>
                                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                </Select>
                            </FormField>
                            <Button type="submit" color="blue" disabled={statusForm.processing}>Update status</Button>
                        </form>
                    </AdminCard>

                    <AdminCard title="Admin note" className="relative z-20">
                        <form
                            className="space-y-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                noteForm.transform((data) => ({ ...data, _method: 'put' }));
                                noteForm.post(`/admin/inquiries/${inquiry.id}/note`);
                            }}
                        >
                            <FormField label="Internal note" error={noteForm.errors.admin_note}>
                                <Textarea rows={6} value={noteForm.data.admin_note} onChange={(event) => noteForm.setData('admin_note', event.target.value)} />
                            </FormField>
                            <Button type="submit" color="blue" disabled={noteForm.processing}>Save note</Button>
                        </form>
                    </AdminCard>

                    <AdminCard title="Danger zone" className="relative z-10">
                        <Button color="blue" onClick={() => setOpenDelete(true)}>Delete inquiry</Button>
                    </AdminCard>
                </div>
            </div>

            <AdminDeleteDialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                title="Delete inquiry"
                description="This permanently removes the inquiry record."
                onConfirm={() => router.post(`/admin/inquiries/${inquiry.id}`, { _method: 'delete' }, {
                    async: true,
                    preserveScroll: true,
                    preserveState: false,
                    replace: true,
                    showProgress: true,
                    onBefore: () => {
                        setDeleteProcessing(true);
                        return true;
                    },
                    onFinish: () => setDeleteProcessing(false),
                    onSuccess: () => setOpenDelete(false),
                })}
                processing={deleteProcessing}
            />
        </AdminLayout>
    );
}
