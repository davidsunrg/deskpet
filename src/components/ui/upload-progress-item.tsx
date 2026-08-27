'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/utils/cn';
import { FileIcon, XCircleIcon } from 'lucide-react';

export type UploadProgressStatus = 'uploading' | 'error';

export type UploadProgressItemProps = {
  name: string;
  /** Preformatted size label, e.g. "1.2 MB". */
  sizeLabel?: string;
  status: UploadProgressStatus;
  /** 0–100 while uploading. */
  progress?: number;
  error?: string;
  className?: string;
};

/**
 * Single-file upload row: name, optional size, percent + progress bar, or error.
 */
export function UploadProgressItem({
  name,
  sizeLabel,
  status,
  progress = 0,
  error,
  className,
}: UploadProgressItemProps) {
  return (
    <li className={cn('grid gap-2 rounded-lg bg-muted/50 px-3 py-2', className)}>
      <div className="flex min-w-0 items-center justify-between gap-2 text-sm text-deskpet-ink">
        <div className="inline-flex min-w-0 items-center gap-2">
          <FileIcon className="size-4 shrink-0" />
          <span className="truncate">{name}</span>
          {sizeLabel ? (
            <span className="shrink-0 text-xs text-deskpet-muted">
              {sizeLabel}
            </span>
          ) : null}
        </div>
        {status === 'uploading' ? (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {progress}%
          </span>
        ) : null}
        {status === 'error' ? (
          <span className="inline-flex min-w-0 shrink-0 items-center gap-1 text-xs text-destructive">
            <XCircleIcon className="size-3.5 shrink-0" />
            <span className="truncate">{error || 'Upload failed'}</span>
          </span>
        ) : null}
      </div>
      {status === 'uploading' ? (
        <Progress value={progress} className="h-1.5" />
      ) : null}
    </li>
  );
}

export type UploadProgressListItem = UploadProgressItemProps & {
  id: string;
};

type UploadProgressListProps = {
  items: UploadProgressListItem[];
  className?: string;
};

/**
 * List of in-flight / failed uploads with progress bars.
 */
export function UploadProgressList({
  items,
  className,
}: UploadProgressListProps) {
  if (items.length === 0) return null;

  return (
    <ul className={cn('m-0 grid list-none gap-2 p-0', className)}>
      {items.map((item) => (
        <UploadProgressItem
          key={item.id}
          name={item.name}
          sizeLabel={item.sizeLabel}
          status={item.status}
          progress={item.progress}
          error={item.error}
        />
      ))}
    </ul>
  );
}
