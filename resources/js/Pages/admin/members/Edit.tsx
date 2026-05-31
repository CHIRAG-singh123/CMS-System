import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { Member, Role } from '@/types/admin';
import MemberForm from './Form';

export default function Edit({
    member,
    roles,
    statuses,
}: {
    member: Member;
    roles: Array<Pick<Role, 'id' | 'name' | 'slug'>>;
    statuses: string[];
}) {
    return (
        <AdminLayout
            title="Edit Member"
            header={
                <AdminPageHeader
                    title={`Edit ${member.name}`}
                    description="Update the member profile, contact details, and assigned role."
                    backHref="/admin/members"
                    sticky
                    actions={<AdminFormActions formId="member-form" cancelHref="/admin/members" processing={false} submitLabel="Update member" processingLabel="Saving..." />}
                />
            }
        >
            <MemberForm member={member} roles={roles} statuses={statuses} />
        </AdminLayout>
    );
}
