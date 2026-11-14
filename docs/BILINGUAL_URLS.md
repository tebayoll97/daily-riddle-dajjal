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

## Implementation approach
Next.js middleware rewrites the locale-prefixed URL internally to the existing App Router path. This avoids a large route-tree move and reduces the chance of breaking existing feature routes. Middleware passes the selected locale in the `x-df-locale` request header; the root layout initializes the language provider and HTML `lang` from that value.

The client language switch writes the preference cookie and navigates to the same path under the selected locale. Existing internal links without locale prefixes remain functional through temporary middleware redirects while pages are migrated to locale-aware links.

## SEO
- Homepage and section pages publish locale-specific canonical URLs.
- Homepage and section pages publish `id`, `en`, and `x-default` alternate links.
- Sitemap emits both locale variants for each currently listed public route.
- Do not claim full localized SEO coverage until metadata on the remaining public pages has been audited.

## Deferred / QA required
- Run ESLint and production build when Vercel quota permits.
- Verify root redirect with no cookie, `id` cookie, and `en` cookie.
- Verify direct deep links, query/hash preservation, and language switching in both directions.
- Verify legacy route redirects and ensure API, OAuth callback, static assets, and game flows are not redirected.
- Audit all public-page canonical/hreflang metadata and sitemap route validity.
- Verify desktop/mobile language controls and both themes.
- No deployment, merge to `main`, production alias change, or database change is authorized by this work.
