import { Plus, Repeat2, Trash2 } from "lucide-react";
import { categoryName, formatMoney, monthlyRecurringAmount, sum } from "../lib/budget";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function ScheduleManager({ bills, currency, onAdd, onDelete, profileType = "personal" }) {
  const activeBills = bills.filter((bill) => bill.active !== false);
  const monthlyEstimate = sum(activeBills.map(monthlyRecurringAmount));
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="eyebrow">Schedules</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Manage recurring bills</h2><p className="mt-1 text-xs text-slate-500">About {formatMoney(monthlyEstimate, currency)} per month across {activeBills.length} active {activeBills.length === 1 ? "schedule" : "schedules"}.</p></div>
        <Button onClick={onAdd}><Plus className="size-4" /> Add bill</Button>
      </div>
      {activeBills.length ? (
        <div className="mt-6 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {activeBills.map((bill) => (
            <article key={bill.id} className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-slate-50/60 p-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-800"><Repeat2 className="size-4" /></span>
              <div className="min-w-0 flex-1"><strong className="block truncate text-xs">{bill.description}</strong><span className="mt-0.5 block text-[10px] capitalize text-slate-400">{bill.frequency} · {categoryName(bill.category, "expense", profileType)} · starts {bill.startDate}</span></div>
              <strong className="text-xs">{formatMoney(bill.amount, currency)}</strong>
              <button onClick={() => onDelete(bill)} className="interactive-button grid size-8 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" aria-label={`Delete ${bill.description}`}><Trash2 className="size-3.5" /></button>
            </article>
          ))}
        </div>
      ) : (
        <button onClick={onAdd} className="interactive-button mt-6 grid min-h-28 w-full place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center hover:border-forest-700/25 hover:bg-forest-50"><span><strong className="block text-xs">No recurring bills yet</strong><span className="mt-1 block text-[11px] font-normal text-slate-400">Add rent, utilities, subscriptions, or other repeating costs.</span></span></button>
      )}
    </Card>
  );
}
