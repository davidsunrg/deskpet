import {
  IconCalendarEvent,
  IconHeartFilled,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconScale,
  IconSparkles,
} from '@tabler/icons-react';
import { useRef, useState } from 'react';
import type { TimelineEntry } from './timeline-data';

const bars = [
  10, 18, 12, 26, 20, 32, 14, 24, 18, 30, 10, 22, 28, 16, 24, 12, 20, 28, 14,
  22, 18, 30, 12, 26, 16, 24, 20, 32, 14, 18, 22, 28, 16,
];

function formatTime(value: number) {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function VoicePreview() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
    }
  }

  return (
    <div className="studio-memory-thumb studio-memory-thumb-voice">
      <audio
        ref={audioRef}
        src="/studio/bark.mp3"
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      >
        <track
          kind="captions"
          src="/bark.vtt"
          srcLang="en"
          label="English"
          default
        />
      </audio>
      <button
        type="button"
        className="studio-wave studio-wave-memory"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause Mochi's bark" : "Play Mochi's bark"}
      >
        {isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
        <span aria-hidden="true">
          {bars.map((height, index) => (
            <i key={`bar-${index}`} style={{ height }} />
          ))}
        </span>
        <small>{formatTime(isPlaying ? currentTime : duration)}</small>
      </button>
    </div>
  );
}

function EntryIcon({ entry }: { entry: TimelineEntry }) {
  const Icon =
    entry.kind === 'weight'
      ? IconScale
      : entry.kind === 'event'
        ? IconCalendarEvent
        : entry.source === 'ai'
          ? IconSparkles
          : IconHeartFilled;
  return (
    <span className="studio-timeline-entry-icon" data-category={entry.category}>
      <Icon />
    </span>
  );
}

export function TimelineEntryContent({
  entry,
  compact = false,
}: {
  entry: TimelineEntry;
  compact?: boolean;
}) {
  return (
    <article
      className="studio-timeline-entry"
      data-category={entry.category}
      data-compact={compact}
    >
      {entry.kind === 'voice' ? <VoicePreview /> : null}
      {entry.media ? (
        <div className="studio-memory-strip">
          {entry.media.slice(0, compact ? 3 : 4).map((src, index) => (
            <div key={src} className="studio-memory-thumb">
              <div className="studio-memory-image">
                <img src={src} alt="" width={64} height={64} loading="lazy" />
                {entry.kind === 'video' && index === 0 ? (
                  <span className="studio-video-duration">
                    {entry.duration ?? '0:15'}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {!entry.media && entry.kind !== 'voice' ? (
        <EntryIcon entry={entry} />
      ) : null}
      <div className="studio-memory-copy">
        <div className="studio-timeline-entry-meta">
          <span>{entry.category}</span>
          <span>{entry.source === 'ai' ? 'AI generated' : entry.source}</span>
        </div>
        <p>{entry.title}</p>
        <small>{entry.description}</small>
        {entry.value ? (
          <strong className="studio-timeline-entry-value">{entry.value}</strong>
        ) : null}
      </div>
    </article>
  );
}
