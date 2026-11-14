const variants = new Set(["info", "success", "warning", "danger"]);

export function Alert({ children, variant = "info", title, className = "", ...props }) {
  const safeVariant = variants.has(variant) ? variant : "info";
  const role = safeVariant === "danger" || safeVariant === "warning" ? "alert" : "status";
  const classes = ["ui-alert", `ui-alert-${safeVariant}`, className].filter(Boolean).join(" ");
  return (
    <div {...props} className={classes} role={role}>
      <div>
        {title ? <strong className="ui-alert-title">{title}</strong> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
