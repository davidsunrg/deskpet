import { readFile } from 'node:fs/promises';

const JSON_MESSAGE_KEYS = [
  'auth_error_codes',
  'pricing_plans_free_features',
  'pricing_plans_free_limits',
  'pricing_plans_lifetime_features',
  'pricing_plans_lifetime_limits',
  'pricing_plans_pro_features',
  'pricing_plans_pro_limits',
] as const;

async function readMessages() {
  const raw = await readFile('project.inlang/messages/en.json', 'utf8');
  return JSON.parse(raw) as Record<string, string>;
}

const en = await readMessages();
const enKeys = Object.keys(en).sort();
const emptyValues = enKeys.filter((key) => en[key] === '');

for (const key of JSON_MESSAGE_KEYS) {
  try {
    JSON.parse(en[key] ?? '');
  } catch {
    throw new Error(`en.${key} is not valid JSON`);
  }
}

if (emptyValues.length) {
  console.error(JSON.stringify({ emptyValues }, null, 2));
  process.exit(1);
}

console.log(`Locale keys OK (${enKeys.length} keys)`);
