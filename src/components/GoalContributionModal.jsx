import { useEffect, useState } from "react";
import { dateForMonth, formatMoney } from "../lib/budget";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function GoalContributionModal({ goal, goals = [], onClose, onSave, onTransfer, currency, selectedMonth, available, availableForDate }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(dateForMonth(selectedMonth));
  const [activityType, setActivityType] = useState("assign");
  const [targetGoalId, setTargetGoalId] = useState("");
  useEffect(() => {
    if (goal) {
      setAmount("");
      setDate(dateForMonth(selectedMonth));
      setActivityType("assign");
      setTargetGoalId(goals.find(({ id }) => id !== goal.id)?.id ?? "");
    }
  }, [goal, selectedMonth, goals]);
  const submit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;
    if (activityType === "transfer") onTransfer(goal.id, targetGoalId, numericAmount, date);
    else onSave(goal.id, { amount: activityType === "withdraw" ? -numericAmount : numericAmount, date });
  };
  const datedAvailable = date && availableForDate ? availableForDate(date) : available;
  const targetGoal = goals.find(({ id }) => id === targetGoalId);
  const maximumAssignment = activityType === "assign"
    ? Math.max(Math.min(datedAvailable, goal?.remaining ?? datedAvailable), 0)
    : activityType === "transfer"
      ? Math.max(Math.min(goal?.saved ?? 0, targetGoal?.remaining ?? Infinity), 0)
      : Math.max(goal?.saved ?? 0, 0);
  const input = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";
  return (
    <ModalShell open={Boolean(goal)} onClose={onClose} eyebrow="Goal activity" title={goal ? `Manage ${goal.name}` : "Manage goal"}>
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-1" role="group" aria-label="Goal activity type">
          {[["assign", "Assign"], ["withdraw", "Withdraw"], ["transfer", "Transfer"]].map(([value, label]) => <button key={value} type="button" onClick={() => setActivityType(value)} className={`min-h-9 rounded-lg px-2 text-[10px] font-bold ${activityType === value ? "bg-white text-forest-800 shadow-sm" : "text-slate-500"}`}>{label}</button>)}
        </div>
        <div className="mt-4 rounded-xl bg-forest-50 p-3 text-xs text-forest-800">
          {activityType === "assign" ? <><strong>{formatMoney(Math.max(datedAvailable, 0), currency)}</strong> available in this month before the assignment.</> : <><strong>{formatMoney(Math.max(goal?.saved ?? 0, 0), currency)}</strong> currently reserved in this goal.</>}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Amount<input autoFocus value={amount} onChange={(event) => setAmount(event.target.value)} className={input} type="number" min="0.01" max={maximumAssignment || undefined} step="0.01" inputMode="decimal" required /></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Activity date<input value={date} onChange={(event) => setDate(event.target.value)} className={input} type="date" required /></label>
        </div>
        {activityType === "transfer" && <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">Move to
          <select value={targetGoalId} onChange={(event) => setTargetGoalId(event.target.value)} className={input} required>
            {goals.filter(({ id }) => id !== goal?.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>}
        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{activityType === "assign" ? "Assigning reserves money and lowers safe-to-spend for that month." : activityType === "withdraw" ? "Withdrawing releases reserved money back into safe-to-spend." : "Transfers keep total reserved funds unchanged while moving them between goals."} No expense transaction is created.</p>
        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={activityType === "transfer" && !targetGoalId}>{activityType === "assign" ? "Assign funds" : activityType === "withdraw" ? "Withdraw funds" : "Transfer funds"}</Button></div>
      </form>
    </ModalShell>
  );
}
