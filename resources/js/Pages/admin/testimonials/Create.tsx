import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import TestimonialForm from './Form';

export default function Create({ statuses }: { statuses: string[] }) {
    return (
        <AdminLayout
            title="Create Testimonial"
            header={
                <AdminPageHeader
                    title="Create testimonial"
                    description="Add a new testimonial record for later publishing."
                    backHref="/admin/testimonials"
                    sticky
                    actions={<AdminFormActions formId="testimonial-form" cancelHref="/admin/testimonials" processing={false} submitLabel="Create testimonial" processingLabel="Saving..." />}
                />
            }
        >
            <TestimonialForm statuses={statuses} />
        </AdminLayout>
    );
}
