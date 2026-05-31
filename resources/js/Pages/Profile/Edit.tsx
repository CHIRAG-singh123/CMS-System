import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import type { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const panelClassName = 'rounded-[2rem] border border-zinc-950/10 bg-white/90 p-6 shadow-lg shadow-zinc-950/5 ring-1 ring-zinc-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75 dark:shadow-black/20 dark:ring-white/5 sm:p-8';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <Heading>Profile</Heading>
                    <Text className="mt-2 max-w-2xl">
                        Manage your account details, password, and permanent account actions.
                    </Text>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="space-y-6">
                <div className={panelClassName}>
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-2xl"
                    />
                </div>

                <div className={panelClassName}>
                    <UpdatePasswordForm className="max-w-2xl" />
                </div>

                <div className={panelClassName}>
                    <DeleteUserForm className="max-w-2xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
