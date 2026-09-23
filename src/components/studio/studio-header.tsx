import * as Dropdown from '@radix-ui/react-dropdown-menu';
import {
  IconBell,
  IconChevronDown,
  IconMenu2,
  IconSearch,
  IconUser,
} from '@tabler/icons-react';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { StudioIconButton } from './studio-card';
export function StudioHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="studio-topbar">
      <div className="studio-mobile-trigger">
        <StudioIconButton label="Open navigation" onClick={onOpenMenu}>
          <IconMenu2 />
        </StudioIconButton>
      </div>
      <div className="studio-topbar-actions">
        <StudioIconButton label="Search (coming soon)" disabled>
          <IconSearch />
        </StudioIconButton>
        <StudioIconButton label="Notifications (coming soon)" disabled>
          <IconBell />
        </StudioIconButton>
        <Dropdown.Root>
          <Dropdown.Trigger
            className="studio-account"
            aria-label="Account menu"
          >
            <span>
              <IconUser size={20} />
            </span>
            <IconChevronDown size={16} />
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Content
              data-studio-theme="light"
              className="studio-menu"
              align="end"
              sideOffset={8}
            >
              <Dropdown.Label className="studio-menu-label">
                Your account
              </Dropdown.Label>
              <Dropdown.Item asChild>
                <LocaleLink href={Routes.SettingsProfile}>
                  Profile settings
                </LocaleLink>
              </Dropdown.Item>
              <Dropdown.Item asChild>
                <LocaleLink href={Routes.Dashboard}>Dashboard</LocaleLink>
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Portal>
        </Dropdown.Root>
      </div>
    </header>
  );
}
