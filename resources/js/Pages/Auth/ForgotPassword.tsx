import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-8">
                <Heading>Reset your password</Heading>
                <Text className="mt-2">
                    Enter your email address and we will send a secure reset link.
                </Text>
            </div>

            {status ? (
                <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
                    {status}
                </div>
            ) : null}

            <form onSubmit={submit} className="space-y-5">
                <FormField label="Email address" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </FormField>

                <Button type="submit" color="blue" className="w-full justify-center" disabled={processing}>
                    Email password reset link
                </Button>
            </form>
        </GuestLayout>
    );
}
