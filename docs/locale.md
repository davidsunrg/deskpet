# Locale

This project uses Paraglide JS for English-only runtime locale support.

## Locales

- Base locale: `en`
- English URLs are unprefixed: `/about`

## Files

- Source messages: `project.inlang/messages/en.json`
- Paraglide settings: `project.inlang/settings.json`
- Generated runtime: `src/locale/paraglide/`
- Project locale helpers: `src/lib/locale.ts`
- Server middleware wrapper: `src/locale/middleware.ts`

Markdown content uses the base filename in each collection directory:

```txt
content/blog/getting-started.md
content/changelog/v1.0.0.md
content/pages/privacy.md
```

`src/locale/paraglide/` is generated code and is ignored by git.

## Commands

```bash
pnpm locale:sort      # sort message keys in en.json
pnpm locale:check     # verify en.json leaf values and JSON message fields
pnpm locale:compile   # compile Paraglide runtime manually
```

`pnpm dev` and `pnpm build` also compile the Paraglide runtime via Vite.

## Message Access

Application code reads messages directly from the generated Paraglide module:

```ts
import { m } from '@/locale/paraglide/messages';

m.auth_login_title();
```

DeskPet marketing copy uses `src/i18n/deskpet/en.json` via `src/lib/deskpet-i18n.ts`.

## URL Strategy

Paraglide is configured with the `url` strategy, but with only `en` enabled there is no
locale prefix in routes. `localizeHref()` and `deLocalizeHref()` remain available for
helpers that need canonical path normalization.

## Adding Copy

1. Add keys to `project.inlang/messages/en.json`
2. Run `pnpm locale:sort` if needed
3. Run `pnpm locale:check`
4. Use `m.your_key()` from Paraglide in components

For DeskPet-specific marketing strings, edit `src/i18n/deskpet/en.json` and use
`useTranslations('Namespace')` from `@/lib/deskpet-i18n`.
