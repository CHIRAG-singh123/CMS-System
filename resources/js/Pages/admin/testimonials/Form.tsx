import { useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminCard from '@/components/admin/AdminCard';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
import FormField from '@/components/admin/FormField';
import type { Testimonial } from '@/types/admin';
import { DEFAULT_PERSON_IMAGE } from '@/utils/admin';

interface TestimonialFormProps {
    testimonial?: Testimonial;
    statuses: string[];
}

export default function TestimonialForm({ testimonial, statuses }: TestimonialFormProps) {
    const form = useForm({
        client_name: testimonial?.client_name ?? '',
        client_designation: testimonial?.client_designation ?? '',
        company_name: testimonial?.company_name ?? '',
        rating: String(testimonial?.rating ?? 5),
        message: testimonial?.message ?? '',
        status: testimonial?.status ?? statuses[0],
        image: null as File | null,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (testimonial) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/testimonials/${testimonial.id}`, {
                forceFormData: true,
            });
            return;
        }

        form.post('/admin/testimonials', { forceFormData: true });
    };

    return (
        <form id="testimonial-form" className="space-y-6 pb-6" onSubmit={submit}>
            <AdminCard title="Client feedback" className="relative z-20">
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField label="Client name" error={form.errors.client_name}>
                        <Input value={form.data.client_name} onChange={(event) => form.setData('client_name', event.target.value)} />
                    </FormField>
                    <FormField label="Client designation" error={form.errors.client_designation}>
                        <Input value={form.data.client_designation} onChange={(event) => form.setData('client_designation', event.target.value)} />
                    </FormField>
                    <FormField label="Company name" error={form.errors.company_name}>
                        <Input value={form.data.company_name} onChange={(event) => form.setData('company_name', event.target.value)} />
                    </FormField>
                    <FormField label="Rating" error={form.errors.rating}>
                        <Select value={form.data.rating} onChange={(event) => form.setData('rating', event.target.value)}>
                            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                        </Select>
                    </FormField>
                    <div className="md:col-span-2">
                        <FormField label="Message" error={form.errors.message}>
                            <Textarea rows={5} value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} />
                        </FormField>
                    </div>
                    <FormField label="Status" error={form.errors.status}>
                        <Select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </Select>
                    </FormField>
                    {testimonial ? (
                        <FormField label="UID">
                            <Input value={testimonial.uid ?? ''} readOnly disabled />
                        </FormField>
                    ) : null}
                </div>
            </AdminCard>

            <AdminCard title="Client image" className="relative z-10">
                <AdminImageUpload
                    label="Testimonial image"
                    file={form.data.image}
                    existing={testimonial?.image}
                    fallbackSrc={DEFAULT_PERSON_IMAGE}
                    onChange={(file) => form.setData('image', file)}
                    error={form.errors.image}
                />
            </AdminCard>

        </form>
    );
}
