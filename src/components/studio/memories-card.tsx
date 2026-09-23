import {
  IconHeartFilled,
  IconPhoto,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { StudioCardHeader } from './studio-card';
import { studioMedia } from './studio-data';
const memories = [
  {
    date: 'Sep 20, 2026',
    title: 'A happy day at the beach',
    subtitle: 'Generated photo',
    src: studioMedia.beach,
  },
  {
    date: 'Sep 15, 2026',
    title: 'Exploring the mountains',
    subtitle: 'Generated photo',
    src: studioMedia.hiking,
  },
  {
    date: 'Sep 10, 2026',
    title: 'Running in the park',
    subtitle: 'Generated video',
    src: studioMedia.flowers,
    kind: 'video',
  },
  {
    date: 'Sep 05, 2026',
    title: "Mochi's bark",
    subtitle: 'Voice recording',
    kind: 'voice',
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
    kind: 'event',
  },
];
const bars = [10, 18, 12, 26, 20, 32, 14, 24, 18, 30, 10, 22, 28, 16, 24, 12];
export function MemoriesCard() {
  return (
    <section className="studio-card studio-memories">
      <StudioCardHeader icon={<IconPhoto />} title="Memories" />
      <ol className="studio-timeline">
        {memories.map((memory) => (
          <li key={memory.date}>
            <time>{memory.date}</time>
            <div className="studio-memory">
              {memory.kind === 'event' ? (
                <span className="studio-memory-heart">
                  <IconHeartFilled />
                </span>
              ) : memory.kind === 'voice' ? (
                <div
                  className="studio-wave"
                  aria-label="Voice recording preview"
                >
                  <IconPlayerPlayFilled />
                  <span>
                    {bars.map((height, index) => (
                      <i key={`bar-${index}`} style={{ height }} />
                    ))}
                  </span>
                  <small>00:24</small>
                </div>
              ) : (
                <div className="studio-memory-image">
                  <img
                    src={memory.src}
                    alt={memory.title}
                    width={124}
                    height={72}
                    loading="lazy"
                  />
                  {memory.kind === 'video' && (
                    <span className="studio-video-duration">00:15</span>
                  )}
                </div>
              )}
              <div>
                <p>{memory.title}</p>
                <small>{memory.subtitle}</small>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
