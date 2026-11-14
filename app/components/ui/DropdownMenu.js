export function DropdownMenu({ label, children, className = "" }) {
  return (
    <details className={["ui-dropdown", className].filter(Boolean).join(" ")}>
      <summary className="ui-dropdown-trigger">{label}<span aria-hidden="true">⌄</span></summary>
      <div className="ui-dropdown-panel">{children}</div>
    </details>
  );
}
