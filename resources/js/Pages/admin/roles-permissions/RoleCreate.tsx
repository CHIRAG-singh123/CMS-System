import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { Permission } from '@/types/admin';
import RoleForm from './Form';

export default function RoleCreate({
    permissionGroups,
    statuses,
}: {
    permissionGroups: Record<string, Permission[]>;
    statuses: string[];
}) {
    return (
        <AdminLayout
            title="Create Role"
            header={
                <AdminPageHeader
                    title="Create role"
                    description="Add a new role and assign permission boundaries."
                    backHref="/admin/roles-permissions"
                    sticky
                    actions={<AdminFormActions formId="role-form" cancelHref="/admin/roles-permissions" processing={false} submitLabel="Create role" processingLabel="Saving..." />}
                />
            }
        >
            <RoleForm permissionGroups={permissionGroups} statuses={statuses} />
        </AdminLayout>
    );
}
