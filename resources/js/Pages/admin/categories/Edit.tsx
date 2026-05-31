import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { Category } from '@/types/admin';
import CategoryForm from './Form';

export default function Edit({ category, statuses }: { category: Category; statuses: string[] }) {
    return (
        <AdminLayout
            title="Edit Category"
            header={
                <AdminPageHeader
                    title={`Edit ${category.name}`}
                    description="Update category metadata, status, and image."
                    backHref="/admin/categories"
                    sticky
                    actions={<AdminFormActions formId="category-form" cancelHref="/admin/categories" processing={false} submitLabel="Update category" processingLabel="Saving..." />}
                />
            }
        >
            <CategoryForm category={category} statuses={statuses} />
        </AdminLayout>
    );
}
