import { useId } from "react";

export function RadioGroup({ label, name, options = [], value, onChange, direction = "column", disabled = false, className = "" }) {
  const groupId = useId();
  return (
    <fieldset className={["ui-choice-fieldset", className].filter(Boolean).join(" ")} disabled={disabled}>
      {label ? <legend className="ui-field-label">{label}</legend> : null}
      <div className={["ui-choice-group", direction === "row" ? "ui-choice-group-row" : ""].join(" ")}>
        {options.map((option, index) => {
          const id = `${groupId}-${index}`;
          return (
            <label className="ui-choice-label" htmlFor={id} key={option.value}>
              <input id={id} className="ui-radio" type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange?.(option.value)} disabled={option.disabled} />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
