import { LayoutDashboard, Settings2, Sparkles } from "lucide-react";
import BudgetHealthCard from "../components/BudgetHealthCard";
import OverviewActivityCard from "../components/OverviewActivityCard";
import OverviewBillsCard from "../components/OverviewBillsCard";
import OverviewGoalsCard from "../components/OverviewGoalsCard";
import OverviewDebtCard from "../components/OverviewDebtCard";
import PageIntro from "../components/PageIntro";
import SummaryCards from "../components/SummaryCards";
import Button from "../components/ui/Button";

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
  onCustomize
}) {
  const hiddenSections = new Set(state.dashboard.hidden);
  const sections = {
    summary: <SummaryCards summary={summary} comparison={comparison} safeToSpend={safeToSpend} currency={state.currency} />,
    spending: <BudgetHealthCard budgets={summary.effectiveBudgets} spending={summary.categorySpending} currency={state.currency} />,
    recurring: <OverviewBillsCard upcoming={upcomingBills} currency={state.currency} />,
    goals: <OverviewGoalsCard goals={goals} currency={state.currency} />,
    debt: <OverviewDebtCard debts={debts} debtPlan={state.debtPlan} currency={state.currency} />,
    transactions: <OverviewActivityCard transactions={summary.transactions} currency={state.currency} />
  };
  const visibleSections = state.dashboard.order.filter((id) => !hiddenSections.has(id));

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

      {!Object.values(state.budgets).some((amount) => Number(amount) > 0) && (
        <section className="mb-4 grid gap-3 rounded-2xl border border-forest-700/15 bg-forest-50 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <span className="grid size-9 place-items-center rounded-full bg-forest-100 text-forest-800"><Sparkles className="size-4" /></span>
          <div>
            <strong className="text-sm">Start by setting your category budgets</strong>
            <p className="mt-1 text-xs text-slate-500">Monthly limits turn on safe-to-spend guidance and progress tracking.</p>
          </div>
          <button onClick={onManageBudget} className="interactive-button text-left text-xs font-bold text-forest-700 hover:-translate-y-px hover:text-forest-900 sm:text-right">Set budget -&gt;</button>
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
