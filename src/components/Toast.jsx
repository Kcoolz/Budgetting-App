export default function Toast({ message }) {
  return (
    <div
      className={`fixed bottom-20 right-4 z-[60] rounded-xl bg-forest-900 px-4 py-3 text-xs font-semibold text-white shadow-xl transition-all duration-200 sm:bottom-6 sm:right-6 ${message ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
