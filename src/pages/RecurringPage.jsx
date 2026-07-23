import { CalendarPlus, Plus } from "lucide-react";
import PageIntro from "../components/PageIntro";
import PlanningCalendar from "../components/PlanningCalendar";
import ScheduleManager from "../components/ScheduleManager";
import CashFlowForecast from "../components/CashFlowForecast";
import { expenseCategoriesFor } from "../lib/budget";
import Button from "../components/ui/Button";

export default function RecurringPage({ state, goals, onAddBill, onEditBill, onToggleBill, onDeleteBill, onAddGoal, onEditGoal, onUpdateOccurrence, profileType = "personal" }) {
  const business = profileType === "business";
  return (
    <>
      <PageIntro eyebrow={business ? "Business schedules" : "Calendar"} title={business ? "Keep every commitment visible." : "Plan for dates that matter."} description={business ? "Track recurring operating costs, reserve milestones, and important payment dates together." : "Keep paydays, bills, preferred savings dates, and hard deadlines visible together."} action={<div className="flex flex-wrap gap-2"><Button variant="primary" onClick={onAddBill}><CalendarPlus className="size-4" /> Add schedule</Button><Button onClick={onAddGoal}><Plus className="size-4" /> {business ? "New reserve" : "New goal"}</Button></div>} />
      <PlanningCalendar bills={state.recurringBills} goals={goals} currency={state.currency} onEditGoal={onEditGoal} profileType={profileType} />
      <CashFlowForecast state={state} onUpdateOccurrence={onUpdateOccurrence} />
      <div className="mt-4"><ScheduleManager bills={state.recurringBills} currency={state.currency} categories={expenseCategoriesFor(profileType, state)} onAdd={onAddBill} onEdit={onEditBill} onToggle={onToggleBill} onDelete={onDeleteBill} profileType={profileType} /></div>
    </>
  );
}
