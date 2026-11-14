export function Skeleton({ variant = "text", width, height, className = "", count = 1, ...props }) {
  const safeVariant = ["text", "rect", "circle"].includes(variant) ? variant : "text";
  const style = { ...(width ? { width } : {}), ...(height ? { height } : {}) };
  return (
    <span className={["ui-skeleton", `ui-skeleton-${safeVariant}`, className].filter(Boolean).join(" ")} style={style} aria-hidden="true" {...props}>
      {count > 1 ? Array.from({ length: count }, (_, index) => <span className="ui-skeleton-line" key={index} />) : null}
    </span>
  );
}
