import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import {
  COUNTDOWN_PRESETS_MS,
  formatCountdownClock,
  useCountdownTimer,
} from './use-countdown-timer';

const pickerButtonClassName = cn(
  'h-8 flex-1 rounded-md px-2 text-sm font-medium',
  'text-[color:var(--picker-fg)] hover:bg-[color:var(--picker-hover)] hover:text-[color:var(--picker-fg)]'
);

type CountdownWidgetProps = {
  onClose?: () => void;
  /** When false, keep mounted but hide so the timer can keep running. */
  visible?: boolean;
};

/**
 * Compact countdown controls for the playground Widgets panel.
 */
export function CountdownWidget({
  onClose,
  visible = true,
}: CountdownWidgetProps) {
  const {
    durationMs,
    remainingMs,
    isRunning,
    isDone,
    start,
    pause,
    reset,
    setDurationMs,
  } = useCountdownTimer();

  return (
    <section
      className={cn(
        'mb-2 space-y-3 rounded-md border border-[color:var(--picker-ring)] bg-[color:var(--picker-selected)]/40 p-3',
        !visible && 'hidden'
      )}
      data-testid="countdown-widget"
      aria-label="Countdown timer"
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide text-[color:var(--picker-muted)] uppercase">
          {isDone ? 'Done' : 'Timer'}
        </p>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 rounded-md text-[color:var(--picker-muted)] hover:bg-[color:var(--picker-hover)] hover:text-[color:var(--picker-fg)]"
            aria-label="Close Timer"
            onClick={onClose}
          >
            <XIcon className="size-3.5" />
          </Button>
        ) : null}
      </div>

      <p
        className={cn(
          'text-center font-mono text-3xl font-semibold tracking-tight tabular-nums',
          isDone
            ? 'text-[color:var(--picker-muted)]'
            : 'text-[color:var(--picker-fg)]'
        )}
        aria-live="polite"
      >
        {formatCountdownClock(remainingMs)}
      </p>

      {!isRunning ? (
        <div className="flex flex-wrap gap-1">
          {COUNTDOWN_PRESETS_MS.map((preset) => {
            const minutes = preset / 60_000;
            const selected = durationMs === preset && remainingMs === preset;
            return (
              <Button
                key={preset}
                type="button"
                variant="ghost"
                className={cn(
                  'h-7 rounded-md px-2 text-[11px] font-medium',
                  'text-[color:var(--picker-fg)] hover:bg-[color:var(--picker-hover)]',
                  selected &&
                    'bg-[color:var(--picker-selected)] ring-1 ring-[color:var(--picker-ring)]'
                )}
                onClick={() => setDurationMs(preset)}
              >
                {minutes}m
              </Button>
            );
          })}
        </div>
      ) : null}

      <div className="flex gap-1.5">
        <Button
          type="button"
          variant="ghost"
          className={pickerButtonClassName}
          onClick={isRunning ? pause : start}
          disabled={!isRunning && remainingMs <= 0 && durationMs <= 0}
        >
          {isRunning ? 'Pause' : isDone ? 'Restart' : 'Start'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={pickerButtonClassName}
          onClick={() => {
            if (isDone) {
              setDurationMs(durationMs);
              return;
            }
            reset();
          }}
        >
          Reset
        </Button>
      </div>
    </section>
  );
}
