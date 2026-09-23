import { IconMenu2, IconShare } from '@tabler/icons-react';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { PetHeader } from './pet-header';
import { StudioIconButton } from './studio-card';

export function StudioHeader({
  breadcrumbs,
  isHome,
  onOpenMenu,
}: {
  breadcrumbs?: Array<{ label: string; href?: string }>;
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
      </div>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="studio-breadcrumb">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <LocaleLink href={Routes.Studio}>Studio</LocaleLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((breadcrumb) => (
              <Fragment key={breadcrumb.label}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {breadcrumb.href ? (
                    <BreadcrumbLink asChild>
                      <LocaleLink href={breadcrumb.href}>
                        {breadcrumb.label}
                      </LocaleLink>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="studio-topbar-actions">
        <LocaleLink
          href={Routes.StudioPublicSiteEditor}
          className="studio-button studio-topbar-share"
        >
          <IconShare />
          <span>Public Site</span>
        </LocaleLink>
      </div>
    </header>
  );
}
