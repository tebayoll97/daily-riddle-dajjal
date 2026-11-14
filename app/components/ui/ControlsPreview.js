"use client";

import { useState } from "react";
import { CheckboxField } from "./CheckboxField";
import { RadioGroup } from "./RadioGroup";
import { SwitchField } from "./SwitchField";
import { Tabs } from "./Tabs";
import { DropdownMenu } from "./DropdownMenu";
import { Breadcrumbs } from "./Breadcrumbs";

export function ControlsPreview() {
  const [checked, setChecked] = useState(true);
  const [choice, setChoice] = useState("dark");
  const [enabled, setEnabled] = useState(false);
  const [tab, setTab] = useState("overview");

  return (
    <div className="ui-stack">
      <div className="ui-stack-sm">
        <p className="ui-eyebrow">BREADCRUMBS</p>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Foundation", href: "/design-system" }, { label: "Controls" }]} />
      </div>
      <div className="ui-stack-sm">
        <p className="ui-eyebrow">DROPDOWN</p>
        <DropdownMenu label="More actions">
          <button type="button" className="ui-dropdown-item">View details</button>
          <button type="button" className="ui-dropdown-item">Copy link</button>
        </DropdownMenu>
      </div>
      <div className="ui-stack-sm">
        <p className="ui-eyebrow">TABS</p>
        <Tabs value={tab} onChange={setTab} tabs={[
          { value: "overview", label: "Overview", content: <p className="ui-prose">Overview panel content.</p> },
          { value: "details", label: "Details", content: <p className="ui-prose">Details panel content.</p> },
          { value: "activity", label: "Activity", content: <p className="ui-prose">Recent activity panel.</p> }
        ]} />
      </div>
      <div className="ui-grid-2">
        <CheckboxField label="Accept terms" checked={checked} onChange={(event) => setChecked(event.target.checked)} helpText="Example controlled checkbox." />
        <RadioGroup label="Appearance preference" name="appearance-demo" value={choice} onChange={setChoice} options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
      </div>
      <SwitchField label="Enable notifications" description="Toggle this example setting." checked={enabled} onChange={setEnabled} />
    </div>
  );
}
