import {
  IconHeartFilled,
  IconPhoto,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { StudioCardHeader } from './studio-card';
import { studioMedia } from './studio-data';

const bars = [
  10, 18, 12, 26, 20, 32, 14, 24, 18, 30, 10, 22, 28, 16, 24, 12, 20, 28, 14,
  22, 18, 30, 12, 26, 16, 24, 20, 32, 14, 18, 22, 28, 16,
];

type MomentMedia = {
  title: string;
  src?: string;
  kind?: 'video' | 'voice' | 'event';
};

const recentStatus = {
  date: 'Sep 20, 2026',
  title: 'Summer adventures with Mochi',
  subtitle: 'Beach day, mountains, and park run',
  media: [
    {
      title: 'A happy day at the beach',
      src: studioMedia.beach,
    },
    {
      title: 'Exploring the mountains',
      src: studioMedia.hiking,
    },
    {
      title: 'Running in the park',
      src: studioMedia.flowers,
      kind: 'video' as const,
    },
  ],
};

const moments = [
  {
    date: 'Sep 05, 2026',
    title: "Mochi's bark",
    subtitle: 'Voice recording',
    kind: 'voice' as const,
  },
  {
    date: 'Aug 28, 2026',
    title: 'Lazy afternoon',
    subtitle: 'Photo',
    src: studioMedia.desktop,
  },
  {
    date: 'Aug 12, 2026',
    title: 'Joined family',
    subtitle: 'Special day',
    kind: 'event' as const,
  },
];

function MomentMediaPreview({ moment }: { moment: MomentMedia }) {
  if (moment.kind === 'event') {
    return (
      <div className="studio-memory-thumb">
        <span className="studio-memory-heart">
          <IconHeartFilled />
        </span>
      </div>
    );
  }

  if (moment.kind === 'voice') {
    return (
      <div
        className="studio-memory-thumb studio-memory-thumb-voice"
        role="img"
        aria-label="Voice recording preview"
      >
        <div className="studio-wave studio-wave-memory">
          <IconPlayerPlayFilled />
          <span>
            {bars.map((height, index) => (
              <i key={`bar-${index}`} style={{ height }} />
            ))}
          </span>
          <small>00:24</small>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-memory-thumb">
      <div className="studio-memory-image">
        <img
          src={moment.src}
          alt={moment.title}
          width={64}
          height={64}
          loading="lazy"
        />
        {moment.kind === 'video' && (
          <span className="studio-video-duration">00:15</span>
        )}
      </div>
    </div>
  );
}

export function MomentsCard() {
  return (
    <section id="moments" className="studio-card studio-moments">
      <StudioCardHeader
        icon={<IconPhoto />}
        title="Moments"
        action={<span className="studio-preview-label">Preview</span>}
      />
      <ol className="studio-timeline">
        <li>
          <time>{recentStatus.date}</time>
          <div className="studio-memory">
            <div className="studio-memory-strip">
              {recentStatus.media.map((item) => (
                <MomentMediaPreview key={item.title} moment={item} />
              ))}
            </div>
            <div className="studio-memory-copy">
              <p>{recentStatus.title}</p>
              <small>{recentStatus.subtitle}</small>
            </div>
          </div>
        </li>
        {moments.map((moment) => (
          <li key={moment.date}>
            <time>{moment.date}</time>
            <div className="studio-memory">
              <MomentMediaPreview moment={moment} />
              <div className="studio-memory-copy">
                <p>{moment.title}</p>
                <small>{moment.subtitle}</small>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
