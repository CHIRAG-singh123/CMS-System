import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckBadgeIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/20/solid';
import AdminCard from '@/components/admin/AdminCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import PhoneInput from '@/components/phone/PhoneInput';
import { Button } from '@/components/ui/button';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Description, ErrorMessage, Field, FieldGroup, Fieldset, Label } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { isPhoneCountryIso2, parsePhoneValue, type PhoneCountryIso2 } from '@/types/phone';
import type { SiteSetting } from '@/types/admin';
import type { PageProps } from '@/types';
import { formatDate, storageUrl } from '@/utils/admin';
import AdminLayout from '@/layouts/AdminLayout';

type SettingsFormRecord = SiteSetting & {
    phone_country?: string | null;
    whatsapp_number_country?: string | null;
};

interface SettingEditProps {
    settings: SettingsFormRecord;
}

function resolvePhoneCountry(country: string | null | undefined, phone: string | null | undefined): PhoneCountryIso2 {
    return isPhoneCountryIso2(country ?? '') ? country : parsePhoneValue(phone).countryIso2;
}

function SettingsPanel({
    title,
    description,
    actions,
    children,
    className,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <AdminCard className={clsx('overflow-hidden p-0', className)}>
            <div className="flex flex-col gap-4 border-b border-zinc-950/10 px-6 py-6 dark:border-white/10 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="text-base/6 font-semibold text-zinc-950 dark:text-white">{title}</h2>
                    {description ? <Text className="mt-2">{description}</Text> : null}
                </div>
                {actions}
            </div>
            {children}
        </AdminCard>
    );
}

function SettingsRow({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={clsx('grid gap-8 border-t border-zinc-950/10 px-6 py-7 dark:border-white/10 xl:grid-cols-[18rem_minmax(0,1fr)]', className)}>
            <div>
                <h3 className="text-sm/6 font-medium text-zinc-950 dark:text-white">{title}</h3>
                {description ? <Text className="mt-2">{description}</Text> : null}
            </div>
            <div className="space-y-5">{children}</div>
        </div>
    );
}

function SettingsLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="mb-3 block text-base/6 select-none text-zinc-950 sm:text-sm/6 dark:text-white">
            {children}
        </label>
    );
}

function SettingsError({ children }: { children: ReactNode }) {
    return <p className="mt-3 text-base/6 text-red-600 sm:text-sm/6 dark:text-red-500">{children}</p>;
}

function SettingsRemoveButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <Button
            type="button"
            outline
            aria-pressed={active}
            onClick={onClick}
            className={clsx(
                'w-full justify-center sm:w-auto',
                active && '!border-red-300 !bg-red-50 !text-red-700 dark:!border-red-500/40 dark:!bg-red-500/10 dark:!text-red-200',
            )}
        >
            <TrashIcon data-slot="icon" />
            {children}
        </Button>
    );
}

export default function Edit({ settings }: SettingEditProps) {
    const { branding } = usePage<PageProps>().props;
    const brochureUrl = settings.brochure_file ? storageUrl(settings.brochure_file) : null;
    const initialMaintenanceMode = settings.maintenance_mode ?? false;
    const initialMaintenanceMessage = settings.maintenance_message ?? '';
    const maintenancePasswordRef = useRef<HTMLInputElement>(null);
    const maintenanceForm = useForm({
        maintenance_mode: initialMaintenanceMode,
        maintenance_message: initialMaintenanceMessage,
    });
    const maintenanceAutoSaveTimeoutRef = useRef<number | null>(null);
    const maintenanceInitialStateRef = useRef({
        maintenance_mode: initialMaintenanceMode,
        maintenance_message: initialMaintenanceMessage,
    });
    const maintenanceModeForm = useForm({
        maintenance_mode: initialMaintenanceMode,
        maintenance_message: initialMaintenanceMessage,
        current_password: '',
    });
    const [confirmingMaintenanceModeChange, setConfirmingMaintenanceModeChange] = useState(false);
    const form = useForm({
        company_name: settings.company_name ?? '',
        legal_name: settings.legal_name ?? '',
        company_address: settings.company_address ?? '',
        header_tagline: settings.header_tagline ?? '',
        header_cta_label: settings.header_cta_label ?? '',
        header_cta_url: settings.header_cta_url ?? '',
        footer_heading: settings.footer_heading ?? '',
        footer_description: settings.footer_description ?? '',
        footer_cta_label: settings.footer_cta_label ?? '',
        footer_cta_url: settings.footer_cta_url ?? '',
        footer_copyright: settings.footer_copyright ?? '',
        logo_light: null as File | null,
        logo_dark: null as File | null,
        remove_logo_light: false,
        remove_logo_dark: false,
        brochure_file: null as File | null,
        remove_brochure_file: false,
        export_email: settings.export_email ?? '',
        phone: settings.phone ?? '',
        phone_country: resolvePhoneCountry(settings.phone_country, settings.phone),
        whatsapp_number: settings.whatsapp_number ?? '',
        whatsapp_number_country: resolvePhoneCountry(settings.whatsapp_number_country, settings.whatsapp_number),
        whatsapp_chat_enabled: settings.whatsapp_chat_enabled ?? false,
        whatsapp_prefill_message: settings.whatsapp_prefill_message ?? '',
        map_title: settings.map_title ?? '',
        map_address: settings.map_address ?? '',
        map_embed: settings.map_embed ?? '',
        linkedin_url: settings.linkedin_url ?? '',
        facebook_url: settings.facebook_url ?? '',
        instagram_url: settings.instagram_url ?? '',
    });

    const [lightLogoPreview, setLightLogoPreview] = useState<string | null>(storageUrl(settings.logo_light ?? branding.logoLight ?? branding.logo));
    const [darkLogoPreview, setDarkLogoPreview] = useState<string | null>(storageUrl(settings.logo_dark ?? branding.logoDark ?? branding.logo));

    const clearPhoneErrors = (field: 'phone' | 'whatsapp_number') => {
        if (field === 'phone') {
            form.clearErrors('phone', 'phone_country');
            return;
        }

        form.clearErrors('whatsapp_number', 'whatsapp_number_country');
    };

    useEffect(() => {
        if (form.data.remove_logo_light && !form.data.logo_light) {
            setLightLogoPreview(null);

            return;
        }

        if (!form.data.logo_light) {
            setLightLogoPreview(storageUrl(settings.logo_light ?? branding.logoLight ?? branding.logo));

            return;
        }

        const objectUrl = URL.createObjectURL(form.data.logo_light);
        setLightLogoPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [branding.logo, branding.logoLight, form.data.logo_light, form.data.remove_logo_light, settings.logo_light]);

    useEffect(() => {
        if (form.data.remove_logo_dark && !form.data.logo_dark) {
            setDarkLogoPreview(null);

            return;
        }

        if (!form.data.logo_dark) {
            setDarkLogoPreview(storageUrl(settings.logo_dark ?? branding.logoDark ?? branding.logo));

            return;
        }

        const objectUrl = URL.createObjectURL(form.data.logo_dark);
        setDarkLogoPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [branding.logo, branding.logoDark, form.data.logo_dark, form.data.remove_logo_dark, settings.logo_dark]);

    useEffect(() => {
        return () => {
            if (maintenanceAutoSaveTimeoutRef.current !== null) {
                window.clearTimeout(maintenanceAutoSaveTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const currentMaintenanceMessage = maintenanceForm.data.maintenance_message;
        const initialState = maintenanceInitialStateRef.current;
        const hasChanged = currentMaintenanceMessage !== initialState.maintenance_message;

        if (!hasChanged) {
            if (maintenanceAutoSaveTimeoutRef.current !== null) {
                window.clearTimeout(maintenanceAutoSaveTimeoutRef.current);
                maintenanceAutoSaveTimeoutRef.current = null;
            }

            return;
        }

        if (maintenanceAutoSaveTimeoutRef.current !== null) {
            window.clearTimeout(maintenanceAutoSaveTimeoutRef.current);
        }

        maintenanceAutoSaveTimeoutRef.current = window.setTimeout(() => {
            maintenanceForm.transform((data) => ({ ...data, _method: 'put' }));
            maintenanceForm.post(route('admin.settings.maintenance.update'), {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onSuccess: () => {
                    maintenanceInitialStateRef.current = {
                        maintenance_mode: maintenanceForm.data.maintenance_mode,
                        maintenance_message: currentMaintenanceMessage,
                    };
                },
            });
        }, 10000);

        return () => {
            if (maintenanceAutoSaveTimeoutRef.current !== null) {
                window.clearTimeout(maintenanceAutoSaveTimeoutRef.current);
                maintenanceAutoSaveTimeoutRef.current = null;
            }
        };
    }, [maintenanceForm.data.maintenance_message]);

    const openMaintenanceModeDialog = (checked: boolean) => {
        maintenanceModeForm.clearErrors();
        maintenanceModeForm.setData({
            maintenance_mode: checked,
            maintenance_message: maintenanceForm.data.maintenance_message,
            current_password: '',
        });
        setConfirmingMaintenanceModeChange(true);
    };

    const closeMaintenanceModeDialog = (
        maintenanceMode = maintenanceForm.data.maintenance_mode,
        maintenanceMessage = maintenanceForm.data.maintenance_message,
    ) => {
        setConfirmingMaintenanceModeChange(false);
        maintenanceModeForm.clearErrors();
        maintenanceModeForm.reset('current_password');
        maintenanceModeForm.setData({
            maintenance_mode: maintenanceMode,
            maintenance_message: maintenanceMessage,
            current_password: '',
        });
    };

    const submitMaintenanceModeChange = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        maintenanceModeForm.transform((data) => ({ ...data, _method: 'put' }));
        maintenanceModeForm.post(route('admin.settings.maintenance.update'), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onSuccess: () => {
                if (maintenanceAutoSaveTimeoutRef.current !== null) {
                    window.clearTimeout(maintenanceAutoSaveTimeoutRef.current);
                    maintenanceAutoSaveTimeoutRef.current = null;
                }

                maintenanceForm.clearErrors();
                maintenanceForm.setData({
                    maintenance_mode: maintenanceModeForm.data.maintenance_mode,
                    maintenance_message: maintenanceModeForm.data.maintenance_message,
                });
                maintenanceInitialStateRef.current = {
                    maintenance_mode: maintenanceModeForm.data.maintenance_mode,
                    maintenance_message: maintenanceModeForm.data.maintenance_message,
                };
                closeMaintenanceModeDialog(
                    maintenanceModeForm.data.maintenance_mode,
                    maintenanceModeForm.data.maintenance_message,
                );
            },
            onError: (errors) => {
                if (errors.maintenance_message) {
                    maintenanceForm.setError('maintenance_message', errors.maintenance_message);
                }

                if (errors.current_password) {
                    maintenancePasswordRef.current?.focus();
                }
            },
        });
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            _method: 'put',
        }));

        form.post(route('admin.settings.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('logo_light', 'logo_dark', 'brochure_file');
                form.setData('remove_logo_light', false);
                form.setData('remove_logo_dark', false);
                form.setData('remove_brochure_file', false);
            },
        });
    };

    const currentBrochureName = form.data.brochure_file?.name
        ?? (!form.data.remove_brochure_file && settings.brochure_file ? settings.brochure_file.split('/').pop() : null);

    return (
        <AdminLayout
            title="Settings"
            header={(
                <AdminPageHeader
                    title="Settings"
                    description="Control branding, company details, contact channels, and website-level configuration."
                    backHref="/admin/dashboard"
                    sticky
                    actions={(
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <div className="flex items-center gap-3 rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-white/80 px-4 py-2 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/40 dark:ring-white/5">
                                <span className="text-sm text-zinc-600 dark:text-zinc-300">Maintenance mode</span>
                                <Switch
                                    checked={maintenanceForm.data.maintenance_mode}
                                    onChange={openMaintenanceModeDialog}
                                    disabled={maintenanceForm.processing || maintenanceModeForm.processing}
                                    color="zinc"
                                />
                            </div>
                            <Button type="submit" form="site-settings-form" color="blue" disabled={form.processing}>
                                <CheckBadgeIcon data-slot="icon" />
                                {form.processing ? 'Saving settings...' : 'Save settings'}
                            </Button>
                        </div>
                    )}
                />
            )}
        >
            <Head title="Settings" />

            <div className="space-y-8">
                <SettingsPanel
                    title="Website administration"
                    description="This configuration controls whether the public website is live or blocked by a maintenance screen."
                >
                    <div className="px-6 py-6">
                        <Text>{maintenanceForm.data.maintenance_mode ? 'Website configuration is currently marked for maintenance.' : 'Website configuration is currently marked as live.'}</Text>
                        <Text className="mt-2">Last saved: {formatDate(settings.updated_at)}</Text>
                    </div>

                    <SettingsRow
                        title="Maintenance notice"
                        description="This message is shown on localhost:8000 and every public page while maintenance mode is enabled."
                    >
                        <div>
                            <Textarea
                                id="maintenance_message"
                                rows={4}
                                value={maintenanceForm.data.maintenance_message}
                                onChange={(event) => maintenanceForm.setData('maintenance_message', event.target.value)}
                            />
                            {maintenanceForm.errors.maintenance_message ? <SettingsError>{maintenanceForm.errors.maintenance_message}</SettingsError> : null}
                        </div>
                    </SettingsRow>
                </SettingsPanel>
            </div>

            <form id="site-settings-form" onSubmit={submit} className="mt-8 space-y-6 pb-6">
                <SettingsPanel
                    title="Website settings"
                    description="This configuration is stored in SQLite and powers reusable admin-side website settings."
                >
                    <SettingsRow
                        title="Company details"
                        description="Primary company identity shown across public pages and contact sections."
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <SettingsLabel htmlFor="company_name">Company name</SettingsLabel>
                                <Input id="company_name" value={form.data.company_name} onChange={(event) => form.setData('company_name', event.target.value)} />
                                {form.errors.company_name ? <SettingsError>{form.errors.company_name}</SettingsError> : null}
                            </div>
                            <div>
                                <SettingsLabel htmlFor="legal_name">Legal entity</SettingsLabel>
                                <Input id="legal_name" value={form.data.legal_name} onChange={(event) => form.setData('legal_name', event.target.value)} />
                                {form.errors.legal_name ? <SettingsError>{form.errors.legal_name}</SettingsError> : null}
                            </div>
                        </div>
                        <div>
                            <SettingsLabel htmlFor="company_address">Company address</SettingsLabel>
                            <Textarea id="company_address" rows={4} value={form.data.company_address} onChange={(event) => form.setData('company_address', event.target.value)} />
                            {form.errors.company_address ? <SettingsError>{form.errors.company_address}</SettingsError> : null}
                        </div>
                    </SettingsRow>

                    <SettingsRow
                        title="Public header"
                        description="Controls the top navigation brand line and main action button shown on all public pages."
                    >
                        <div>
                            <SettingsLabel htmlFor="header_tagline">Header tagline</SettingsLabel>
                            <Input
                                id="header_tagline"
                                maxLength={140}
                                value={form.data.header_tagline}
                                onChange={(event) => form.setData('header_tagline', event.target.value)}
                            />
                            <Text className="mt-2">Short text below the company name in the public header.</Text>
                            {form.errors.header_tagline ? <SettingsError>{form.errors.header_tagline}</SettingsError> : null}
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <SettingsLabel htmlFor="header_cta_label">Header button label</SettingsLabel>
                                <Input
                                    id="header_cta_label"
                                    maxLength={60}
                                    value={form.data.header_cta_label}
                                    onChange={(event) => form.setData('header_cta_label', event.target.value)}
                                />
                                {form.errors.header_cta_label ? <SettingsError>{form.errors.header_cta_label}</SettingsError> : null}
                            </div>
                            <div>
                                <SettingsLabel htmlFor="header_cta_url">Header button URL</SettingsLabel>
                                <Input
                                    id="header_cta_url"
                                    placeholder="/contact-us"
                                    value={form.data.header_cta_url}
                                    onChange={(event) => form.setData('header_cta_url', event.target.value)}
                                />
                                <Text className="mt-2">Use an internal path, http(s), mailto, or tel link.</Text>
                                {form.errors.header_cta_url ? <SettingsError>{form.errors.header_cta_url}</SettingsError> : null}
                            </div>
                        </div>
                    </SettingsRow>

                    <SettingsRow
                        title="Public footer"
                        description="Controls the closing brand block, footer call-to-action, and copyright line."
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <SettingsLabel htmlFor="footer_heading">Footer heading</SettingsLabel>
                                <Input
                                    id="footer_heading"
                                    maxLength={120}
                                    value={form.data.footer_heading}
                                    onChange={(event) => form.setData('footer_heading', event.target.value)}
                                />
                                {form.errors.footer_heading ? <SettingsError>{form.errors.footer_heading}</SettingsError> : null}
                            </div>
                            <div>
                                <SettingsLabel htmlFor="footer_copyright">Copyright line</SettingsLabel>
                                <Input
                                    id="footer_copyright"
                                    maxLength={180}
                                    value={form.data.footer_copyright}
                                    onChange={(event) => form.setData('footer_copyright', event.target.value)}
                                />
                                {form.errors.footer_copyright ? <SettingsError>{form.errors.footer_copyright}</SettingsError> : null}
                            </div>
                        </div>
                        <div>
                            <SettingsLabel htmlFor="footer_description">Footer description</SettingsLabel>
                            <Textarea
                                id="footer_description"
                                rows={4}
                                maxLength={800}
                                value={form.data.footer_description}
                                onChange={(event) => form.setData('footer_description', event.target.value)}
                            />
                            {form.errors.footer_description ? <SettingsError>{form.errors.footer_description}</SettingsError> : null}
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <SettingsLabel htmlFor="footer_cta_label">Footer button label</SettingsLabel>
                                <Input
                                    id="footer_cta_label"
                                    maxLength={60}
                                    value={form.data.footer_cta_label}
                                    onChange={(event) => form.setData('footer_cta_label', event.target.value)}
                                />
                                {form.errors.footer_cta_label ? <SettingsError>{form.errors.footer_cta_label}</SettingsError> : null}
                            </div>
                            <div>
                                <SettingsLabel htmlFor="footer_cta_url">Footer button URL</SettingsLabel>
                                <Input
                                    id="footer_cta_url"
                                    placeholder="/contact-us"
                                    value={form.data.footer_cta_url}
                                    onChange={(event) => form.setData('footer_cta_url', event.target.value)}
                                />
                                <Text className="mt-2">Use an internal path, http(s), mailto, or tel link.</Text>
                                {form.errors.footer_cta_url ? <SettingsError>{form.errors.footer_cta_url}</SettingsError> : null}
                            </div>
                        </div>
                    </SettingsRow>

                    <SettingsRow
                        title="Contact information"
                        description="Public inquiry routing and visible contact channels."
                    >
                        <div className="grid gap-5 xl:grid-cols-3">
                            <div>
                                <SettingsLabel htmlFor="export_email">Export email</SettingsLabel>
                                <Input id="export_email" type="email" value={form.data.export_email} onChange={(event) => form.setData('export_email', event.target.value)} />
                                {form.errors.export_email ? <SettingsError>{form.errors.export_email}</SettingsError> : null}
                            </div>
                            <div>
                                <SettingsLabel htmlFor="phone">Phone</SettingsLabel>
                                <PhoneInput
                                    id="phone"
                                    autoComplete="tel"
                                    value={form.data.phone}
                                    country={form.data.phone_country}
                                    onChange={(value) => {
                                        form.setData('phone', value);
                                        clearPhoneErrors('phone');
                                    }}
                                    onCountryChange={(country) => {
                                        form.setData('phone_country', country);
                                        clearPhoneErrors('phone');
                                    }}
                                />
                                {form.errors.phone || form.errors.phone_country ? <SettingsError>{form.errors.phone || form.errors.phone_country}</SettingsError> : null}
                            </div>
                            <div>
                                <SettingsLabel htmlFor="whatsapp_number">WhatsApp</SettingsLabel>
                                <PhoneInput
                                    id="whatsapp_number"
                                    autoComplete="tel"
                                    value={form.data.whatsapp_number}
                                    country={form.data.whatsapp_number_country}
                                    onChange={(value) => {
                                        form.setData('whatsapp_number', value);
                                        clearPhoneErrors('whatsapp_number');
                                    }}
                                    onCountryChange={(country) => {
                                        form.setData('whatsapp_number_country', country);
                                        clearPhoneErrors('whatsapp_number');
                                    }}
                                />
                                {form.errors.whatsapp_number || form.errors.whatsapp_number_country ? <SettingsError>{form.errors.whatsapp_number || form.errors.whatsapp_number_country}</SettingsError> : null}
                            </div>
                        </div>
                        <div className="rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-zinc-50/90 p-5 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/40 dark:ring-white/5">
                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
                                <div>
                                    <SettingsLabel htmlFor="whatsapp_prefill_message">Floating WhatsApp chat button</SettingsLabel>
                                    <Text className="mt-2">Shows a public WhatsApp shortcut and starts the chat with the saved prefilled message.</Text>
                                    <Textarea
                                        id="whatsapp_prefill_message"
                                        rows={3}
                                        value={form.data.whatsapp_prefill_message}
                                        onChange={(event) => form.setData('whatsapp_prefill_message', event.target.value)}
                                    />
                                    {form.errors.whatsapp_prefill_message ? <SettingsError>{form.errors.whatsapp_prefill_message}</SettingsError> : null}
                                </div>
                                <div className="h-full rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-white/70 px-5 py-4 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/60 dark:ring-white/5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm/6 font-medium text-zinc-950 dark:text-white">Show WhatsApp chat</p>
                                            <Text className="mt-1">Enable or disable the public floating WhatsApp action.</Text>
                                        </div>
                                        <Switch
                                            className="mt-0.5 shrink-0"
                                            checked={form.data.whatsapp_chat_enabled}
                                            onChange={(checked) => form.setData('whatsapp_chat_enabled', checked)}
                                            color="zinc"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SettingsRow>

                    <SettingsRow
                        title="Map location"
                        description="Controls the map content reused on the public contact section."
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <SettingsLabel htmlFor="map_title">Map title</SettingsLabel>
                                <Input id="map_title" value={form.data.map_title} onChange={(event) => form.setData('map_title', event.target.value)} />
                                {form.errors.map_title ? <SettingsError>{form.errors.map_title}</SettingsError> : null}
                            </div>
                            <div>
                                <SettingsLabel htmlFor="map_address">Map address / search location</SettingsLabel>
                                <Input id="map_address" value={form.data.map_address} onChange={(event) => form.setData('map_address', event.target.value)} />
                                {form.errors.map_address ? <SettingsError>{form.errors.map_address}</SettingsError> : null}
                            </div>
                        </div>
                        <div>
                            <SettingsLabel htmlFor="map_embed">Google Maps embed or share URL</SettingsLabel>
                            <Textarea id="map_embed" rows={5} value={form.data.map_embed} onChange={(event) => form.setData('map_embed', event.target.value)} />
                            <Text className="mt-2">Paste a Google Maps iframe/embed URL for inline preview. Short share links are saved and shown as an Open map button.</Text>
                            {form.errors.map_embed ? <SettingsError>{form.errors.map_embed}</SettingsError> : null}
                        </div>
                    </SettingsRow>

                    <SettingsRow
                        title="Social media links"
                        description="Optional public links used in shared footer and contact sections."
                    >
                        <div className="grid gap-5 xl:grid-cols-3">
                            <div>
                                <SettingsLabel htmlFor="linkedin_url">LinkedIn</SettingsLabel>
                                <Input id="linkedin_url" type="url" value={form.data.linkedin_url} onChange={(event) => form.setData('linkedin_url', event.target.value)} />
                                {form.errors.linkedin_url ? <SettingsError>{form.errors.linkedin_url}</SettingsError> : null}
                            </div>
                            <div>
                                <SettingsLabel htmlFor="facebook_url">Facebook</SettingsLabel>
                                <Input id="facebook_url" type="url" value={form.data.facebook_url} onChange={(event) => form.setData('facebook_url', event.target.value)} />
                                {form.errors.facebook_url ? <SettingsError>{form.errors.facebook_url}</SettingsError> : null}
                            </div>
                            <div>
                                <SettingsLabel htmlFor="instagram_url">Instagram</SettingsLabel>
                                <Input id="instagram_url" type="url" value={form.data.instagram_url} onChange={(event) => form.setData('instagram_url', event.target.value)} />
                                {form.errors.instagram_url ? <SettingsError>{form.errors.instagram_url}</SettingsError> : null}
                            </div>
                        </div>
                    </SettingsRow>
                </SettingsPanel>

                <SettingsPanel
                    title="Brand assets"
                    description="Manage sidebar branding assets and the shared brochure download file."
                >
                    <SettingsRow
                        title="Sidebar logos"
                        description="Configure the dedicated light and dark mode brand assets shown throughout the admin workspace."
                    >
                        <div className="grid gap-6 xl:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <SettingsLabel htmlFor="logo_light">Upload Light mode logo</SettingsLabel>
                                    <Text className="mt-2">Logo for light mode. SVG/Images both are supported up to 2MB.</Text>
                                </div>
                                <div className="space-y-4 rounded-[var(--app-surface-radius)] border border-dashed border-zinc-950/10 bg-zinc-50/90 p-4 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/40 dark:ring-white/5">
                                    <div className="flex min-h-28 items-center justify-center rounded-[var(--app-surface-radius)] bg-white px-4 ring-1 ring-zinc-950/5 dark:bg-zinc-950/70 dark:ring-white/5">
                                        {lightLogoPreview ? (
                                            <img
                                                src={lightLogoPreview}
                                                alt="Light logo preview"
                                                loading="lazy"
                                                decoding="async"
                                                className="max-h-16 w-auto max-w-full object-contain"
                                            />
                                        ) : (
                                            <Text className="!text-zinc-500">No light mode logo selected.</Text>
                                        )}
                                    </div>
                                    <Input
                                        id="logo_light"
                                        type="file"
                                        accept=".svg,.jpg,.jpeg,.png,.webp"
                                        onChange={(event) => {
                                            form.setData('remove_logo_light', false);
                                            form.setData('logo_light', event.target.files?.[0] ?? null);
                                        }}
                                    />
                                    {settings.logo_light || form.data.logo_light ? (
                                        <SettingsRemoveButton
                                            active={form.data.remove_logo_light}
                                            onClick={() => {
                                                const shouldRemove = !form.data.remove_logo_light;
                                                form.setData('remove_logo_light', shouldRemove);

                                                if (shouldRemove) {
                                                    form.setData('logo_light', null);
                                                }
                                            }}
                                        >
                                            {form.data.remove_logo_light ? 'Keep light logo' : 'Remove light logo'}
                                        </SettingsRemoveButton>
                                    ) : null}
                                </div>
                                {form.errors.logo_light ? <SettingsError>{form.errors.logo_light}</SettingsError> : null}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <SettingsLabel htmlFor="logo_dark">Upload Dark mode logo</SettingsLabel>
                                    <Text className="mt-2">Logo for Dark mode. SVG/Images both are supported up to 2MB.</Text>
                                </div>
                                <div className="space-y-4 rounded-[var(--app-surface-radius)] border border-dashed border-zinc-950/10 bg-zinc-50/90 p-4 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/40 dark:ring-white/5">
                                    <div className="flex min-h-28 items-center justify-center rounded-[var(--app-surface-radius)] bg-white px-4 ring-1 ring-zinc-950/5 dark:bg-zinc-950/70 dark:ring-white/5">
                                        {darkLogoPreview ? (
                                            <img
                                                src={darkLogoPreview}
                                                alt="Dark logo preview"
                                                loading="lazy"
                                                decoding="async"
                                                className="max-h-16 w-auto max-w-full object-contain"
                                            />
                                        ) : (
                                            <Text className="!text-zinc-500">No dark mode logo selected.</Text>
                                        )}
                                    </div>
                                    <Input
                                        id="logo_dark"
                                        type="file"
                                        accept=".svg,.jpg,.jpeg,.png,.webp"
                                        onChange={(event) => {
                                            form.setData('remove_logo_dark', false);
                                            form.setData('logo_dark', event.target.files?.[0] ?? null);
                                        }}
                                    />
                                    {settings.logo_dark || form.data.logo_dark ? (
                                        <SettingsRemoveButton
                                            active={form.data.remove_logo_dark}
                                            onClick={() => {
                                                const shouldRemove = !form.data.remove_logo_dark;
                                                form.setData('remove_logo_dark', shouldRemove);

                                                if (shouldRemove) {
                                                    form.setData('logo_dark', null);
                                                }
                                            }}
                                        >
                                            {form.data.remove_logo_dark ? 'Keep dark logo' : 'Remove dark logo'}
                                        </SettingsRemoveButton>
                                    ) : null}
                                </div>
                                {form.errors.logo_dark ? <SettingsError>{form.errors.logo_dark}</SettingsError> : null}
                            </div>
                        </div>
                    </SettingsRow>

                    <SettingsRow
                        title="Company brochure"
                        description="Upload a public PDF brochure that can be reused across the website."
                    >
                        <div className="space-y-4 rounded-[var(--app-surface-radius)] border border-dashed border-zinc-950/10 bg-zinc-50/90 p-4 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/40 dark:ring-white/5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="flex size-12 items-center justify-center rounded-[var(--app-surface-radius)] bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-950/70 dark:ring-white/5">
                                        <DocumentTextIcon className="size-6 text-zinc-500 dark:text-zinc-300" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-950 dark:text-white">
                                            {currentBrochureName ?? 'No brochure uploaded'}
                                        </p>
                                        <Text>PDF only, up to 10MB.</Text>
                                        {brochureUrl && !form.data.remove_brochure_file ? (
                                            <a
                                                href={brochureUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-2 inline-flex text-sm text-blue-600 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200"
                                            >
                                                Open current brochure
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="w-full sm:w-auto sm:min-w-80">
                                    <Input
                                        id="brochure_file"
                                        type="file"
                                        accept=".pdf"
                                        onChange={(event) => {
                                            form.setData('remove_brochure_file', false);
                                            form.setData('brochure_file', event.target.files?.[0] ?? null);
                                        }}
                                    />
                                </div>
                            </div>
                            {settings.brochure_file || form.data.brochure_file ? (
                                <SettingsRemoveButton
                                    active={form.data.remove_brochure_file}
                                    onClick={() => {
                                        const shouldRemove = !form.data.remove_brochure_file;
                                        form.setData('remove_brochure_file', shouldRemove);

                                        if (shouldRemove) {
                                            form.setData('brochure_file', null);
                                        }
                                    }}
                                >
                                    {form.data.remove_brochure_file ? 'Keep brochure' : 'Remove brochure'}
                                </SettingsRemoveButton>
                            ) : null}
                        </div>
                        {form.errors.brochure_file ? <SettingsError>{form.errors.brochure_file}</SettingsError> : null}
                    </SettingsRow>
                </SettingsPanel>

            </form>

            <Dialog open={confirmingMaintenanceModeChange} onClose={closeMaintenanceModeDialog} size="md">
                <DialogTitle>
                    {maintenanceModeForm.data.maintenance_mode ? 'Enable maintenance mode' : 'Disable maintenance mode'}
                </DialogTitle>
                <DialogDescription>
                    {maintenanceModeForm.data.maintenance_mode
                        ? 'Enter your current admin password to put the public website into maintenance mode immediately.'
                        : 'Enter your current admin password to make the public website live immediately.'}
                </DialogDescription>
                <DialogBody>
                    <form onSubmit={submitMaintenanceModeChange} className="space-y-5">
                        <Fieldset>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="maintenance_mode_current_password">Current password</Label>
                                    <Description>
                                        {maintenanceModeForm.data.maintenance_mode
                                            ? 'Required before enabling maintenance mode.'
                                            : 'Required before disabling maintenance mode.'}
                                    </Description>
                                    <Input
                                        id="maintenance_mode_current_password"
                                        ref={maintenancePasswordRef}
                                        type="password"
                                        autoComplete="current-password"
                                        value={maintenanceModeForm.data.current_password}
                                        onChange={(event) => maintenanceModeForm.setData('current_password', event.target.value)}
                                        autoFocus
                                    />
                                    {maintenanceModeForm.errors.current_password ? (
                                        <ErrorMessage>{maintenanceModeForm.errors.current_password}</ErrorMessage>
                                    ) : null}
                                </Field>
                            </FieldGroup>
                        </Fieldset>
                        {maintenanceModeForm.errors.maintenance_message ? (
                            <ErrorMessage>{maintenanceModeForm.errors.maintenance_message}</ErrorMessage>
                        ) : null}

                        <DialogActions>
                            <Button plain type="button" onClick={closeMaintenanceModeDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" color="blue" disabled={maintenanceModeForm.processing || !maintenanceModeForm.data.current_password}>
                                {maintenanceModeForm.processing
                                    ? maintenanceModeForm.data.maintenance_mode
                                        ? 'Enabling...'
                                        : 'Disabling...'
                                    : maintenanceModeForm.data.maintenance_mode
                                        ? 'Enable maintenance mode'
                                        : 'Disable maintenance mode'}
                            </Button>
                        </DialogActions>
                    </form>
                </DialogBody>
            </Dialog>
        </AdminLayout>
    );
}
