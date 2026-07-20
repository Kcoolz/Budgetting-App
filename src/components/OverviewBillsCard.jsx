import { ArrowRight, CalendarClock } from "lucide-react";
import { Link } from "react-router";
import { formatMoney, sum } from "../lib/budget";
import Card from "./ui/Card";

export default function OverviewBillsCard({ upcoming, currency }) {
  const total = sum(upcoming.map(({ amount }) => amount));

  return (
    <Card className="relative h-full overflow-hidden p-5 sm:p-6">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-300 to-amber-500" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <div><p className="eyebrow">Next 14 days</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Upcoming bills</h2></div>
        <span className="rounded-xl bg-orange-50 px-3 py-2 text-right"><span className="block text-[8px] font-bold uppercase tracking-wider text-orange-600">Total due</span><strong className="mt-0.5 block text-sm">{formatMoney(total, currency)}</strong></span>
      </div>
      {upcoming.length ? (
        <div className="mt-5 grid gap-2">
          {upcoming.slice(0, 3).map((bill) => {
            const date = new Date(`${bill.dueDate}T12:00:00`);
            return (
              <article key={bill.occurrenceId} className="flex items-center gap-3 rounded-xl border border-orange-100/50 bg-gradient-to-r from-orange-50/70 to-white p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[11px] font-bold text-orange-700 shadow-sm">{date.getDate()}</span>
                <div className="min-w-0 flex-1"><strong className="block truncate text-xs">{bill.description}</strong><span className="text-[9px] text-slate-400">{new Intl.DateTimeFormat(undefined, { month: "short", weekday: "short" }).format(date)}</span></div>
                <strong className="text-xs">{formatMoney(bill.amount, currency)}</strong>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 grid min-h-28 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center"><div><CalendarClock className="mx-auto size-4 text-slate-400" /><strong className="mt-2 block text-xs">No bills due soon</strong><span className="mt-1 block text-[10px] text-slate-400">The next two weeks are clear.</span></div></div>
      )}
      <Link to="/recurring" className="interactive-button mt-5 flex items-center justify-between border-t border-black/5 pt-4 text-xs font-bold text-forest-700 hover:text-forest-900">Open planning calendar <ArrowRight className="size-4" /></Link>
    </Card>
  );
}
