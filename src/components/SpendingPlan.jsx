import { EXPENSE_CATEGORIES, formatMoney, progressTone } from "../lib/budget";
import Card from "./ui/Card";

const toneClasses = {
  healthy: "bg-emerald-600",
  warning: "bg-amber-400",
  danger: "bg-rose-400"
};

export default function SpendingPlan({ budgets, carryovers = {}, rolloverEnabled = false, spending, currency, onManage }) {
  const active = EXPENSE_CATEGORIES.filter(({ id }) => budgets[id] !== 0 || spending[id] > 0 || carryovers[id] !== 0);
  const categories = active.length
    ? active
    : EXPENSE_CATEGORIES.filter(({ id }) => ["food", "housing", "fun"].includes(id));

  return (
    <Card id="spending" className="p-5 sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">By category</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Spending plan</h2>
        </div>
        <span className="rounded-full bg-cream-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </span>
      </div>

      <div className="grid gap-5">
        {categories.map((category) => {
          const budget = budgets[category.id] || 0;
          const spent = spending[category.id] || 0;
          const carryover = carryovers[category.id] || 0;
          const percent = budget > 0 ? (spent / budget) * 100 : spent > 0 ? 100 : 0;
          const tone = budget <= 0 && spent > 0 ? "danger" : progressTone(percent);

          return (
            <article key={category.id}>
              <div className="mb-2 flex items-center gap-2.5 text-xs">
                <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: category.color }} aria-hidden="true" />
                <span className="flex flex-1 items-center gap-2"><strong className="font-semibold">{category.shortName}</strong>{rolloverEnabled && carryover !== 0 && <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${carryover > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>{carryover > 0 ? "+" : ""}{formatMoney(carryover, currency)} rolled</span>}</span>
                <span className={`text-[11px] ${tone === "danger" ? "font-semibold text-rose-600" : "text-slate-500"}`}>
                  {budget > 0
                    ? `${formatMoney(spent, currency)} of ${formatMoney(budget, currency)}`
                    : "Set a monthly limit"}
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label={`${category.name} budget used`}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(Math.min(percent, 100))}
              >
                <span
                  className={`block h-full rounded-full transition-all duration-500 ${toneClasses[tone]}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
              {budget > 0 && (
                <p className="mt-1.5 text-right text-[10px] font-medium text-slate-400">{Math.round(percent)}% used</p>
              )}
            </article>
          );
        })}
      </div>

      {!active.length && (
        <button onClick={onManage} className="interactive-button mt-6 text-xs font-bold text-forest-700 hover:-translate-y-px hover:text-forest-900">
          Set your category budgets →
        </button>
      )}
    </Card>
  );
}
