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
