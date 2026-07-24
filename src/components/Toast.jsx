export default function Toast({ message, actionLabel, onAction }) {
  return (
    <div
      className={`fixed bottom-20 right-4 z-[60] flex max-w-sm items-center gap-4 rounded-xl bg-forest-900 px-4 py-3 text-xs font-semibold text-white shadow-xl transition-all duration-200 sm:bottom-6 sm:right-6 ${message ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"}`}
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      {actionLabel && onAction && <button type="button" onClick={onAction} className="rounded-lg bg-white/12 px-2.5 py-1.5 font-bold text-emerald-100 hover:bg-white/20">{actionLabel}</button>}
    </div>
  );
}
