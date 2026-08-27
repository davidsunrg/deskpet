/**
 * Timeline timestamp for a media item (gallery groups by createdAt).
 */
export function getMediaTimelineAt(item: { createdAt: string }): Date {
  return new Date(item.createdAt);
}

/**
 * Local calendar date key `YYYY-MM-DD` for grouping.
 */
export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type MediaTimelineGroup<T> = {
  dateKey: string;
  label: string;
  items: T[];
};

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Title-case the first letter (RelativeTimeFormat returns "today"/"yesterday"). */
function capitalizeLabel(label: string): string {
  if (!label) {
    return label;
  }
  return label.charAt(0).toLocaleUpperCase() + label.slice(1);
}

/** Week starts Monday (local calendar). */
function startOfLocalWeek(date: Date): Date {
  const day = startOfLocalDay(date);
  const weekday = day.getDay(); // 0 Sun … 6 Sat
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  day.setDate(day.getDate() - daysFromMonday);
  return day;
}

/**
 * Relative day label: Today / Yesterday / weekday (same week) / full date.
 */
export function formatMediaDayLabel(date: Date, locale: string): string {
  const now = new Date();
  const today = startOfLocalDay(now);
  const target = startOfLocalDay(date);
  const dayMs = 24 * 60 * 60 * 1000;
  const dayDiff = Math.round((today.getTime() - target.getTime()) / dayMs);

  if (dayDiff === 0 || dayDiff === 1) {
    return capitalizeLabel(
      new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
        -dayDiff,
        'day'
      )
    );
  }

  if (
    target.getTime() >= startOfLocalWeek(now).getTime() &&
    target.getTime() <= today.getTime()
  ) {
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Group media by local calendar day (newest day first).
 * Items within a day keep input order (already sorted newest-first).
 */
export function groupMediaByLocalDate<
  T extends { id: string; createdAt: string },
>(items: T[], locale: string): MediaTimelineGroup<T>[] {
  const groups = new Map<string, MediaTimelineGroup<T>>();

  for (const item of items) {
    const at = getMediaTimelineAt(item);
    const dateKey = getLocalDateKey(at);
    const existing = groups.get(dateKey);
    if (existing) {
      existing.items.push(item);
      continue;
    }
    groups.set(dateKey, {
      dateKey,
      label: formatMediaDayLabel(at, locale),
      items: [item],
    });
  }

  return Array.from(groups.values()).sort((a, b) =>
    b.dateKey.localeCompare(a.dateKey)
  );
}
