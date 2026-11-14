import { useId } from "react";

export function SwitchField({ label, description, checked, onChange, disabled = false, id, className = "", name }) {
  const generatedId = useId();
  const switchId = id || generatedId;
  const descriptionId = description ? `${switchId}-description` : undefined;
  return (
    <div className={["ui-switch-field", className].filter(Boolean).join(" ")}>
      <div className="ui-switch-copy">
        <label htmlFor={switchId} className="ui-choice-title">{label}</label>
        {description ? <p className="ui-field-help" id={descriptionId}>{description}</p> : null}
      </div>
      <button id={switchId} type="button" role="switch" aria-checked={checked} aria-describedby={descriptionId} name={name} className="ui-switch" disabled={disabled} onClick={() => onChange?.(!checked)}>
        <span className="ui-switch-thumb" aria-hidden="true" />
      </button>
    </div>
  );
}
