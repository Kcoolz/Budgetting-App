import { ArrowRight, CalendarCheck2, CreditCard, ShieldCheck, Target, WalletCards } from "lucide-react";
import { Link } from "react-router";
import { calculateDebtPlan, formatMoney } from "../lib/budget";
import Card from "./ui/Card";

function payoffLabel(months) {
  if (!Number.isFinite(months)) return "Needs adjustment";
  if (months === 0) return "Paid off";
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(date);
}

export default function OverviewDebtCard({ debts = [], debtPlan, currency, profileType = "personal" }) {
  const business = profileType === "business";
  const activeDebts = debts.filter(({ balance }) => Number(balance) > 0);
  const plan = calculateDebtPlan(activeDebts, debtPlan?.extraPayment, debtPlan?.strategy);
  const accent = business ? "text-teal-800" : "text-forest-800";
  const accentSoft = business ? "bg-teal-50" : "bg-forest-50";

  if (!activeDebts.length) {
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${accentSoft} ${accent}`}><ShieldCheck className="size-[18px]" /></span>
            <div>
              <p className="eyebrow">{business ? "Business credit" : "Debt payoff"}</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">{debts.length ? "Your tracked cards are paid off." : "No credit-card payoff plan yet."}</h2>
              <p className="mt-1 text-xs text-slate-500">{debts.length ? "Your Overview will show a new projection if another balance is recorded." : "Add a card once and Cloud will keep its balance and payoff projection together."}</p>
            </div>
          </div>
          <Link to="/spending" className={`interactive-button flex shrink-0 items-center gap-2 text-xs font-bold ${accent}`}>{debts.length ? "View debt planner" : "Create a payoff plan"}<ArrowRight className="size-4" /></Link>
        </div>
      </Card>
    );
  }

  const focus = plan.payoffOrder[0];
  const target = payoffLabel(plan.months);

  return (
    <Card className="relative overflow-hidden">
      <span className={`absolute inset-y-0 left-0 w-1 ${business ? "bg-teal-600" : "bg-forest-700"}`} aria-hidden="true" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${accentSoft} ${accent}`}><CreditCard className="size-[18px]" /></span>
            <div>
              <p className="eyebrow">{business ? "Business debt payoff" : "Credit-card payoff"}</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Your path to a zero balance</h2>
              <p className="mt-1 text-xs text-slate-500">A focused snapshot of the full payoff planner.</p>
            </div>
          </div>
          <Link to="/spending" className={`interactive-button flex shrink-0 items-center gap-2 text-xs font-bold ${accent}`}>Open payoff plan <ArrowRight className="size-4" /></Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`rounded-2xl ${business ? "bg-[#102c2b]" : "bg-forest-900"} p-4 text-white`}>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.11em] text-white/55"><WalletCards className="size-3.5" /> Total remaining</div>
            <strong className="mt-3 block font-display text-2xl font-normal tracking-[-0.04em]">{formatMoney(plan.totalBalance, currency)}</strong>
            <span className="mt-1 block text-[10px] text-white/45">Across {activeDebts.length} card{activeDebts.length === 1 ? "" : "s"}</span>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.11em] text-slate-400"><CalendarCheck2 className="size-3.5" /> Monthly plan</div>
            <strong className="mt-3 block text-lg">{formatMoney(plan.monthlyPayment, currency)}</strong>
            <span className="mt-1 block text-[10px] text-slate-400">minimums plus extra</span>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.11em] text-slate-400"><Target className="size-3.5" /> Projected finish</div>
            <strong className={`mt-3 block text-lg ${plan.status === "ok" ? "text-ink-900" : "text-rose-700"}`}>{target}</strong>
            <span className="mt-1 block text-[10px] text-slate-400">using the current plan</span>
          </div>
          <div className={`rounded-2xl p-4 ${accentSoft}`}>
            <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.11em] ${accent}`}><CreditCard className="size-3.5" /> Focus first</div>
            <strong className="mt-3 block truncate text-lg">{focus?.name ?? "Adjust plan"}</strong>
            <span className="mt-1 block text-[10px] text-slate-500">{debtPlan?.strategy === "snowball" ? "smallest balance" : "highest APR"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
