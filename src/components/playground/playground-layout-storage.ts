import type { PanelPosition } from './use-panel-drag';
import type { ChromeId } from './use-playground-chrome';

const LAYOUT_STORAGE_KEY = 'petnet.playground.layout.v1';

export type WidgetId = 'pomodoro' | 'countdown' | 'notes';

export type StickyColor = 'yellow' | 'mint' | 'pink' | 'blue';

export type StickyNoteState = {
  id: string;
  text: string;
  x: number;
  y: number;
  color: StickyColor;
};

export type CountdownTimerState = {
  durationMs: number;
  remainingMs: number;
  isRunning: boolean;
  endsAt?: number | null;
};

export type PlaygroundLayoutState = {
  visible?: Partial<Record<ChromeId, boolean>>;
  positions?: Partial<Record<ChromeId, PanelPosition>>;
  petPosition?: PanelPosition;
  /**
   * Last measured pet window aspect (width/height). Used on refresh so size
   * matches before video metadata arrives.
   */
  petAspect?: number;
  openWidgets?: WidgetId[];
  selectedWidget?: WidgetId | null;
  timer?: CountdownTimerState;
  stickies?: StickyNoteState[];
};

const STICKY_COLORS: readonly StickyColor[] = [
  'yellow',
  'mint',
  'pink',
  'blue',
];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPanelPosition(value: unknown): value is PanelPosition {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return isFiniteNumber(record.x) && isFiniteNumber(record.y);
}

function isStickyColor(value: unknown): value is StickyColor {
  return (
    typeof value === 'string' &&
    (STICKY_COLORS as readonly string[]).includes(value)
  );
}

function isStickyNote(value: unknown): value is StickyNoteState {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.text === 'string' &&
    isFiniteNumber(record.x) &&
    isFiniteNumber(record.y) &&
    isStickyColor(record.color)
  );
}

function isCountdownTimerState(value: unknown): value is CountdownTimerState {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    isFiniteNumber(record.durationMs) &&
    isFiniteNumber(record.remainingMs) &&
    typeof record.isRunning === 'boolean' &&
    (record.endsAt == null || isFiniteNumber(record.endsAt))
  );
}

const CHROME_IDS: readonly ChromeId[] = [
  'pets',
  'actions',
  'widgets',
  'feedback',
  'camera',
  'debug',
];

const WIDGET_IDS: readonly WidgetId[] = ['pomodoro', 'countdown', 'notes'];

function isChromeId(value: string): value is ChromeId {
  return (CHROME_IDS as readonly string[]).includes(value);
}

function isWidgetId(value: string): value is WidgetId {
  return (WIDGET_IDS as readonly string[]).includes(value);
}

function parseLayout(raw: string): PlaygroundLayoutState | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    const next: PlaygroundLayoutState = {};

    if (record.visible && typeof record.visible === 'object') {
      const visible: Partial<Record<ChromeId, boolean>> = {};
      for (const [key, value] of Object.entries(
        record.visible as Record<string, unknown>
      )) {
        if (isChromeId(key) && typeof value === 'boolean') {
          visible[key] = value;
        }
      }
      next.visible = visible;
    }

    if (record.positions && typeof record.positions === 'object') {
      const positions: Partial<Record<ChromeId, PanelPosition>> = {};
      for (const [key, value] of Object.entries(
        record.positions as Record<string, unknown>
      )) {
        if (isChromeId(key) && isPanelPosition(value)) {
          positions[key] = { x: value.x, y: value.y };
        }
      }
      next.positions = positions;
    }

    if (isPanelPosition(record.petPosition)) {
      next.petPosition = {
        x: record.petPosition.x,
        y: record.petPosition.y,
      };
    }

    if (isFiniteNumber(record.petAspect) && record.petAspect > 0) {
      next.petAspect = record.petAspect;
    }

    if (Array.isArray(record.openWidgets)) {
      next.openWidgets = record.openWidgets.filter(
        (id): id is WidgetId => typeof id === 'string' && isWidgetId(id)
      );
    }

    if (record.selectedWidget === null) {
      next.selectedWidget = null;
    } else if (
      typeof record.selectedWidget === 'string' &&
      isWidgetId(record.selectedWidget)
    ) {
      next.selectedWidget = record.selectedWidget;
    }

    if (isCountdownTimerState(record.timer)) {
      next.timer = {
        durationMs: record.timer.durationMs,
        remainingMs: record.timer.remainingMs,
        isRunning: record.timer.isRunning,
        endsAt: record.timer.endsAt ?? null,
      };
    }

    if (Array.isArray(record.stickies)) {
      next.stickies = record.stickies.filter(isStickyNote).map((note) => ({
        id: note.id,
        text: note.text,
        x: note.x,
        y: note.y,
        color: note.color,
      }));
    }

    return next;
  } catch {
    return null;
  }
}

export function readPlaygroundLayout(): PlaygroundLayoutState | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return parseLayout(raw);
  } catch {
    return null;
  }
}

export function writePlaygroundLayout(patch: PlaygroundLayoutState) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const current = readPlaygroundLayout() ?? {};
    const next: PlaygroundLayoutState = {
      ...current,
      ...patch,
      visible: patch.visible
        ? { ...current.visible, ...patch.visible }
        : current.visible,
      positions: patch.positions
        ? { ...current.positions, ...patch.positions }
        : current.positions,
    };
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota / private mode — ignore.
  }
}

export function writePlaygroundChrome(state: {
  visible: Record<ChromeId, boolean>;
  positions: Partial<Record<ChromeId, PanelPosition>>;
}) {
  writePlaygroundLayout({
    visible: state.visible,
    positions: state.positions,
  });
}

export function writePlaygroundPetPosition(position: PanelPosition) {
  writePlaygroundLayout({ petPosition: position });
}

export function writePlaygroundPetAspect(aspect: number) {
  if (!(aspect > 0) || !Number.isFinite(aspect)) {
    return;
  }
  writePlaygroundLayout({ petAspect: aspect });
}

export function writePlaygroundWidgets(state: {
  openWidgets: WidgetId[];
  selectedWidget: WidgetId | null;
}) {
  writePlaygroundLayout({
    openWidgets: state.openWidgets,
    selectedWidget: state.selectedWidget,
  });
}

export function writePlaygroundTimer(timer: CountdownTimerState) {
  writePlaygroundLayout({ timer });
}

export function writePlaygroundStickies(stickies: StickyNoteState[]) {
  writePlaygroundLayout({ stickies });
}

export { STICKY_COLORS };
