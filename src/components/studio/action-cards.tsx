import {
  IconChevronRight,
  IconMessageCircle,
  IconMicrophone,
  IconPhoto,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';

const actions = [
  {
    title: 'Create Image',
    description: 'Generate new photos of Mochi in any style',
    icon: IconPhoto,
    tone: 'image',
    href: `${Routes.Studio}/create`,
  },
  {
    title: 'Create Video',
    description: 'Turn moments into short videos',
    icon: IconPlayerPlayFilled,
    tone: 'video',
    href: `${Routes.Studio}/create`,
  },
  {
    title: 'Record Voice',
    description: "Save Mochi's voice and special sounds",
    icon: IconMicrophone,
    tone: 'voice',
    href: `${Routes.Studio}/voice`,
  },
  {
    title: 'Chat with Mochi',
    description: 'Talk, play, and get to know Mochi',
    icon: IconMessageCircle,
    tone: 'chat',
    href: `${Routes.Studio}/chat`,
  },
];
export function ActionCards() {
  return (
    <div className="studio-actions">
      {actions.map((action) => (
        <LocaleLink
          key={action.title}
          href={action.href}
          className={`studio-action studio-tone-${action.tone}`}
        >
          <span className="studio-action-icon">
            <action.icon />
          </span>
          <span>
            <strong>{action.title}</strong>
            <small>{action.description}</small>
          </span>
          <IconChevronRight className="studio-action-arrow" />
        </LocaleLink>
      ))}
    </div>
  );
}
