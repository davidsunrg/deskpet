'use client';

import { cn } from '@/utils/cn';
import { FileIcon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type FileAttachmentChipProps = {
  href: string;
  name: string;
  /** Secondary line, e.g. "pdf · 1.2 MB". */
  meta?: string;
  onRemove?: () => void;
  removeLabel?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Compact Gmail-style attachment chip (icon + name, wraps in a row).
 */
export function FileAttachmentChip({
  href,
  name,
  meta,
  onRemove,
  removeLabel = 'Remove',
  disabled = false,
  className,
}: FileAttachmentChipProps) {
  return (
    <div
      className={cn(
        // Fixed width so long filenames truncate instead of stretching the row.
        'group relative flex w-[12.5rem] shrink-0 items-center gap-1.5 overflow-hidden rounded-md border border-border bg-background px-2 py-1.5 shadow-xs',
        className
      )}
    >
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-deskpet-ink no-underline hover:underline"
        title={name}
      >
        <FileIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="block truncate text-xs font-medium leading-tight">
            {name}
          </span>
          {meta ? (
            <span className="block truncate text-[11px] leading-tight text-deskpet-muted">
              {meta}
            </span>
          ) : null}
        </span>
      </a>
      {onRemove ? (
        <button
          type="button"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

type FileAttachmentListProps = {
  children: ReactNode;
  className?: string;
};

/** Wrapping row of attachment chips. */
export function FileAttachmentList({
  children,
  className,
}: FileAttachmentListProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>{children}</div>
  );
}
