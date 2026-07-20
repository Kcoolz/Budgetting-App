import { useEffect } from "react";
import { X } from "lucide-react";

export default function ModalShell({ open, onClose, eyebrow, title, children, width = "max-w-xl" }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-forest-950/55 p-3 backdrop-blur-[3px]"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      role="presentation"
    >
      <section className={`premium-card my-auto max-h-[calc(100vh-24px)] w-full overflow-y-auto rounded-3xl bg-white shadow-2xl ${width}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="flex items-start justify-between gap-6 px-5 pb-0 pt-6 sm:px-7 sm:pt-7">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="modal-title" className="mt-1 text-xl font-semibold tracking-[-0.025em]">{title}</h2>
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
