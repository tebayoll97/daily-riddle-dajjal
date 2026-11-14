# Typography & Layout Foundation

**Document ID:** DF-TL-001  
**Version:** 1.0  
**Status:** Draft — implementation baseline  
**Parent:** MASTER FOUNDATION DAJJAL FAMILY v1.0  
**Related:** DESIGN_SYSTEM.md, COMPONENT_CATALOG.md

## Purpose
Provide predictable typography, content width, spacing, and responsive composition for new Dajjal Family interfaces. These utilities are opt-in; they do not authorize a mass migration of existing pages.

## Typography contract
- Font stack: Inter first, then platform system sans-serif fallbacks.
- Body copy: 15–16px minimum for normal reading; supporting metadata may use 12–14px.
- Reading measure: maximum 46rem (736px) for long-form copy.
- Paragraph line-height: 1.5–1.65; headings: approximately 1.12–1.3.
- Use balanced wrapping for major headings and avoid uppercase paragraphs.
- Use the `--df-text-*`, `--df-leading-*`, and fluid type utilities.
- Use `.ui-prose` for readable text blocks and `.ui-caption` for metadata.

## Layout contract
- Standard content max width: 76rem (1216px).
- Reading max width: 46rem (736px).
- Horizontal gutters: 20px desktop/tablet and 16px small mobile.
- Use CSS Grid for two-dimensional page composition; Flexbox for one-dimensional alignment.
- Grid children must be allowed to shrink (`min-width: 0`).
- Avoid fixed content widths and horizontal overflow.
- Prefer spacing tokens on shared components.

## Responsive behavior
- Below 768px, three- and four-column utility grids collapse to two columns.
- Below 480px, two-, three-, and four-column utility grids collapse to one column.
- These are utility defaults, not mandatory breakpoints for every component. Component-specific breakpoints should be based on content fit.
- Validate at 360px, 390px, 768px, 1024px, and 1440px.

## Theme behavior
- Layout and typography must not depend on hardcoded dark-theme text or surface colors.
- Use semantic tokens for text, borders, surfaces, and accents.
- Check both themes; maintain clear focus and status contrast.

## Utility classes
- Typography: `.ui-heading-h1` through `.ui-heading-h4`, `.ui-subtitle`, `.ui-prose`, `.ui-caption`, `.ui-eyebrow`, `.ui-gradient-text`.
- Containers: `.ui-page`, `.ui-container`, `.ui-reading-container`.
- Composition: `.ui-stack`, `.ui-stack-sm`, `.ui-stack-lg`, `.ui-cluster`, `.ui-grid`, `.ui-grid-2`, `.ui-grid-3`, `.ui-grid-4`.
- Frames: `.ui-page-header`, `.ui-frame-h1` through `.ui-frame-h4`.

## Implementation safeguards
1. Utilities are opt-in and must be applied only to new or explicitly migrated UI.
2. Preserve legacy CSS and routes.
3. Do not globally restyle bare `h1`, `p`, `button`, or form elements as part of this foundation.
4. Do not add broad `!important` overrides.
5. Verify theme switching, language switching, keyboard focus, and narrow viewport behavior.
6. Keep production untouched until the user explicitly approves.

## Acceptance checklist
- [ ] Type hierarchy is consistent and readable.
- [ ] Long-form copy respects reading width.
- [ ] No horizontal overflow at the required viewport widths.
- [ ] Grid utilities collapse at defined widths.
- [ ] Dark and Light themes both use semantic colors.
- [ ] Legacy pages and game HUD styles remain unaffected.
- [ ] Preview build succeeds.
