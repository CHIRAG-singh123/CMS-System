import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { AdminAccount, Permission, Role } from '@/types/admin';
import AdminUserForm from './Form';

export default function Edit({
    adminUser,
    statuses,
    roles,
    permissionGroups,
}: {
    adminUser: AdminAccount;
    statuses: string[];
    roles: Array<Pick<Role, 'id' | 'name' | 'slug' | 'permission_ids'>>;
    permissionGroups: Record<string, Permission[]>;
}) {
    return (
        <AdminLayout
            title="Edit User"
            header={
                <AdminPageHeader
                    title={`Edit ${adminUser.name}`}
                    description="Update the backend access account, assigned role, and direct overrides."
                    backHref="/admin/admin-users"
                    sticky
                    actions={<AdminFormActions formId="admin-user-form" cancelHref="/admin/admin-users" processing={false} submitLabel="Update user" processingLabel="Saving..." />}
                />
            }
        >
            <AdminUserForm adminUser={adminUser} statuses={statuses} roles={roles} permissionGroups={permissionGroups} />
        </AdminLayout>
    );
}
