"use client";

import { useId, useRef } from "react";

export function Tabs({ tabs = [], value, onChange, ariaLabel = "Content tabs", className = "" }) {
  const id = useId();
  const refs = useRef([]);
  const selectedIndex = Math.max(0, tabs.findIndex((tab) => tab.value === value));
  function handleKeyDown(event, index) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    refs.current[next]?.focus();
    if (!tabs[next]?.disabled) onChange?.(tabs[next].value);
  }
  const active = tabs[selectedIndex];
  return (
    <div className={["ui-tabs", className].filter(Boolean).join(" ")}>
      <div className="ui-tab-list" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab, index) => (
          <button
            key={tab.value}
            ref={(node) => { refs.current[index] = node; }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={tab.value === value}
            aria-controls={`${id}-panel`}
            tabIndex={tab.value === value ? 0 : -1}
            disabled={tab.disabled}
            className="ui-tab"
            onClick={() => onChange?.(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >{tab.label}</button>
        ))}
      </div>
      <div className="ui-tab-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${selectedIndex}`} tabIndex={0}>
        {active?.content}
      </div>
    </div>
  );
}
