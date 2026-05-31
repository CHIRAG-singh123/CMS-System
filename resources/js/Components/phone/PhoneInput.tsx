import { useEffect, useState, type ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
    DEFAULT_PHONE_COUNTRY_ISO2,
    PHONE_COUNTRIES,
    formatPhoneValue,
    getPhoneCountryLabel,
    isPhoneCountryIso2,
    parsePhoneValue,
    sanitizePhoneDigits,
    type PhoneCountry,
    type PhoneCountryIso2,
} from '@/types/phone';

type PhoneInputBaseProps = Omit<
    ComponentPropsWithoutRef<typeof Input>,
    'className' | 'maxLength' | 'minLength' | 'numericOnly' | 'onChange' | 'type' | 'value'
>;

interface PhoneInputProps extends PhoneInputBaseProps {
    value: string;
    onChange: (value: string) => void;
    country?: PhoneCountryIso2;
    onCountryChange?: (country: PhoneCountryIso2) => void;
    countries?: readonly PhoneCountry[];
    defaultCountry?: PhoneCountryIso2;
    format?: 'international' | 'national';
    className?: string;
    inputClassName?: string;
    selectClassName?: string;
    countryId?: string;
    countryName?: string;
}

function resolveCountry(
    countries: readonly PhoneCountry[],
    countryIso2: string | null | undefined,
    fallbackCountryIso2: PhoneCountryIso2,
): PhoneCountry {
    return (
        countries.find((country) => country.iso2 === countryIso2) ??
        countries.find((country) => country.iso2 === fallbackCountryIso2) ??
        countries[0]
    );
}

function getDisplayedNationalNumber(value: string, country: PhoneCountry, fallbackCountryIso2: PhoneCountryIso2): string {
    const rawValue = value.trim();
    const digits = sanitizePhoneDigits(rawValue);

    if (!digits) {
        return '';
    }

    if (rawValue.startsWith('+') || rawValue.startsWith('00')) {
        const normalizedDigits = rawValue.startsWith('00') ? digits.slice(2) : digits;
        const dialCodeDigits = country.dialCode.slice(1);

        if (normalizedDigits.startsWith(dialCodeDigits)) {
            return normalizedDigits.slice(dialCodeDigits.length).slice(0, country.maxLength);
        }
    }

    return parsePhoneValue(value, fallbackCountryIso2).nationalNumber.slice(0, country.maxLength);
}

export default function PhoneInput({
    value,
    onChange,
    country,
    onCountryChange,
    countries = PHONE_COUNTRIES,
    defaultCountry = DEFAULT_PHONE_COUNTRY_ISO2,
    format = 'national',
    autoComplete,
    className,
    countryId,
    countryName,
    disabled,
    id,
    inputClassName,
    placeholder,
    required,
    selectClassName,
    ...inputProps
}: PhoneInputProps) {
    const fallbackCountry = resolveCountry(countries, defaultCountry, DEFAULT_PHONE_COUNTRY_ISO2);
    const [uncontrolledCountry, setUncontrolledCountry] = useState<PhoneCountryIso2>(fallbackCountry.iso2);

    const parsedValue = parsePhoneValue(value, uncontrolledCountry);
    const currentCountry = resolveCountry(
        countries,
        country ?? (format === 'international' ? parsedValue.countryIso2 : uncontrolledCountry),
        fallbackCountry.iso2,
    );
    const currentNationalNumber = getDisplayedNationalNumber(value, currentCountry, currentCountry.iso2);

    useEffect(() => {
        if (country) {
            return;
        }

        if (!value) {
            setUncontrolledCountry((previousCountry) =>
                previousCountry === fallbackCountry.iso2 ? previousCountry : fallbackCountry.iso2,
            );

            return;
        }

        if (format === 'international' && parsedValue.countryIso2 !== uncontrolledCountry) {
            setUncontrolledCountry(parsedValue.countryIso2);
        }
    }, [country, fallbackCountry.iso2, format, parsedValue.countryIso2, uncontrolledCountry, value]);

    const handleCountryChange = (nextCountryIso2: PhoneCountryIso2) => {
        const nextCountry = resolveCountry(countries, nextCountryIso2, fallbackCountry.iso2);
        const nextNationalNumber = currentNationalNumber.slice(0, nextCountry.maxLength);

        if (!country) {
            setUncontrolledCountry(nextCountry.iso2);
        }

        onCountryChange?.(nextCountry.iso2);

        if (format === 'international') {
            onChange(formatPhoneValue(nextCountry.iso2, nextNationalNumber));

            return;
        }

        if (nextNationalNumber !== currentNationalNumber) {
            onChange(nextNationalNumber);
        }
    };

    return (
        <div data-slot="control" className={clsx('grid gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)]', className)}>
            <Select
                id={countryId ?? (id ? `${id}-country` : undefined)}
                name={countryName}
                value={currentCountry.iso2}
                disabled={disabled}
                required={required}
                onChange={(event) => {
                    if (!isPhoneCountryIso2(event.target.value)) {
                        return;
                    }

                    handleCountryChange(event.target.value);
                }}
                className={selectClassName}
                optionsClassName="!min-w-0"
            >
                {countries.map((option) => (
                    <option key={option.iso2} value={option.iso2}>
                        {getPhoneCountryLabel(option)}
                    </option>
                ))}
            </Select>

            <Input
                {...inputProps}
                id={id}
                value={currentNationalNumber}
                type="tel"
                numericOnly
                maxLength={currentCountry.maxLength}
                minLength={currentCountry.minLength}
                disabled={disabled}
                required={required}
                autoComplete={autoComplete ?? (format === 'international' ? 'tel' : 'tel-national')}
                placeholder={placeholder ?? 'Phone number'}
                className={inputClassName}
                onChange={(event) => {
                    const nextNationalNumber = sanitizePhoneDigits(event.target.value).slice(0, currentCountry.maxLength);

                    if (format === 'international') {
                        onChange(formatPhoneValue(currentCountry.iso2, nextNationalNumber));

                        return;
                    }

                    onChange(nextNationalNumber);
                }}
            />
        </div>
    );
}
