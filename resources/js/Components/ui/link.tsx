import * as Headless from '@headlessui/react'
import { isUrlMethodPair, mergeDataIntoQueryString, shouldIntercept } from '@inertiajs/core'
import { Link as InertiaLink } from '@inertiajs/react'
import { router } from '@inertiajs/react'
import React, { forwardRef, useState } from 'react'

type LinkProps = React.ComponentPropsWithoutRef<typeof InertiaLink> & {
  showProgress?: boolean
}

export const Link = forwardRef(function Link(
  {
    as,
    cacheFor,
    cacheTags,
    children,
    data = {},
    except = [],
    headers = {},
    href,
    method = 'get',
    onBefore,
    onCancel,
    onCancelToken,
    onClick,
    onError,
    onFinish,
    onPrefetched,
    onPrefetching,
    onProgress,
    onStart,
    onSuccess,
    only = [],
    prefetch,
    preserveScroll = false,
    preserveState = null,
    preserveUrl = false,
    queryStringArrayFormat = 'brackets',
    replace = false,
    showProgress,
    viewTransition = false,
    async = false,
    ...props
  }: LinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  let [inFlightCount, setInFlightCount] = useState(0)

  if (typeof showProgress === 'undefined') {
    return (
      <Headless.DataInteractive>
        <InertiaLink
          {...props}
          as={as}
          cacheFor={cacheFor}
          cacheTags={cacheTags}
          data={data}
          except={except}
          headers={headers}
          href={href}
          method={method}
          onBefore={onBefore}
          onCancel={onCancel}
          onCancelToken={onCancelToken}
          onClick={onClick}
          onError={onError}
          onFinish={onFinish}
          onPrefetched={onPrefetched}
          onPrefetching={onPrefetching}
          onProgress={onProgress}
          onStart={onStart}
          onSuccess={onSuccess}
          only={only}
          prefetch={prefetch}
          preserveScroll={preserveScroll}
          preserveState={preserveState}
          preserveUrl={preserveUrl}
          queryStringArrayFormat={queryStringArrayFormat}
          replace={replace}
          viewTransition={viewTransition}
          async={async}
          ref={ref}
        >
          {children}
        </InertiaLink>
      </Headless.DataInteractive>
    )
  }

  let resolvedMethod = (isUrlMethodPair(href) ? href.method : method).toLowerCase()
  let [resolvedHref, resolvedData] = mergeDataIntoQueryString(
    resolvedMethod,
    isUrlMethodPair(href) ? href.url : href,
    data,
    queryStringArrayFormat
  )

  return (
    <Headless.DataInteractive>
      <a
        {...props}
        href={resolvedHref}
        ref={ref}
        data-loading={inFlightCount > 0 ? '' : undefined}
        onClick={(event) => {
          onClick?.(event)

          if (!shouldIntercept(event)) {
            return
          }

          event.preventDefault()

          router.visit(resolvedHref, {
            async,
            data: resolvedData,
            except,
            headers,
            method: resolvedMethod,
            only,
            preserveScroll,
            preserveState: preserveState ?? resolvedMethod !== 'get',
            preserveUrl,
            replace,
            showProgress,
            viewTransition,
            onBefore,
            onCancel,
            onCancelToken,
            onError,
            onProgress,
            onSuccess,
            onStart: (visit) => {
              setInFlightCount((count) => count + 1)
              onStart?.(visit)
            },
            onFinish: (visit) => {
              setInFlightCount((count) => Math.max(0, count - 1))
              onFinish?.(visit)
            },
          })
        }}
      >
        {children}
      </a>
    </Headless.DataInteractive>
  )
})
