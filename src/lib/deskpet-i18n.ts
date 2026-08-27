import { getLocale, type Locale } from '@/lib/locale';
import en from '@/i18n/deskpet/en.json';

type MessageTree = Record<string, unknown>;

const messagesByLocale: Record<Locale, MessageTree> = { en };

function resolvePath(tree: MessageTree, path: string): unknown {
  return path.split('.').reduce<unknown>((node, segment) => {
    if (node && typeof node === 'object' && segment in node) {
      return (node as MessageTree)[segment];
    }
    return undefined;
  }, tree);
}

function interpolate(
  template: string,
  values?: Record<string, string | number>
): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value == null ? `{${key}}` : String(value);
  });
}

export type DeskPetTranslator = {
  (key: string, values?: Record<string, string | number>): string;
  has: (key: string) => boolean;
  raw: (key: string) => unknown;
};

function createTranslator(
  namespace: string,
  locale: Locale
): DeskPetTranslator {
  const tree = messagesByLocale[locale] ?? messagesByLocale.en;
  const base =
    namespace.length > 0
      ? (resolvePath(tree, namespace) as MessageTree | undefined)
      : tree;

  const t = ((key: string, values?: Record<string, string | number>) => {
    const value = base ? resolvePath(base as MessageTree, key) : undefined;
    if (typeof value === 'string') {
      return interpolate(value, values);
    }
    return `${namespace ? `${namespace}.` : ''}${key}`;
  }) as DeskPetTranslator;

  t.has = (key: string) => {
    const value = base ? resolvePath(base as MessageTree, key) : undefined;
    return typeof value === 'string';
  };

  t.raw = (key: string) => {
    return base ? resolvePath(base as MessageTree, key) : undefined;
  };

  return t;
}

/** Client hook mirroring next-intl `useTranslations(namespace)`. */
export function useTranslations(namespace: string): DeskPetTranslator {
  return createTranslator(namespace, getLocale());
}

/** Client hook mirroring next-intl `useLocale()`. */
export function useLocale(): Locale {
  return getLocale();
}

/** Server/async helper mirroring next-intl `getTranslations`. */
export async function getTranslations(options: {
  locale?: Locale;
  namespace: string;
}): Promise<DeskPetTranslator> {
  const locale = options.locale ?? getLocale();
  return createTranslator(options.namespace, locale);
}

/** Sync dotted-path lookup for route `head()` metadata. */
export function getDeskPetMessage(
  path: string,
  locale: Locale = getLocale()
): string {
  const tree = messagesByLocale[locale] ?? messagesByLocale.en;
  const value = resolvePath(tree, path);
  return typeof value === 'string' ? value : path;
}
