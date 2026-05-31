import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import CategoryForm from './Form';

export default function Create({ statuses }: { statuses: string[] }) {
    return (
        <AdminLayout
            title="Create Category"
            header={
                <AdminPageHeader
                    title="Create category"
                    description="Add a reusable category for products or services."
                    backHref="/admin/categories"
                    sticky
                    actions={<AdminFormActions formId="category-form" cancelHref="/admin/categories" processing={false} submitLabel="Create category" processingLabel="Saving..." />}
                />
            }
        >
            <CategoryForm statuses={statuses} />
        </AdminLayout>
    );
}
