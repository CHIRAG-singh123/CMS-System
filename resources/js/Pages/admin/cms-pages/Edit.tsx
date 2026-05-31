import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { CmsPage } from '@/types/admin';
import CmsPageForm from './Form';

export default function Edit({ cmsPage, statuses }: { cmsPage: CmsPage; statuses: string[] }) {
    return (
        <AdminLayout
            title="Edit CMS Page"
            header={
                <AdminPageHeader
                    title={`Edit ${cmsPage.title}`}
                    description="Update structured page content, banner media, publishing state, and SEO."
                    backHref="/admin/cms-pages"
                    sticky
                    actions={<AdminFormActions formId="cms-page-form" cancelHref="/admin/cms-pages" processing={false} submitLabel="Save page" processingLabel="Saving..." />}
                />
            }
        >
            <CmsPageForm cmsPage={cmsPage} statuses={statuses} />
        </AdminLayout>
    );
}
