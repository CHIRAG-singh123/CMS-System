import type { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { Squares2X2Icon } from '@heroicons/react/20/solid';
import { AuthLayout } from '@/components/ui/auth-layout';
import { Text } from '@/components/ui/text';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen">
            <AuthLayout>
                <div className="w-full max-w-md rounded-[var(--app-surface-radius)] border border-zinc-950/10 bg-white/92 p-8 shadow-2xl shadow-zinc-950/10 ring-1 ring-zinc-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/35 dark:ring-white/5">
                    <Link href="/" className="flex items-center gap-3 rounded-2xl">
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20">
                            <Squares2X2Icon className="size-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">Laravel</p>
                            <Text className="mt-1 !text-zinc-500 dark:!text-zinc-300">Unified workspace</Text>
                        </div>
                    </Link>
                    <div className="mt-8">{children}</div>
                </div>
            </AuthLayout>
        </div>
    );
}
