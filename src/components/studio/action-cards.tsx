import {
  IconChevronRight,
  IconMicrophone,
  IconPhoto,
  IconPhotoPlus,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';

const actions = [
  {
    title: 'Add Moments',
    description: 'Save a photo, note, or memory from today',
    icon: IconPhotoPlus,
    tone: 'moments',
    href: `${Routes.Studio}/moments`,
  },
  {
    title: 'Create Photo',
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
