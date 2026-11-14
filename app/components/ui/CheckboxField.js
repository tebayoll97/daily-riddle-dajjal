import { useId } from "react";

export function CheckboxField({ label, helpText, id, className = "", ...props }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  return (
    <div className={["ui-choice-field", className].filter(Boolean).join(" ")}>
      <label className="ui-choice-label" htmlFor={fieldId}>
        <input {...props} id={fieldId} type="checkbox" className="ui-checkbox" aria-describedby={[helpId, props["aria-describedby"]].filter(Boolean).join(" ") || undefined} />
        <span>{label}</span>
      </label>
      {helpText ? <p className="ui-field-help" id={helpId}>{helpText}</p> : null}
    </div>
  );
}
