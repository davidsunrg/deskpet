import { IconMenu2 } from '@tabler/icons-react';
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
import { StudioIconButton } from './studio-card';

export function StudioHeader({
  breadcrumb,
  onOpenMenu,
}: {
  breadcrumb?: string;
  onOpenMenu: () => void;
}) {
  return (
    <header
      className={`studio-topbar${breadcrumb ? '' : ' studio-topbar-home'}`}
    >
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
    </header>
  );
}
