import { Plus } from "lucide-react";
import PageIntro from "../components/PageIntro";
import PlanningCalendar from "../components/PlanningCalendar";
import ScheduleManager from "../components/ScheduleManager";
import Button from "../components/ui/Button";

export default function RecurringPage({ state, goals, onAddBill, onDeleteBill, onAddGoal, onEditGoal, profileType = "personal" }) {
  const business = profileType === "business";
  return (
    <>
      <PageIntro eyebrow={business ? "Business schedules" : "Calendar"} title={business ? "Keep every commitment visible." : "Plan for dates that matter."} description={business ? "Track recurring operating costs, reserve milestones, and important payment dates together." : "Keep bills, preferred savings dates, and hard deadlines visible together."} action={<Button onClick={onAddGoal}><Plus className="size-4" /> {business ? "New reserve" : "New goal"}</Button>} />
      <PlanningCalendar bills={state.recurringBills} goals={goals} currency={state.currency} onEditGoal={onEditGoal} profileType={profileType} />
      <div className="mt-4"><ScheduleManager bills={state.recurringBills} currency={state.currency} onAdd={onAddBill} onDelete={onDeleteBill} profileType={profileType} /></div>
    </>
  );
}
