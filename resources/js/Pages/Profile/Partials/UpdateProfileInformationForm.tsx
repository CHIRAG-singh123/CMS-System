import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text, TextLink } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';
import type { AuthUser, PageProps } from '@/types';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user as AuthUser;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                    Profile information
                </h2>

                <Text className="mt-1">
                    Update your account name and primary email address.
                </Text>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <FormField label="Name" error={errors.name}>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                        autoComplete="name"
                    />
                </FormField>

                <FormField label="Email address" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                </FormField>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3">
                        <Text className="!text-amber-800 dark:!text-amber-100">
                            Your email address is unverified.{' '}
                            <TextLink
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="!text-amber-900 dark:!text-amber-200"
                            >
                                Re-send verification email
                            </TextLink>
                            .
                        </Text>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <Button type="submit" color="blue" disabled={processing}>
                        Save changes
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <Text className="text-sm">Saved.</Text>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
