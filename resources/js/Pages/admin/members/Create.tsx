import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { Role } from '@/types/admin';
import MemberForm from './Form';

export default function Create({
    roles,
    statuses,
}: {
    roles: Array<Pick<Role, 'id' | 'name' | 'slug'>>;
    statuses: string[];
}) {
    return (
        <AdminLayout
            title="Create Member"
            header={
                <AdminPageHeader
                    title="Create member"
                    description="Add a new team or member profile."
                    backHref="/admin/members"
                    sticky
                    actions={<AdminFormActions formId="member-form" cancelHref="/admin/members" processing={false} submitLabel="Create member" processingLabel="Saving..." />}
                />
            }
        >
            <MemberForm roles={roles} statuses={statuses} />
        </AdminLayout>
    );
}
