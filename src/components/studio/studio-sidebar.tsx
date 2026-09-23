import * as Dropdown from '@radix-ui/react-dropdown-menu';
import {
  IconHeart,
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
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { studioPet } from './studio-data';
import { studioSections } from './studio-sections';

const sectionIcons = {
  create: IconSparkles,
  memories: IconPhoto,
  'ai-generation': IconSparkles,
  voice: IconMicrophone,
  chat: IconMessageCircle,
  memorial: IconHeart,
  gallery: IconPhoto,
  share: IconShare,
};

const items = [
  ...studioSections.map((section) => ({
    title: section.title,
    icon: sectionIcons[section.slug],
    href: `${Routes.Studio}/${section.slug}`,
  })),
  { title: 'Settings', icon: IconSettings, href: Routes.SettingsProfile },
];

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
  return (
    <aside className="studio-sidebar">
      <PetSwitcher onNavigate={onNavigate} />
      <nav aria-label="Studio navigation" className="studio-navigation">
        <LocaleLink
          href={Routes.Studio}
          activeOptions={{ exact: true }}
          onClick={onNavigate}
        >
          <IconHome />
          Home
        </LocaleLink>
        {items.map((item, index) => (
          <div
            key={item.title}
            className={index === 6 ? 'studio-nav-divider' : undefined}
          >
            <LocaleLink href={item.href} onClick={onNavigate}>
              <item.icon />
              {item.title}
            </LocaleLink>
          </div>
        ))}
      </nav>
    </aside>
  );
}
