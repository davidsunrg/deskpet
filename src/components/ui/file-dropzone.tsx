'use client';

import { cn } from '@/utils/cn';
import { UploadIcon } from 'lucide-react';
import { useRef, useState, type DragEvent, type ReactNode } from 'react';

type FileDropzoneProps = {
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  title: string;
  hint: string;
  onFiles: (files: File[]) => void;
  className?: string;
  children?: ReactNode;
};

/**
 * Click-or-drag file upload zone (shadcn-style dashed border).
 */
export function FileDropzone({
  accept,
  multiple = true,
  disabled = false,
  title,
  hint,
  onFiles,
  className,
  children,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  const emitFiles = (list: FileList | File[] | null) => {
    if (!list || disabled) return;
    const files = Array.isArray(list) ? list : Array.from(list);
    if (files.length === 0) return;
    onFiles(files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onDragEnter = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  };

  const onDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = 0;
    setIsDragging(false);
    if (disabled) return;
    emitFiles(event.dataTransfer.files);
  };

  return (
    <div className={cn('grid gap-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={(event) => emitFiles(event.target.files)}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors',
          'border-deskpet-ink/20 bg-muted/20 hover:border-deskpet-ink/40 hover:bg-muted/40',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          isDragging && 'border-deskpet-mint bg-deskpet-mint-soft/60'
        )}
      >
        <UploadIcon
          className={cn(
            'size-8 text-muted-foreground',
            isDragging && 'text-deskpet-ink'
          )}
        />
        <div className="grid gap-1">
          <p className="m-0 text-sm font-medium text-deskpet-ink">{title}</p>
          <p className="m-0 text-xs text-muted-foreground">{hint}</p>
        </div>
      </button>
      {children}
    </div>
  );
}
