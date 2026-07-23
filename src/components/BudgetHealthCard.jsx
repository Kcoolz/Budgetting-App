import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import { EXPENSE_CATEGORIES, formatMoney, sum } from "../lib/budget";
import Card from "./ui/Card";

export default function BudgetHealthCard({ budgets, spending, currency, categories = EXPENSE_CATEGORIES }) {
  const rows = categories
    .map((category) => {
      const budget = Number(budgets[category.id]) || 0;
      const spent = Number(spending[category.id]) || 0;
      const percent = budget ? spent / budget * 100 : spent ? 100 : 0;
      return { ...category, budget, spent, percent };
    })
    .filter(({ budget, spent }) => budget || spent)
    .sort((a, b) => b.percent - a.percent);
  const planned = sum(rows.map(({ budget }) => budget));
  const spent = sum(rows.map(({ spent: amount }) => amount));
  const attention = rows.filter(({ percent }) => percent >= 80);
  const visible = (attention.length ? attention : rows).slice(0, 3);

  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-orange-400" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Budget health</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">What needs your attention</h2>
          <p className="mt-1 text-xs text-slate-500">A short list of categories closest to their limits.</p>
        </div>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${attention.length ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-700"}`}>
          {attention.length ? <AlertTriangle className="size-4" /> : <CheckCircle2 className="size-4" />}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 rounded-xl bg-slate-50/70 p-4">
        <div><span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Plan remaining</span><strong className={`mt-1 block font-display text-2xl font-normal ${planned - spent < 0 ? "text-rose-700" : ""}`}>{formatMoney(planned - spent, currency, { whole: true })}</strong></div>
        <span className="text-right text-[10px] text-slate-400">{formatMoney(spent, currency, { whole: true })}<br />of {formatMoney(planned, currency, { whole: true })} used</span>
      </div>

      {visible.length ? (
        <div className="mt-5 grid gap-3">
          {visible.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-3">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: category.color }} />
                <div className="min-w-0 flex-1"><strong className="block truncate text-xs">{category.name}</strong><span className="text-[9px] text-slate-400">{Math.round(category.percent)}% used</span></div>
                <span className={`text-xs font-semibold ${category.percent >= 100 ? "text-rose-600" : category.percent >= 80 ? "text-orange-600" : "text-slate-500"}`}>{formatMoney(category.budget - category.spent, currency, { whole: true })} left</span>
              </div>
              <span className="ml-[22px] mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(category.percent, 100)}%`, backgroundColor: category.color }} /></span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center text-[11px] text-slate-400">Set category limits to see budget health.</p>
      )}

      <Link to="/spending" className="interactive-button mt-5 flex items-center justify-between border-t border-black/5 pt-4 text-xs font-bold text-forest-700 hover:text-forest-900">Open spending plan <ArrowRight className="size-4" /></Link>
    </Card>
  );
}
