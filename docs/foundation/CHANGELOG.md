# Foundation Changelog

## v1.0 — Approved

- Established Dajjal Family as a unified digital ecosystem.
- Approved Dark Mode and Light Mode as global theme options.
- Approved English and Bahasa Indonesia with URL prefixes: /en/ and /id/.
- Approved browser-language detection, country fallback, and persistent manual language selection.
- Approved a modular monolith architecture using Next.js.
- Approved a unified account identity using Supabase Auth, with product-specific authorization.
- Established shared design tokens and reusable component standards.
- Established SEO, performance, security, accessibility, content, testing, and deployment standards.
- Established GitHub documentation as the authoritative project reference.
- Established preview-first development and explicit approval before production changes.
- Required gradual migration and protection of existing routes, accounts, games, invitations, and data.



## Homepage foundation integration — Preview

- Connected the homepage shell to semantic design tokens for background, surfaces, borders, typography, and theme values without changing legacy routes.
- Added a keyboard skip link, visible focus indicators, current-page navigation semantics, and accessible labeling for the mobile navigation disclosure.
- Kept the existing homepage content, destinations, and information architecture intact.
- Status: preview implementation; visual and keyboard QA in both themes and mobile/desktop remains required before approval.

## Homepage Foundation Compliance — Preview

- Added a dedicated, homepage-scoped compliance layer consuming Master Foundation semantic tokens for the desktop sidebar, mobile header and navigation disclosure, content header, hero, category cards, feature section, latest section, and footer.
- Unified theme-aware surfaces, text hierarchy, borders, actions, focus indicators, and reduced-motion behavior through shared semantic tokens.
- Kept existing page destinations, categories, bilingual copy, and legacy route styling intact.
- The approved Master Foundation remains the governing standard; the visual Design System remains Draft pending owner review.
- Status: implementation committed to the preview branch; build and manual visual/keyboard QA remain required.

## Command Master v1.1 — Autonomous product discovery

- Added a mandate to independently research category leaders, competitor patterns, user expectations, technical standards, and market trends before major product builds.
- Added end-to-end feature mapping and journey checklists so important menus, settings, management flows, and user-facing states are not omitted.
- Established sensible-default execution: do not ask the owner to specify routine product/design details; ask only for genuinely blocking owner-only decisions or high-impact irreversible trade-offs.
- Added a wedding-builder example covering templates, customization, event information, schedule, venue/maps, media, RSVP, guestbook, gifts, preview, drafts, publishing, sharing, management, privacy, accessibility, mobile, localization, and future analytics/monetization.
- Added /command-master as the owner's shorthand to load and execute the current Command Master and related foundation documents, subject to security and production release safeguards.
- Research claims must distinguish verified findings, common patterns, and recommendations; no claim of exhaustive web crawling or certainty beyond available evidence.


## Account experience and profile security — Preview implementation

- Added a shared account entry that reflects Supabase Auth state, displays the player's avatar or nickname when available, and routes signed-out visitors to Google login with a return path.
- Added the account entry to the standard site header and both desktop and mobile homepage headers; the existing footer profile link remains available.
- Preserved immersive game and public wedding invitation layouts without injecting account chrome into those focused experiences.
- Hardened the player profile API: it now requires a valid bearer session, verifies that the requested player belongs to that authenticated user, omits the internal auth user ID from the response, and disables response caching.
- Updated the profile page to send its session token and the edit page to return unauthenticated visitors to login.
- Status: committed to the feature branch; build, interactive auth-flow, responsive, and visual QA remain pending. No production changes.


## Command Master v2.0 — incremental releases and command registry

- Established `/command-master` as the development command and added dedicated `/command-master-migration`, `/command-master-audit`, and `/command-master-status` operating modes.
- Defined a gated release-readiness workflow covering branch scope/divergence, build and tests, exact-commit preview QA, database compatibility, recovery planning, explicit release approval, and post-release verification.
- Clarified that Git merge, Supabase database migration, and Vercel production promotion are separate operations.
- Adopted incremental, independently usable releases with versioning, release notes, migration-state tracking, and safe synchronization of the development branch after each release.
- Production and destructive operations remain blocked until explicit, release-specific owner approval.
- Status: documentation committed to `redesign/dajjalfamily-home` only. No merge to `main`, production deployment, or Supabase database change.
