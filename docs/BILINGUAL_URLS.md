# Bilingual URL Architecture

**Status:** Initial implementation on `feature/bilingual-url-routing` — source review only; build and runtime QA pending.

## Product decision
- Supported locales: `id` and `en`.
- Default locale for a first-time visitor: Indonesian (`id`).
- Persist the visitor's latest explicit choice in the `df-locale` cookie for one year.
- The locale in the URL is authoritative. Opening an explicit `/id` or `/en` URL updates the preference cookie.
- Switching language preserves the current path, query string, and hash.

## URL contract
- `/` redirects temporarily to the remembered locale, or `/id` when no valid preference exists.
- Localized paths use `/{locale}` plus the existing route, for example `/id/knowledge` and `/en/knowledge`.
- Legacy unprefixed UI routes temporarily redirect to the remembered locale, e.g. `/knowledge` to `/id/knowledge` or `/en/knowledge`.
- API routes remain unprefixed under `/api`.
- OAuth callback `/auth/callback` is excluded from locale routing.
- The middleware applies to existing UI routes without moving their App Router files; API routes remain outside the locale rewrite.

## Implementation approach
Next.js middleware rewrites the locale-prefixed URL internally to the existing App Router path. This avoids a large route-tree move and reduces the chance of breaking existing feature routes. Middleware passes the selected locale in the `x-df-locale` request header and normalized path in `x-df-path`; the root layout initializes the language provider and HTML `lang` from those values.

The client language switch writes the preference cookie and navigates to the same path under the selected locale. Existing internal links without locale prefixes remain functional through temporary middleware redirects while pages are migrated to locale-aware links. The language provider compares a requested locale with its current context value before navigating.

## SEO and privacy
- The root layout supplies locale-aware canonical and alternate-language URLs for the current localized path.
- Page-specific hardcoded unprefixed canonicals were removed from the leaderboard and mini-game layouts so they inherit the locale-aware root canonical.
- Private account/admin/settings and wedding-builder paths receive `noindex,nofollow` metadata from the root layout.
- `robots.txt` disallows private paths in both unprefixed and localized forms. This is crawler guidance only; server-side authentication and authorization remain the actual access controls.
- Sitemap emits both locale variants for the currently enumerated public routes only.
- Do not claim full localized SEO coverage until metadata, translated content, and sitemap route validity have been audited for every public page.

## Deferred / QA required
- Run ESLint and production build when Vercel quota permits.
- Verify root redirect with no cookie, `id` cookie, and `en` cookie.
- Verify direct deep links, query/hash preservation, and language switching in both directions.
- Verify legacy route redirects and ensure API, OAuth callback, static assets, and game flows are not redirected.
- Audit all public-page canonical/hreflang metadata and sitemap route validity.
- Verify desktop/mobile language controls and both themes.
- No deployment, merge to `main`, production alias change, or database change is authorized by this work.
