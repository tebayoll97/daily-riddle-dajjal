# DAJJAL FAMILY — SHARED COMPONENT CATALOG

**Document ID:** DF-UI-001  
**Version:** 1.0  
**Status:** Draft — Implementation Reference  
**Parent:** DESIGN_SYSTEM.md  
**Scope:** Shared UI components for new and migrated features

---

# 1. COMPONENT PRINCIPLES

- Build a shared component when the same interaction or visual pattern appears in multiple places.
- Keep components focused and composable.
- Separate visual presentation from feature-specific business logic.
- Use semantic design tokens.
- Support both themes.
- Include accessible names, keyboard behavior, and visible focus where relevant.
- Do not introduce a shared component solely to wrap one element without adding consistent behavior or value.
- Avoid breaking existing pages when introducing or changing shared components.

# 2. FOUNDATIONAL COMPONENT INVENTORY

| Component | Purpose | Required variants or states |
|---|---|---|
| Button | Trigger an action | Primary, secondary, ghost, danger, loading, disabled |
| Link | Navigate to a destination | Default, subtle, external |
| IconButton | Compact icon action | Default, active, disabled, accessible label |
| Card | Group related content | Standard, interactive, featured, compact |
| Badge | Show a short status or category | Neutral, success, warning, danger, info |
| Input | Single-line entry | Default, focus, invalid, disabled |
| Textarea | Multi-line entry | Default, focus, invalid, disabled |
| Select | Choose an option | Default, focus, invalid, disabled |
| Checkbox | Boolean or multi-select choice | Checked, unchecked, indeterminate, disabled |
| RadioGroup | Single choice | Selected, unselected, disabled |
| Switch | Toggle a setting | On, off, disabled |
| Alert | Communicate a message | Info, success, warning, danger |
| Dialog | Focused decision or task | Open, closing, confirmation |
| DropdownMenu | Contextual actions | Open, closed, focused, disabled item |
| Tabs | Switch related views | Active, inactive, disabled |
| Tooltip | Explain a control | Visible, hidden |
| Skeleton | Loading placeholder | Loading |
| EmptyState | Explain absence of content | Default, action available |
| ErrorState | Explain failure and recovery | Recoverable, blocking |
| Breadcrumbs | Show hierarchy | Current, ancestor |
| Pagination | Navigate result pages | Current, available, disabled |
| Table | Present structured data | Loading, empty, populated, responsive |
| Avatar | Represent a user or entity | Image, initials, fallback |
| ThemeToggle | Change appearance | Dark, light |
| LanguageSwitcher | Change language | EN, ID |

# 3. INTERACTION STATE CONTRACT

Interactive components should define relevant states explicitly:

- Default.
- Hover (pointer devices).
- Focus-visible.
- Active or pressed.
- Selected.
- Disabled.
- Loading.
- Invalid or error.
- Success where relevant.

Not every component needs every state. Implement only meaningful states for its role.

# 4. BUTTON CONTRACT

- Use a semantic button for actions.
- Use an anchor/link for navigation.
- Provide a visible label unless an icon-only control has an accessible name.
- Prevent duplicate submission while loading where appropriate.
- Disabled controls must be visibly disabled and non-interactive.
- Destructive actions should be visually distinct and may require confirmation.
- Do not communicate success until the operation actually succeeds.

# 5. FORM CONTRACT

- Associate each field with a programmatic label.
- Explain required fields.
- Validate on the server for security-sensitive data.
- Preserve entered values when validation fails where appropriate.
- Put errors close to the affected field.
- Provide a clear correction path.
- Ensure keyboard and mobile usability.

# 6. DIALOG CONTRACT

- Give the dialog an accessible name.
- Move focus into the dialog when opened.
- Keep keyboard focus within a modal dialog.
- Return focus to the invoking control when closed.
- Support Escape where safe and appropriate.
- Avoid closing and losing unsaved user input without warning.
- Confirm destructive actions.

# 7. NAVIGATION CONTRACT

- Use links for navigation.
- Indicate the active location.
- Ensure mobile menus are keyboard accessible.
- Expose expanded/collapsed state to assistive technology.
- Preserve meaningful browser navigation behavior.
- Language switching should retain the equivalent page when that translation exists.

# 8. DATA DISPLAY CONTRACT

- Tables should have meaningful headers.
- Provide an appropriate mobile presentation for wide data.
- Loading, empty, and error states must be distinct.
- Status badges should include text, not color alone.
- Important data should remain readable at zoomed text sizes.

# 9. COMPONENT DOCUMENTATION TEMPLATE

Every substantial shared component should document:
1. Purpose.
2. API/props.
3. Variants.
4. Interaction states.
5. Accessibility behavior.
6. Theme behavior.
7. Responsive behavior.
8. Example usage.
9. Known limitations.

# 10. MIGRATION POLICY

- New features should use approved shared components.
- Legacy pages migrate one at a time.
- Do not replace an existing component globally without identifying all consumers.
- Verify visual and functional regression in both themes and supported viewports.
- Record documented exceptions.

**Principle:** Shared components create consistency without forcing every product experience to look identical.


# 11. INITIAL CSS PRIMITIVE IMPLEMENTATION

The first opt-in CSS primitives are available in `app/styles/components.css`:

- Buttons: `.ui-button`, `.ui-button-primary`, `.ui-button-secondary`, `.ui-button-ghost`, `.ui-button-danger`, `.ui-button-sm`, `.ui-button-lg`.
- Cards: `.ui-card`, `.ui-card-interactive`.
- Forms: `.ui-field-label`, `.ui-field-help`, `.ui-input`, `.ui-select`, `.ui-textarea`.
- Feedback: `.ui-badge` with semantic status variants; `.ui-alert` with semantic status variants.
- Icon action: `.ui-icon-button`.
- Dialog visual shell: `.ui-dialog-backdrop`, `.ui-dialog`.

These are styling primitives, not complete React components. Dialog focus trapping, Escape handling, focus restoration, form validation, loading behavior, and business logic must be implemented in the corresponding accessible component. Do not infer those behaviors from CSS classes.

All primitives consume semantic tokens and are opt-in. Apply only to new UI or a page explicitly selected for migration. Review in both themes and at mobile widths before wider adoption.


# 12. REACT PRIMITIVE IMPLEMENTATION

Initial reusable React primitives are available under `app/components/ui/`:
- `Button`: action-only button with variants, sizes, loading, and disabled states.
- `Card`: content surface; interactive styling does not replace semantic link/button behavior.
- `Badge`: short status/category label.
- `Alert`: status or alert announcement with semantic role.
- `TextField`: labeled input/textarea/select wrapper with help and error messaging.
- `Dialog`: native modal dialog with browser-managed focus containment, Escape handling, and focus restoration.\n- `index.js`: named exports for the primitives.

Example:
```jsx
import { Alert, Badge, Button, Card, TextField } from "@/app/components/ui";

<Card className="ui-stack" padding="var(--df-space-4)">
  <Badge variant="success">Ready</Badge>
  <TextField label="Display name" name="displayName" required />
  <Alert variant="info" title="Note">Changes are saved after submission.</Alert>
  <Button type="submit" loading={isSaving}>Save changes</Button>
</Card>
```

Implementation notes:
- The primitives provide presentation and basic semantics, not business logic or server validation.
- The consuming form must validate input and handle submission.
- Dialog uses the native HTML dialog element and `showModal()`, allowing the browser to manage modal focus containment and focus restoration. Escape closes by default; set `closeOnEscape={false}` to prevent it. The parent controls the `open` prop and should set it to false in `onClose`. Backdrop closing is opt-in with `closeOnBackdrop`. Always provide a title or an accessible label.
- Import paths assume the repository's existing `@/*` alias; if an individual feature uses a different alias configuration, use a relative import.


# 13. DIALOG REACT API

```jsx
import { Dialog } from "@/app/components/ui";

<Dialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm changes"
  description="Review before continuing."
  closeOnEscape
  closeOnBackdrop={false}
  actions={<Button onClick={() => setIsOpen(false)}>Done</Button>}
>
  Dialog content
</Dialog>
```

The native modal dialog provides a top-layer modal, keyboard focus containment, and focus restoration when closed. The component does not implement application-specific confirmation, unsaved-change handling, or server actions. Those remain the responsibility of the consuming feature. Verify behavior in supported browsers before production adoption.
