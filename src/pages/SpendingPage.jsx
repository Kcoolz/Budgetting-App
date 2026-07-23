import { Settings2 } from "lucide-react";
import BillsFocusCard from "../components/BillsFocusCard";
import DebtPlanner from "../components/DebtPlanner";
import FlexibleSpendingCard from "../components/FlexibleSpendingCard";
import PageIntro from "../components/PageIntro";
import Button from "../components/ui/Button";
import { expenseCategoriesFor } from "../lib/budget";

export default function SpendingPage({
  monthLabel,
  state,
  debts = state.debts,
  summary,
  onManageBudget,
  onAddDebt,
  onEditDebt,
  onDeleteDebt,
  onDebtPlanChange,
  profileType = "personal"
}) {
  const business = profileType === "business";
  const categories = expenseCategoriesFor(profileType, state);
  return (
    <>
      <PageIntro
        eyebrow={business ? "Operations" : "Spending"}
        title={business ? `Protect the margin in ${monthLabel}.` : `Plan ${monthLabel} with confidence.`}
        description={business ? "Understand fixed overhead, control variable operating costs, and keep business credit on a deliberate payoff path." : "Cover bills first, make intentional choices with flexible spending, and build a practical debt payoff path."}
        action={<Button onClick={onManageBudget}><Settings2 className="size-4" /> Manage budget</Button>}
      />
      <div className="grid gap-4">
        <BillsFocusCard bills={state.recurringBills} budgets={summary.effectiveBudgets} spending={summary.categorySpending} currency={state.currency} profileType={profileType} />
      </div>
      <div className="mt-4"><FlexibleSpendingCard budgets={summary.effectiveBudgets} spending={summary.categorySpending} currency={state.currency} onManage={onManageBudget} categories={categories} profileType={profileType} /></div>
      <div className="mt-4"><DebtPlanner debts={debts} plan={state.debtPlan} currency={state.currency} onAdd={onAddDebt} onEdit={onEditDebt} onDelete={onDeleteDebt} onPlanChange={onDebtPlanChange} profileType={profileType} /></div>
    </>
  );
}
