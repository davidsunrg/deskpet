export const INVENTORY_CATEGORY_KEYS = [
  'food',
  'medicine',
  'supplies',
  'toys',
  'grooming',
  'cleaning',
  'litter',
  'peePad',
  'bowl',
  'treats',
  'health',
  'other',
] as const;

export type InventoryCategoryKey = (typeof INVENTORY_CATEGORY_KEYS)[number];

const INVENTORY_CATEGORY_SET = new Set<string>(INVENTORY_CATEGORY_KEYS);

export function isInventoryCategoryKey(
  value: string
): value is InventoryCategoryKey {
  return INVENTORY_CATEGORY_SET.has(value);
}

export const INVENTORY_EVENT_TYPES = ['use', 'restock', 'adjust'] as const;
export type InventoryEventType = (typeof INVENTORY_EVENT_TYPES)[number];

export const DEFAULT_INVENTORY_UNIT = 'pcs';
