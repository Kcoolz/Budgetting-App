import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarCheck2, CreditCard, Pencil, Plus, ShieldCheck, Trash2, TrendingDown } from "lucide-react";
import { calculateDebtPlan, formatMoney } from "../lib/budget";
import Button from "./ui/Button";
import Card from "./ui/Card";

function durationLabel(months) {
  if (!Number.isFinite(months)) return "Needs adjustment";
  if (months === 0) return "Now";
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return [years ? `${years} ${years === 1 ? "year" : "years"}` : "", remainingMonths ? `${remainingMonths} mo` : ""].filter(Boolean).join(" ");
}

function payoffDate(months) {
  if (!Number.isFinite(months)) return null;
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(date);
}

export default function DebtPlanner({ debts, plan: savedPlan, currency, onAdd, onEdit, onDelete, onPlanChange, profileType = "personal" }) {
  const business = profileType === "business";
  const [extraPayment, setExtraPayment] = useState(String(savedPlan.extraPayment || ""));
  const [strategy, setStrategy] = useState(savedPlan.strategy);

  useEffect(() => {
    setExtraPayment(String(savedPlan.extraPayment || ""));
    setStrategy(savedPlan.strategy);
  }, [savedPlan.extraPayment, savedPlan.strategy]);

  const plan = useMemo(() => calculateDebtPlan(debts, savedPlan.extraPayment, savedPlan.strategy), [debts, savedPlan]);
  const baseline = useMemo(() => calculateDebtPlan(debts, 0, savedPlan.strategy), [debts, savedPlan.strategy]);
  const monthsSaved = plan.status === "ok" && baseline.status === "ok" ? Math.max(baseline.months - plan.months, 0) : 0;
  const interestSaved = plan.status === "ok" && baseline.status === "ok" ? Math.max(baseline.totalInterest - plan.totalInterest, 0) : 0;

  const submitPlan = (event) => {
    event.preventDefault();
    onPlanChange({ strategy, extraPayment: Math.max(Number(extraPayment) || 0, 0) });
  };

  if (!debts.length) {
    return (
      <Card className="overflow-hidden p-5 sm:p-6">
        <div className="grid min-h-64 place-items-center rounded-2xl bg-gradient-to-br from-forest-50 to-white px-6 py-10 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-forest-800 shadow-sm"><CreditCard className="size-5" /></span>
            <p className="eyebrow mt-5">{business ? "Business credit" : "Credit-card debt"}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">Build a payoff plan</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-500">Add each card to compare interest-first and smallest-balance strategies, then see how an extra monthly payment changes your timeline.</p>
            <Button variant="primary" onClick={onAdd} className="mt-5"><Plus className="size-4" /> Add your first card</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">{business ? "Business debt" : "Debt payoff"}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{business ? "Business credit reduction plan" : "Credit-card reduction plan"}</h2>
          <p className="mt-1 text-xs text-slate-500">Keep one monthly payment amount and roll paid-off minimums into the next card.</p>
        </div>
        <Button onClick={onAdd} className="shrink-0"><Plus className="size-4" /> Add card</Button>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="min-w-0">
          <dl className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total debt</dt><dd className="mt-2 font-display text-xl">{formatMoney(plan.totalBalance, currency)}</dd></div>
            <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Monthly plan</dt><dd className="mt-2 font-display text-xl">{formatMoney(plan.monthlyPayment, currency)}</dd></div>
            <div className="rounded-2xl bg-forest-50 p-4"><dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Time to payoff</dt><dd className="mt-2 font-display text-xl">{durationLabel(plan.months)}</dd></div>
            <div className="rounded-2xl bg-forest-50 p-4"><dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Debt-free target</dt><dd className="mt-2 font-display text-xl">{payoffDate(plan.months) ?? "—"}</dd></div>
          </dl>

          {plan.status === "ok" ? (
            <div className={`mt-3 flex items-start gap-3 rounded-2xl p-4 ${monthsSaved > 0 ? "bg-emerald-50 text-emerald-900" : "bg-forest-50 text-forest-900"}`}>
              {monthsSaved > 0 ? <TrendingDown className="mt-0.5 size-4 shrink-0" /> : <ShieldCheck className="mt-0.5 size-4 shrink-0" />}
              <p className="text-xs leading-relaxed">
                {monthsSaved > 0
                  ? `Your extra payment may remove ${durationLabel(monthsSaved)} and about ${formatMoney(interestSaved, currency)} in interest versus minimum payments.`
                  : "Add an affordable extra monthly payment to shorten the timeline. The avalanche method usually minimizes interest."}
              </p>
            </div>
          ) : (
            <div className="mt-3 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-800" role="alert">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p className="text-xs leading-relaxed">The planned payment does not reduce the projected balance, or payoff exceeds 50 years. Increase the payment and verify each card’s minimum and APR.</p>
            </div>
          )}

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payoff priority</p><span className="text-[10px] text-slate-400">{savedPlan.strategy === "avalanche" ? "Highest APR first" : "Smallest balance first"}</span></div>
            <div className="grid gap-2">
              {plan.payoffOrder.map((priority, index) => {
                const debt = debts.find(({ id }) => id === priority.id);
                return (
                  <article key={debt.id} className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${index === 0 ? "bg-forest-900 text-white" : "bg-slate-100 text-slate-500"}`}>{index + 1}</span>
                    <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{debt.name}</strong><span className="text-[10px] text-slate-400">{debt.apr.toFixed(2)}% APR · {formatMoney(debt.minimumPayment, currency)} minimum</span></div>
                    <strong className="text-sm">{formatMoney(debt.balance, currency)}</strong>
                    <div className="flex gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <button onClick={() => onEdit(debt)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-forest-50 hover:text-forest-800" aria-label={`Edit ${debt.name}`}><Pencil className="size-3.5" /></button>
                      <button onClick={() => onDelete(debt)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${debt.name}`}><Trash2 className="size-3.5" /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={submitPlan} className="h-fit rounded-2xl border border-forest-700/10 bg-forest-50/60 p-5">
          <div className="flex items-center gap-2"><CalendarCheck2 className="size-4 text-forest-700" /><h3 className="text-sm font-semibold">Adjust the plan</h3></div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Minimums total {formatMoney(plan.minimumPayment, currency)} per month.</p>

          <label className="mt-5 grid gap-2 text-xs font-semibold text-slate-600">Extra monthly payment
            <input value={extraPayment} onChange={(event) => setExtraPayment(event.target.value)} type="number" min="0" step="1" inputMode="decimal" className="min-h-11 rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10" placeholder={`${currency} 0`} />
          </label>

          <fieldset className="mt-5"><legend className="text-xs font-semibold text-slate-600">Payoff method</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStrategy("avalanche")} className={`interactive-button rounded-xl border p-3 text-left ${strategy === "avalanche" ? "border-forest-700/25 bg-white text-forest-900 shadow-sm" : "border-transparent bg-white/50 text-slate-500"}`}><strong className="block text-xs">Avalanche</strong><span className="mt-1 block text-[9px]">High APR first</span></button>
              <button type="button" onClick={() => setStrategy("snowball")} className={`interactive-button rounded-xl border p-3 text-left ${strategy === "snowball" ? "border-forest-700/25 bg-white text-forest-900 shadow-sm" : "border-transparent bg-white/50 text-slate-500"}`}><strong className="block text-xs">Snowball</strong><span className="mt-1 block text-[9px]">Low balance first</span></button>
            </div>
          </fieldset>

          <Button type="submit" variant="primary" className="mt-5 w-full">Update projection</Button>
          <p className="mt-4 text-[9px] leading-relaxed text-slate-400">Projection assumes fixed APRs, no new charges, and the same total payment each month. It is an estimate, not lender guidance.</p>
        </form>
      </div>
    </Card>
  );
}
