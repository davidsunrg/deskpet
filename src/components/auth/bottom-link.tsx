import { LocaleLink } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils';

interface BottomLinkProps {
  href?: string;
  label: string;
  prefix?: string;
  className?: string;
  onClick?: () => void;
}

const linkClassName =
  'font-medium text-[#1a69ff] underline-offset-4 hover:underline';

export function BottomLink({
  href,
  label,
  prefix,
  className,
  onClick,
}: BottomLinkProps) {
  return (
    <p
      className={cn(
        'w-full text-center text-sm text-muted-foreground',
        className
      )}
    >
      {prefix ? <span>{prefix} </span> : null}
      {onClick ? (
        <button type="button" onClick={onClick} className={linkClassName}>
          {label}
        </button>
      ) : (
        <LocaleLink href={href ?? '#'} className={linkClassName}>
          {label}
        </LocaleLink>
      )}
    </p>
  );
}
