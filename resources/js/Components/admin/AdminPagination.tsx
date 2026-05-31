import clsx from 'clsx';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Dropdown, DropdownButton, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/ui/dropdown';
import { Pagination, PaginationGap, PaginationList, PaginationNext, PaginationPage, PaginationPrevious } from '@/components/ui/pagination';
import type { Paginated } from '@/types/admin';

interface AdminPaginationProps<T> {
    paginator: Paginated<T>;
    className?: string;
    only?: string[];
    async?: boolean;
    showProgress?: boolean;
    preserveState?: boolean;
    preserveScroll?: boolean;
    replace?: boolean;
}

const PER_PAGE_OPTIONS = [10, 15, 50, 100] as const;

function buildPageWindow(currentPage: number, lastPage: number): Array<number | 'gap'> {
    if (lastPage <= 5) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    if (currentPage <= 2) {
        return [1, 2, 'gap', lastPage - 1, lastPage];
    }

    if (currentPage >= lastPage - 1) {
        return [1, 2, 'gap', lastPage - 1, lastPage];
    }

    return [1, 'gap', currentPage - 1, currentPage, currentPage + 1, 'gap', lastPage];
}

export default function AdminPagination<T>({
    paginator,
    className,
    only,
    async,
    showProgress,
    preserveState,
    preserveScroll,
    replace,
}: AdminPaginationProps<T>) {
    const page = usePage();
    const currentUrl = new URL(page.url, 'http://localhost');

    const buildHref = (pageNumber: number, perPage = paginator.per_page) => {
        const params = new URLSearchParams(currentUrl.search);

        params.set('per_page', String(perPage));

        if (pageNumber <= 1) {
            params.delete('page');
        } else {
            params.set('page', String(pageNumber));
        }

        const query = params.toString();

        return `${currentUrl.pathname}${query ? `?${query}` : ''}`;
    };

    const linkProps = {
        only,
        async,
        showProgress,
        preserveState,
        preserveScroll,
        replace,
        prefetch: false,
    } as const;

    const perPageLinkProps = {
        ...linkProps,
        preserveState: false,
    } as const;

    const pages = buildPageWindow(paginator.current_page, Math.max(paginator.last_page, 1));

    return (
        <Pagination className={clsx('w-full', className)}>
            <div className="flex w-full flex-col gap-4 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-center">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Rows</span>
                    <Dropdown>
                        <DropdownButton as={Button} outline className="min-w-20 justify-between">
                            <span>{paginator.per_page}</span>
                            <ChevronDownIcon data-slot="icon" className="size-4" />
                        </DropdownButton>
                        <DropdownMenu anchor="top end" className="min-w-24">
                            {PER_PAGE_OPTIONS.map((value) => (
                                <DropdownItem key={value} href={buildHref(1, value)} {...perPageLinkProps}>
                                    <DropdownLabel>{value} rows</DropdownLabel>
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </div>

                <div className="flex items-center justify-center gap-2 xl:justify-self-center">
                    <PaginationPrevious
                        href={paginator.current_page > 1 ? buildHref(paginator.current_page - 1) : null}
                        className="grow-0 basis-auto"
                        {...linkProps}
                    />
                    <PaginationList className="flex items-center gap-2">
                        {pages.map((item, index) => (
                            item === 'gap'
                                ? <PaginationGap key={`gap-${index}`} />
                                : (
                                    <PaginationPage
                                        key={item}
                                        href={buildHref(item)}
                                        current={item === paginator.current_page}
                                        {...linkProps}
                                    >
                                        {item}
                                    </PaginationPage>
                                )
                        ))}
                    </PaginationList>
                    <PaginationNext
                        href={paginator.current_page < paginator.last_page ? buildHref(paginator.current_page + 1) : null}
                        className="grow-0 basis-auto"
                        {...linkProps}
                    />
                </div>

                <div className="flex items-center justify-end text-sm text-zinc-500 dark:text-zinc-400 xl:justify-self-end">
                    <span>
                        Showing {paginator.from ?? 0}-{paginator.to ?? 0} of {paginator.total}
                    </span>
                </div>
            </div>
        </Pagination>
    );
}
