import type { LucideIcon } from 'lucide-react';
import {
  BoneIcon,
  BrushIcon,
  CakeIcon,
  CatIcon,
  ClipboardPlusIcon,
  CookieIcon,
  DogIcon,
  DropletsIcon,
  EarIcon,
  FootprintsIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HomeIcon,
  PillIcon,
  ScissorsIcon,
  ShieldIcon,
  ShirtIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StethoscopeIcon,
  SyringeIcon,
  ToyBrickIcon,
  UtensilsIcon,
  WandSparklesIcon,
} from 'lucide-react';

/**
 * Code-defined reminder type keys (localized via `Dashboard.reminders.types.*`).
 */
export const REMINDER_TYPE_KEYS = [
  'externalDeworming',
  'feeding',
  'internalDeworming',
  'rabiesVaccine',
  'catTripleVaccine',
  'bath',
  'litterScoop',
  'medical',
  'earCheck',
  'brushTeeth',
  'training',
  'walk',
  'nailTrim',
  'treats',
  'checkup',
  'toy',
  'neuter',
  'clothing',
  'boarding',
  'buyFood',
  'buyLitter',
  'insurance',
  'birthday',
  'dogVaccine',
  'other',
] as const;

export type ReminderTypeKey = (typeof REMINDER_TYPE_KEYS)[number];

const REMINDER_TYPE_SET = new Set<string>(REMINDER_TYPE_KEYS);

export function isReminderTypeKey(value: string): value is ReminderTypeKey {
  return REMINDER_TYPE_SET.has(value);
}

export const DEFAULT_REMINDER_TYPE: ReminderTypeKey = 'other';

/** Optional icons for reminder cards (selection is dropdown-based). */
export const REMINDER_TYPE_ICON: Partial<Record<ReminderTypeKey, LucideIcon>> =
  {
    externalDeworming: DropletsIcon,
    feeding: UtensilsIcon,
    internalDeworming: PillIcon,
    rabiesVaccine: SyringeIcon,
    catTripleVaccine: CatIcon,
    bath: SparklesIcon,
    litterScoop: WandSparklesIcon,
    medical: StethoscopeIcon,
    earCheck: EarIcon,
    brushTeeth: BrushIcon,
    training: GraduationCapIcon,
    walk: FootprintsIcon,
    nailTrim: ScissorsIcon,
    treats: CookieIcon,
    checkup: ClipboardPlusIcon,
    toy: ToyBrickIcon,
    neuter: HeartPulseIcon,
    clothing: ShirtIcon,
    boarding: HomeIcon,
    buyFood: ShoppingBagIcon,
    buyLitter: ShoppingBagIcon,
    insurance: ShieldIcon,
    birthday: CakeIcon,
    dogVaccine: DogIcon,
    other: BoneIcon,
  };

export const REMINDER_REPEAT_TYPES = [
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const;

export type ReminderRepeatType = (typeof REMINDER_REPEAT_TYPES)[number];

const REMINDER_REPEAT_SET = new Set<string>(REMINDER_REPEAT_TYPES);

export function isReminderRepeatType(
  value: string
): value is ReminderRepeatType {
  return REMINDER_REPEAT_SET.has(value);
}

export const DEFAULT_REMINDER_REPEAT: ReminderRepeatType = 'none';

export type ReminderStatusFilter = 'all' | 'pending' | 'completed';

/** Local calendar date `YYYY-MM-DD` for today. */
export function todayRemindDateValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Local time `HH:mm` rounded to the next hour (or current hour). */
export function defaultRemindTimeValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** Combine local date + time into an ISO timestamp. */
export function combineRemindAt(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  if (
    year == null ||
    month == null ||
    day == null ||
    hours == null ||
    minutes == null
  ) {
    return null;
  }
  const value = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString();
}

/** Split an ISO timestamp into local date + time fields. */
export function splitRemindAt(iso: string): { date: string; time: string } {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) {
    return { date: todayRemindDateValue(), time: defaultRemindTimeValue() };
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
    time: `${pad(value.getHours())}:${pad(value.getMinutes())}`,
  };
}
