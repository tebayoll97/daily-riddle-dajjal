import { useId } from "react";

/** Labeled input primitive. Validation remains the responsibility of the consuming form. */
export function TextField({
  label,
  helpText,
  error,
  id,
  className = "",
  inputClassName = "",
  as: Element = "input",
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [helpId, errorId, props["aria-describedby"]].filter(Boolean).join(" ") || undefined;

  return (
    <div className={["ui-field", className].filter(Boolean).join(" ")}>
      {label ? <label className="ui-field-label" htmlFor={fieldId}>{label}{props.required ? <span aria-hidden="true"> *</span> : null}</label> : null}
      <Element
        {...props}
        id={fieldId}
        className={[`ui-${Element === "textarea" ? "textarea" : Element === "select" ? "select" : "input"}`, inputClassName].filter(Boolean).join(" ")}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-errormessage={error ? errorId : props["aria-errormessage"]}
        aria-describedby={describedBy}
      />
      {helpText ? <div className="ui-field-help" id={helpId}>{helpText}</div> : null}
      {error ? <div className="ui-field-error" id={errorId}>{error}</div> : null}
    </div>
  );
}
