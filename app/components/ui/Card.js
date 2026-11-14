/** Content surface. Interactive behavior should be supplied by a semantic link or button. */
export function Card({ children, interactive = false, as: Element = "div", className = "", ...props }) {
  const classes = ["ui-card", interactive ? "ui-card-interactive" : "", className].filter(Boolean).join(" ");
  return <Element {...props} className={classes}>{children}</Element>;
}
