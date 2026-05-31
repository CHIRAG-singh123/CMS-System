import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'

export const Textarea = forwardRef(function Textarea(
  {
    className,
    resizable = true,
    ...props
  }: { className?: string; resizable?: boolean } & Omit<Headless.TextareaProps, 'as' | 'className'>,
  ref: React.ForwardedRef<HTMLTextAreaElement>
) {
  return (
    <span
      data-slot="control"
      className={clsx([
        className,
        'relative block w-full',
        'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:before:bg-zinc-900/90 dark:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-[var(--app-surface-radius)] after:ring-transparent after:ring-inset sm:focus-within:after:ring-2 sm:focus-within:after:ring-zinc-500 dark:sm:focus-within:after:ring-zinc-400',
        'has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-100 has-data-disabled:before:shadow-none dark:has-data-disabled:before:bg-zinc-950/70',
      ])}
    >
      <Headless.Textarea
        ref={ref}
        {...props}
        className={clsx([
          'relative block h-full w-full appearance-none rounded-[var(--app-surface-radius)] px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
          'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
          'border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20',
          'bg-white/80 dark:bg-white/5',
          'focus:border-zinc-500 focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-transparent focus:shadow-none dark:focus:border-zinc-400',
          'data-invalid:border-red-500 data-invalid:data-hover:border-red-500',
          'disabled:border-zinc-950/10 disabled:bg-zinc-100 data-hover:disabled:border-zinc-950/10 dark:disabled:border-white/10 dark:disabled:bg-white/2.5 dark:data-hover:disabled:border-white/10',
          resizable ? 'resize-y' : 'resize-none',
        ])}
      />
    </span>
  )
})
