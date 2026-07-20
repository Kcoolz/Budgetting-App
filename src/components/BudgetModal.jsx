import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { EXPENSE_CATEGORIES } from "../lib/budget";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

const currencies = [
  ["CAD", "Canadian dollar"],
  ["USD", "US dollar"],
  ["EUR", "Euro"],
  ["GBP", "British pound"],
  ["AUD", "Australian dollar"]
];

function currencySymbol(currency) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency })
    .formatToParts(0)
    .find(({ type }) => type === "currency")?.value ?? "$";
}

export default function BudgetModal({ open, onClose, state, selectedMonth, onSave, onExport, onImport, categories = EXPENSE_CATEGORIES, profileType = "personal" }) {
  const business = profileType === "business";
  const [currency, setCurrency] = useState(state.currency);
  const [budgets, setBudgets] = useState(state.budgets);
  const [rolloverEnabled, setRolloverEnabled] = useState(state.rollover?.enabled ?? false);
  const fileInput = useRef(null);

  useEffect(() => {
    if (!open) return;
    setCurrency(state.currency);
    setBudgets({ ...state.budgets });
    setRolloverEnabled(state.rollover?.enabled ?? false);
  }, [open, state.currency, state.budgets, state.rollover?.enabled]);

  const submit = (event) => {
    event.preventDefault();
    onSave({
      currency,
      budgets,
      rolloverEnabled,
      rolloverStartMonth: rolloverEnabled ? state.rollover?.startMonth ?? selectedMonth : null
    });
  };

  const handleImport = async (event) => {
    const [file] = event.target.files;
    event.target.value = "";
    if (file) await onImport(file);
  };

  return (
    <ModalShell open={open} onClose={onClose} eyebrow={business ? "Operating limits" : "Monthly plan"} title={business ? "Manage operating plan" : "Manage budget"} width="max-w-2xl">
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <label className="grid gap-2 text-xs font-semibold text-slate-600">
          Currency
          <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="min-h-11 rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10">
            {currencies.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}
          </select>
        </label>

        <div className="mb-2 mt-6 flex justify-between text-xs">
          <strong>{business ? "Operating limits" : "Category limits"}</strong>
          <span className="text-slate-400">per month</span>
        </div>
        <div className="grid gap-x-5 sm:grid-cols-2">
          {categories.map((category) => (
            <label key={category.id} className="grid min-h-14 grid-cols-[auto_1fr_100px] items-center gap-2 border-b border-black/5 text-xs font-semibold">
              <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: category.color }} />
              <span>{category.name}</span>
              <span className="flex items-center rounded-lg border border-black/8 bg-white focus-within:border-forest-700/30">
                <span className="pl-2 text-slate-400">{currencySymbol(currency)}</span>
                <input
                  value={budgets[category.id] || ""}
                  onChange={(event) => setBudgets((current) => ({ ...current, [category.id]: Number(event.target.value) }))}
                  className="h-9 min-w-0 flex-1 border-0 bg-transparent px-2 text-right outline-none"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="0"
                />
              </span>
            </label>
          ))}
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-black/5 bg-slate-50/70 p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700"><RotateCcw className="size-4" /></span>
          <span className="flex-1">
            <strong className="block text-xs">Roll over unused balance to next month</strong>
            <span className="mt-1 block text-[10px] font-normal leading-relaxed text-slate-400">Unused funds and overspending carry forward by category. Rollover begins in {state.rollover?.startMonth ?? selectedMonth}.</span>
          </span>
          <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${rolloverEnabled ? "bg-forest-800" : "bg-slate-300"}`}>
            <input type="checkbox" checked={rolloverEnabled} onChange={(event) => setRolloverEnabled(event.target.checked)} className="sr-only" />
            <span className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${rolloverEnabled ? "translate-x-6" : "translate-x-1"}`} />
          </span>
        </label>

        <div className="mt-6 flex flex-col gap-4 rounded-xl bg-cream-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong className="text-xs">Keep a portable backup</strong>
            <p className="mt-1 text-[11px] text-slate-500">Export or restore your transactions and settings.</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileInput} className="sr-only" type="file" accept="application/json,.json" onChange={handleImport} />
            <Button type="button" onClick={() => fileInput.current?.click()} className="min-h-9 px-3 text-xs"><Upload className="size-3.5" /> Import</Button>
            <Button type="button" onClick={onExport} className="min-h-9 px-3 text-xs"><Download className="size-3.5" /> Export</Button>
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{business ? "Save operating plan" : "Save budget"}</Button>
        </div>
      </form>
    </ModalShell>
  );
}
