import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-8">
                <Heading>Verify your email</Heading>
                <Text className="mt-2">
                    Before getting started, confirm your email address from the message we just sent you.
                </Text>
            </div>

            {status === 'verification-link-sent' ? (
                <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    A fresh verification link has been sent to your email address.
                </div>
            ) : null}

            <form onSubmit={submit} className="space-y-4">
                <Button type="submit" color="blue" className="w-full justify-center" disabled={processing}>
                    Resend verification email
                </Button>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                    Log out
                </Link>
            </form>
        </GuestLayout>
    );
}
