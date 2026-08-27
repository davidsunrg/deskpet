export const WEIGHT_UNITS = ['kg'] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const DEFAULT_WEIGHT_UNIT: WeightUnit = 'kg';

export function isWeightUnit(value: string): value is WeightUnit {
  return (WEIGHT_UNITS as readonly string[]).includes(value);
}

/** Convert major-unit kg value to integer grams. */
export function kgToGrams(kg: number): number {
  return Math.round(kg * 1000);
}

/** Convert integer grams to kg. */
export function gramsToKg(grams: number): number {
  return grams / 1000;
}

/**
 * Parse a user weight input into integer grams.
 * Accepts up to 3 decimal places for kg (gram precision).
 */
export function parseWeightInputToGrams(
  input: string,
  unit: WeightUnit
): number | null {
  const trimmed = input.trim().replace(/,/g, '');
  if (!trimmed) return null;
  if (!/^\d+(\.\d{1,3})?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;

  if (unit === 'kg') {
    const grams = kgToGrams(value);
    if (grams <= 0 || grams > 1_000_000) return null;
    return grams;
  }

  return null;
}

/** Format stored grams for the weight input (unit-aware). */
export function formatGramsForInput(grams: number, unit: WeightUnit): string {
  if (unit === 'kg') {
    const kg = gramsToKg(grams);
    return Number(kg.toFixed(3)).toString();
  }
  return String(grams);
}

/** Format grams for display (numeric part only, no unit suffix). */
export function formatGramsDisplay(grams: number, unit: WeightUnit): string {
  if (unit === 'kg') {
    return gramsToKg(grams).toFixed(1);
  }
  return String(grams);
}

/** Delta in display unit between two gram values (current - previous). */
export function weightDeltaInUnit(
  currentGrams: number,
  previousGrams: number,
  unit: WeightUnit
): number {
  if (unit === 'kg') {
    return Number(
      (gramsToKg(currentGrams) - gramsToKg(previousGrams)).toFixed(3)
    );
  }
  return currentGrams - previousGrams;
}
