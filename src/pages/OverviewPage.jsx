import { Banknote, CalendarClock, Check, LayoutDashboard, Settings2, WalletCards } from "lucide-react";
import BudgetHealthCard from "../components/BudgetHealthCard";
import OverviewActivityCard from "../components/OverviewActivityCard";
import OverviewBillsCard from "../components/OverviewBillsCard";
import OverviewGoalsCard from "../components/OverviewGoalsCard";
import OverviewDebtCard from "../components/OverviewDebtCard";
import PageIntro from "../components/PageIntro";
import SummaryCards from "../components/SummaryCards";
import Button from "../components/ui/Button";
import { expenseCategoriesFor } from "../lib/budget";

export default function OverviewPage({
  monthLabel,
  state,
  summary,
  comparison,
  safeToSpend,
  upcomingBills,
  goals,
  debts,
  onManageBudget,
  onCustomize,
  onAddIncome,
  onAddSchedule
}) {
  const hiddenSections = new Set(state.dashboard.hidden);
  const sections = {
    summary: <SummaryCards summary={summary} comparison={comparison} safeToSpend={safeToSpend} currency={state.currency} />,
    spending: <BudgetHealthCard budgets={summary.effectiveBudgets} spending={summary.categorySpending} currency={state.currency} categories={expenseCategoriesFor("personal", state)} />,
    recurring: <OverviewBillsCard upcoming={upcomingBills} currency={state.currency} />,
    goals: <OverviewGoalsCard goals={goals} currency={state.currency} />,
    debt: <OverviewDebtCard debts={debts} debtPlan={state.debtPlan} currency={state.currency} />,
    transactions: <OverviewActivityCard transactions={summary.transactions} currency={state.currency} />
  };
  const visibleSections = state.dashboard.order.filter((id) => !hiddenSections.has(id));
  const setupSteps = [
    { id: "income", done: summary.income > 0, label: "Record income", detail: "Add what you have actually received this month.", icon: Banknote, action: onAddIncome },
    { id: "budget", done: summary.totalBudget > 0, label: "Plan your spending", detail: "Give this month’s income category limits.", icon: WalletCards, action: onManageBudget },
    { id: "schedule", done: state.recurringBills.length > 0, label: "Add repeating payments", detail: "Put paydays and bills on the calendar.", icon: CalendarClock, action: onAddSchedule }
  ];
  const completedSteps = setupSteps.filter(({ done }) => done).length;

  return (
    <>
      <PageIntro
        id="overview"
        variant="hero"
        eyebrow="Monthly overview"
        title={`${monthLabel}, made simple.`}
        description="Give every dollar some direction and keep your spending in view."
        action={(
          <div className="flex flex-wrap gap-2">
            <Button variant="heroGhost" onClick={onCustomize}><LayoutDashboard className="size-4" /> Customize</Button>
            <Button variant="heroPrimary" onClick={onManageBudget}><Settings2 className="size-4" /> Manage budget</Button>
          </div>
        )}
      />

      {completedSteps < setupSteps.length && (
        <section className="premium-card mb-4 rounded-2xl p-4 sm:p-5" aria-label="Monthly setup">
          <div className="flex items-center justify-between gap-4">
            <div><p className="eyebrow">Quick setup</p><h2 className="mt-1 text-base font-semibold">Get this month ready</h2></div>
            <span className="rounded-full bg-forest-50 px-3 py-1.5 text-[10px] font-bold text-forest-800">{completedSteps} of {setupSteps.length} done</span>
          </div>
          <div className="mt-4 grid gap-2 lg:grid-cols-3">
            {setupSteps.map(({ id, done, label, detail, icon: Icon, action }, index) => (
              <button key={id} onClick={action} disabled={done} className={`interactive-button flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left ${done ? "cursor-default border-emerald-100 bg-emerald-50/60" : "border-black/5 bg-slate-50/70 hover:border-forest-700/20 hover:bg-forest-50"}`}>
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${done ? "bg-white text-emerald-700" : "bg-white text-forest-700 shadow-sm"}`}>{done ? <Check className="size-4" /> : <Icon className="size-4" />}</span>
                <span className="min-w-0"><strong className="block text-xs">{index + 1}. {label}</strong><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">{done ? "Done for now" : detail}</span></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {visibleSections.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleSections.map((id) => <div key={id} className={`min-w-0 ${["summary", "spending", "debt", "transactions"].includes(id) ? "md:col-span-2" : ""}`}>{sections[id]}</div>)}
        </div>
      ) : (
        <section className="premium-card rounded-2xl px-5 py-12 text-center sm:px-8">
          <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-forest-100 text-forest-800"><LayoutDashboard className="size-5" /></span>
          <h2 className="mt-4 text-lg font-semibold">Your Overview is clear</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Add back the sections you want to see. Your financial data is still safely stored.</p>
          <Button onClick={onCustomize} className="mt-5">Choose sections</Button>
        </section>
      )}
    </>
  );
}
