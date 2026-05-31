import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { Category, ProductService } from '@/types/admin';
import ProductServiceForm from './Form';

export default function Edit({
    record,
    categories,
    statuses,
    types,
}: {
    record: ProductService;
    categories: Array<Pick<Category, 'id' | 'name'>>;
    statuses: string[];
    types: string[];
}) {
    return (
        <AdminLayout
            title="Edit Product / Service"
            header={
                <AdminPageHeader
                    title={`Edit ${record.title}`}
                    description="Update media, highlights, SEO, and publishing details."
                    backHref="/admin/products-services"
                    sticky
                    actions={<AdminFormActions formId="product-service-form" cancelHref="/admin/products-services" processing={false} submitLabel="Update record" processingLabel="Saving..." />}
                />
            }
        >
            <ProductServiceForm record={record} categories={categories} statuses={statuses} types={types} />
        </AdminLayout>
    );
}
