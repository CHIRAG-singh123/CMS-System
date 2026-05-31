import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';

export default function SecondaryButton({
    type = 'button',
    className = '',
    color: _color,
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            {...props}
            type={type}
            outline
            className={clsx('justify-center uppercase tracking-[0.2em] sm:text-xs', className)}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}
