import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text, TextLink } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';
import AdminAuthLayout from '@/layouts/AdminAuthLayout';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('admin.password.email'));
    };

    return (
        <AdminAuthLayout title="Reset admin password" description="Enter your admin email address and we will send a secure reset link.">
            <Head title="Forgot Password" />

            {status ? (
                <div className="mb-4 rounded-[var(--app-surface-radius)] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
                    {status}
                </div>
            ) : null}

            <form onSubmit={submit} className="space-y-6">
                <FormField label="Email address" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        onChange={(event) => setData('email', event.target.value)}
                    />
                </FormField>

                <Button type="submit" color="blue" className="w-full justify-center" disabled={processing}>
                    {processing ? 'Sending link...' : 'Email password reset link'}
                </Button>

                <Text className="pt-1 text-sm">
                    Remembered your password?{' '}
                    <TextLink href={route('admin.login')}>
                        Back to login
                    </TextLink>
                </Text>
            </form>
        </AdminAuthLayout>
    );
}
