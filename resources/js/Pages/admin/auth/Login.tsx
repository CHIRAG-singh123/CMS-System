import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox, CheckboxField } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { TextLink } from '@/components/ui/text';
import FormField from '@/components/admin/FormField';
import AdminAuthLayout from '@/layouts/AdminAuthLayout';

interface LoginProps {
    canResetPassword: boolean;
    googleLoginEnabled: boolean;
    status?: string;
    error?: string;
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" data-slot="icon" className="fill-none">
            <path
                d="M21.805 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.055-4.4 3.055-7.65Z"
                fill="#4285F4"
            />
            <path
                d="M12 22c2.76 0 5.07-.91 6.76-2.47l-3.3-2.56c-.91.61-2.08.98-3.46.98-2.66 0-4.92-1.8-5.73-4.22H2.86v2.64A10.21 10.21 0 0 0 12 22Z"
                fill="#34A853"
            />
            <path
                d="M6.27 13.73A6.14 6.14 0 0 1 5.95 12c0-.6.11-1.18.32-1.73V7.63H2.86A10.2 10.2 0 0 0 1.8 12c0 1.64.39 3.19 1.06 4.37l3.41-2.64Z"
                fill="#FBBC05"
            />
            <path
                d="M12 6.05c1.5 0 2.85.52 3.91 1.53l2.93-2.93C17.07 2.98 14.76 2 12 2 7.86 2 4.29 4.38 2.86 7.63l3.41 2.64C7.08 7.85 9.34 6.05 12 6.05Z"
                fill="#EA4335"
            />
        </svg>
    );
}

export default function Login({ canResetPassword, googleLoginEnabled, status, error }: LoginProps) {
    const form = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const submittedFormData = new FormData(event.currentTarget);
        const payload = {
            email: String(submittedFormData.get('email') ?? '').trim(),
            password: String(submittedFormData.get('password') ?? ''),
            remember: form.data.remember,
        };

        form.setData('email', payload.email);
        form.setData('password', payload.password);
        form.transform(() => payload);
        form.post('/admin/login', {
            onFinish: () => form.transform((data) => data),
        });
    };

    return (
        <AdminAuthLayout title="Admin Login" description="Sign in to manage your reusable default admin panel.">
            {status ? (
                <div className="mb-4 rounded-[var(--app-surface-radius)] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
                    {status}
                </div>
            ) : null}

            {error ? (
                <div className="mb-4 rounded-[var(--app-surface-radius)] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
                    {error}
                </div>
            ) : null}

            <form className="space-y-5" onSubmit={submit}>
                <FormField label="Email address" error={form.errors.email}>
                    <Input
                        autoCapitalize="none"
                        autoComplete="username"
                        autoFocus
                        inputMode="email"
                        name="email"
                        spellCheck={false}
                        type="email"
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                    />
                </FormField>

                <FormField label="Password" error={form.errors.password}>
                    <Input
                        autoComplete="current-password"
                        name="password"
                        type="password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                    />
                </FormField>

                <CheckboxField>
                    <Checkbox checked={form.data.remember} onChange={(checked) => form.setData('remember', checked)} />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Keep me signed in</span>
                </CheckboxField>

                {canResetPassword ? (
                    <div className="text-right">
                        <TextLink href={route('admin.password.request')} className="text-sm">
                            Forgot password?
                        </TextLink>
                    </div>
                ) : null}

                <Button type="submit" color="blue" className="w-full justify-center" disabled={form.processing}>
                    {form.processing ? 'Signing in...' : 'Sign in'}
                </Button>

                {googleLoginEnabled ? (
                    <Button
                        type="button"
                        outline
                        className="w-full justify-center"
                        disabled={form.processing}
                        onClick={() => window.location.assign(`${route('admin.login.google.redirect')}?remember=${form.data.remember ? '1' : '0'}`)}
                    >
                        <GoogleIcon />
                        Continue with Google
                    </Button>
                ) : null}
            </form>
        </AdminAuthLayout>
    );
}
