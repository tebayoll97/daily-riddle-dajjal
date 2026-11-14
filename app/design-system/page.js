import { Alert, Badge, Button, Card, TextField } from "../components/ui";
import ThemeToggle from "../components/ThemeToggle";
import { DialogPreview } from "../components/ui/DialogPreview";
import { ControlsPreview } from "../components/ui/ControlsPreview";
import { DataDisplayPreview } from "../components/ui/DataDisplayPreview";

export const metadata = {
  title: "Design System Preview | Dajjal Family",
  description: "Internal preview of Dajjal Family design tokens and shared UI primitives.",
  robots: { index: false, follow: false },
};

export default function DesignSystemPreviewPage() {
  return (
    <main className="ui-page" style={{ paddingBlock: "var(--df-space-8)" }}>
      <header className="ui-page-header ui-stack">
        <div className="ui-cluster" style={{ justifyContent: "space-between" }}>
          <Badge variant="info">Internal preview · v1.0 draft</Badge>
          <ThemeToggle />
        </div>
        <p className="ui-eyebrow">DAJJAL FAMILY / FOUNDATION</p>
        <h1 className="ui-heading-h1">Design System Preview</h1>
        <p className="ui-subtitle">
          A controlled showcase for reviewing typography, layout, semantic colors, and reusable UI components in both themes.
        </p>
      </header>

      <section className="ui-stack" aria-labelledby="type-heading">
        <div>
          <p className="ui-eyebrow">01 / TYPOGRAPHY</p>
          <h2 className="ui-heading-h2" id="type-heading">Clear hierarchy, comfortable reading</h2>
        </div>
        <Card className="ui-stack" style={{ padding: "var(--df-space-5)" }}>
          <h1 className="ui-heading-h1">Page heading H1</h1>
          <h2 className="ui-heading-h2">Section heading H2</h2>
          <h3 className="ui-heading-h3">Subsection heading H3</h3>
          <h4 className="ui-heading-h4">Component heading H4</h4>
          <p className="ui-prose">Body copy is designed for sustained reading. The reading measure is intentionally limited so long paragraphs remain comfortable on desktop and mobile screens.</p>
          <p className="ui-caption">Caption · supporting metadata · 14px</p>
          <p className="ui-gradient-text" style={{ fontWeight: 800 }}>One Family. Many Possibilities.</p>
        </Card>
      </section>

      <section className="ui-stack" aria-labelledby="buttons-heading">
        <div>
          <p className="ui-eyebrow">02 / ACTIONS</p>
          <h2 className="ui-heading-h2" id="buttons-heading">Buttons and interaction states</h2>
        </div>
        <Card className="ui-cluster" style={{ padding: "var(--df-space-5)" }}>
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Card>
      </section>

      <section className="ui-stack" aria-labelledby="feedback-heading">
        <div>
          <p className="ui-eyebrow">03 / FEEDBACK</p>
          <h2 className="ui-heading-h2" id="feedback-heading">Status and messages</h2>
        </div>
        <Card className="ui-stack" style={{ padding: "var(--df-space-5)" }}>
          <div className="ui-cluster">
            <Badge>Neutral</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
          </div>
          <Alert variant="info" title="Information">This is an informational message.</Alert>
          <Alert variant="success" title="Saved">Your changes have been saved.</Alert>
          <Alert variant="warning" title="Attention">Review this detail before continuing.</Alert>
          <Alert variant="danger" title="Action required">An example error message with a recovery hint.</Alert>
        </Card>
      </section>

      <section className="ui-stack" aria-labelledby="form-heading">
        <div>
          <p className="ui-eyebrow">04 / FORMS</p>
          <h2 className="ui-heading-h2" id="form-heading">Labeled fields and validation</h2>
        </div>
        <Card className="ui-stack" style={{ padding: "var(--df-space-5)", maxWidth: "42rem" }}>
          <TextField label="Display name" name="displayName" placeholder="Enter a display name" helpText="This is helper text for the field." />
          <TextField label="Email address" name="email" type="email" placeholder="you@example.com" required />
          <TextField as="textarea" label="Short description" name="description" placeholder="Write a short description..." />
          <TextField label="Example invalid field" name="invalid" defaultValue="not-an-email" error="Please enter a valid email address." />
          <div className="ui-cluster">
            <Button type="button">Example submit</Button>
            <Button variant="secondary" type="reset">Reset</Button>
          </div>
        </Card>
      </section>

      <section className="ui-stack" aria-labelledby="dialog-heading">
        <div>
          <p className="ui-eyebrow">05 / DIALOG</p>
          <h2 className="ui-heading-h2" id="dialog-heading">Accessible modal interaction</h2>
          <p className="ui-subtitle">Open the dialog, navigate with Tab, and test Escape and focus return.</p>
        </div>
        <Card className="ui-stack" style={{ padding: "var(--df-space-5)" }}>
          <DialogPreview />
        </Card>
      </section>

      <section className="ui-stack" aria-labelledby="controls-heading">
        <div>
          <p className="ui-eyebrow">06 / NAVIGATION & CONTROLS</p>
          <h2 className="ui-heading-h2" id="controls-heading">Reusable navigation and choice controls</h2>
          <p className="ui-subtitle">Try the tabs, dropdown, checkbox, radio group, and switch using keyboard or touch.</p>
        </div>
        <Card className="ui-stack" style={{ padding: "var(--df-space-5)" }}>
          <ControlsPreview />
        </Card>
      </section>

      <section className="ui-stack" aria-labelledby="layout-heading">
        <div>
          <p className="ui-eyebrow">07 / RESPONSIVE LAYOUT</p>
          <h2 className="ui-heading-h2" id="layout-heading">Grid behavior</h2>
          <p className="ui-subtitle">Resize the viewport to review the two-, three-, and four-column grid collapse rules.</p>
        </div>
        <div className="ui-grid-3">
          {["Gaming", "Knowledge", "Community"].map((item) => (
            <Card key={item} className="ui-stack" style={{ padding: "var(--df-space-4)" }}>
              <Badge variant="info">Category</Badge>
              <h3 className="ui-heading-h3">{item}</h3>
              <p className="ui-caption">Reusable card surface and spacing.</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="ui-stack" aria-labelledby="data-heading">
        <div>
          <p className="ui-eyebrow">08 / DATA DISPLAY</p>
          <h2 className="ui-heading-h2" id="data-heading">Loading, empty, error and structured data</h2>
          <p className="ui-subtitle">Shared patterns for data-heavy pages, tables and user identity.</p>
        </div>
        <Card className="ui-stack" style={{ padding: "var(--df-space-5)" }}>
          <DataDisplayPreview />
          <p className="ui-eyebrow">SKELETON</p>
          <p className="ui-eyebrow">EMPTY & ERROR</p>
          <p className="ui-eyebrow">AVATARS</p>
          <p className="ui-eyebrow">TABLE & PAGINATION</p>
        </Card>
      </section>

      <footer className="ui-caption" style={{ paddingBlock: "var(--df-space-4)" }}>
        Internal QA route · noindex · not a production approval.
      </footer>
    </main>
  );
}
