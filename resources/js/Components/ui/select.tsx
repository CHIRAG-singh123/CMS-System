import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef, useEffect, useRef } from 'react'

interface OptionData {
  value: string
  label: string
  disabled?: boolean
}

function CloseOnScroll({
  enabled,
  optionsRef,
}: {
  enabled: boolean
  optionsRef: React.RefObject<HTMLElement | null>
}) {
  const close = Headless.useClose()

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleScroll = (event: Event) => {
      const target = event.target

      if (target instanceof Node && optionsRef.current?.contains(target)) {
        return
      }

      close()
    }

    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [close, enabled, optionsRef])

  return null
}

export const Select = forwardRef(function Select(
  {
    className,
    multiple,
    optionsClassName,
    value,
    onChange,
    children,
    disabled,
    name,
    id,
    ...props
  }: {
    className?: string
    optionsClassName?: string
  } & Omit<Headless.SelectProps, 'as' | 'className'>,
  ref: React.ForwardedRef<HTMLSelectElement>
) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const optionsRef = useRef<HTMLDivElement | null>(null)

  // Convert standard native <option> elements inside `children` to clean JSON option objects.
  const options: OptionData[] = []
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === 'option') {
        options.push({
          value: String(child.props.value ?? ''),
          label: String(child.props.children ?? child.props.value ?? ''),
          disabled: child.props.disabled,
        })
      } else if (child.type === React.Fragment) {
        React.Children.forEach(child.props.children, (subChild) => {
          if (React.isValidElement(subChild) && subChild.type === 'option') {
            options.push({
              value: String(subChild.props.value ?? ''),
              label: String(subChild.props.children ?? subChild.props.value ?? ''),
              disabled: subChild.props.disabled,
            })
          }
        })
      }
    }
  })

  // Find the selected option's label to show on the button.
  const selectedValue = value !== undefined ? String(value) : ''
  const selectedOption = options.find((opt) => opt.value === selectedValue) || options[0]
  const displayLabel = selectedOption ? selectedOption.label : ''
  const handleSelectChange = (newValue: string) => {
    if (onChange) {
      // Simulate native <select> event so all forms are fully backward-compatible.
      const simulatedEvent = {
        target: {
          value: newValue,
          name: name,
        },
        currentTarget: {
          value: newValue,
          name: name,
        },
        persist: () => {},
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as React.ChangeEvent<HTMLSelectElement>
      onChange(simulatedEvent)
    }
  }

  return (
    <span data-slot="control" className="relative block w-full">
      {/* 
        Keep a hidden native select so that ref, native form submits, and native validation continue working perfectly.
      */}
      <select
        ref={ref}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        {children}
      </select>

      <Headless.Listbox value={selectedValue} onChange={handleSelectChange} disabled={disabled}>
        {({ open }) => (
          <>
            <Headless.ListboxButton
              ref={buttonRef}
              className={clsx([
                className,
                'group relative block w-full text-left cursor-default',
                'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:before:bg-zinc-900/90 dark:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
                'after:pointer-events-none after:absolute after:inset-0 after:rounded-[var(--app-surface-radius)] after:ring-transparent after:ring-inset sm:data-focus:after:ring-2 sm:data-focus:after:ring-zinc-500 dark:sm:data-focus:after:ring-zinc-400',
                'data-disabled:opacity-50 data-disabled:before:bg-zinc-100 data-disabled:before:shadow-none dark:data-disabled:before:bg-zinc-950/70',
              ])}
            >
              <span
                className={clsx([
                  'relative flex w-full items-center rounded-[var(--app-surface-radius)]',
                  'px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
                  'pr-10 sm:pr-8',
                  'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white',
                  'border border-zinc-950/10 group-data-hover:border-zinc-950/20 dark:border-white/10 dark:group-data-hover:border-white/20',
                  'bg-white/80 dark:bg-white/5',
                  'group-data-focus:border-zinc-500 dark:group-data-focus:border-zinc-400',
                  'group-data-invalid:border-red-500 dark:group-data-invalid:border-red-500',
                ])}
              >
                <span className="block min-w-0 truncate">{displayLabel}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-2.5">
                <svg
                  className="size-5 stroke-zinc-500 group-data-disabled:stroke-zinc-400 sm:size-4 dark:stroke-zinc-400 dark:group-data-disabled:stroke-zinc-600"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  fill="none"
                >
                  <path d="M5.25 6.25L8 3.75L10.75 6.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.25 9.75L8 12.25L10.75 9.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Headless.ListboxButton>

            <Headless.ListboxOptions
              ref={optionsRef}
              className={clsx([
                'absolute top-full left-0 isolate z-30 mt-1 w-full min-w-[12rem] scroll-py-1 rounded-[var(--app-surface-radius)] p-1 select-none focus:outline-none',
                'table-scrollbar max-h-[7.5rem] overflow-x-hidden overflow-y-auto overscroll-contain',
                'bg-white dark:bg-zinc-900',
                'shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 dark:ring-inset border border-zinc-950/10 dark:border-white/10',
                optionsClassName,
              ])}
            >
              <CloseOnScroll enabled={open} optionsRef={optionsRef} />

              {options.map((opt, index) => (
                <Headless.ListboxOption
                  key={`${opt.value}-${index}`}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={clsx(
                    'group/option relative flex cursor-default select-none items-center rounded-[calc(var(--app-surface-radius)-4px)] py-2 pr-3.5 pl-8 sm:py-1.5 sm:pr-3 sm:pl-7',
                    'text-base/6 text-zinc-900 dark:text-zinc-100 sm:text-sm/6',
                    'data-focus:bg-zinc-100 dark:data-focus:bg-zinc-800 data-focus:text-zinc-950 dark:data-focus:text-white',
                    'data-selected:font-semibold data-selected:bg-zinc-50 dark:data-selected:bg-zinc-800/40',
                    'data-disabled:cursor-not-allowed data-disabled:opacity-40'
                  )}
                >
                  {({ selected }) => (
                    <>
                      {selected && (
                        <span className="absolute inset-y-0 left-2.5 flex items-center pr-2 sm:left-2">
                          <svg
                            className="size-4 stroke-current text-zinc-600 dark:text-zinc-300"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path d="M4 8.5l3 3L12 4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                      <span className="block truncate">{opt.label}</span>
                    </>
                  )}
                </Headless.ListboxOption>
              ))}
            </Headless.ListboxOptions>
          </>
        )}
      </Headless.Listbox>
    </span>
  )
})
