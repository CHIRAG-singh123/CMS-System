import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-8">
                <Heading>Confirm your password</Heading>
                <Text className="mt-2">
                    This secure area requires one more password confirmation before you continue.
                </Text>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <FormField label="Password" error={errors.password}>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </FormField>

                <Button type="submit" color="blue" className="w-full justify-center" disabled={processing}>
                    Confirm
                </Button>
            </form>
        </GuestLayout>
    );
}
