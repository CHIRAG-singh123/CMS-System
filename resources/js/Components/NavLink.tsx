import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center rounded-lg border border-transparent px-3 py-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-700 focus:border-blue-500 dark:text-white dark:focus:border-blue-400'
                    : 'text-zinc-600 hover:border-zinc-950/10 hover:bg-zinc-950/5 hover:text-zinc-950 focus:border-zinc-950/10 focus:text-zinc-950 dark:text-zinc-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white dark:focus:border-white/10 dark:focus:text-white') +
                className
            }
        >
            {children}
        </Link>
    );
}
