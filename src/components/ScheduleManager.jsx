import { ArrowDownLeft, ArrowUpRight, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { categoryName, formatMoney, monthlyRecurringAmount, sum } from "../lib/budget";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function ScheduleManager({ bills, currency, categories = [], onAdd, onEdit, onToggle, onDelete, profileType = "personal" }) {
  const activeBills = bills.filter((bill) => bill.active !== false);
  const monthlyOutgoing = sum(activeBills.filter((bill) => bill.type !== "income").map(monthlyRecurringAmount));
  const monthlyIncoming = sum(activeBills.filter((bill) => bill.type === "income").map(monthlyRecurringAmount));
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="eyebrow">Schedules</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Manage recurring payments</h2><p className="mt-1 text-xs text-slate-500">{formatMoney(monthlyIncoming, currency)} expected income and {formatMoney(monthlyOutgoing, currency)} outgoing per month across {activeBills.length} active {activeBills.length === 1 ? "schedule" : "schedules"}.</p></div>
        <Button onClick={onAdd}><Plus className="size-4" /> Add schedule</Button>
      </div>
      {bills.length ? (
        <div className="mt-6 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {bills.map((bill) => {
            const income = bill.type === "income";
            const paused = bill.active === false;
            return (
            <article key={bill.id} className={`group flex items-center gap-3 rounded-2xl border border-black/5 p-3.5 ${paused ? "bg-slate-100/60 opacity-70" : "bg-slate-50/60"}`}>
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${income ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{income ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}</span>
              <div className="min-w-0 flex-1"><strong className="block truncate text-xs">{bill.description}</strong><span className="mt-0.5 block text-[10px] capitalize text-slate-400">{paused ? "Paused · " : ""}{bill.frequency === "biweekly" ? "Every two weeks" : bill.frequency} · {income ? categoryName(bill.category, "income", profileType) : categories.find(({ id }) => id === bill.category)?.name ?? categoryName(bill.category, "expense", profileType)} · starts {bill.startDate}{bill.endDate ? ` · ends ${bill.endDate}` : ""}</span></div>
              <strong className="text-xs">{formatMoney(bill.amount, currency)}</strong>
              <div className="flex sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <button onClick={() => onEdit(bill)} className="interactive-button grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-ink-900" aria-label={`Edit ${bill.description}`}><Pencil className="size-3.5" /></button>
                <button onClick={() => onToggle(bill)} className="interactive-button grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-ink-900" aria-label={`${paused ? "Resume" : "Pause"} ${bill.description}`}>{paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}</button>
                <button onClick={() => onDelete(bill)} className="interactive-button grid size-8 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${bill.description}`}><Trash2 className="size-3.5" /></button>
              </div>
            </article>
          );})}
        </div>
      ) : (
        <button onClick={onAdd} className="interactive-button mt-6 grid min-h-28 w-full place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center hover:border-forest-700/25 hover:bg-forest-50"><span><strong className="block text-xs">No recurring payments yet</strong><span className="mt-1 block text-[11px] font-normal text-slate-400">Add paydays, rent, utilities, subscriptions, or other repeating activity.</span></span></button>
      )}
    </Card>
  );
}
