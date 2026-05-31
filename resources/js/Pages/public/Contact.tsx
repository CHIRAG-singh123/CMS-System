import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import PhoneInput from '@/components/phone/PhoneInput';
import { Heading } from '@/components/ui/heading';
import { Description, ErrorMessage, Field, FieldGroup, Fieldset, Label } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import {
    PublicCard,
    PublicHero,
    PublicPanel,
    PublicSectionHeader,
    PublicSubheading,
} from '@/components/public/PublicPageShell';
import PublicLayout from '@/layouts/PublicLayout';
import { asContactSections } from '@/lib/public-cms';
import type { ContactPageProps } from '@/types/public';
import type { PageProps } from '@/types';
import {
    DEFAULT_PHONE_COUNTRY_ISO2,
    resolveInternationalPhone,
    resolvePhoneCountryIso2,
    resolvePhoneDisplay,
    sanitizePhoneDigits,
    type PhoneCountryIso2,
} from '@/types/phone';
import { storageUrl } from '@/utils/admin';

const recordRequiredTypes = new Set(['product', 'service', 'quote']);

interface MapDisplay {
    frameSrc: string | null;
    externalUrl: string | null;
    note: string | null;
}

interface ContactInquiryForm {
    inquiry_type: string;
    product_service_id: string;
    name: string;
    email: string;
    phone: string;
    phone_country: PhoneCountryIso2;
    subject: string;
    message: string;
    website: string;
}

function normalizeMapValue(value?: string | null): string {
    return (value ?? '').trim();
}

function extractIframeSrc(value: string): string | null {
    const match = value.match(/<iframe[^>]+src=["']([^"']+)["']/i);

    return match?.[1]?.replaceAll('&amp;', '&') ?? null;
}

function isHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);

        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function isEmbeddableGoogleMapUrl(value: string): boolean {
    if (!isHttpUrl(value)) {
        return false;
    }

    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    return (host === 'www.google.com' || host === 'maps.google.com')
        && (url.pathname.startsWith('/maps/embed') || url.searchParams.get('output') === 'embed');
}

function googleSearchEmbed(address?: string | null): string | null {
    const query = normalizeMapValue(address);

    return query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : null;
}

function googleSearchUrl(address?: string | null): string | null {
    const query = normalizeMapValue(address);

    return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

function resolveMapDisplay(mapValue?: string | null, address?: string | null): MapDisplay | null {
    const savedValue = normalizeMapValue(mapValue);
    const iframeSrc = savedValue ? extractIframeSrc(savedValue) : null;
    const candidateSrc = iframeSrc ?? savedValue;
    const addressFrameSrc = googleSearchEmbed(address);
    const addressUrl = googleSearchUrl(address);

    if (candidateSrc && isEmbeddableGoogleMapUrl(candidateSrc)) {
        return {
            frameSrc: candidateSrc,
            externalUrl: addressUrl,
            note: null,
        };
    }

    if (candidateSrc && isHttpUrl(candidateSrc)) {
        return {
            frameSrc: addressFrameSrc,
            externalUrl: candidateSrc,
            note: addressFrameSrc ? 'Preview is generated from the saved address because this Google Maps share link cannot be embedded.' : 'Google Maps share links cannot be embedded. Open the map in a new tab.',
        };
    }

    if (addressFrameSrc) {
        return {
            frameSrc: addressFrameSrc,
            externalUrl: addressUrl,
            note: null,
        };
    }

    return null;
}

function resolvePhoneLink(value?: string | null, countryIso2?: string | null): { href: string; text: string } | null {
    const text = resolvePhoneDisplay(value, countryIso2);

    if (!text) {
        return null;
    }

    const hrefValue = resolveInternationalPhone(value, countryIso2) ?? sanitizePhoneDigits(text) ?? text;

    return {
        href: `tel:${hrefValue}`,
        text,
    };
}

function resolveWhatsappDisplay(value?: string | null, countryIso2?: string | null): { href: string; text: string } | null {
    const text = resolvePhoneDisplay(value, countryIso2);

    if (!text) {
        return null;
    }

    const digits = sanitizePhoneDigits(resolveInternationalPhone(value, countryIso2) ?? text);

    if (!digits) {
        return null;
    }

    return {
        href: `https://wa.me/${digits}`,
        text,
    };
}

export default function Contact({ page, settings, productServices, inquiryTypes }: ContactPageProps) {
    const sections = asContactSections(page.sections);
    const bannerImage = storageUrl(page.banner_image);
    const flashSuccess = usePage<PageProps>().props.flash.success;
    const mapDisplay = resolveMapDisplay(settings.map_embed, settings.map_address);
    const companyPhone = resolvePhoneLink(settings.phone, settings.phone_country);
    const companyWhatsapp = settings.whatsapp_chat_enabled
        ? resolveWhatsappDisplay(settings.whatsapp_number, settings.whatsapp_number_country)
        : null;
    const form = useForm<ContactInquiryForm>({
        inquiry_type: inquiryTypes[0] ?? 'general',
        product_service_id: '',
        name: '',
        email: '',
        phone: '',
        phone_country: resolvePhoneCountryIso2(settings.phone_country) ?? DEFAULT_PHONE_COUNTRY_ISO2,
        subject: '',
        message: '',
        website: '',
    });

    const requiresRecord = recordRequiredTypes.has(form.data.inquiry_type);
    const visibleServices = productServices.filter((record) => form.data.inquiry_type === 'quote' || record.type === form.data.inquiry_type);

    const updateInquiryType = (inquiryType: string) => {
        const nextRequiresRecord = recordRequiredTypes.has(inquiryType);

        form.setData((data) => ({
            ...data,
            inquiry_type: inquiryType,
            product_service_id: nextRequiresRecord && productServices.some((record) => (
                String(record.id) === data.product_service_id && (inquiryType === 'quote' || record.type === inquiryType)
            ))
                ? data.product_service_id
                : '',
        }));
    };

    return (
        <PublicLayout title={page.meta_title ?? page.title} description={page.meta_description}>
            <div className="space-y-8 sm:space-y-10">
                <PublicHero
                    eyebrow={sections.hero.eyebrow}
                    title={sections.hero.title}
                    body={sections.hero.body}
                    bannerImage={bannerImage}
                >
                    <PublicCard className="border-[color:var(--public-border-strong)] bg-[color:var(--public-surface-strong)]">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--public-text-muted)]">
                            Direct response
                        </p>
                        <Text className="mt-4 !text-[color:var(--public-text-soft)]">{sections.intro.body}</Text>
                    </PublicCard>
                </PublicHero>

                <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
                    <div className="space-y-6">
                        <PublicPanel>
                            <PublicSectionHeader
                                eyebrow={sections.form.eyebrow}
                                title={sections.form.title}
                                body={sections.form.body}
                            />

                            {flashSuccess ? (
                                <div className="mt-6 rounded-[1.4rem] border border-[color:var(--public-border-strong)] bg-[color:var(--public-accent-soft)] px-4 py-3 text-sm font-medium text-[color:var(--public-text)]">
                                    {flashSuccess}
                                </div>
                            ) : null}

                            <form
                                className="mt-8"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post('/contact-us/inquiries', {
                                        preserveScroll: true,
                                        preserveState: true,
                                        onSuccess: () => form.reset(),
                                    });
                                }}
                            >
                                <Fieldset>
                                    <FieldGroup className="space-y-6">
                                        <Field>
                                            <Label>Inquiry type</Label>
                                            <Select value={form.data.inquiry_type} onChange={(event) => updateInquiryType(event.target.value)}>
                                                {inquiryTypes.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type.replace(/[_-]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase())}
                                                    </option>
                                                ))}
                                            </Select>
                                            {form.errors.inquiry_type ? <ErrorMessage>{form.errors.inquiry_type}</ErrorMessage> : null}
                                        </Field>

                                        {requiresRecord ? (
                                            <Field>
                                                <Label>Product / service</Label>
                                                <Description>Select the published record most closely related to this inquiry.</Description>
                                                <Select value={form.data.product_service_id} onChange={(event) => form.setData('product_service_id', event.target.value)}>
                                                    <option value="">Choose a record</option>
                                                    {visibleServices.map((record) => (
                                                        <option key={record.id} value={record.id}>
                                                            {record.title} ({record.type})
                                                        </option>
                                                    ))}
                                                </Select>
                                                {form.errors.product_service_id ? <ErrorMessage>{form.errors.product_service_id}</ErrorMessage> : null}
                                            </Field>
                                        ) : null}

                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <Field>
                                                <Label>Full name</Label>
                                                <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                                                {form.errors.name ? <ErrorMessage>{form.errors.name}</ErrorMessage> : null}
                                            </Field>
                                            <Field>
                                                <Label>Email address</Label>
                                                <Input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} />
                                                {form.errors.email ? <ErrorMessage>{form.errors.email}</ErrorMessage> : null}
                                            </Field>
                                        </div>

                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <Field>
                                                <Label>Phone</Label>
                                                <PhoneInput
                                                    id="phone"
                                                    autoComplete="tel"
                                                    country={form.data.phone_country}
                                                    countryId="phone-country"
                                                    format="national"
                                                    value={form.data.phone}
                                                    onChange={(value) => form.setData('phone', value)}
                                                    onCountryChange={(country) => form.setData('phone_country', country)}
                                                />
                                                {form.errors.phone || form.errors.phone_country ? <ErrorMessage>{form.errors.phone ?? form.errors.phone_country}</ErrorMessage> : null}
                                            </Field>
                                            <Field>
                                                <Label>Subject</Label>
                                                <Input value={form.data.subject} onChange={(event) => form.setData('subject', event.target.value)} />
                                                {form.errors.subject ? <ErrorMessage>{form.errors.subject}</ErrorMessage> : null}
                                            </Field>
                                        </div>

                                        <Field>
                                            <Label>Message</Label>
                                            <Textarea rows={6} value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} />
                                            {form.errors.message ? <ErrorMessage>{form.errors.message}</ErrorMessage> : null}
                                        </Field>

                                        <div className="hidden">
                                            <Input tabIndex={-1} autoComplete="off" value={form.data.website} onChange={(event) => form.setData('website', event.target.value)} />
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <Button type="submit" color="amber" className="!rounded-full" disabled={form.processing}>
                                                {form.processing ? 'Sending inquiry...' : sections.form.submitLabel}
                                            </Button>
                                        </div>
                                    </FieldGroup>
                                </Fieldset>
                            </form>
                        </PublicPanel>

                        <PublicPanel className="bg-[color:var(--public-surface-dark)] text-white">
                            <PublicSectionHeader
                                eyebrow={sections.contact.eyebrow}
                                title={sections.contact.title}
                                body={sections.contact.body}
                                invert
                            />
                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                {settings.export_email ? (
                                    <PublicCard className="border-white/10 bg-white/6">
                                        <PublicSubheading className="!text-white">Email</PublicSubheading>
                                        <a href={`mailto:${settings.export_email}`} className="mt-3 block text-sm text-white/72 transition hover:text-white">
                                            {settings.export_email}
                                        </a>
                                    </PublicCard>
                                ) : null}
                                {companyPhone ? (
                                    <PublicCard className="border-white/10 bg-white/6">
                                        <PublicSubheading className="!text-white">Phone</PublicSubheading>
                                        <a href={companyPhone.href} className="mt-3 block text-sm text-white/72 transition hover:text-white">
                                            {companyPhone.text}
                                        </a>
                                    </PublicCard>
                                ) : null}
                                {companyWhatsapp ? (
                                    <PublicCard className="border-white/10 bg-white/6">
                                        <PublicSubheading className="!text-white">WhatsApp</PublicSubheading>
                                        <a
                                            href={companyWhatsapp.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 block text-sm text-white/72 transition hover:text-white"
                                        >
                                            {companyWhatsapp.text}
                                        </a>
                                    </PublicCard>
                                ) : null}
                                {settings.company_address ? (
                                    <PublicCard className="border-white/10 bg-white/6 sm:col-span-2">
                                        <PublicSubheading className="!text-white">Address</PublicSubheading>
                                        <Text className="mt-3 !text-white/72">{settings.company_address}</Text>
                                    </PublicCard>
                                ) : null}
                            </div>
                        </PublicPanel>
                    </div>

                    <div className="space-y-6">
                        {mapDisplay ? (
                            <PublicPanel>
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--public-text-muted)]">
                                    Location
                                </p>
                                <Heading className="public-display mt-4 text-4xl/11 font-normal tracking-[-0.03em] !text-[color:var(--public-text)]">
                                    {settings.map_title ?? 'Map'}
                                </Heading>
                                <Text className="mt-3 !text-[color:var(--public-text-soft)]">{settings.map_address}</Text>
                                <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-[color:var(--public-border)] bg-[color:var(--public-bg-soft)]">
                                    {mapDisplay.frameSrc ? (
                                        <iframe
                                            src={mapDisplay.frameSrc}
                                            title={settings.map_title ?? 'Map'}
                                            className="h-80 w-full"
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
                                            <PublicSubheading>Map preview unavailable</PublicSubheading>
                                            <Text className="mt-3 !text-[color:var(--public-text-soft)]">
                                                This saved map link opens correctly in Google Maps, but cannot be shown inside an embedded frame.
                                            </Text>
                                        </div>
                                    )}
                                </div>
                                {mapDisplay.note ? <Text className="mt-4 !text-[color:var(--public-text-muted)]">{mapDisplay.note}</Text> : null}
                                {mapDisplay.externalUrl ? (
                                    <a
                                        href={mapDisplay.externalUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-5 inline-flex rounded-full bg-[color:var(--public-surface-dark)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--public-shadow)] transition hover:-translate-y-0.5"
                                    >
                                        Open map
                                    </a>
                                ) : null}
                            </PublicPanel>
                        ) : null}

                        <PublicPanel className="bg-[color:var(--public-surface-dark)] text-white">
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[color:var(--public-accent)]">
                                Closing CTA
                            </p>
                            <Heading className="public-display mt-4 text-4xl/11 font-normal tracking-[-0.03em] !text-white sm:text-5xl/[1.06]">
                                {sections.cta.title}
                            </Heading>
                            <Text className="mt-4 !text-white/72">{sections.cta.body}</Text>
                            <div className="mt-6">
                                <Button href={sections.cta.primaryCtaHref} color="amber" className="!rounded-full">
                                    {sections.cta.primaryCtaLabel}
                                </Button>
                            </div>
                        </PublicPanel>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
