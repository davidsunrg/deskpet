import type { LucideIcon } from 'lucide-react';
import {
  BoneIcon,
  BrushIcon,
  CarIcon,
  CookieIcon,
  DropletsIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HomeIcon,
  PackageIcon,
  PawPrintIcon,
  PillIcon,
  ScissorsIcon,
  ShieldIcon,
  ShoppingBagIcon,
  SparklesIcon,
  SprayCanIcon,
  StethoscopeIcon,
  SyringeIcon,
  ToyBrickIcon,
  UtensilsIcon,
  WandSparklesIcon,
} from 'lucide-react';

/**
 * Code-defined expense category keys (localized via `Dashboard.expenses.categories.*`).
 */
export const EXPENSE_CATEGORY_KEYS = [
  'food',
  'treats',
  'supplies',
  'toys',
  'grooming',
  'beauty',
  'health',
  'medicine',
  'vaccine',
  'deworming',
  'vet',
  'cleaning',
  'litter',
  'peePad',
  'bowl',
  'boarding',
  'training',
  'insurance',
  'transport',
  'license',
  'adoptionPurchase',
  'other',
] as const;

export type ExpenseCategoryKey = (typeof EXPENSE_CATEGORY_KEYS)[number];

const EXPENSE_CATEGORY_SET = new Set<string>(EXPENSE_CATEGORY_KEYS);

export function isExpenseCategoryKey(
  value: string
): value is ExpenseCategoryKey {
  return EXPENSE_CATEGORY_SET.has(value);
}

/** Stable accent colors for category chips / summary bars. */
export const EXPENSE_CATEGORY_SWATCH: Record<ExpenseCategoryKey, string> = {
  food: 'bg-deskpet-sun',
  treats: 'bg-orange-300',
  supplies: 'bg-sky-300',
  toys: 'bg-deskpet-mint',
  grooming: 'bg-teal-300',
  beauty: 'bg-pink-300',
  health: 'bg-rose-300',
  medicine: 'bg-red-300',
  vaccine: 'bg-violet-300',
  deworming: 'bg-fuchsia-300',
  vet: 'bg-[#9f7aea]',
  cleaning: 'bg-cyan-300',
  litter: 'bg-amber-300',
  peePad: 'bg-lime-300',
  bowl: 'bg-yellow-300',
  boarding: 'bg-indigo-300',
  training: 'bg-blue-300',
  insurance: 'bg-emerald-300',
  transport: 'bg-slate-300',
  license: 'bg-stone-300',
  adoptionPurchase: 'bg-purple-300',
  other: 'bg-[#ffe7ec]',
};

export const EXPENSE_CATEGORY_ICON: Partial<
  Record<ExpenseCategoryKey, LucideIcon>
> = {
  food: UtensilsIcon,
  treats: CookieIcon,
  supplies: PackageIcon,
  toys: ToyBrickIcon,
  grooming: ScissorsIcon,
  beauty: SparklesIcon,
  health: HeartPulseIcon,
  medicine: PillIcon,
  vaccine: SyringeIcon,
  deworming: DropletsIcon,
  vet: StethoscopeIcon,
  cleaning: SprayCanIcon,
  litter: WandSparklesIcon,
  peePad: BrushIcon,
  bowl: BoneIcon,
  boarding: HomeIcon,
  training: GraduationCapIcon,
  insurance: ShieldIcon,
  transport: CarIcon,
  license: ShoppingBagIcon,
  adoptionPurchase: PawPrintIcon,
};
