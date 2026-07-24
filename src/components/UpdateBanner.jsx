import { RefreshCw } from "lucide-react";

export default function UpdateBanner({ registration, onDismiss }) {
  if (!registration) return null;
  const refresh = () => {
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    if (!registration.waiting) window.location.reload();
  };
  return (
    <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950 sm:flex-row sm:items-center" role="status">
      <div className="flex-1"><strong className="block text-xs">A new version of Cloud is ready</strong><p className="mt-1 text-[11px] text-blue-800/70">Refresh once to use the latest features. Your local budget data will stay in place.</p></div>
      <div className="flex gap-2"><button type="button" onClick={onDismiss} className="min-h-9 rounded-xl px-3 text-xs font-bold text-blue-700">Later</button><button type="button" onClick={refresh} className="interactive-button flex min-h-9 items-center gap-2 rounded-xl bg-blue-800 px-3 text-xs font-bold text-white hover:bg-blue-900"><RefreshCw className="size-3.5" /> Refresh now</button></div>
    </section>
  );
}
