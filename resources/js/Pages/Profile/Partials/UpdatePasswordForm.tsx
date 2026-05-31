import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (validationErrors) => {
                if (validationErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (validationErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                    Update password
                </h2>

                <Text className="mt-1">
                    Use a long, random password to keep your account secure.
                </Text>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <FormField label="Current password" error={errors.current_password}>
                    <Input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        autoComplete="current-password"
                    />
                </FormField>

                <FormField label="New password" error={errors.password}>
                    <Input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                    />
                </FormField>

                <FormField label="Confirm new password" error={errors.password_confirmation}>
                    <Input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                    />
                </FormField>

                <div className="flex items-center gap-4">
                    <Button type="submit" color="blue" disabled={processing}>
                        Save password
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
