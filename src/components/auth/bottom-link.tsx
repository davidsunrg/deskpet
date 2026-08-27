import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

const bottomLinkClass =
  'w-full text-center text-sm font-bold text-deskpet-muted underline-offset-4 hover:text-deskpet-ink hover:underline';

interface BottomLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
}

export function BottomLink({ href, label, onClick }: BottomLinkProps) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(bottomLinkClass)}>
        {label}
      </button>
    );
  }

  return (
    <Link to={href} className={cn(bottomLinkClass)}>
      {label}
    </Link>
  );
}
