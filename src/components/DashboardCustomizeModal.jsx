import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw } from "lucide-react";
import { DASHBOARD_SECTIONS, createDefaultDashboard, normalizeDashboard } from "../lib/budget";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function DashboardCustomizeModal({ open, onClose, layout, onSave }) {
  const [draft, setDraft] = useState(() => normalizeDashboard(layout));

  useEffect(() => {
    if (open) setDraft(normalizeDashboard(layout));
  }, [open, layout]);

  const moveSection = (id, direction) => {
    setDraft((current) => {
      const order = [...current.order];
      const index = order.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return current;
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      return { ...current, order };
    });
  };

  const toggleSection = (id) => {
    setDraft((current) => ({
      ...current,
      hidden: current.hidden.includes(id)
        ? current.hidden.filter((sectionId) => sectionId !== id)
        : [...current.hidden, id]
    }));
  };

  const visibleCount = draft.order.length - draft.hidden.length;

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Your workspace" title="Customize dashboard" width="max-w-2xl">
      <div className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <div className="flex flex-col gap-3 rounded-2xl bg-forest-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong className="text-sm">Choose what appears on Overview</strong>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">Hidden sections keep their data and remain available on their dedicated pages.</p>
          </div>
          <span className="w-fit shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-forest-800 shadow-sm">
            {visibleCount} of {draft.order.length} visible
          </span>
        </div>

        <div className="mt-5 grid gap-2" role="list" aria-label="Dashboard sections">
          {draft.order.map((id, index) => {
            const section = DASHBOARD_SECTIONS.find((item) => item.id === id);
            const hidden = draft.hidden.includes(id);
            if (!section) return null;

            return (
              <article key={id} className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${hidden ? "border-black/5 bg-slate-50/70" : "border-forest-700/15 bg-white"}`} role="listitem">
                <button
                  type="button"
                  onClick={() => toggleSection(id)}
                  className={`interactive-button grid size-10 shrink-0 place-items-center rounded-xl ${hidden ? "bg-slate-200 text-slate-500 hover:bg-slate-300" : "bg-forest-100 text-forest-800 hover:bg-blue-200"}`}
                  aria-label={`${hidden ? "Show" : "Hide"} ${section.name}`}
                  aria-pressed={!hidden}
                >
                  {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>

                <button type="button" onClick={() => toggleSection(id)} className="min-w-0 flex-1 text-left">
                  <strong className={`block text-sm ${hidden ? "text-slate-500" : "text-ink-900"}`}>{section.name}</strong>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-400">{section.description}</span>
                </button>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(id, -1)}
                    disabled={index === 0}
                    className="interactive-button grid size-9 place-items-center rounded-xl border border-black/5 bg-white text-slate-500 hover:bg-forest-50 hover:text-forest-800 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:bg-white"
                    aria-label={`Move ${section.name} up`}
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(id, 1)}
                    disabled={index === draft.order.length - 1}
                    className="interactive-button grid size-9 place-items-center rounded-xl border border-black/5 bg-white text-slate-500 hover:bg-forest-50 hover:text-forest-800 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:bg-white"
                    aria-label={`Move ${section.name} down`}
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-7 flex flex-col-reverse gap-2 border-t border-black/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => setDraft(createDefaultDashboard())}>
            <RotateCcw className="size-4" /> Reset layout
          </Button>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="button" variant="primary" onClick={() => onSave(draft)}>Save layout</Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
