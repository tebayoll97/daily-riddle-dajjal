# Tools Navigation

## Purpose
Provide a dedicated, extensible Tools / Alat category in the primary Dajjal Family navigation pane so utility products can be discovered without expanding the main navigation list.

## Current structure
- Navigation group label: Tools (English) / Alat (Bahasa Indonesia).
- First item: Wedding Invitation Builder (English) / Pembuat Undangan Pernikahan (Bahasa Indonesia).
- Destination: `/df/wedding`.
- The existing Wedding platform, builder, dashboard, preview, and invitation routes remain unchanged. This is a navigation entry point, not a route migration or rewrite.

## Placement and behavior
- The Tools group appears beneath the Main Menu group in the homepage left sidebar.
- The same Sidebar component is reused in the mobile navigation drawer, so the item is available on desktop and mobile.
- Keep labels bilingual through the existing LanguageProvider.
- Add future tools as child links within this category rather than adding each tool to the primary Main Menu list.
- Preserve the existing navigation hierarchy and responsive drawer behavior.

## Scope and verification
- Implemented in `app/components/HomeExperience.js`.
- No new route, database schema, API, or authentication behavior was introduced.
- Build, browser QA, and preview verification are deferred until Vercel quota is expected to recover, per `docs/aturan-kerja.md`.
