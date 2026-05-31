import { useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                    Delete account
                </h2>

                <Text className="mt-1">
                    Permanently delete your account and all associated data.
                </Text>
            </header>

            <Button color="red" onClick={() => setConfirmingUserDeletion(true)}>
                Delete account
            </Button>

            <Dialog open={confirmingUserDeletion} onClose={closeModal} size="md">
                <DialogTitle>Delete account</DialogTitle>
                <DialogDescription>
                    This action is permanent. Enter your password to confirm account deletion.
                </DialogDescription>
                <DialogBody>
                    <form onSubmit={deleteUser} className="space-y-5">
                        <FormField label="Password" error={errors.password}>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoFocus
                                placeholder="Password"
                            />
                        </FormField>

                        <DialogActions>
                            <Button plain onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button type="submit" color="red" disabled={processing}>
                                Delete account
                            </Button>
                        </DialogActions>
                    </form>
                </DialogBody>
            </Dialog>
        </section>
    );
}
