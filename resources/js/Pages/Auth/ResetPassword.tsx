import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="mb-8">
                <Heading>Create a new password</Heading>
                <Text className="mt-2">Choose a strong password for your account.</Text>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <FormField label="Email address" error={errors.email}>
                    <Input id="email" type="email" name="email" value={data.email} autoComplete="username" onChange={(e) => setData('email', e.target.value)} />
                </FormField>
                <FormField label="Password" error={errors.password}>
                    <Input id="password" type="password" name="password" value={data.password} autoComplete="new-password" autoFocus onChange={(e) => setData('password', e.target.value)} />
                </FormField>
                <FormField label="Confirm password" error={errors.password_confirmation}>
                    <Input id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation} autoComplete="new-password" onChange={(e) => setData('password_confirmation', e.target.value)} />
                </FormField>

                <Button type="submit" color="blue" className="w-full justify-center" disabled={processing}>
                    Reset password
                </Button>
            </form>
        </GuestLayout>
    );
}
