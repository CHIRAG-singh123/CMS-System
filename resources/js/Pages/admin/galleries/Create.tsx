import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import GalleryForm from './Form';

export default function Create({ statuses, imageStatuses }: { statuses: string[]; imageStatuses: string[] }) {
    return (
        <AdminLayout
            title="Create Gallery"
            header={
                <AdminPageHeader
                    title="Create gallery"
                    description="Create the gallery and prepare its cover image and published gallery cards in one pass."
                    backHref="/admin/galleries"
                    sticky
                    actions={<AdminFormActions formId="gallery-form" cancelHref="/admin/galleries" processing={false} submitLabel="Create gallery" processingLabel="Saving..." />}
                />
            }
        >
            <GalleryForm statuses={statuses} imageStatuses={imageStatuses} showGalleryUploads />
        </AdminLayout>
    );
}
