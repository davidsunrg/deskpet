import { BottomLink } from '@/components/auth/bottom-link';
import { BrandName } from '@/components/layout/brand-name';
import { Logo } from '@/components/layout/logo';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  headerLabel: string;
  bottomButtonLabel: string;
  bottomButtonHref: string;
  onBottomButtonClick?: () => void;
  className?: string;
  showBrand?: boolean;
}

export function AuthCard({
  children,
  headerLabel,
  bottomButtonLabel,
  bottomButtonHref,
  onBottomButtonClick,
  className,
  showBrand = true,
}: AuthCardProps) {
  return (
    <div className={cn('flex w-full flex-col gap-6', className)}>
      {showBrand ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <Link to="/" className="flex flex-col items-center gap-3">
            <Logo />
            <BrandName className="text-xl" />
          </Link>
          <p className="text-sm font-bold text-deskpet-muted">{headerLabel}</p>
        </div>
      ) : (
        <p className="text-center text-lg font-black text-deskpet-ink">
          {headerLabel}
        </p>
      )}
      <div className="flex flex-col gap-6">{children}</div>
      <BottomLink
        label={bottomButtonLabel}
        href={bottomButtonHref}
        onClick={onBottomButtonClick}
      />
    </div>
  );
}
