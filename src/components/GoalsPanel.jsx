import { CalendarCheck2, LockKeyhole, Pencil, Plus, ShieldAlert, Target, Trash2 } from "lucide-react";
import { formatMoney, sum } from "../lib/budget";
import Button from "./ui/Button";
import Card from "./ui/Card";

function dateLabel(value) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export default function GoalsPanel({ goals, currency, onAdd, onAssign, onEdit, onDelete, profileType = "personal" }) {
  const assignedThisMonth = sum(goals.map((goal) => goal.assignedThisMonth));
  const business = profileType === "business";

  return (
    <Card id="goals" className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{business ? "Capital reserves" : "Savings goals"}</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">{business ? "Capital with a job" : "Money with a purpose"}</h2>
          <p className="mt-1 text-xs text-slate-500">{business ? "Allocated funds stay separate from available operating cash." : "Assigned funds are held back from your safe-to-spend amount."}</p>
        </div>
        <Button onClick={onAdd} className="px-3"><Plus className="size-4" /><span className="hidden sm:inline">{business ? "New reserve" : "New goal"}</span></Button>
      </div>

      {goals.length ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <article key={goal.id} className="group rounded-2xl border border-black/5 bg-slate-50/60 p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-800"><Target className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">{goal.name}</strong>
                  <p className="mt-0.5 text-[10px] text-slate-400">{formatMoney(goal.saved, currency)} of {formatMoney(goal.target, currency)}</p>
                </div>
                <div className="flex gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <button onClick={() => onEdit(goal)} className="interactive-button grid size-7 place-items-center rounded-lg text-slate-400 hover:-translate-y-px hover:bg-forest-50 hover:text-forest-800" aria-label={`Edit ${goal.name}`}><Pencil className="size-3.5" /></button>
                  <button onClick={() => onDelete(goal)} className="interactive-button grid size-7 place-items-center rounded-lg text-slate-300 hover:-translate-y-px hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${goal.name}`}><Trash2 className="size-3.5" /></button>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={`${goal.name} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(Math.min(goal.percent, 100))}>
                <span className="block h-full rounded-full bg-forest-700 transition-all duration-500" style={{ width: `${Math.min(goal.percent, 100)}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="font-bold text-forest-700">{Math.round(goal.percent)}% funded</span>
                <span className="text-slate-400">{formatMoney(goal.remaining, currency)} to go</span>
              </div>
              {(goal.targetDate || goal.deadline) && (
                <div className="mt-4 grid gap-2 border-t border-black/5 pt-3">
                  {goal.targetDate && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <CalendarCheck2 className="size-3.5 shrink-0 text-forest-700" />
                      <span className="min-w-0 flex-1 truncate"><strong>Plan:</strong> {dateLabel(goal.targetDate)}</span>
                      {goal.targetMonthly !== null && <strong className="shrink-0 text-forest-800">{formatMoney(goal.targetMonthly, currency)}/mo</strong>}
                    </div>
                  )}
                  {goal.deadline && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <ShieldAlert className="size-3.5 shrink-0 text-rose-500" />
                      <span className="min-w-0 flex-1 truncate"><strong>Must:</strong> {dateLabel(goal.deadline)}</span>
                      {goal.deadlineMonthly !== null && <strong className="shrink-0 text-rose-700">{formatMoney(goal.deadlineMonthly, currency)}/mo</strong>}
                    </div>
                  )}
                  {["plan-overdue", "deadline-overdue", "date-conflict"].includes(goal.dateStatus) && (
                    <button onClick={() => onEdit(goal)} className="interactive-button rounded-lg bg-rose-50 px-2.5 py-2 text-left text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                      {goal.dateStatus === "deadline-overdue" ? "The must-have date has passed." : goal.dateStatus === "date-conflict" ? "The planned date is after the hard deadline." : "The planned finish date has passed."} Update dates →
                    </button>
                  )}
                </div>
              )}
              <button onClick={() => onAssign(goal)} className="interactive-button mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-forest-700/15 bg-white py-2 text-[11px] font-bold text-forest-700 hover:-translate-y-px hover:bg-forest-50">
                <LockKeyhole className="size-3.5" /> Assign funds
              </button>
            </article>
          ))}
        </div>
      ) : (
        <button onClick={onAdd} className="interactive-button mt-6 grid min-h-36 w-full place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center hover:-translate-y-px hover:border-forest-700/25 hover:bg-forest-50/40">
          <span><span className="mx-auto grid size-10 place-items-center rounded-full bg-forest-50 text-forest-700"><Target className="size-4" /></span><strong className="mt-3 block text-xs">{business ? "Create your first reserve" : "Create your first savings goal"}</strong><span className="mt-1 block text-[11px] font-normal text-slate-400">{business ? "Tax, equipment, payroll, and contingency funds belong here." : "Emergency funds, trips, and big purchases all belong here."}</span></span>
        </button>
      )}

      {assignedThisMonth > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-forest-50 px-3 py-2.5 text-[11px] text-forest-800">
          <LockKeyhole className="size-3.5" /> <strong>{formatMoney(assignedThisMonth, currency)}</strong> {business ? "allocated to reserves" : "reserved for goals"} this month.
        </div>
      )}
    </Card>
  );
}
