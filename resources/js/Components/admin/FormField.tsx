import type { PropsWithChildren, ReactNode } from 'react';
import { Description, ErrorMessage, Field, Label } from '@/components/ui/fieldset';

interface FormFieldProps extends PropsWithChildren {
    label: string;
    error?: string;
    hint?: ReactNode;
}

export default function FormField({ label, error, hint, children }: FormFieldProps) {
    return (
        <Field>
            <Label>{label}</Label>
            {children}
            {hint ? <Description>{hint}</Description> : null}
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        </Field>
    );
}
