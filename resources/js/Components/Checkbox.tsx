import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'size-4 rounded border border-white/15 bg-white/5 text-blue-500 shadow-sm shadow-black/20 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 ' +
                className
            }
        />
    );
}
