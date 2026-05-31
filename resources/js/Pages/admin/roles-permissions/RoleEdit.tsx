import AdminFormActions from '@/components/admin/AdminFormActions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminLayout from '@/layouts/AdminLayout';
import type { Permission, Role } from '@/types/admin';
import RoleForm from './Form';

export default function RoleEdit({
    role,
    permissionGroups,
    statuses,
}: {
    role: Role;
    permissionGroups: Record<string, Permission[]>;
    statuses: string[];
}) {
    return (
        <AdminLayout
            title="Edit Role"
            header={
                <AdminPageHeader
                    title={`Edit ${role.name}`}
                    description="Update role metadata and adjust access."
                    backHref="/admin/roles-permissions"
                    sticky
                    actions={<AdminFormActions formId="role-form" cancelHref="/admin/roles-permissions" processing={false} submitLabel="Update role" processingLabel="Saving..." />}
                />
            }
        >
            <RoleForm role={role} permissionGroups={permissionGroups} statuses={statuses} />
        </AdminLayout>
    );
}
