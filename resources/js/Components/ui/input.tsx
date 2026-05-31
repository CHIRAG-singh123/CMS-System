import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'

export function InputGroup({ children }: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      data-slot="control"
      className={clsx(
        'relative isolate block',
        'has-[[data-slot=icon]:first-child]:[&_input]:pl-10 has-[[data-slot=icon]:last-child]:[&_input]:pr-10 sm:has-[[data-slot=icon]:first-child]:[&_input]:pl-8 sm:has-[[data-slot=icon]:last-child]:[&_input]:pr-8',
        '*:data-[slot=icon]:pointer-events-none *:data-[slot=icon]:absolute *:data-[slot=icon]:top-3 *:data-[slot=icon]:z-10 *:data-[slot=icon]:size-5 sm:*:data-[slot=icon]:top-2.5 sm:*:data-[slot=icon]:size-4',
        '[&>[data-slot=icon]:first-child]:left-3 sm:[&>[data-slot=icon]:first-child]:left-2.5 [&>[data-slot=icon]:last-child]:right-3 sm:[&>[data-slot=icon]:last-child]:right-2.5',
        '*:data-[slot=icon]:text-zinc-500 dark:*:data-[slot=icon]:text-zinc-400'
      )}
    >
      {children}
    </span>
  )
}

const dateTypes = ['date', 'datetime-local', 'month', 'time', 'week']
type DateType = (typeof dateTypes)[number]
const nonDigitPattern = /\D+/g
const allowedNumericControlKeys = new Set([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'Backspace',
  'Delete',
  'End',
  'Enter',
  'Escape',
  'Home',
  'Tab',
])

function sanitizeNumericValue(value: string, maxLength?: number | null) {
  const sanitized = value.replace(nonDigitPattern, '')

  return typeof maxLength === 'number' ? sanitized.slice(0, maxLength) : sanitized
}

function availableNumericSlots(input: HTMLInputElement, maxLength?: number | null) {
  if (typeof maxLength !== 'number') {
    return null
  }

  const selectionStart = input.selectionStart ?? input.value.length
  const selectionEnd = input.selectionEnd ?? input.value.length
  const selectedLength = Math.max(0, selectionEnd - selectionStart)

  return Math.max(0, maxLength - (input.value.length - selectedLength))
}

function insertSanitizedNumericText(input: HTMLInputElement, text: string, maxLength?: number | null) {
  const sanitized = sanitizeNumericValue(text, availableNumericSlots(input, maxLength))

  if (!sanitized) {
    return
  }

  const selectionStart = input.selectionStart ?? input.value.length
  const selectionEnd = input.selectionEnd ?? input.value.length

  input.setRangeText(sanitized, selectionStart, selectionEnd, 'end')
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function fileMatchesAccept(file: File, acceptRule: string) {
  const normalizedRule = acceptRule.trim().toLowerCase()

  if (!normalizedRule) {
    return true
  }

  if (normalizedRule.startsWith('.')) {
    return file.name.toLowerCase().endsWith(normalizedRule)
  }

  if (normalizedRule.endsWith('/*')) {
    return file.type.toLowerCase().startsWith(`${normalizedRule.slice(0, -1)}`)
  }

  return file.type.toLowerCase() === normalizedRule
}

function resolveDroppedFiles(files: FileList, accept?: string, multiple?: boolean) {
  const acceptRules = (accept ?? '')
    .split(',')
    .map((rule) => rule.trim())
    .filter(Boolean)

  const acceptedFiles = Array.from(files).filter((file) => (
    acceptRules.length === 0 || acceptRules.some((rule) => fileMatchesAccept(file, rule))
  ))

  return multiple ? acceptedFiles : acceptedFiles.slice(0, 1)
}

function assignDroppedFiles(input: HTMLInputElement, files: File[]) {
  if (!files.length) {
    return
  }

  const transfer = new DataTransfer()

  files.forEach((file) => {
    transfer.items.add(file)
  })

  input.files = transfer.files
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

type InputProps = {
  className?: string
  numericOnly?: boolean
  type?: 'email' | 'file' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' | DateType
} & Omit<Headless.InputProps, 'as' | 'className'>

export const Input = forwardRef(function Input(
  {
    className,
    accept,
    inputMode,
    multiple,
    numericOnly = false,
    onBeforeInput,
    onChange,
    onDragOver,
    onDrop,
    onKeyDown,
    onPaste,
    pattern,
    type,
    maxLength,
    ...props
  }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const resolvedType = numericOnly ? 'text' : type
  const numericMaxLength = numericOnly && typeof maxLength === 'number' ? maxLength : null

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
      <Headless.Input
        ref={ref}
        {...props}
        type={resolvedType}
        accept={accept}
        maxLength={maxLength}
        multiple={multiple}
        inputMode={numericOnly ? inputMode ?? 'numeric' : inputMode}
        pattern={numericOnly ? pattern ?? '[0-9]*' : pattern}
        onBeforeInput={(event) => {
          onBeforeInput?.(event)

          if (event.defaultPrevented || !numericOnly) {
            return
          }

          const inputEvent = event.nativeEvent as InputEvent

          if (inputEvent.data && sanitizeNumericValue(inputEvent.data) !== inputEvent.data) {
            event.preventDefault()
            return
          }

          if (
            inputEvent.data &&
            numericMaxLength !== null &&
            availableNumericSlots(event.currentTarget, numericMaxLength) === 0
          ) {
            event.preventDefault()
          }
        }}
        onChange={(event) => {
          if (numericOnly) {
            const sanitizedValue = sanitizeNumericValue(event.target.value, numericMaxLength)

            if (sanitizedValue !== event.target.value) {
              event.target.value = sanitizedValue
            }
          }

          onChange?.(event)
        }}
        onDrop={(event) => {
          onDrop?.(event)

          if (event.defaultPrevented) {
            return
          }

          if (resolvedType === 'file') {
            event.preventDefault()

            const droppedFiles = resolveDroppedFiles(event.dataTransfer.files, accept, multiple)
            assignDroppedFiles(event.currentTarget, droppedFiles)
            return
          }

          if (!numericOnly) {
            return
          }

          const droppedText = event.dataTransfer.getData('text')

          event.preventDefault()
          insertSanitizedNumericText(event.currentTarget, droppedText, numericMaxLength)
        }}
        onDragOver={(event) => {
          onDragOver?.(event)

          if (event.defaultPrevented || resolvedType !== 'file') {
            return
          }

          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)

          if (
            event.defaultPrevented ||
            !numericOnly ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey ||
            event.key.length !== 1 ||
            allowedNumericControlKeys.has(event.key)
          ) {
            return
          }

          if (sanitizeNumericValue(event.key) !== event.key) {
            event.preventDefault()
            return
          }

          if (
            numericMaxLength !== null &&
            availableNumericSlots(event.currentTarget, numericMaxLength) === 0
          ) {
            event.preventDefault()
          }
        }}
        onPaste={(event) => {
          onPaste?.(event)

          if (event.defaultPrevented || !numericOnly) {
            return
          }

          const pastedText = event.clipboardData.getData('text')

          event.preventDefault()
          insertSanitizedNumericText(event.currentTarget, pastedText, numericMaxLength)
        }}
        className={clsx([
          // Date classes
          resolvedType &&
            dateTypes.includes(resolvedType as DateType) && [
              '[&::-webkit-datetime-edit-fields-wrapper]:p-0',
              '[&::-webkit-date-and-time-value]:min-h-[1.5em]',
              '[&::-webkit-datetime-edit]:inline-flex',
              '[&::-webkit-datetime-edit]:p-0',
              '[&::-webkit-datetime-edit-year-field]:p-0',
              '[&::-webkit-datetime-edit-month-field]:p-0',
              '[&::-webkit-datetime-edit-day-field]:p-0',
              '[&::-webkit-datetime-edit-hour-field]:p-0',
              '[&::-webkit-datetime-edit-minute-field]:p-0',
              '[&::-webkit-datetime-edit-second-field]:p-0',
              '[&::-webkit-datetime-edit-millisecond-field]:p-0',
              '[&::-webkit-datetime-edit-meridiem-field]:p-0',
            ],
          'relative block w-full appearance-none rounded-[var(--app-surface-radius)] px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
          'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
          '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(24_24_27)] [&:-webkit-autofill]:[caret-color:rgb(24_24_27)] [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_rgb(255_255_255)_inset] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:white] dark:[&:-webkit-autofill]:[caret-color:white] dark:[&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_rgb(24_24_27)_inset]',
          'border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20',
          'bg-white/80 dark:bg-white/5',
          'focus:border-zinc-500 focus:outline-none focus-visible:outline-none focus:ring-0 focus:ring-transparent focus:shadow-none dark:focus:border-zinc-400',
          'data-invalid:border-red-500 data-invalid:data-hover:border-red-500',
          'data-disabled:border-zinc-950/10 data-disabled:bg-zinc-100 data-hover:data-disabled:border-zinc-950/10 dark:data-disabled:border-white/10 dark:data-disabled:bg-white/2.5 dark:data-hover:data-disabled:border-white/10',
          'scheme-light dark:scheme-dark',
        ])}
      />
    </span>
  )
})
