'use client'

import clsx from 'clsx'
import React, { Children, createContext, useContext } from 'react'
import { Link } from './link'

const TableContext = createContext<{
  bleed: boolean
  dense: boolean
  grid: boolean
  striped: boolean
  scrollable: boolean
  minRows: number
  rowCount: number
  virtualColumns: number
}>({
  bleed: false,
  dense: false,
  grid: false,
  striped: false,
  scrollable: false,
  minRows: 0,
  rowCount: 0,
  virtualColumns: 0,
})

function fillerCellClassName({
  bleed,
  grid,
  cellIndex,
  columnCount,
}: {
  bleed: boolean
  grid: boolean
  cellIndex: number
  columnCount: number
}) {
  return clsx(
    'px-4 py-0 first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) border-b border-zinc-950/5 dark:border-white/5',
    grid && 'border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5',
    !bleed && 'sm:first:pl-1 sm:last:pr-1',
    cellIndex === columnCount - 1 && 'text-center'
  )
}

function fillerBarClassName(cellIndex: number, columnCount: number) {
  return clsx(
    'block h-4 rounded-md bg-zinc-950/5 dark:bg-white/10',
    cellIndex === 0 && 'w-full max-w-48',
    cellIndex > 0 && cellIndex < columnCount - 1 && 'w-full max-w-44',
    cellIndex === columnCount - 1 && 'mx-auto w-16 rounded-full'
  )
}

export function Table({
  bleed = false,
  dense = false,
  grid = false,
  striped = false,
  scrollable = false,
  minRows = 0,
  rowCount = 0,
  virtualColumns = 0,
  toolbar,
  toolbarClassName,
  footer,
  footerClassName,
  className,
  children,
  ...props
}: {
  bleed?: boolean
  dense?: boolean
  grid?: boolean
  striped?: boolean
  scrollable?: boolean
  minRows?: number
  rowCount?: number
  virtualColumns?: number
  toolbar?: React.ReactNode
  toolbarClassName?: string
  footer?: React.ReactNode
  footerClassName?: string
} & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <TableContext.Provider
      value={{ bleed, dense, grid, striped, scrollable, minRows, rowCount, virtualColumns } as React.ContextType<typeof TableContext>}
    >
      <div className={clsx('flex min-h-0 flex-col', scrollable && 'flex-1')}>
        {toolbar ? (
          <div
            className={clsx(
              'mb-4 w-full border-b border-zinc-950/10 pb-4 dark:border-white/10',
              toolbarClassName
            )}
          >
            {toolbar}
          </div>
        ) : null}
        <div className={clsx('flow-root', scrollable && 'min-h-0 flex-1')}>
        <div
          {...props}
          className={clsx(
            className,
            '-mx-(--gutter) whitespace-nowrap',
            scrollable ? 'table-scrollbar h-full overflow-auto overscroll-contain' : 'overflow-x-auto'
          )}
        >
          <div className={clsx('inline-block min-w-full align-middle', !bleed && 'sm:px-(--gutter)')}>
            <table className="min-w-full text-left text-sm/6 text-zinc-950 dark:text-white">{children}</table>
          </div>
        </div>
      </div>
      {footer ? (
        <div
          className={clsx(
            'mt-4 border-t border-zinc-950/10 pt-4 dark:border-white/10',
            footerClassName
          )}
        >
          {footer}
        </div>
      ) : null}
      </div>
    </TableContext.Provider>
  )
}

export function TableHead({ className, ...props }: React.ComponentPropsWithoutRef<'thead'>) {
  return <thead {...props} className={clsx(className, 'text-zinc-500 dark:text-zinc-400')} />
}

export function TableBody({ children, ...props }: React.ComponentPropsWithoutRef<'tbody'>) {
  let { bleed, grid, minRows, rowCount, virtualColumns } = useContext(TableContext)
  let renderedRowCount = Children.count(children)
  let fillerCount = 0

  if (virtualColumns > 0) {
    fillerCount = rowCount === 0
      ? (renderedRowCount === 0 ? minRows : 0)
      : Math.max(minRows - rowCount, 0)
  }

  return (
    <tbody {...props}>
      {children}
      {Array.from({ length: fillerCount }).map((_, index) => (
        <tr key={`virtual-row-${index}`} aria-hidden="true" className="pointer-events-none select-none">
          {Array.from({ length: virtualColumns }).map((__, cellIndex) => (
            <td
              key={`virtual-row-${index}-cell-${cellIndex}`}
              className={fillerCellClassName({ bleed, grid, cellIndex, columnCount: virtualColumns })}
            >
              <div className="flex h-14 items-center opacity-40">
                <span className={fillerBarClassName(cellIndex, virtualColumns)} />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

const TableRowContext = createContext<{ href?: string; target?: string; title?: string }>({
  href: undefined,
  target: undefined,
  title: undefined,
})

export function TableRow({
  href,
  target,
  title,
  className,
  ...props
}: { href?: string; target?: string; title?: string } & React.ComponentPropsWithoutRef<'tr'>) {
  let { striped } = useContext(TableContext)

  return (
    <TableRowContext.Provider value={{ href, target, title } as React.ContextType<typeof TableRowContext>}>
      <tr
        {...props}
        className={clsx(
          className,
          href &&
            'has-[[data-row-link][data-focus]]:outline-2 has-[[data-row-link][data-focus]]:-outline-offset-2 has-[[data-row-link][data-focus]]:outline-zinc-500 dark:focus-within:bg-white/2.5',
          striped && 'even:bg-zinc-950/2.5 dark:even:bg-white/2.5',
          href && striped && 'hover:bg-zinc-950/5 dark:hover:bg-white/5',
          href && !striped && 'hover:bg-zinc-950/2.5 dark:hover:bg-white/2.5'
        )}
      />
    </TableRowContext.Provider>
  )
}

export function TableHeader({ className, ...props }: React.ComponentPropsWithoutRef<'th'>) {
  let { bleed, grid, scrollable } = useContext(TableContext)

  return (
    <th
      {...props}
      className={clsx(
        className,
        'border-b border-b-zinc-950/10 px-4 py-2 font-medium first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2)) dark:border-b-white/10',
        scrollable &&
          'sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:bg-zinc-900/95 dark:supports-[backdrop-filter]:bg-zinc-900/85',
        grid && 'border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5',
        !bleed && 'sm:first:pl-1 sm:last:pr-1'
      )}
    />
  )
}

export function TableCell({
  className,
  children,
  linkTabbable = false,
  ...props
}: React.ComponentPropsWithoutRef<'td'> & { linkTabbable?: boolean }) {
  let { bleed, dense, grid, striped } = useContext(TableContext)
  let { href, target, title } = useContext(TableRowContext)

  return (
    <td
      {...props}
      className={clsx(
        className,
        'relative px-4 first:pl-(--gutter,--spacing(2)) last:pr-(--gutter,--spacing(2))',
        !striped && 'border-b border-zinc-950/5 dark:border-white/5',
        grid && 'border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5',
        dense ? 'py-2.5' : 'py-4',
        !bleed && 'sm:first:pl-1 sm:last:pr-1'
      )}
    >
      {href && (
        <Link
          data-row-link
          href={href}
          target={target}
          aria-label={title}
          tabIndex={linkTabbable ? 0 : -1}
          preserveScroll={false}
          preserveState={false}
          className="absolute inset-0 focus:outline-hidden"
        />
      )}
      {children}
    </td>
  )
}
