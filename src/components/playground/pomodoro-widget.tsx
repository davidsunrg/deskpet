import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import {
  formatPomodoroClock,
  usePomodoroTimer,
  type PomodoroPhase,
} from '@/utils/pomodoro-timer';

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  focus: 'Focus',
  'short-break': 'Short break',
  'long-break': 'Long break',
};

const pickerButtonClassName = cn(
  'h-8 flex-1 rounded-md px-2 text-sm font-medium',
  'text-[color:var(--picker-fg)] hover:bg-[color:var(--picker-hover)] hover:text-[color:var(--picker-fg)]'
);

type PomodoroWidgetProps = {
  onClose?: () => void;
  /** When false, keep mounted but hide so the timer can keep running. */
  visible?: boolean;
};

/**
 * Compact Pomodoro controls for the playground Widgets panel.
 */
export function PomodoroWidget({
  onClose,
  visible = true,
}: PomodoroWidgetProps) {
  const {
    phase,
    remainingMs,
    isRunning,
    completedFocusCount,
    longBreakEvery,
    start,
    pause,
    reset,
    skip,
  } = usePomodoroTimer();

  const towardLongBreak = completedFocusCount % longBreakEvery;

  return (
    <div
      className={cn(
        'mb-2 space-y-3 rounded-md border border-[color:var(--picker-ring)] bg-[color:var(--picker-selected)]/40 p-3',
        !visible && 'hidden'
      )}
      data-testid="pomodoro-widget"
      aria-label="Pomodoro timer"
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide text-[color:var(--picker-muted)] uppercase">
          {PHASE_LABELS[phase]}
        </p>
        <div className="flex items-center gap-1">
          <p className="text-[11px] font-medium text-[color:var(--picker-muted)]">
            {towardLongBreak} / {longBreakEvery}
          </p>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 rounded-md text-[color:var(--picker-muted)] hover:bg-[color:var(--picker-hover)] hover:text-[color:var(--picker-fg)]"
              aria-label="Close Pomodoro"
              onClick={onClose}
            >
              <XIcon className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      <p
        className="text-center font-mono text-3xl font-semibold tracking-tight text-[color:var(--picker-fg)] tabular-nums"
        aria-live="polite"
      >
        {formatPomodoroClock(remainingMs)}
      </p>

      <div className="flex gap-1.5">
        <Button
          type="button"
          variant="ghost"
          className={pickerButtonClassName}
          onClick={isRunning ? pause : start}
        >
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={pickerButtonClassName}
          onClick={reset}
        >
          Reset
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={pickerButtonClassName}
          onClick={skip}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}
