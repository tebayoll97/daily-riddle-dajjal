import React from "react";

/** Accessible action button. Use a Link for navigation, not this component. */
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) {
  const classes = ["ui-button", `ui-button-${variant}`, size !== "md" ? `ui-button-${size}` : "", className]
    .filter(Boolean).join(" ");

  return (
    <button
      {...props}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <><span aria-hidden="true" className="ui-button-spinner" /> <span>{children}</span></> : children}
    </button>
  );
}
