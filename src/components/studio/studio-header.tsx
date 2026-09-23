import { IconMenu2, IconShare } from '@tabler/icons-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { PetHeader } from './pet-header';
import { StudioIconButton } from './studio-card';

export function StudioHeader({
  breadcrumb,
  isHome,
  onOpenMenu,
}: {
  breadcrumb?: string;
  isHome: boolean;
  onOpenMenu: () => void;
}) {
  if (isHome) {
    return (
      <header className="studio-home-header">
        <div className="studio-home-toolbar">
          <div className="studio-topbar-menu">
            <StudioIconButton label="Open navigation" onClick={onOpenMenu}>
              <IconMenu2 />
            </StudioIconButton>
          </div>
        </div>
        <PetHeader />
      </header>
    );
  }

  return (
    <header className="studio-topbar">
      <div className="studio-topbar-menu">
        <StudioIconButton label="Open navigation" onClick={onOpenMenu}>
          <IconMenu2 />
        </StudioIconButton>
        <Separator orientation="vertical" />
      </div>
      {breadcrumb && (
        <Breadcrumb className="studio-breadcrumb">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <LocaleLink href={Routes.Studio}>Studio</LocaleLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="studio-topbar-actions">
        <LocaleLink
          href={`${Routes.Studio}/share`}
          className="studio-button studio-topbar-share"
        >
          <IconShare />
          <span>Share</span>
        </LocaleLink>
      </div>
    </header>
  );
}
