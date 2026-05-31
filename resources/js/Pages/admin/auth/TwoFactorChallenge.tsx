import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormField from '@/components/admin/FormField';
import AdminAuthLayout from '@/layouts/AdminAuthLayout';

interface TwoFactorChallengeProps {
    method: 'email' | 'authenticator';
    maskedEmail: string | null;
}

export default function TwoFactorChallenge({ method, maskedEmail }: TwoFactorChallengeProps) {
    const form = useForm({
        code: '',
    });

    const resendForm = useForm({});

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(route('admin.two-factor.challenge.store'));
    };

    const resend = () => {
        resendForm.post(route('admin.two-factor.challenge.resend'));
    };

    return (
        <AdminAuthLayout
            title="Verify your sign-in"
            description={
                method === 'email'
                    ? `Enter the six-digit code sent to ${maskedEmail}. The code expires after 10 minutes.`
                    : 'Open your authenticator app and enter the current six-digit code to continue.'
            }
        >
            <form className="space-y-6" onSubmit={submit}>
                <FormField label="Verification code" error={form.errors.code}>
                    <Input
                        autoComplete="one-time-code"
                        autoFocus
                        numericOnly
                        maxLength={6}
                        name="code"
                        value={form.data.code}
                        onChange={(event) => form.setData('code', event.target.value.slice(0, 6))}
                    />
                </FormField>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                        type="submit"
                        color="blue"
                        className="flex-1 justify-center"
                        disabled={form.processing || form.data.code.length !== 6}
                    >
                        {form.processing ? 'Verifying...' : 'Verify code'}
                    </Button>
                    {method === 'email' ? (
                        <Button
                            type="button"
                            outline
                            className="justify-center"
                            disabled={resendForm.processing}
                            onClick={resend}
                        >
                            {resendForm.processing ? 'Resending...' : 'Resend code'}
                        </Button>
                    ) : null}
                </div>
            </form>
        </AdminAuthLayout>
    );
}
