import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export default function ModalShell({ open, onClose, eyebrow, title, children, width = "max-w-xl" }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusDialog = requestAnimationFrame(() => {
      const preferred = dialogRef.current?.querySelector("[autofocus]") ?? dialogRef.current?.querySelector(focusableSelector);
      (preferred ?? dialogRef.current)?.focus();
    });
    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll(focusableSelector) ?? [])];
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(focusDialog);
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-forest-950/55 p-3 backdrop-blur-[3px]"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      role="presentation"
    >
      <section ref={dialogRef} tabIndex="-1" className={`premium-card my-auto max-h-[calc(100vh-24px)] w-full overflow-y-auto rounded-3xl bg-white shadow-2xl ${width}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="flex items-start justify-between gap-6 px-5 pb-0 pt-6 sm:px-7 sm:pt-7">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id={titleId} className="mt-1 text-xl font-semibold tracking-[-0.025em]">{title}</h2>
          </div>
          <button onClick={onClose} className="interactive-button grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:-translate-y-px hover:bg-slate-200 hover:text-ink-900" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
