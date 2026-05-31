import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { Permission, Role } from '@/types/admin';
import AdminUserForm from './Form';

export default function Create({
    statuses,
    roles,
    permissionGroups,
}: {
    statuses: string[];
    roles: Array<Pick<Role, 'id' | 'name' | 'slug' | 'permission_ids'>>;
    permissionGroups: Record<string, Permission[]>;
}) {
    return (
        <AdminLayout
            title="Create User"
            header={
                <AdminPageHeader
                    title="Create user"
                    description="Add a new backend access account with one role and optional direct overrides."
                    backHref="/admin/admin-users"
                    sticky
                    actions={<AdminFormActions formId="admin-user-form" cancelHref="/admin/admin-users" processing={false} submitLabel="Create user" processingLabel="Saving..." />}
                />
            }
        >
            <AdminUserForm statuses={statuses} roles={roles} permissionGroups={permissionGroups} />
        </AdminLayout>
    );
}
