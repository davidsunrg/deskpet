import {
  IconChevronRight,
  IconCrown,
  IconHeart,
  IconHome,
  IconMessageCircle,
  IconMicrophone,
  IconPaw,
  IconPhoto,
  IconSettings,
  IconShare,
  IconSparkles,
} from '@tabler/icons-react';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { studioPet } from './studio-data';
const items = [
  { title: 'Create', icon: IconSparkles, href: Routes.DesktopPetCreator },
  { title: 'Memories', icon: IconPhoto },
  { title: 'AI Generation', icon: IconSparkles },
  { title: 'Voice', icon: IconMicrophone },
  { title: 'Chat', icon: IconMessageCircle },
  { title: 'Memorial', icon: IconHeart },
  { title: 'Gallery', icon: IconPhoto },
  { title: 'Share', icon: IconShare },
  { title: 'Settings', icon: IconSettings, href: Routes.SettingsProfile },
];
export function StudioSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="studio-sidebar">
      <LocaleLink
        href={Routes.Root}
        className="studio-brand"
        onClick={onNavigate}
      >
        <IconPaw />
        DeskPet
      </LocaleLink>
      <p className="studio-brand-note">
        A happier life with your pet.
        <br />
        Always, together.
      </p>
      <nav aria-label="Studio navigation" className="studio-navigation">
        <LocaleLink href={Routes.Studio} onClick={onNavigate}>
          <IconHome />
          Home
        </LocaleLink>
        <LocaleLink href={Routes.Pets} onClick={onNavigate}>
          <IconPaw />
          My Pets
        </LocaleLink>
        <LocaleLink
          href={Routes.Studio}
          className="studio-selected"
          aria-current="page"
          onClick={onNavigate}
        >
          <img src={studioPet.avatar} alt="" width={40} height={40} />
          {studioPet.name}
          <IconChevronRight className="studio-push" />
        </LocaleLink>
        {items.map((item, index) => (
          <div
            key={item.title}
            className={index === 6 ? 'studio-nav-divider' : undefined}
          >
            {item.href ? (
              <LocaleLink href={item.href} onClick={onNavigate}>
                <item.icon />
                {item.title}
              </LocaleLink>
            ) : (
              <button type="button" disabled title="Coming soon">
                <item.icon />
                {item.title}
                <span className="studio-sr-only"> (coming soon)</span>
              </button>
            )}
          </div>
        ))}
      </nav>
      <LocaleLink
        href={Routes.Pricing}
        className="studio-upgrade"
        onClick={onNavigate}
      >
        <IconCrown />
        <span>
          <strong>Upgrade to Pro</strong>
          <small>
            More creations,
            <br />
            more memories.
          </small>
        </span>
      </LocaleLink>
    </aside>
  );
}
