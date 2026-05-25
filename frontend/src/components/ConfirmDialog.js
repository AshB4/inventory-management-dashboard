import { useEffect, useRef } from "react";
import atlasLogo from "../assets/HexAtlasIcon.png";

function ConfirmDialog({
  confirmLabel = "Confirm",
  isOpen,
  message,
  onCancel,
  onConfirm,
  title,
}) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previouslyFocusedElementRef.current = document.activeElement;
    const focusTimer = window.setTimeout(() => cancelButtonRef.current?.focus(), 0);

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);
      if (focusableElements.length === 0) {
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElementRef.current?.focus?.();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <section
        aria-describedby="confirm-dialog-description"
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="modal-panel"
        ref={dialogRef}
        role="dialog"
      >
        <div className="confirm-dialog">
          <img alt="" aria-hidden="true" className="confirm-dialog__logo" src={atlasLogo} />
          <div className="confirm-dialog__content">
            <h3 className="panel-title" id="confirm-dialog-title">
              {title}
            </h3>
            <p className="modal-description" id="confirm-dialog-description">
              {message}
            </p>
          </div>
        </div>
        <div className="modal-actions">
          <button
            className="ui-button ui-button--ghost"
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            Cancel
          </button>
          <button className="ui-button ui-button--danger" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("aria-hidden"));
}

export default ConfirmDialog;
