import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BottomLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
}

export function BottomLink({ href, label, onClick }: BottomLinkProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          buttonVariants({ variant: 'link', size: 'sm' }),
          'font-normal w-full text-muted-foreground hover:underline underline-offset-4 hover:text-primary'
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <Link
      to={href}
      className={cn(
        buttonVariants({ variant: 'link', size: 'sm' }),
        'font-normal w-full text-muted-foreground hover:underline underline-offset-4 hover:text-primary'
      )}
    >
      {label}
    </Link>
  );
}
