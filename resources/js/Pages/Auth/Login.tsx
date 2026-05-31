import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox, CheckboxField } from '@/components/ui/checkbox';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Text, TextLink } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-8">
                <Heading>Sign in</Heading>
                <Text className="mt-2">Access your account from the shared workspace.</Text>
            </div>

            {status ? (
                <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
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

                <FormField label="Password" error={errors.password}>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </FormField>

                <div className="flex items-center justify-between gap-4">
                    <CheckboxField>
                        <Checkbox checked={data.remember} onChange={(checked) => setData('remember', checked)} />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Remember me</span>
                    </CheckboxField>
                    {canResetPassword ? (
                        <TextLink href={route('password.request')} className="text-sm">
                            Forgot password?
                        </TextLink>
                    ) : null}
                </div>

                <Button type="submit" color="blue" className="w-full justify-center" disabled={processing}>
                    Log in
                </Button>

                <Text className="text-sm">
                    Need an account?{' '}
                    <TextLink href={route('register')}>
                        Register
                    </TextLink>
                </Text>
            </form>
        </GuestLayout>
    );
}
