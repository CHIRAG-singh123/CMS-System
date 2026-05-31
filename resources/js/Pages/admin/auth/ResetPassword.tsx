import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text, TextLink } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';
import AdminAuthLayout from '@/layouts/AdminAuthLayout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('admin.password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AdminAuthLayout title="Create a new admin password" description="Choose a strong password for your admin account.">
            <Head title="Reset Password" />

            <form onSubmit={submit} className="space-y-6">
                <FormField label="Email address" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        onChange={(event) => setData('email', event.target.value)}
                    />
                </FormField>

                <FormField label="Password" error={errors.password}>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="new-password"
                        autoFocus
                        onChange={(event) => setData('password', event.target.value)}
                    />
                </FormField>

                <FormField label="Confirm password" error={errors.password_confirmation}>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(event) => setData('password_confirmation', event.target.value)}
                    />
                </FormField>

                <Button type="submit" color="blue" className="w-full justify-center" disabled={processing}>
                    {processing ? 'Resetting password...' : 'Reset password'}
                </Button>

                <Text className="pt-1 text-sm">
                    <TextLink href={route('admin.login')}>
                        Back to login
                    </TextLink>
                </Text>
            </form>
        </AdminAuthLayout>
    );
}
