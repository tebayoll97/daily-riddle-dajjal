# DAJJAL FAMILY — DESIGN SYSTEM FOUNDATION

**Document ID:** DF-DS-001  
**Version:** 1.0  
**Status:** Draft — Pending Approval  
**Parent Standard:** MASTER FOUNDATION DAJJAL FAMILY v1.0  
**Scope:** Shared visual language and reusable UI standards

---

# 1. DESIGN SYSTEM PURPOSE

The Design System is the shared visual and interaction language of Dajjal Family.

It defines how colors, typography, spacing, layout, components, themes, motion, and responsive behavior are designed and implemented.

Its purpose is to make the ecosystem:
- Visually consistent.
- Recognizable as one brand.
- Accessible and comfortable to use.
- Responsive across devices.
- Easier to maintain and extend.
- Independent from individual page styling.

The Design System is the source of truth for new UI work. Existing pages are migrated gradually; this document does not authorize a blanket redesign of legacy pages.

# 2. VISUAL DIRECTION

## 2.1 Brand character

The recommended visual character is:
- Modern.
- Digital-first.
- Confident.
- Futuristic, but not visually noisy.
- Premium without unnecessary decoration.
- Clear and readable.
- Flexible across gaming, knowledge, publishing, commerce, and community products.

## 2.2 Brand palette

Retain the established purple–indigo–cyan identity.

Core brand colors:
- Brand Purple: `#A855F7`
- Brand Indigo: `#6366F1`
- Brand Cyan: `#22D3EE`
- Brand Gradient: purple → indigo → cyan.

Usage:
- Purple is the primary brand signal and primary action color.
- Indigo supports gradients, selected states, and secondary emphasis.
- Cyan is an accent, not a competing primary action color.
- Gradients should be used selectively for brand emphasis, not for every surface or paragraph.

## 2.3 Dark theme palette

Recommended semantic values:
- Background: `#080711`
- Surface 1: `#151020`
- Surface 2: `#1B1528`
- Surface 3: `#241C34`
- Text primary: `#F7F4FF`
- Text secondary: `#C3B8D2`
- Text muted: `#978DA7`
- Border: translucent lavender/purple.
- Primary action: `#A855F7`

Dark theme should use layered surfaces rather than placing every element on the same black background.

## 2.4 Light theme palette

Recommended semantic values:
- Background: `#F5F6FB`
- Surface 1: `#FFFFFF`
- Surface 2: `#F0EFF8`
- Surface 3: `#E8E6F2`
- Text primary: `#19172A`
- Text secondary: `#55536A`
- Text muted: `#747188`
- Border: soft lavender-gray.
- Primary action: a sufficiently dark purple variant when needed for text contrast.

Light theme must not be a simple inversion of dark theme. Surfaces, shadows, borders, and text contrast must be designed deliberately.

# 3. SEMANTIC COLOR TOKENS

Color tokens must describe purpose, not just hue.

Required semantic token groups:
- `--df-bg`: page background.
- `--df-surface`: default component surface.
- `--df-surface-raised`: elevated surface.
- `--df-surface-overlay`: popover, modal, and overlay surface.
- `--df-text`: primary text.
- `--df-text-secondary`: supporting text.
- `--df-text-muted`: low-emphasis text.
- `--df-border`: standard border.
- `--df-border-strong`: emphasized border.
- `--df-primary`: primary action.
- `--df-primary-hover`: primary hover state.
- `--df-secondary`: secondary brand color.
- `--df-accent`: accent color.
- `--df-focus`: keyboard focus indicator.

Semantic status colors:
- Success.
- Warning.
- Danger.
- Info.

Status colors must remain distinguishable in both themes and must not be the only way to communicate state.

# 4. TYPOGRAPHY SYSTEM

## 4.1 Font family

Primary recommendation:
- Inter.
- System UI fallback.
- Segoe UI fallback.
- Sans-serif fallback.

Use a limited number of font families. Avoid loading multiple font families without a clear purpose.

## 4.2 Type scale

Recommended responsive scale:

| Token | Recommended size | Usage |
|---|---:|---|
| Display | 40–56 px | Hero/display title |
| H1 | 30–40 px | Page title |
| H2 | 24–30 px | Main section |
| H3 | 20–24 px | Subsection |
| H4 | 16–20 px | Component heading |
| Body large | 18 px | Introductory text |
| Body | 16 px | Default text |
| Body small | 14 px | Supporting text |
| Caption | 12 px | Metadata |
| Micro | 11 px | Dense labels only |

Use fluid sizing with `clamp()` where appropriate.

## 4.3 Typography rules

- Body text should prioritize readability.
- Headings should have a clear hierarchy.
- Avoid excessive letter spacing in paragraphs.
- Use uppercase mainly for short labels and eyebrows.
- Use balanced line lengths.
- Use adequate line-height.
- Do not use tiny text for important information.

# 5. SPACING AND SIZING

Use a 4 px base spacing scale.

Recommended tokens:
- 4 px
- 8 px
- 12 px
- 16 px
- 20 px
- 24 px
- 32 px
- 40 px
- 48 px
- 64 px
- 80 px
- 96 px

Rules:
- Prefer spacing tokens over arbitrary values.
- Use consistent spacing within repeated components.
- Section spacing should be larger than component spacing.
- Mobile layouts may reduce spacing while preserving hierarchy.
- Avoid cramped controls and dense text blocks.

# 6. LAYOUT AND GRID

## 6.1 Content containers

Recommended maximum content width:
- Standard content: 1200–1280 px.
- Reading content: 680–760 px.
- Wide dashboards: up to 1440 px when justified.

Containers should be fluid and include safe horizontal padding.

## 6.2 Grid

- Use CSS Grid for page-level composition.
- Use Flexbox for one-dimensional alignment.
- Avoid fixed widths that break on mobile.
- Prefer minmax(), min-width: 0, and responsive grid patterns.
- Avoid unnecessary nested containers.

## 6.3 Responsive breakpoints

Recommended breakpoints for new components:
- Small mobile: 360 px and below.
- Mobile: 640 px.
- Tablet: 768 px.
- Laptop: 1024 px.
- Desktop: 1280 px.
- Wide desktop: 1440 px and above.

Breakpoints are guidance, not a reason to force every component to change at identical widths. Component behavior should determine its breakpoint.

Existing legacy breakpoints may remain until their pages are migrated and tested.

# 7. SHAPE, BORDER, AND ELEVATION

## 7.1 Border radius

Recommended scale:
- Small: 8 px.
- Medium: 12 px.
- Large: 16 px.
- Extra large: 20 px.
- Pill: 999 px.

Use consistent radius within related component families.

## 7.2 Borders

- Use subtle borders for surface separation.
- Use stronger borders for active or selected states.
- Avoid excessive outlines on every nested element.
- Borders must remain visible in both themes.

## 7.3 Shadows

Use restrained elevation:
- Low: subtle card separation.
- Medium: dropdowns and popovers.
- High: dialogs and overlays.

Do not rely on shadows alone to communicate hierarchy.

# 8. COMPONENT STANDARDS

All shared components must support both themes, keyboard interaction where relevant, and responsive layouts.

## 8.1 Buttons

Variants:
- Primary.
- Secondary.
- Tertiary/Ghost.
- Danger.
- Link.

Sizes:
- Small.
- Medium.
- Large.

Rules:
- Clear action labels.
- Visible hover, focus, active, disabled, and loading states.
- Minimum comfortable touch target; aim for 44 × 44 px on touch interfaces.
- Do not use buttons for navigation when a link is appropriate.

## 8.2 Cards

Card types:
- Standard.
- Interactive.
- Featured.
- Compact.
- Media.

Rules:
- Consistent padding and radius.
- Clear content hierarchy.
- Avoid unnecessary nested card borders.
- Interactive cards must expose clear focus and hover states.

## 8.3 Forms

Rules:
- Every input has an accessible label.
- Required and optional states are clear.
- Validation appears near the relevant field.
- Error messages explain how to fix the problem.
- Disabled and loading states are distinguishable.
- Controls remain usable on small screens.

## 8.4 Navigation

Rules:
- Navigation hierarchy must be clear.
- Active route must be identifiable.
- Mobile navigation must support keyboard and touch.
- Menus must expose accessible names and states.
- Language and theme controls must be easy to find.

## 8.5 Dialogs and overlays

Rules:
- Clear title and purpose.
- Predictable close behavior.
- Keyboard focus management.
- Escape behavior where appropriate.
- Avoid destructive actions without confirmation.
- Keep dialogs usable on small screens.

## 8.6 Data components

Tables, lists, badges, alerts, and status indicators must:
- Preserve readability.
- Support responsive presentation.
- Use semantic status colors.
- Provide text labels for important states.
- Avoid color-only meaning.

# 9. DARK AND LIGHT THEME BEHAVIOR

- Dark Mode and Light Mode are first-class themes.
- New components must use semantic tokens.
- Do not hardcode theme-specific colors in individual components unless there is a documented exception.
- Theme switching must not alter layout or lose user input.
- Respect system preference when no explicit user choice exists.
- Persist explicit user choice.
- Check contrast and component states in both themes.
- Avoid a flash of the wrong theme where technically practical.

# 10. INTERACTION AND MOTION

Recommended motion:
- Fast: approximately 150–160 ms.
- Standard: approximately 200–240 ms.
- Emphasis: approximately 280–320 ms.

Rules:
- Motion should clarify state changes.
- Avoid unnecessary animation.
- Avoid motion that delays interaction.
- Respect `prefers-reduced-motion`.
- Hover effects must not be the only indication of interactivity.
- Avoid excessive glow, parallax, and animated gradients.

# 11. ACCESSIBILITY

Target: WCAG 2.2 Level AA, following the Master Foundation.

Required practices:
- Sufficient text and UI contrast.
- Keyboard access.
- Visible focus indicator.
- Semantic HTML.
- Accessible names.
- Accessible forms and error messages.
- Appropriate touch target sizing.
- Reduced motion support.
- Status information not conveyed by color alone.

# 12. ICONOGRAPHY AND IMAGERY

- Use one consistent icon family wherever practical.
- Icons must have consistent stroke weight and visual scale.
- Decorative icons should be hidden from assistive technology.
- Functional icons require accessible labels.
- Use consistent image aspect ratios within repeated content patterns.
- Images must be optimized and have appropriate alternative text.
- Do not stretch or distort brand assets.

# 13. DESIGN TOKEN IMPLEMENTATION

CSS custom properties are the source of truth for shared design values.

Token naming must be semantic and consistent.

Recommended organization:
1. Brand primitives.
2. Theme semantic colors.
3. Typography.
4. Spacing.
5. Layout.
6. Radius and elevation.
7. Motion.
8. Breakpoints.

Components should consume semantic tokens rather than directly referencing palette primitives.

Existing `--df-*` variables may be migrated incrementally. Avoid breaking current styles by renaming tokens globally without regression testing.

# 14. GOVERNANCE AND MIGRATION

- This document governs new UI work after approval.
- Existing pages are not automatically redesigned.
- Legacy CSS remains in place until each page is migrated and tested.
- Shared token changes require regression checks.
- Component exceptions must be documented.
- Visual changes must be reviewed in Dark Mode, Light Mode, mobile, and desktop.
- Production changes require explicit approval under the Master Foundation.

# 15. DEFINITION OF DONE

A shared component is design-system compliant when:
- It uses semantic design tokens.
- It supports Dark Mode and Light Mode.
- It has responsive behavior.
- It has appropriate interaction states.
- It meets relevant accessibility requirements.
- It uses consistent spacing, typography, and shape.
- It has been tested in the contexts where it is used.
- It does not introduce unintended legacy regressions.

---

**Design principle:** One visual language. Many product experiences.

**Parent standard:** MASTER FOUNDATION DAJJAL FAMILY v1.0.
