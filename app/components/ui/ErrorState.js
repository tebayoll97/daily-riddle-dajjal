export function ErrorState({ title = "Something went wrong", description = "Please try again.", onRetry, retryLabel = "Try again", className = "" }) {
  return (
    <div className={["ui-error-state", className].filter(Boolean).join(" ")} role="alert">
      <span className="ui-error-state-icon" aria-hidden="true">!</span>
      <h3 className="ui-error-state-title">{title}</h3>
      <p className="ui-error-state-description">{description}</p>
      {onRetry ? <button type="button" className="ui-button ui-button-secondary ui-button-sm" onClick={onRetry}>{retryLabel}</button> : null}
    </div>
  );
}
