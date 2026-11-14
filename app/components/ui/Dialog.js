"use client";

import { useEffect, useId, useRef } from "react";

/**
 * Native modal dialog with browser-managed focus containment and restoration.
 * The parent controls visibility through the open prop and should set it false in onClose.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  closeOnEscape = true,
  closeOnBackdrop = false,
  closeLabel = "Close dialog",
  initialFocusRef,
  className = "",
  ...props
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      initialFocusRef?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocusRef]);

  function handleCancel(event) {
    if (!closeOnEscape) event.preventDefault();
  }

  function handleClose() {
    onClose?.();
  }

  function handleBackdropClick(event) {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      dialogRef.current?.close();
    }
  }

  return (
    <dialog
      {...props}
      ref={dialogRef}
      className={["ui-dialog", className].filter(Boolean).join(" ")}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      aria-label={!title ? closeLabel : undefined}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleBackdropClick}
    >
      <div className="ui-dialog-content">
        <div className="ui-dialog-header">
          <div>
            {title ? <h2 className="ui-dialog-title" id={titleId}>{title}</h2> : null}
            {description ? <p className="ui-dialog-description" id={descriptionId}>{description}</p> : null}
          </div>
          <button className="ui-icon-button ui-dialog-close" type="button" aria-label={closeLabel} onClick={() => dialogRef.current?.close()}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="ui-dialog-body">{children}</div>
        {actions ? <div className="ui-dialog-actions">{actions}</div> : null}
      </div>
    </dialog>
  );
}
