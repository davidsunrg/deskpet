import {
  IconChevronRight,
  IconMessageCircle,
  IconMicrophone,
  IconPhoto,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { studioSoftCardClass } from './studio-card';

const actions = [
  {
    title: 'Create Image',
    description: 'Generate new photos of Mochi in any style',
    icon: IconPhoto,
    accent: 'bg-deskpet-lavender',
  },
  {
    title: 'Create Video',
    description: 'Turn moments into short videos',
    icon: IconPlayerPlayFilled,
    accent: 'bg-deskpet-mint-soft',
  },
  {
    title: 'Record Voice',
    description: "Save Mochi's voice and special sounds",
    icon: IconMicrophone,
    accent: 'bg-deskpet-cream',
  },
  {
    title: 'Chat with Mochi',
    description: 'Talk, play, and get to know Mochi',
    icon: IconMessageCircle,
    accent: 'bg-deskpet-sky/40',
  },
];

export function ActionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => (
        <button
          key={action.title}
          type="button"
          className={`${studioSoftCardClass} flex items-center gap-3.5 p-4 text-left transition-transform hover:-translate-y-0.5`}
        >
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-xl border-2 border-deskpet-ink ${action.accent}`}
          >
            <action.icon className="size-[18px] text-deskpet-ink" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black tracking-tight text-deskpet-ink">
              {action.title}
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-deskpet-muted">
              {action.description}
            </span>
          </span>
          <IconChevronRight className="ml-auto size-4 shrink-0 text-deskpet-muted" />
        </button>
      ))}
    </div>
  );
}
