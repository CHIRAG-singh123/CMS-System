import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Text, TextLink } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-8">
                <Heading>Create an account</Heading>
                <Text className="mt-2">Set up a fresh account inside the shared workspace.</Text>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <FormField label="Name" error={errors.name}>
                    <Input id="name" name="name" value={data.name} autoComplete="name" autoFocus onChange={(e) => setData('name', e.target.value)} required />
                </FormField>
                <FormField label="Email address" error={errors.email}>
                    <Input id="email" type="email" name="email" value={data.email} autoComplete="username" onChange={(e) => setData('email', e.target.value)} required />
                </FormField>
                <FormField label="Password" error={errors.password}>
                    <Input id="password" type="password" name="password" value={data.password} autoComplete="new-password" onChange={(e) => setData('password', e.target.value)} required />
                </FormField>
                <FormField label="Confirm password" error={errors.password_confirmation}>
                    <Input id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation} autoComplete="new-password" onChange={(e) => setData('password_confirmation', e.target.value)} required />
                </FormField>

                <Button type="submit" color="blue" className="w-full justify-center" disabled={processing}>
                    Register
                </Button>

                <Text className="text-sm">
                    Already registered?{' '}
                    <TextLink href={route('login')}>
                        Sign in
                    </TextLink>
                </Text>
            </form>
        </GuestLayout>
    );
}
