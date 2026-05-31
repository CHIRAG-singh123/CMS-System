export interface PhoneCountryOption {
    iso2: string;
    name: string;
    dialCode: `+${number}`;
    minLength: number;
    maxLength: number;
}

export const PHONE_COUNTRIES = [
    { iso2: 'US', name: 'United States', dialCode: '+1', minLength: 10, maxLength: 10 },
    { iso2: 'IN', name: 'India', dialCode: '+91', minLength: 10, maxLength: 10 },
    { iso2: 'GB', name: 'United Kingdom', dialCode: '+44', minLength: 10, maxLength: 10 },
    { iso2: 'AE', name: 'United Arab Emirates', dialCode: '+971', minLength: 9, maxLength: 9 },
    { iso2: 'AU', name: 'Australia', dialCode: '+61', minLength: 9, maxLength: 9 },
    { iso2: 'CA', name: 'Canada', dialCode: '+1', minLength: 10, maxLength: 10 },
    { iso2: 'SG', name: 'Singapore', dialCode: '+65', minLength: 8, maxLength: 8 },
    { iso2: 'SA', name: 'Saudi Arabia', dialCode: '+966', minLength: 9, maxLength: 9 },
    { iso2: 'MY', name: 'Malaysia', dialCode: '+60', minLength: 9, maxLength: 10 },
    { iso2: 'NZ', name: 'New Zealand', dialCode: '+64', minLength: 8, maxLength: 10 },
    { iso2: 'DE', name: 'Germany', dialCode: '+49', minLength: 10, maxLength: 11 },
    { iso2: 'FR', name: 'France', dialCode: '+33', minLength: 9, maxLength: 9 },
    { iso2: 'ES', name: 'Spain', dialCode: '+34', minLength: 9, maxLength: 9 },
    { iso2: 'IT', name: 'Italy', dialCode: '+39', minLength: 9, maxLength: 10 },
    { iso2: 'IE', name: 'Ireland', dialCode: '+353', minLength: 9, maxLength: 9 },
    { iso2: 'ZA', name: 'South Africa', dialCode: '+27', minLength: 9, maxLength: 9 },
    { iso2: 'EG', name: 'Egypt', dialCode: '+20', minLength: 10, maxLength: 10 },
    { iso2: 'NG', name: 'Nigeria', dialCode: '+234', minLength: 10, maxLength: 10 },
    { iso2: 'KE', name: 'Kenya', dialCode: '+254', minLength: 9, maxLength: 9 },
    { iso2: 'PK', name: 'Pakistan', dialCode: '+92', minLength: 10, maxLength: 10 },
    { iso2: 'BD', name: 'Bangladesh', dialCode: '+880', minLength: 10, maxLength: 10 },
    { iso2: 'TH', name: 'Thailand', dialCode: '+66', minLength: 9, maxLength: 9 },
    { iso2: 'ID', name: 'Indonesia', dialCode: '+62', minLength: 9, maxLength: 12 },
    { iso2: 'PH', name: 'Philippines', dialCode: '+63', minLength: 10, maxLength: 10 },
    { iso2: 'VN', name: 'Vietnam', dialCode: '+84', minLength: 9, maxLength: 10 },
    { iso2: 'JP', name: 'Japan', dialCode: '+81', minLength: 10, maxLength: 10 },
    { iso2: 'KR', name: 'South Korea', dialCode: '+82', minLength: 9, maxLength: 10 },
    { iso2: 'CN', name: 'China', dialCode: '+86', minLength: 11, maxLength: 11 },
    { iso2: 'HK', name: 'Hong Kong', dialCode: '+852', minLength: 8, maxLength: 8 },
    { iso2: 'BR', name: 'Brazil', dialCode: '+55', minLength: 10, maxLength: 11 },
    { iso2: 'MX', name: 'Mexico', dialCode: '+52', minLength: 10, maxLength: 10 },
    { iso2: 'TR', name: 'Turkey', dialCode: '+90', minLength: 10, maxLength: 10 },
] as const satisfies readonly PhoneCountryOption[];

export type PhoneCountry = Readonly<PhoneCountryOption>;
export type PhoneCountryIso2 = (typeof PHONE_COUNTRIES)[number]['iso2'];

export interface ParsedPhoneValue {
    country: PhoneCountry;
    countryIso2: PhoneCountryIso2;
    nationalNumber: string;
}

export const DEFAULT_PHONE_COUNTRY_ISO2: PhoneCountryIso2 = 'IN';

export function sanitizePhoneDigits(value: string | null | undefined): string {
    return (value ?? '').replace(/\D+/g, '');
}

export function isPhoneCountryIso2(value: string): value is PhoneCountryIso2 {
    return PHONE_COUNTRIES.some((country) => country.iso2 === value);
}

export function resolvePhoneCountryIso2(value: string | null | undefined): PhoneCountryIso2 | null {
    return value && isPhoneCountryIso2(value) ? value : null;
}

export function getPhoneCountryOption(countryIso2: string | null | undefined): PhoneCountry {
    return (
        PHONE_COUNTRIES.find((country) => country.iso2 === countryIso2) ??
        PHONE_COUNTRIES.find((country) => country.iso2 === DEFAULT_PHONE_COUNTRY_ISO2) ??
        PHONE_COUNTRIES[0]
    );
}

export function getPhoneCountryLabel(country: Pick<PhoneCountry, 'dialCode'>): string {
    return country.dialCode;
}

export function formatPhoneValue(countryIso2: PhoneCountryIso2, nationalNumber: string): string {
    const country = getPhoneCountryOption(countryIso2);
    const digits = sanitizePhoneDigits(nationalNumber).slice(0, country.maxLength);

    return digits ? `${country.dialCode}${digits}` : '';
}

export function resolveInternationalPhone(
    value: string | null | undefined,
    countryIso2?: string | null,
): string | null {
    const trimmedValue = (value ?? '').trim();

    if (!trimmedValue) {
        return null;
    }

    if (trimmedValue.startsWith('+')) {
        return trimmedValue;
    }

    const digits = sanitizePhoneDigits(trimmedValue);

    if (!digits) {
        return null;
    }

    if (trimmedValue.startsWith('00')) {
        return `+${digits.slice(2)}`;
    }

    const resolvedCountry = resolvePhoneCountryIso2(countryIso2);

    return resolvedCountry ? formatPhoneValue(resolvedCountry, digits) : null;
}

export function resolvePhoneDisplay(value: string | null | undefined, countryIso2?: string | null): string | null {
    const trimmedValue = (value ?? '').trim();

    if (!trimmedValue) {
        return null;
    }

    return resolveInternationalPhone(trimmedValue, countryIso2) ?? trimmedValue;
}

export function parsePhoneValue(
    value: string | null | undefined,
    fallbackCountryIso2: PhoneCountryIso2 = DEFAULT_PHONE_COUNTRY_ISO2,
): ParsedPhoneValue {
    const fallbackCountry = getPhoneCountryOption(fallbackCountryIso2);
    const rawValue = (value ?? '').trim();
    const digits = sanitizePhoneDigits(rawValue);

    if (!digits) {
        return {
            country: fallbackCountry,
            countryIso2: fallbackCountry.iso2,
            nationalNumber: '',
        };
    }

    const hasInternationalPrefix = rawValue.startsWith('+') || rawValue.startsWith('00');
    const normalizedDigits = rawValue.startsWith('00') ? digits.slice(2) : digits;
    const fallbackDialCodeDigits = fallbackCountry.dialCode.slice(1);

    if (!hasInternationalPrefix && digits.length <= fallbackCountry.maxLength) {
        return {
            country: fallbackCountry,
            countryIso2: fallbackCountry.iso2,
            nationalNumber: digits.slice(0, fallbackCountry.maxLength),
        };
    }

    if (normalizedDigits.startsWith(fallbackDialCodeDigits)) {
        return {
            country: fallbackCountry,
            countryIso2: fallbackCountry.iso2,
            nationalNumber: normalizedDigits.slice(fallbackDialCodeDigits.length).slice(0, fallbackCountry.maxLength),
        };
    }

    const matchedCountry = [...PHONE_COUNTRIES]
        .sort((left, right) => right.dialCode.length - left.dialCode.length)
        .find((country) => normalizedDigits.startsWith(country.dialCode.slice(1)));

    if (!matchedCountry) {
        return {
            country: fallbackCountry,
            countryIso2: fallbackCountry.iso2,
            nationalNumber: digits.slice(0, fallbackCountry.maxLength),
        };
    }

    return {
        country: matchedCountry,
        countryIso2: matchedCountry.iso2,
        nationalNumber: normalizedDigits
            .slice(matchedCountry.dialCode.length - 1)
            .slice(0, matchedCountry.maxLength),
    };
}
