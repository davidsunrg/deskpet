import {
  IconChevronRight,
  IconMessageCircle,
  IconMicrophone,
  IconPhoto,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';

const actions = [
  {
    title: 'Create Image',
    description: 'Generate new photos of Mochi in any style',
    icon: IconPhoto,
    chip: 'bg-[#f1ebff] text-[#7c5cf0]',
    card: 'bg-[#faf8ff]',
  },
  {
    title: 'Create Video',
    description: 'Turn moments into short videos',
    icon: IconPlayerPlayFilled,
    chip: 'bg-[#dff7ec] text-[#18a957]',
    card: 'bg-[#f6fdf9]',
  },
  {
    title: 'Record Voice',
    description: "Save Mochi's voice and special sounds",
    icon: IconMicrophone,
    chip: 'bg-[#ffeadd] text-[#f2701d]',
    card: 'bg-[#fffaF6]',
  },
  {
    title: 'Chat with Mochi',
    description: 'Talk, play, and get to know Mochi',
    icon: IconMessageCircle,
    chip: 'bg-[#e3f0ff] text-[#3b82f6]',
    card: 'bg-[#f7fbff]',
  },
];

export function ActionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => (
        <button
          key={action.title}
          type="button"
          className={`flex items-center gap-3.5 rounded-[22px] ${action.card} p-4 text-left shadow-[0_1px_6px_rgba(43,38,34,0.04)] ring-1 ring-[#f2ede4] transition-shadow hover:shadow-[0_4px_14px_rgba(43,38,34,0.08)]`}
        >
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-full ${action.chip}`}
          >
            <action.icon className="size-5" strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-bold text-[#2b2622]">
              {action.title}
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-[#a2978b]">
              {action.description}
            </span>
          </span>
          <IconChevronRight
            className="ml-auto size-4 shrink-0 text-[#c9bfb2]"
            strokeWidth={2}
          />
        </button>
      ))}
    </div>
  );
}
