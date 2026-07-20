import { ArrowDownLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { categoryName, formatMoney, getTransactionSubcategory, subcategoryName } from "../lib/budget";
import Card from "./ui/Card";

export default function OverviewActivityCard({ transactions, currency }) {
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const unreviewed = transactions.filter(({ reviewed }) => reviewed === false).length;

  return (
    <Card className="relative overflow-hidden">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-violet-50/45 to-transparent p-5 sm:p-6">
        <div><p className="eyebrow">Recent activity</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Latest transactions</h2><p className="mt-1 text-xs text-slate-500">A quick check, not the full ledger.</p></div>
        {unreviewed > 0 && <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-bold text-orange-700">{unreviewed} to review</span>}
      </div>
      {recent.length ? (
        <div className="border-t border-black/5">
          {recent.map((transaction) => {
            const income = transaction.type === "income";
            return (
              <article key={transaction.id} className="flex items-center gap-3 border-b border-black/5 px-5 py-3 transition-colors last:border-b-0 hover:bg-slate-50/70 sm:px-6">
                <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${income ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{income ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}</span>
                <div className="min-w-0 flex-1"><strong className="block truncate text-xs">{transaction.description}</strong><span className="text-[9px] text-slate-400">{income ? categoryName(transaction.category, "income") : subcategoryName(getTransactionSubcategory(transaction))} · {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${transaction.date}T12:00:00`))}</span></div>
                <strong className={`text-xs ${income ? "text-emerald-700" : ""}`}>{income ? "+" : "−"}{formatMoney(transaction.amount, currency)}</strong>
              </article>
            );
          })}
        </div>
      ) : <p className="mx-5 mb-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center text-[11px] text-slate-400 sm:mx-6 sm:mb-6">No transactions in this month yet.</p>}
      <Link to="/transactions" className="interactive-button flex items-center justify-between border-t border-black/5 px-5 py-4 text-xs font-bold text-forest-700 hover:bg-forest-50 hover:text-forest-900 sm:px-6">Open transaction ledger <ArrowRight className="size-4" /></Link>
    </Card>
  );
}
