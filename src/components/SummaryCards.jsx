import { ArrowDownLeft, ArrowUpRight, Gauge, LockKeyhole } from "lucide-react";
import { formatMoney } from "../lib/budget";
import Card from "./ui/Card";
import Sparkline from "./Sparkline";

function MetricLabel({ icon: Icon, tone, children }) {
  const tones = {
    income: { wrapper: "text-emerald-900/70", icon: "bg-white/75 text-emerald-700 shadow-sm" },
    spent: { wrapper: "text-orange-900/65", icon: "bg-white/75 text-orange-700 shadow-sm" },
    budget: { wrapper: "text-blue-100/75", icon: "bg-white/10 text-blue-100" }
  };
  const classes = tones[tone];
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold ${classes.wrapper}`}>
      <span className={`grid size-8 place-items-center rounded-xl ${classes.icon}`}>
        <Icon className="size-3.5" strokeWidth={2} />
      </span>
      {children}
    </div>
  );
}

function Value({ children, danger = false, inverse = false }) {
  return <strong className={`mt-4 block font-display text-[2.1rem] font-normal leading-none tracking-[-0.04em] ${danger ? inverse ? "text-rose-200" : "text-rose-700" : inverse ? "text-white" : "text-ink-900"}`}>{children}</strong>;
}

export default function SummaryCards({ summary, comparison, safeToSpend, currency }) {
  const money = (value, options) => formatMoney(value, currency, options);
  const safePrefix = currency === "CAD" ? "CA" : currency === "USD" ? "US" : currency === "AUD" ? "A" : "";
  const safeAmount = money(safeToSpend.dailyAmount);
  const safeDisplay = safePrefix && !safeAmount.startsWith(safePrefix) ? `${safePrefix}${safeAmount}` : safeAmount;
  const comparisonTone = comparison.direction === "less" ? "text-emerald-700" : comparison.direction === "more" ? "text-amber-700" : "text-slate-400";

  return (
    <section className="grid grid-cols-1 gap-3.5 md:grid-cols-3" aria-label="Monthly summary">
      <Card as="article" className="summary-income relative min-h-44 overflow-hidden px-5 py-5">
        <span className="absolute -right-8 -top-10 size-32 rounded-full border border-emerald-600/10 bg-white/25" aria-hidden="true" />
        <MetricLabel icon={ArrowDownLeft} tone="income">Income</MetricLabel>
        <Value>{money(summary.income)}</Value>
        <p className="mt-2 text-[11px] text-emerald-900/45">Received this month</p>
      </Card>

      <Card as="article" className="summary-spent relative min-h-44 overflow-hidden px-5 py-5">
        <span className="absolute -right-10 -top-12 size-36 rounded-full border border-orange-500/10 bg-white/25" aria-hidden="true" />
        <MetricLabel icon={ArrowUpRight} tone="spent">Spent</MetricLabel>
        <div className="mt-1 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <Value>{money(summary.expenses)}</Value>
            <p className={`mt-2 truncate text-[11px] font-medium ${comparisonTone}`}>{comparison.label}</p>
          </div>
          <Sparkline values={summary.dailySpending} />
        </div>
      </Card>

      <Card as="article" className="summary-budget relative min-h-44 overflow-hidden border-transparent px-5 py-5 text-white shadow-[0_14px_35px_rgba(18,58,99,0.22)]">
        <span className="absolute -bottom-16 -right-12 size-40 rounded-full border border-white/10 bg-white/[0.04]" aria-hidden="true" />
        <MetricLabel icon={Gauge} tone="budget">Available to spend</MetricLabel>
        <Value danger={summary.spendableRemaining < 0} inverse>{money(summary.spendableRemaining)}</Value>
        <p className="mt-2 text-[11px] font-medium text-blue-100/70">
          {safeToSpend.label ?? `${safeDisplay} safe to spend per day`}
        </p>
        {summary.totalBudget > 0 && <p className="mt-1 text-[10px] text-blue-100/70">{money(summary.budgetRemaining)} left across category limits</p>}
        {summary.goalReserved > 0 && (
          <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-blue-100"><LockKeyhole className="size-3" />{money(summary.goalReserved)} reserved for goals</p>
        )}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
          <span
            className={`block h-full rounded-full transition-all duration-500 ${summary.percentSpent > 100 ? "bg-rose-300" : "bg-blue-200"}`}
            style={{ width: `${Math.min(summary.percentSpent, 100)}%` }}
          />
        </div>
      </Card>
    </section>
  );
}
