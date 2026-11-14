export function EmptyState({ title = "Nothing here yet", description, action, icon = "—", className = "" }) {
  return (
    <div className={["ui-empty-state", className].filter(Boolean).join(" ")} role="status">
      <span className="ui-empty-state-icon" aria-hidden="true">{icon}</span>
      <h3 className="ui-empty-state-title">{title}</h3>
      {description ? <p className="ui-empty-state-description">{description}</p> : null}
      {action ? <div className="ui-empty-state-action">{action}</div> : null}
    </div>
  );
}
