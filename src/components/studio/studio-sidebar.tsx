import * as Dropdown from '@radix-ui/react-dropdown-menu';
import {
  IconCalendar,
  IconHome,
  IconMessageCircle,
  IconMicrophone,
  IconPhoto,
  IconPlus,
  IconSelector,
  IconSettings,
  IconShare,
  IconSparkles,
} from '@tabler/icons-react';
import { useRouterState } from '@tanstack/react-router';
import { authClient } from '@/auth/client';
import { UserAccountMenu } from '@/components/shared/user-account-menu';
import { UserAvatar } from '@/components/shared/user-avatar';
import { getLocale, localizeHref } from '@/lib/locale';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { cn } from '@/utils/cn';
import { studioPet } from './studio-data';
import { studioSections } from './studio-sections';

const sectionIcons = {
  create: IconSparkles,
  moments: IconPhoto,
  'ai-generation': IconSparkles,
  voice: IconMicrophone,
  chat: IconMessageCircle,
  care: IconCalendar,
  gallery: IconPhoto,
  share: IconShare,
};

const hiddenSectionSlugs = new Set([
  'ai-generation',
  'memorial',
  'share',
  'voice',
]);

const sectionItems = studioSections
  .filter((section) => !hiddenSectionSlugs.has(section.slug))
  .map((section) => ({
    title: section.title,
    icon: sectionIcons[section.slug],
    href: `${Routes.Studio}/${section.slug}`,
  }));

const settingsItem = {
  title: 'Settings',
  icon: IconSettings,
  href: Routes.SettingsProfile,
};

function normalizePath(path: string) {
  return path.replace(/\/$/, '') || '/';
}

function hrefToPath(href: string) {
  const pathname = href.split('?')[0]?.split('#')[0] || '/';
  return normalizePath(localizeHref(pathname, { locale: getLocale() }));
}

function PetSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="studio-pet-switcher">
        <img
          src={studioPet.avatar}
          alt={studioPet.name}
          width={40}
          height={40}
        />
        <span>
          <strong>{studioPet.name}</strong>
          <small>{studioPet.age}</small>
        </span>
        <IconSelector />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          data-studio-theme="light"
          className="studio-menu studio-pet-switcher-menu"
          align="start"
          sideOffset={6}
        >
          <Dropdown.Label className="studio-menu-label">
            Current pet
          </Dropdown.Label>
          <Dropdown.Item asChild>
            <LocaleLink
              href={Routes.Studio}
              className="studio-pet-menu-item"
              onClick={onNavigate}
            >
              <img src={studioPet.avatar} alt="" width={28} height={28} />
              <span>{studioPet.name}</span>
            </LocaleLink>
          </Dropdown.Item>
          <Dropdown.Separator className="studio-menu-separator" />
          <Dropdown.Item asChild>
            <LocaleLink
              href={Routes.Pets}
              className="studio-pet-menu-item"
              onClick={onNavigate}
            >
              <IconSettings />
              <span>Manage pets</span>
            </LocaleLink>
          </Dropdown.Item>
          <Dropdown.Item asChild>
            <LocaleLink
              href={Routes.DesktopPetCreator}
              className="studio-pet-menu-item"
              onClick={onNavigate}
            >
              <IconPlus />
              <span>Add pet</span>
            </LocaleLink>
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

export function StudioSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = authClient.useSession();
  const pathname =
    useRouterState({ select: (state) => state.location.pathname }) ?? '';
  const currentPath = normalizePath(pathname);

  const isNavActive = (href: string, exact = true) => {
    const target = hrefToPath(href);
    if (exact) return currentPath === target;
    return currentPath === target || currentPath.startsWith(`${target}/`);
  };

  const settingsRoot = hrefToPath(Routes.Settings);
  const isSettingsActive =
    currentPath === settingsRoot || currentPath.startsWith(`${settingsRoot}/`);

  return (
    <aside className="studio-sidebar">
      <PetSwitcher onNavigate={onNavigate} />
      <nav aria-label="Studio navigation" className="studio-navigation">
        <LocaleLink
          href={Routes.Studio}
          className={cn(
            isNavActive(Routes.Studio, true) && 'studio-nav-selected'
          )}
          onClick={onNavigate}
        >
          <IconHome />
          Home
        </LocaleLink>
        {sectionItems.map((item) => (
          <div key={item.title}>
            <LocaleLink
              href={item.href}
              className={cn(
                isNavActive(item.href, true) && 'studio-nav-selected'
              )}
              onClick={onNavigate}
            >
              <item.icon />
              {item.title}
            </LocaleLink>
          </div>
        ))}
      </nav>
      <nav
        aria-label="Settings"
        className="studio-navigation studio-nav-divider"
      >
        <LocaleLink
          href={settingsItem.href}
          className={cn(isSettingsActive && 'studio-nav-selected')}
          onClick={onNavigate}
        >
          <settingsItem.icon />
          {settingsItem.title}
        </LocaleLink>
      </nav>
      {session?.user && (
        <UserAccountMenu
          user={session.user}
          side={onNavigate ? 'top' : 'right'}
          contentClassName="z-[110]"
          trigger={
            <button type="button" className="studio-sidebar-user">
              <UserAvatar
                name={session.user.name ?? null}
                image={session.user.image ?? null}
                className="size-8 border"
              />
              <span>
                <strong>{session.user.name}</strong>
                <small>{session.user.email}</small>
              </span>
              <IconSelector />
            </button>
          }
        />
      )}
    </aside>
  );
}
