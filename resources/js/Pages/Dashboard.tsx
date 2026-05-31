import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

const cardClassName = 'rounded-[2rem] border border-zinc-950/10 bg-white/90 p-6 shadow-lg shadow-zinc-950/5 ring-1 ring-zinc-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75 dark:shadow-black/20 dark:ring-white/5';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <Heading>User Dashboard</Heading>
                    <Text className="mt-2 max-w-2xl">
                        Your account is ready. Use this area to review profile settings and move into the admin workspace when needed.
                    </Text>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="grid gap-6 lg:grid-cols-3">
                <section className={`${cardClassName} lg:col-span-2`}>
                    <Subheading>Signed in successfully</Subheading>
                    <Text className="mt-3 max-w-2xl">
                        This dashboard uses the same Catalyst-aligned visual system as the rest of the app in both light and dark mode.
                    </Text>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button href="/profile" color="blue">Go to profile</Button>
                        <Button href="/admin/login" outline>Open admin login</Button>
                    </div>
                </section>

                <section className={cardClassName}>
                    <Subheading>Workspace notes</Subheading>
                    <Text className="mt-3">
                        Shared layouts, forms, dialogs, and account pages now render inside one consistent theme-aware visual language.
                    </Text>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
