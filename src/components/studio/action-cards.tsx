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
    tone: 'image',
  },
  {
    title: 'Create Video',
    description: 'Turn moments into short videos',
    icon: IconPlayerPlayFilled,
    tone: 'video',
  },
  {
    title: 'Record Voice',
    description: "Save Mochi's voice and special sounds",
    icon: IconMicrophone,
    tone: 'voice',
  },
  {
    title: 'Chat with Mochi',
    description: 'Talk, play, and get to know Mochi',
    icon: IconMessageCircle,
    tone: 'chat',
  },
];
export function ActionCards() {
  return (
    <div className="studio-actions">
      {actions.map((action) => (
        <button
          key={action.title}
          type="button"
          disabled
          title="Coming soon"
          className={`studio-action studio-tone-${action.tone}`}
        >
          <span className="studio-action-icon">
            <action.icon />
          </span>
          <span>
            <strong>{action.title}</strong>
            <small>{action.description}</small>
            <span className="studio-unavailable">Coming soon</span>
          </span>
          <IconChevronRight className="studio-action-arrow" />
        </button>
      ))}
    </div>
  );
}
