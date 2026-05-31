import type { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { Heading, Subheading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

const cardClassName = 'rounded-[2rem] border border-zinc-950/10 bg-white/90 p-6 shadow-lg shadow-zinc-950/5 ring-1 ring-zinc-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75 dark:shadow-black/20 dark:ring-white/5';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen px-4 py-6 sm:px-6">
                <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-center">
                    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
                        <section className={`${cardClassName} relative overflow-hidden p-8 sm:p-10`}>
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-blue-500/14 via-sky-500/10 to-transparent dark:via-violet-500/8" />
                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">
                                    <SparklesIcon className="size-4" />
                                    Theme-ready UI
                                </div>
                                <Heading className="mt-6 text-4xl sm:text-5xl">
                                    Catalyst-aligned Laravel workspace
                                </Heading>
                                <Text className="mt-4 max-w-2xl text-base sm:text-lg">
                                    A reusable Laravel + Inertia interface with a shared Catalyst-style shell across account screens and the admin panel.
                                </Text>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    {auth.user ? (
                                        <Button href={route('dashboard')} color="blue">
                                            Dashboard
                                        </Button>
                                    ) : (
                                        <Button href={route('login')} color="blue">
                                            Log in
                                        </Button>
                                    )}
                                    <Button href="/admin/login" outline>
                                        Admin login
                                    </Button>
                                </div>
                            </div>
                        </section>

                        <div className="grid gap-6">
                            <section className={cardClassName}>
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20">
                                        <ShieldCheckIcon className="size-5" />
                                    </span>
                                    <Subheading>Single design system</Subheading>
                                </div>
                                <Text className="mt-4">
                                    Shared layouts, form controls, dialogs, tables, badges, and navigation now align to one theme-aware Catalyst direction.
                                </Text>
                            </section>

                            <section className={cardClassName}>
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/20">
                                        <ArrowRightIcon className="size-5" />
                                    </span>
                                    <Subheading>Runtime</Subheading>
                                </div>
                                <Text className="mt-4">
                                    Laravel v{laravelVersion} running on PHP v{phpVersion}.
                                </Text>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
