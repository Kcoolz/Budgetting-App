import { formatMoney } from "../lib/budget";
import Card from "./ui/Card";

export default function CashFlowCard({ summary, currency }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const spentRatio = Math.min(summary.expenses / Math.max(summary.income, summary.expenses, 1), 1);
  const dashOffset = circumference * (1 - spentRatio);

  return (
    <Card className="flex flex-col border-forest-700/10 bg-[#f7faff] p-5 sm:p-6">
      <div>
        <p className="eyebrow">Cash flow</p>
        <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Income vs. spending</h2>
      </div>

      <div className="relative grid min-h-52 flex-1 place-items-center" aria-label={`Net cash flow ${formatMoney(summary.net, currency)}`}>
        <svg viewBox="0 0 160 160" className="size-44 -rotate-90" aria-hidden="true">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#dce6ee" strokeWidth="15" />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#d99a68"
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute grid max-w-28 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Net</span>
          <strong className={`truncate font-display text-xl font-normal ${summary.net < 0 ? "text-rose-700" : "text-ink-900"}`}>
            {formatMoney(summary.net, currency, { whole: true })}
          </strong>
        </div>
      </div>

      <dl className="grid gap-3 border-t border-black/5 pt-4 text-xs">
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2 text-slate-500"><span className="size-2 rounded-full bg-forest-700" />Income</dt>
          <dd className="font-bold">{formatMoney(summary.income, currency)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2 text-slate-500"><span className="size-2 rounded-full bg-[#d99a68]" />Spending</dt>
          <dd className="font-bold">{formatMoney(summary.expenses, currency)}</dd>
        </div>
      </dl>
    </Card>
  );
}
