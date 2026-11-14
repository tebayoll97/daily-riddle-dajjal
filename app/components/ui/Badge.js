const variants = new Set(["neutral", "success", "warning", "danger", "info"]);

export function Badge({ children, variant = "neutral", className = "", ...props }) {
  const safeVariant = variants.has(variant) ? variant : "neutral";
  const classes = ["ui-badge", safeVariant !== "neutral" ? `ui-badge-${safeVariant}` : "", className]
    .filter(Boolean).join(" ");
  return <span {...props} className={classes}>{children}</span>;
}
