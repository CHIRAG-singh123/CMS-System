import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-blue-500 bg-blue-500/10 text-blue-700 focus:border-blue-500 focus:bg-blue-500/15 dark:text-white dark:focus:border-blue-400'
                    : 'border-transparent text-zinc-600 hover:border-zinc-950/10 hover:bg-zinc-950/5 hover:text-zinc-950 focus:border-zinc-950/10 focus:bg-zinc-950/5 focus:text-zinc-950 dark:text-zinc-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white dark:focus:border-white/10 dark:focus:bg-white/5 dark:focus:text-white'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
