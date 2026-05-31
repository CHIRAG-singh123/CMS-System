import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { Testimonial } from '@/types/admin';
import TestimonialForm from './Form';

export default function Edit({ testimonial, statuses }: { testimonial: Testimonial; statuses: string[] }) {
    return (
        <AdminLayout
            title="Edit Testimonial"
            header={
                <AdminPageHeader
                    title={`Edit ${testimonial.client_name}`}
                    description="Update testimonial content, image, or publishing state."
                    backHref="/admin/testimonials"
                    sticky
                    actions={<AdminFormActions formId="testimonial-form" cancelHref="/admin/testimonials" processing={false} submitLabel="Update testimonial" processingLabel="Saving..." />}
                />
            }
        >
            <TestimonialForm testimonial={testimonial} statuses={statuses} />
        </AdminLayout>
    );
}
