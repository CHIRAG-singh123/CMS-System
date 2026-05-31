import type React from 'react'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-scrollbar relative flex h-dvh flex-col overflow-y-auto px-4 py-6 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-zinc-500/10 via-zinc-400/6 to-transparent dark:from-zinc-700/12 dark:via-zinc-600/5" />
      <div className="relative flex min-h-full grow items-center justify-center">
        {children}
      </div>
    </main>
  )
}
