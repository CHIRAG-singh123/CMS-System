import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowPathIcon,
    CameraIcon,
    DevicePhoneMobileIcon,
    TrashIcon,
} from '@heroicons/react/20/solid';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import PhoneInput from '@/components/phone/PhoneInput';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Description, ErrorMessage, Field, FieldGroup, Fieldset, Label } from '@/components/ui/fieldset';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch, SwitchField } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { isPhoneCountryIso2, parsePhoneValue, type PhoneCountryIso2 } from '@/types/phone';
import type { PageProps } from '@/types';
import type { AdminSessionContext } from '@/types/admin';
import { DEFAULT_PERSON_IMAGE, formatDate, hasPermission, storageUrl } from '@/utils/admin';

type TwoFactorMethod = 'email' | 'authenticator';
type TwoFactorMode = 'enable' | 'disable';
type AdminProfileAccount = NonNullable<PageProps['auth']['admin']> & {
    phone_country?: string | null;
};

function resolvePhoneCountry(country: string | null | undefined, phone: string | null | undefined): PhoneCountryIso2 {
    return isPhoneCountryIso2(country ?? '') ? country : parsePhoneValue(phone).countryIso2;
}

const browserTimezones = (() => {
    try {
        const supportedValuesOf = (Intl as typeof Intl & {
            supportedValuesOf?: (key: 'timeZone') => string[];
        }).supportedValuesOf;

        if (typeof Intl !== 'undefined' && typeof supportedValuesOf === 'function') {
            return supportedValuesOf('timeZone');
        }
    } catch {
        // Ignore browser Intl support issues and fall back below.
    }

    const fallback = typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : null;

    return [fallback, 'UTC'].filter((timezone): timezone is string => typeof timezone === 'string' && timezone !== '');
})();

interface AdminProfilePageProps {
    googleLoginEnabled: boolean;
    sessionContext: AdminSessionContext;
    twoFactor: {
        emailEnabled: boolean;
        authenticatorEnabled: boolean;
        enabledMethod: TwoFactorMethod | null;
        pendingAction: TwoFactorMode | null;
        pendingMethod: TwoFactorMethod | null;
        maskedEmail: string;
        authenticatorQrCode: string | null;
        authenticatorSecret: string | null;
    };
}

const accountPanels = [
    {
        id: 'profile',
        label: 'Profile Information',
        heading: 'Update your profile information',
        description: 'Keep your admin account details current.',
    },
    {
        id: 'password',
        label: 'Change Password',
        heading: 'Change your password',
        description: 'Update the password used for admin sign in.',
    },
    {
        id: 'two-factor',
        label: 'Two-Factor Authentication',
        heading: 'Two-factor authentication',
        description: 'Manage the verification step for admin sign in.',
    },
    {
        id: 'sessions',
        label: 'Sessions',
        heading: 'Sessions',
        description: 'Review the current browser session and sign out other devices.',
    },
] as const;

type AccountPanel = (typeof accountPanels)[number]['id'];

export default function Edit({ googleLoginEnabled, sessionContext, twoFactor }: AdminProfilePageProps) {
    const { auth } = usePage<PageProps>().props;
    const admin = auth.admin as AdminProfileAccount | null;
    const googleLoginPasswordRef = useRef<HTMLInputElement>(null);

    const profileForm = useForm({
        name: admin?.name ?? '',
        email: admin?.email ?? '',
        phone: admin?.phone ?? '',
        phone_country: resolvePhoneCountry(admin?.phone_country, admin?.phone),
        job_title: admin?.job_title ?? '',
        timezone: admin?.timezone ?? 'UTC',
        bio: admin?.bio ?? '',
    });

    const avatarForm = useForm<{ avatar: File | null }>({
        avatar: null,
    });

    const removeAvatarForm = useForm({});

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const sessionsForm = useForm({
        current_password: '',
    });

    const googleLoginForm = useForm({
        google_login_enabled: googleLoginEnabled,
        current_password: '',
    });

    const twoFactorRequestForm = useForm({
        two_factor_current_password: '',
    });

    const twoFactorConfirmForm = useForm({
        code: '',
    });

    const [preview, setPreview] = useState<string | null>(storageUrl(admin?.avatar));
    const [confirmingGoogleLoginChange, setConfirmingGoogleLoginChange] = useState(false);
    const [twoFactorMode, setTwoFactorMode] = useState<TwoFactorMode | null>(twoFactor.pendingAction);
    const [twoFactorMethod, setTwoFactorMethod] = useState<TwoFactorMethod | null>(twoFactor.pendingMethod);
    const [timezoneOptions, setTimezoneOptions] = useState<string[]>(() =>
        [admin?.timezone ?? 'UTC', 'UTC'].filter(
            (timezone, index, values): timezone is string => typeof timezone === 'string' && timezone !== '' && values.indexOf(timezone) === index,
        ),
    );
    const [activePanel, setActivePanel] = useState<AccountPanel>(
        twoFactor.pendingAction ? 'two-factor' : 'profile',
    );
    const panelScrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!avatarForm.data.avatar) {
            setPreview(storageUrl(admin?.avatar));

            return;
        }

        const objectUrl = URL.createObjectURL(avatarForm.data.avatar);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [admin?.avatar, avatarForm.data.avatar]);

    useEffect(() => {
        setTwoFactorMode(twoFactor.pendingAction);
        setTwoFactorMethod(twoFactor.pendingMethod);
    }, [twoFactor.pendingAction, twoFactor.pendingMethod]);

    useEffect(() => {
        if (twoFactor.pendingAction) {
            setActivePanel('two-factor');
        }
    }, [twoFactor.pendingAction]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setTimezoneOptions(
                browserTimezones.includes(profileForm.data.timezone)
                    ? browserTimezones
                    : [profileForm.data.timezone, ...browserTimezones].filter(
                        (timezone, index, values): timezone is string => typeof timezone === 'string' && timezone !== '' && values.indexOf(timezone) === index,
                    ),
            );
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [profileForm.data.timezone]);

    useEffect(() => {
        panelScrollRef.current?.scrollTo({
            top: 0,
        });
    }, [activePanel]);

    if (!admin) {
        return null;
    }

    const adminMeta = admin as typeof admin & {
        created_at?: string | null;
        email_verified_at?: string | null;
    };

    const avatarInitials = admin.name
        .trim()
        .split(/\s+/)
        .map((segment) => segment[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AD';

    const activePanelConfig = accountPanels.find((panel) => panel.id === activePanel) ?? accountPanels[0];
    const adminLastLogin = admin.last_login_at ? formatDate(admin.last_login_at) : 'Not available';
    const sessionLastActive = sessionContext.last_active_at ? formatDate(sessionContext.last_active_at) : 'Not available';
    const sessionLastLogin = sessionContext.last_login_at ? formatDate(sessionContext.last_login_at) : 'Not available';
    const canToggleGoogleLogin = hasPermission(admin?.permissions, 'settings.edit');

    const topMeta = [
        {
            label: adminMeta.created_at ? 'Member since' : 'Last login',
            value: adminMeta.created_at ? formatDate(adminMeta.created_at) : adminLastLogin,
            highlight: false,
        },
        {
            label: typeof adminMeta.email_verified_at !== 'undefined' ? 'Email status' : 'Account status',
            value:
                typeof adminMeta.email_verified_at !== 'undefined'
                    ? adminMeta.email_verified_at
                        ? 'Verified'
                        : 'Not verified'
                    : admin.status === 'active'
                      ? 'Active'
                      : 'Inactive',
            highlight:
                typeof adminMeta.email_verified_at !== 'undefined'
                    ? Boolean(adminMeta.email_verified_at)
                    : admin.status === 'active',
        },
    ];

    const submitProfile = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        profileForm.transform((data) => ({ ...data, _method: 'put' }));
        profileForm.post(route('admin.profile.update'), {
            preserveScroll: true,
        });
    };

    const submitAvatar = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        avatarForm.post(route('admin.profile.avatar.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => avatarForm.reset('avatar'),
        });
    };

    const removeAvatar = () => {
        removeAvatarForm.transform((data) => ({ ...data, _method: 'delete' }));
        removeAvatarForm.post(route('admin.profile.avatar.destroy'), {
            preserveScroll: true,
        });
    };

    const submitPassword = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        passwordForm.transform((data) => ({ ...data, _method: 'put' }));
        passwordForm.post(route('admin.profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const submitSessions = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        sessionsForm.post(route('admin.profile.logout-other-sessions'), {
            preserveScroll: true,
            onSuccess: () => sessionsForm.reset(),
        });
    };

    const toggleGoogleLoginVisibility = (checked: boolean) => {
        if (!canToggleGoogleLogin) {
            return;
        }

        setConfirmingGoogleLoginChange(true);
        googleLoginForm.clearErrors();
        googleLoginForm.setData('google_login_enabled', checked);
        googleLoginForm.setData('current_password', '');
    };

    const closeGoogleLoginChangeDialog = () => {
        setConfirmingGoogleLoginChange(false);
        googleLoginForm.clearErrors();
        googleLoginForm.reset('current_password');
        googleLoginForm.setData('google_login_enabled', googleLoginEnabled);
    };

    const submitGoogleLoginChange = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        googleLoginForm.transform((data) => ({ ...data, _method: 'put' }));
        googleLoginForm.post(route('admin.profile.google-login.update'), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onSuccess: () => closeGoogleLoginChangeDialog(),
            onError: (errors) => {
                if (errors.current_password) {
                    googleLoginPasswordRef.current?.focus();
                }
            },
        });
    };

    const submitTwoFactorRequest = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!twoFactorMode || !twoFactorMethod) {
            return;
        }

        const routeName =
            twoFactorMethod === 'email'
                ? twoFactorMode === 'enable'
                    ? 'admin.profile.two-factor.enable.request'
                    : 'admin.profile.two-factor.disable.request'
                : twoFactorMode === 'enable'
                  ? 'admin.profile.two-factor.authenticator.enable.request'
                  : 'admin.profile.two-factor.authenticator.disable.request';

        twoFactorRequestForm.post(route(routeName), {
            preserveScroll: true,
            onSuccess: () => twoFactorRequestForm.reset('two_factor_current_password'),
        });
    };

    const submitTwoFactorConfirm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!twoFactor.pendingAction || !twoFactor.pendingMethod) {
            return;
        }

        const routeName =
            twoFactor.pendingMethod === 'email'
                ? twoFactor.pendingAction === 'enable'
                    ? 'admin.profile.two-factor.enable.confirm'
                    : 'admin.profile.two-factor.disable.confirm'
                : twoFactor.pendingAction === 'enable'
                  ? 'admin.profile.two-factor.authenticator.enable.confirm'
                  : 'admin.profile.two-factor.authenticator.disable.confirm';

        twoFactorConfirmForm.post(route(routeName), {
            preserveScroll: true,
            onSuccess: () => {
                twoFactorConfirmForm.reset();
                twoFactorRequestForm.reset();
            },
        });
    };

    const resetTwoFactorForms = () => {
        setTwoFactorMode(null);
        setTwoFactorMethod(null);
        twoFactorRequestForm.reset();
        twoFactorConfirmForm.reset();
        twoFactorRequestForm.clearErrors();
        twoFactorConfirmForm.clearErrors();
    };

    const beginTwoFactorFlow = (mode: TwoFactorMode, method: TwoFactorMethod) => {
        setTwoFactorMode(mode);
        setTwoFactorMethod(method);
        twoFactorRequestForm.reset();
        twoFactorConfirmForm.reset();
        twoFactorRequestForm.clearErrors();
        twoFactorConfirmForm.clearErrors();
    };

    const renderActivePanel = () => {
        switch (activePanel) {
            case 'profile':
                return (
                    <form onSubmit={submitProfile} className="space-y-6">
                        <Fieldset>
                            <FieldGroup>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <Field>
                                        <Label htmlFor="name">Full name</Label>
                                        <Input
                                            id="name"
                                            value={profileForm.data.name}
                                            onChange={(event) => profileForm.setData('name', event.target.value)}
                                        />
                                        {profileForm.errors.name ? <ErrorMessage>{profileForm.errors.name}</ErrorMessage> : null}
                                    </Field>

                                    <Field>
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            value={profileForm.data.email}
                                            onChange={(event) => profileForm.setData('email', event.target.value)}
                                        />
                                        {profileForm.errors.email ? <ErrorMessage>{profileForm.errors.email}</ErrorMessage> : null}
                                    </Field>

                                    <Field>
                                        <Label htmlFor="phone">Phone</Label>
                                        <PhoneInput
                                            id="phone"
                                            autoComplete="tel"
                                            value={profileForm.data.phone}
                                            country={profileForm.data.phone_country}
                                            onChange={(value) => profileForm.setData('phone', value)}
                                            onCountryChange={(country) => profileForm.setData('phone_country', country)}
                                        />
                                        {profileForm.errors.phone || profileForm.errors.phone_country ? <ErrorMessage>{profileForm.errors.phone || profileForm.errors.phone_country}</ErrorMessage> : null}
                                    </Field>

                                    <Field>
                                        <Label htmlFor="job_title">Job title</Label>
                                        <Input
                                            id="job_title"
                                            value={profileForm.data.job_title}
                                            onChange={(event) => profileForm.setData('job_title', event.target.value)}
                                        />
                                        {profileForm.errors.job_title ? <ErrorMessage>{profileForm.errors.job_title}</ErrorMessage> : null}
                                    </Field>
                                </div>

                                <Field>
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select
                                        id="timezone"
                                        value={profileForm.data.timezone}
                                        onChange={(event) => profileForm.setData('timezone', event.target.value)}
                                    >
                                        {timezoneOptions.map((timezone) => (
                                            <option key={timezone} value={timezone}>
                                                {timezone}
                                            </option>
                                        ))}
                                    </Select>
                                    {profileForm.errors.timezone ? <ErrorMessage>{profileForm.errors.timezone}</ErrorMessage> : null}
                                </Field>

                                <Field>
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        rows={5}
                                        value={profileForm.data.bio}
                                        onChange={(event) => profileForm.setData('bio', event.target.value)}
                                    />
                                    {profileForm.errors.bio ? <ErrorMessage>{profileForm.errors.bio}</ErrorMessage> : null}
                                </Field>
                            </FieldGroup>
                        </Fieldset>

                        <div>
                            <Button type="submit" color="blue" disabled={profileForm.processing}>
                                {profileForm.processing ? 'Updating profile...' : 'Update profile'}
                            </Button>
                        </div>
                    </form>
                );
            case 'password':
                return (
                    <form onSubmit={submitPassword} className="space-y-6">
                        <Fieldset>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="current_password">Current password</Label>
                                    <Input
                                        id="current_password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={passwordForm.data.current_password}
                                        onChange={(event) => passwordForm.setData('current_password', event.target.value)}
                                    />
                                    {passwordForm.errors.current_password ? (
                                        <ErrorMessage>{passwordForm.errors.current_password}</ErrorMessage>
                                    ) : null}
                                </Field>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <Field>
                                        <Label htmlFor="password">New password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            autoComplete="new-password"
                                            value={passwordForm.data.password}
                                            onChange={(event) => passwordForm.setData('password', event.target.value)}
                                        />
                                        {passwordForm.errors.password ? <ErrorMessage>{passwordForm.errors.password}</ErrorMessage> : null}
                                    </Field>

                                    <Field>
                                        <Label htmlFor="password_confirmation">Confirm new password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            autoComplete="new-password"
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)}
                                        />
                                    </Field>
                                </div>
                            </FieldGroup>
                        </Fieldset>

                        <div>
                            <Button type="submit" color="blue" disabled={passwordForm.processing}>
                                {passwordForm.processing ? 'Updating password...' : 'Update password'}
                            </Button>
                        </div>
                    </form>
                );
            case 'two-factor': {
                const enabledMethodLabel =
                    twoFactor.enabledMethod === 'email'
                        ? 'Email OTP'
                        : twoFactor.enabledMethod === 'authenticator'
                          ? 'Authenticator app'
                          : 'Disabled';

                const requestLabel =
                    twoFactorMethod === 'email'
                        ? 'Confirm your password to send an email verification code'
                        : twoFactorMode === 'enable'
                          ? 'Confirm your password to generate your authenticator app QR code'
                          : 'Confirm your password to continue disabling authenticator app verification';

                const requestDescription =
                    twoFactorMethod === 'email'
                        ? `A six-digit code will be sent to ${twoFactor.maskedEmail}.`
                        : twoFactorMode === 'enable'
                          ? 'After password confirmation, scan the QR code in Google Authenticator, Microsoft Authenticator, or Authy.'
                          : 'After password confirmation, enter a live code from your authenticator app to turn it off.';

                const requestButtonLabel =
                    twoFactorMethod === 'email'
                        ? 'Send verification code'
                        : twoFactorMode === 'enable'
                          ? 'Show QR code'
                          : 'Continue';

                const confirmLabel =
                    twoFactor.pendingMethod === 'email'
                        ? `Enter the verification code to ${twoFactor.pendingAction} email two-factor authentication`
                        : twoFactor.pendingAction === 'enable'
                          ? 'Scan the QR code and enter the authenticator app code'
                          : 'Enter a current authenticator app code to disable two-factor authentication';

                const confirmDescription =
                    twoFactor.pendingMethod === 'email'
                        ? `A fresh verification code was sent to ${twoFactor.maskedEmail}. It expires after 10 minutes.`
                        : twoFactor.pendingAction === 'enable'
                          ? 'Use the QR code or manual setup key below, then enter the current six-digit code from your authenticator app.'
                          : 'Open your authenticator app and enter the current six-digit code.';

                const emailFlowActive = twoFactorMethod === 'email' || twoFactor.pendingMethod === 'email';
                const authenticatorFlowActive =
                    twoFactorMethod === 'authenticator' || twoFactor.pendingMethod === 'authenticator';

                return (
                    <div className="space-y-6">
                        <div className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-zinc-50/60 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-950 dark:text-white">
                                        Two-factor authentication status
                                    </p>
                                    <Text className="mt-1">
                                        Choose one verification method for admin sign-in. Only one method can be active at a time.
                                    </Text>
                                </div>
                                <Badge color={twoFactor.enabledMethod ? 'blue' : 'zinc'}>{enabledMethodLabel}</Badge>
                            </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                            <div className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 p-5 dark:border-white/10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">Email OTP</h3>
                                        <Text className="mt-2">
                                            Send a one-time verification code to {twoFactor.maskedEmail} after password confirmation.
                                        </Text>
                                    </div>
                                    <Badge color={twoFactor.emailEnabled ? 'green' : emailFlowActive ? 'blue' : 'zinc'}>
                                        {twoFactor.emailEnabled ? 'Enabled' : emailFlowActive ? 'Pending' : 'Available'}
                                    </Badge>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <SwitchField>
                                        <div>
                                            <Label>Email verification</Label>
                                            <Description>
                                                Keep this on to require a fresh email OTP before admin sign-in completes.
                                            </Description>
                                        </div>
                                        <Switch
                                            color="blue"
                                            checked={twoFactor.emailEnabled}
                                            disabled={
                                                Boolean(twoFactor.pendingAction)
                                                || twoFactorRequestForm.processing
                                                || twoFactorConfirmForm.processing
                                                || (!twoFactor.emailEnabled && twoFactor.authenticatorEnabled)
                                            }
                                            onChange={() =>
                                                beginTwoFactorFlow(twoFactor.emailEnabled ? 'disable' : 'enable', 'email')
                                            }
                                        />
                                    </SwitchField>

                                    {!twoFactor.emailEnabled && twoFactor.authenticatorEnabled ? (
                                        <Text>Disable authenticator app verification before switching to email OTP.</Text>
                                    ) : null}
                                </div>
                            </div>

                            <div className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 p-5 dark:border-white/10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">Authenticator App</h3>
                                        <Text className="mt-2">
                                            Use Google Authenticator, Microsoft Authenticator, Authy, or another TOTP app after password confirmation.
                                        </Text>
                                    </div>
                                    <Badge color={twoFactor.authenticatorEnabled ? 'green' : authenticatorFlowActive ? 'blue' : 'zinc'}>
                                        {twoFactor.authenticatorEnabled ? 'Enabled' : authenticatorFlowActive ? 'Pending' : 'Available'}
                                    </Badge>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <SwitchField>
                                        <div>
                                            <Label>Authenticator app verification</Label>
                                            <Description>
                                                Enable this to verify sign-ins with a TOTP app instead of a code sent by email.
                                            </Description>
                                        </div>
                                        <Switch
                                            color="blue"
                                            checked={twoFactor.authenticatorEnabled}
                                            disabled={
                                                Boolean(twoFactor.pendingAction)
                                                || twoFactorRequestForm.processing
                                                || twoFactorConfirmForm.processing
                                                || (!twoFactor.authenticatorEnabled && twoFactor.emailEnabled)
                                            }
                                            onChange={() =>
                                                beginTwoFactorFlow(
                                                    twoFactor.authenticatorEnabled ? 'disable' : 'enable',
                                                    'authenticator',
                                                )
                                            }
                                        />
                                    </SwitchField>

                                    {!twoFactor.authenticatorEnabled && twoFactor.emailEnabled ? (
                                        <Text>Disable email OTP before switching to an authenticator app.</Text>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {twoFactorMode && twoFactorMethod && !twoFactor.pendingAction ? (
                            <form onSubmit={submitTwoFactorRequest} className="space-y-4">
                                <Fieldset>
                                    <FieldGroup>
                                        <Field>
                                            <Label htmlFor="two_factor_current_password">{requestLabel}</Label>
                                            <Description>{requestDescription}</Description>
                                            <Input
                                                id="two_factor_current_password"
                                                type="password"
                                                autoComplete="current-password"
                                                value={twoFactorRequestForm.data.two_factor_current_password}
                                                onChange={(event) =>
                                                    twoFactorRequestForm.setData('two_factor_current_password', event.target.value)
                                                }
                                            />
                                            {twoFactorRequestForm.errors.two_factor_current_password ? (
                                                <ErrorMessage>{twoFactorRequestForm.errors.two_factor_current_password}</ErrorMessage>
                                            ) : null}
                                        </Field>
                                    </FieldGroup>
                                </Fieldset>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        type="submit"
                                        color="blue"
                                        disabled={twoFactorRequestForm.processing || !twoFactorRequestForm.data.two_factor_current_password}
                                    >
                                        {twoFactorRequestForm.processing ? 'Processing...' : requestButtonLabel}
                                    </Button>
                                    <Button type="button" outline onClick={resetTwoFactorForms}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : null}

                        {twoFactor.pendingAction && twoFactor.pendingMethod ? (
                            <form onSubmit={submitTwoFactorConfirm} className="space-y-4">
                                {twoFactor.pendingMethod === 'authenticator' && twoFactor.pendingAction === 'enable' ? (
                                    <div className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-zinc-50/60 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-950 dark:text-white">
                                                    Authenticator app setup
                                                </p>
                                                <Text className="mt-1">
                                                    Scan this QR code or enter the manual setup key in your authenticator app before verifying.
                                                </Text>
                                            </div>

                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                                                {twoFactor.authenticatorQrCode ? (
                                                    <img
                                                        src={twoFactor.authenticatorQrCode}
                                                        alt="Authenticator app QR code"
                                                        loading="eager"
                                                        decoding="async"
                                                        className="size-56 rounded-[var(--app-surface-radius)] bg-white p-3 shadow-sm ring-1 ring-black/5"
                                                    />
                                                ) : null}

                                                {twoFactor.authenticatorSecret ? (
                                                    <div className="min-w-0 flex-1">
                                                        <Text className="text-sm font-medium text-zinc-950 dark:text-white">Manual setup key</Text>
                                                        <div className="mt-2 break-all rounded-[var(--app-surface-radius)] border border-dashed border-zinc-950/15 px-4 py-3 font-mono text-sm text-zinc-950 dark:border-white/15 dark:text-white">
                                                            {twoFactor.authenticatorSecret}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <Fieldset>
                                    <FieldGroup>
                                        <Field>
                                            <Label htmlFor="two_factor_code">{confirmLabel}</Label>
                                            <Description>{confirmDescription}</Description>
                                            <Input
                                                id="two_factor_code"
                                                numericOnly
                                                autoComplete="one-time-code"
                                                maxLength={6}
                                                value={twoFactorConfirmForm.data.code}
                                                onChange={(event) =>
                                                    twoFactorConfirmForm.setData(
                                                        'code',
                                                        event.target.value.slice(0, 6),
                                                    )
                                                }
                                            />
                                            {twoFactorConfirmForm.errors.code ? (
                                                <ErrorMessage>{twoFactorConfirmForm.errors.code}</ErrorMessage>
                                            ) : null}
                                        </Field>
                                    </FieldGroup>
                                </Fieldset>

                                <div>
                                    <Button
                                        type="submit"
                                        color="blue"
                                        disabled={twoFactorConfirmForm.processing || twoFactorConfirmForm.data.code.length !== 6}
                                    >
                                        {twoFactorConfirmForm.processing ? 'Verifying...' : 'Confirm'}
                                    </Button>
                                </div>
                            </form>
                        ) : null}
                    </div>
                );
            }
            case 'sessions':
                return (
                    <div className="space-y-8">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/20">
                                <DevicePhoneMobileIcon className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-zinc-950 dark:text-white">
                                    {sessionContext.browser} on {sessionContext.platform}
                                </p>
                                <Text className="mt-1 break-all !text-zinc-500 dark:!text-zinc-400">{sessionContext.user_agent}</Text>
                            </div>
                        </div>

                        <DescriptionList className="max-w-3xl">
                            <DescriptionTerm>IP address</DescriptionTerm>
                            <DescriptionDetails>{sessionContext.ip_address || 'Not available'}</DescriptionDetails>

                            <DescriptionTerm>Last active</DescriptionTerm>
                            <DescriptionDetails>{sessionLastActive}</DescriptionDetails>

                            <DescriptionTerm>Last login</DescriptionTerm>
                            <DescriptionDetails>{sessionLastLogin}</DescriptionDetails>
                        </DescriptionList>

                        <form onSubmit={submitSessions} className="space-y-5">
                            <Fieldset>
                                <FieldGroup>
                                    <Field>
                                        <Label htmlFor="sessions_current_password">Confirm your password</Label>
                                        <Description>Enter your current password to sign out other browser sessions.</Description>
                                        <Input
                                            id="sessions_current_password"
                                            type="password"
                                            autoComplete="current-password"
                                            value={sessionsForm.data.current_password}
                                            onChange={(event) => sessionsForm.setData('current_password', event.target.value)}
                                        />
                                        {sessionsForm.errors.current_password ? (
                                            <ErrorMessage>{sessionsForm.errors.current_password}</ErrorMessage>
                                        ) : null}
                                    </Field>
                                </FieldGroup>
                            </Fieldset>

                            <div>
                                <Button type="submit" outline disabled={sessionsForm.processing}>
                                    <ArrowPathIcon data-slot="icon" />
                                    {sessionsForm.processing ? 'Signing out other sessions...' : 'Sign out other sessions'}
                                </Button>
                            </div>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AdminLayout
            title="My Account"
            contentClassName="h-full min-h-0"
            header={
                <AdminPageHeader
                    title="My Account"
                    description="Manage your account settings and preferences"
                    backHref="/admin/dashboard"
                />
            }
        >
            <Head title="My Account" />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="shrink-0 space-y-8">
                    <section className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 px-6 py-6 dark:border-white/10">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                                <Avatar
                                    src={preview ?? undefined}
                                    fallbackSrc={DEFAULT_PERSON_IMAGE}
                                    initials={preview ? undefined : avatarInitials}
                                    alt={admin.name}
                                    className="size-20 bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                />
                                <div className="min-w-0">
                                    <Heading className="truncate text-2xl">{admin.name}</Heading>
                                    <Text className="mt-1 truncate">{admin.email}</Text>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <Badge color={admin.status === 'active' ? 'green' : 'zinc'}>
                                            {admin.status === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Badge color="blue">{admin.role?.name ?? 'Administrator'}</Badge>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submitAvatar} className="w-full max-w-2xl space-y-3 xl:max-w-xl">
                                <div>
                                    <p className="text-sm font-medium text-zinc-950 dark:text-white">Profile photo</p>
                                    <Text className="mt-1">Upload a JPG, PNG, or WEBP image up to 2MB.</Text>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="min-w-0 flex-1">
                                        <Input
                                            id="avatar"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp"
                                            onChange={(event) => avatarForm.setData('avatar', event.target.files?.[0] ?? null)}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button type="submit" color="blue" disabled={avatarForm.processing || !avatarForm.data.avatar}>
                                            <CameraIcon data-slot="icon" />
                                            {avatarForm.processing ? 'Updating photo...' : 'Update photo'}
                                        </Button>
                                        {admin.avatar ? (
                                            <Button
                                                type="button"
                                                outline
                                                disabled={removeAvatarForm.processing}
                                                onClick={removeAvatar}
                                            >
                                                <TrashIcon data-slot="icon" />
                                                {removeAvatarForm.processing ? 'Removing...' : 'Remove photo'}
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>

                                {avatarForm.errors.avatar ? <ErrorMessage>{avatarForm.errors.avatar}</ErrorMessage> : null}
                            </form>
                        </div>

                        <div className="mt-6 grid gap-6 border-t border-zinc-950/10 pt-6 sm:grid-cols-2 dark:border-white/10">
                            {topMeta.map((item) => (
                                <div
                                    key={item.label}
                                    className={clsx(item.label === 'Account status' && 'flex items-start justify-between gap-4')}
                                >
                                    <div className="min-w-0">
                                        <Text className="text-sm !text-zinc-500 dark:!text-zinc-400">{item.label}</Text>
                                        <p
                                            className={clsx(
                                                'mt-2 text-base font-semibold text-zinc-950 dark:text-white',
                                                item.highlight && 'text-emerald-600 dark:text-emerald-400',
                                            )}
                                        >
                                            {item.value}
                                        </p>
                                    </div>
                                    {item.label === 'Account status' ? (
                                        <div className="flex shrink-0 items-center gap-3 self-center">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-zinc-950 dark:text-white">Turn on/off Google Login</p>
                                                <Text className="mt-1 text-xs !text-zinc-500 dark:!text-zinc-400">
                                                    Control Google sign-in visibility for all admins.
                                                </Text>
                                            </div>
                                            <Switch
                                                aria-label="Google login visibility"
                                                checked={googleLoginEnabled}
                                                color="zinc"
                                                disabled={!canToggleGoogleLogin}
                                                onChange={toggleGoogleLoginVisibility}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="border-b border-zinc-950/10 dark:border-white/10">
                        <nav className="-mb-px flex flex-wrap items-center gap-8" aria-label="Account navigation">
                            {accountPanels.map((panel) => {
                                const isActive = panel.id === activePanel;

                                return (
                                    <button
                                        key={panel.id}
                                        type="button"
                                        aria-pressed={isActive}
                                        aria-controls={`account-panel-${panel.id}`}
                                        onClick={() => setActivePanel(panel.id)}
                                        className={clsx(
                                            'border-b-2 px-1 pb-5 text-sm font-medium transition',
                                            isActive
                                                ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
                                                : 'border-transparent text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200',
                                        )}
                                    >
                                        {panel.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div ref={panelScrollRef} className="page-scrollbar min-h-0 flex-1 overflow-y-auto pt-8">
                    <section key={activePanel} id={`account-panel-${activePanel}`} className="max-w-5xl space-y-6 pb-6 pr-2">
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">{activePanelConfig.heading}</h2>
                            <Text className="mt-1">{activePanelConfig.description}</Text>
                        </div>

                        {renderActivePanel()}
                    </section>
                </div>
            </div>

            <Dialog open={confirmingGoogleLoginChange} onClose={closeGoogleLoginChangeDialog} size="md">
                <DialogTitle>
                    {googleLoginForm.data.google_login_enabled ? 'Enable Google login' : 'Disable Google login'}
                </DialogTitle>
                <DialogDescription>
                    {googleLoginForm.data.google_login_enabled
                        ? 'Enter your current admin password to allow Google sign-in for all admin users.'
                        : 'Enter your current admin password to hide Google sign-in for all admin users.'}
                </DialogDescription>
                <DialogBody>
                    <form onSubmit={submitGoogleLoginChange} className="space-y-5">
                        <Fieldset>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="google_login_current_password">Current password</Label>
                                    <Description>
                                        {googleLoginForm.data.google_login_enabled
                                            ? 'Required before enabling Google login.'
                                            : 'Required before disabling Google login.'}
                                    </Description>
                                    <Input
                                        id="google_login_current_password"
                                        ref={googleLoginPasswordRef}
                                        type="password"
                                        autoComplete="current-password"
                                        value={googleLoginForm.data.current_password}
                                        onChange={(event) => googleLoginForm.setData('current_password', event.target.value)}
                                        autoFocus
                                    />
                                    {googleLoginForm.errors.current_password ? (
                                        <ErrorMessage>{googleLoginForm.errors.current_password}</ErrorMessage>
                                    ) : null}
                                </Field>
                            </FieldGroup>
                        </Fieldset>

                        <DialogActions>
                            <Button plain type="button" onClick={closeGoogleLoginChangeDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" color="blue" disabled={googleLoginForm.processing || !googleLoginForm.data.current_password}>
                                {googleLoginForm.processing
                                    ? googleLoginForm.data.google_login_enabled
                                        ? 'Enabling...'
                                        : 'Disabling...'
                                    : googleLoginForm.data.google_login_enabled
                                        ? 'Enable Google login'
                                        : 'Disable Google login'}
                            </Button>
                        </DialogActions>
                    </form>
                </DialogBody>
            </Dialog>
        </AdminLayout>
    );
}
