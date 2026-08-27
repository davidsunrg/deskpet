'use client';

import { LocaleLink } from '@/lib/i18n/navigation';
import { useLocalePathname } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

function getCurrentPageFromPath(pathname: string): number {
  const match = pathname.match(/\/page\/(\d+)$/);
  if (match?.[1]) {
    return Number(match[1]);
  }
  return 1;
}

function pageHref(routePrefix: string, page: number): string {
  if (page <= 1) {
    return routePrefix;
  }
  return `${routePrefix}/page/${page}`;
}

function generatePagination(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
}

type BlogPathPaginationProps = {
  totalPages: number;
  routePrefix: string;
};

export function BlogPathPagination({
  totalPages,
  routePrefix,
}: BlogPathPaginationProps) {
  const pathname = useLocalePathname();
  const currentPage = getCurrentPageFromPath(pathname);
  const allPages = generatePagination(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  const linkClass =
    'inline-flex size-9 items-center justify-center rounded-md border border-transparent text-sm font-medium hover:bg-muted';
  const activeClass = 'border-border bg-background';

  return (
    <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
      <ul className="flex items-center gap-0.5">
        <li>
          {currentPage > 1 ? (
            <LocaleLink
              href={pageHref(routePrefix, currentPage - 1)}
              className={cn(linkClass, 'px-2')}
              aria-label="Go to previous page"
            >
              <ChevronLeftIcon className="size-4" />
            </LocaleLink>
          ) : (
            <span
              aria-disabled
              className={cn(
                linkClass,
                'pointer-events-none px-2 text-gray-300 dark:text-gray-600'
              )}
            >
              <ChevronLeftIcon className="size-4" />
            </span>
          )}
        </li>
        {allPages.map((page, index) => (
          <li key={`${page}-${index}`}>
            {page === '...' ? (
              <span className="flex size-9 items-center justify-center">
                …
              </span>
            ) : (
              <LocaleLink
                href={pageHref(routePrefix, Number(page))}
                className={cn(
                  linkClass,
                  currentPage === page && activeClass
                )}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </LocaleLink>
            )}
          </li>
        ))}
        <li>
          {currentPage < totalPages ? (
            <LocaleLink
              href={pageHref(routePrefix, currentPage + 1)}
              className={cn(linkClass, 'px-2')}
              aria-label="Go to next page"
            >
              <ChevronRightIcon className="size-4" />
            </LocaleLink>
          ) : (
            <span
              aria-disabled
              className={cn(
                linkClass,
                'pointer-events-none px-2 text-gray-300 dark:text-gray-600'
              )}
            >
              <ChevronRightIcon className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
