import { CalendarClock, Plus, Repeat2, Trash2 } from "lucide-react";
import { categoryName, formatMoney, localDate, sum } from "../lib/budget";
import Button from "./ui/Button";
import Card from "./ui/Card";

function calendarDays(count = 14) {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return date;
  });
}

export default function RecurringPanel({ bills, upcoming, currency, onAdd, onDelete }) {
  const days = calendarDays();
  const dueByDate = upcoming.reduce((result, occurrence) => {
    result[occurrence.dueDate] = (result[occurrence.dueDate] ?? 0) + 1;
    return result;
  }, {});
  const upcomingTotal = sum(upcoming.map(({ amount }) => amount));

  return (
    <Card id="recurring" className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Recurring</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Bills calendar</h2>
          <p className="mt-1 text-xs text-slate-500">Your next 14 days of scheduled obligations.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-forest-50 px-3 py-2 text-right">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Upcoming obligations</span>
            <strong className="mt-0.5 block text-sm text-forest-900">{formatMoney(upcomingTotal, currency)}</strong>
          </div>
          <Button onClick={onAdd} className="px-3"><Plus className="size-4" /><span className="hidden sm:inline">Add bill</span></Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.8fr)]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <CalendarClock className="size-3.5" /> Next two weeks
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((date, index) => {
              const key = localDate(date);
              const count = dueByDate[key] ?? 0;
              return (
                <div key={key} className={`grid min-w-12 place-items-center rounded-xl border px-2 py-2.5 text-center ${index === 0 ? "border-forest-700/25 bg-forest-50" : "border-black/5 bg-slate-50/70"}`}>
                  <span className="text-[9px] font-bold uppercase text-slate-400">{new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(date)}</span>
                  <strong className="mt-1 text-sm">{date.getDate()}</strong>
                  <span className={`mt-1.5 size-1.5 rounded-full ${count ? "bg-orange-400" : "bg-slate-200"}`} title={count ? `${count} bill${count === 1 ? "" : "s"} due` : "Nothing due"} />
                </div>
              );
            })}
          </div>

          {bills.length > 0 && (
            <div className="mt-5 border-t border-black/5 pt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Active schedules</p>
              <div className="grid gap-1 sm:grid-cols-2">
                {bills.map((bill) => (
                  <div key={bill.id} className="group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
                    <span className="grid size-8 place-items-center rounded-lg bg-forest-50 text-forest-700"><Repeat2 className="size-3.5" /></span>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-xs">{bill.description}</strong>
                      <span className="text-[10px] capitalize text-slate-400">{bill.frequency} - {formatMoney(bill.amount, currency)}</span>
                    </div>
                    <button onClick={() => onDelete(bill)} className="interactive-button grid size-7 place-items-center rounded-lg text-slate-300 hover:-translate-y-px hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Delete ${bill.description} schedule`}><Trash2 className="size-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Coming up</p>
          {upcoming.length ? (
            <div className="grid gap-2">
              {upcoming.map((occurrence) => {
                const date = new Date(`${occurrence.dueDate}T12:00:00`);
                return (
                  <article key={occurrence.occurrenceId} className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-3">
                    <div className="grid min-w-10 text-center">
                      <span className="text-[9px] font-bold uppercase text-orange-500">{new Intl.DateTimeFormat(undefined, { month: "short" }).format(date)}</span>
                      <strong className="text-base leading-none">{date.getDate()}</strong>
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-xs">{occurrence.description}</strong>
                      <span className="text-[10px] text-slate-400">{categoryName(occurrence.category)}</span>
                    </div>
                    <strong className="text-xs">{formatMoney(occurrence.amount, currency)}</strong>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center">
              <div>
                <strong className="text-xs">No bills due soon</strong>
                <p className="mt-1 text-[11px] text-slate-400">Add a schedule or flag an expense as recurring.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
