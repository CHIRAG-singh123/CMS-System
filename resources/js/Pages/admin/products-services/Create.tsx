import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { Category } from '@/types/admin';
import ProductServiceForm from './Form';

export default function Create({
    categories,
    statuses,
    types,
}: {
    categories: Array<Pick<Category, 'id' | 'name'>>;
    statuses: string[];
    types: string[];
}) {
    return (
        <AdminLayout
            title="Create Product / Service"
            header={
                <AdminPageHeader
                    title="Create product / service"
                    description="Add a new catalog record with structured content and media."
                    backHref="/admin/products-services"
                    sticky
                    actions={<AdminFormActions formId="product-service-form" cancelHref="/admin/products-services" processing={false} submitLabel="Create record" processingLabel="Saving..." />}
                />
            }
        >
            <ProductServiceForm categories={categories} statuses={statuses} types={types} />
        </AdminLayout>
    );
}
