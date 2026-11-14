"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

export function DialogPreview() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open accessible dialog</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Review this action"
        description="This preview demonstrates a native modal with keyboard focus management."
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p className="ui-prose">Press Escape to close this dialog. Keyboard focus remains within the modal while it is open and returns to the trigger when it closes.</p>
      </Dialog>
    </>
  );
}
