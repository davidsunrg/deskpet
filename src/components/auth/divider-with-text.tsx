import { cn } from '@/lib/utils';

interface DividerWithTextProps {
  text: string;
  className?: string;
}

export function DividerWithText({ text, className }: DividerWithTextProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <div className="grow border-t border-deskpet-ink/15" />
      <span className="mx-4 shrink text-sm font-bold text-deskpet-muted">
        {text}
      </span>
      <div className="grow border-t border-deskpet-ink/15" />
    </div>
  );
}
