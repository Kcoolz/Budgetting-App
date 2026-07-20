import { useEffect, useState } from "react";
import { dateForMonth, formatMoney } from "../lib/budget";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function GoalContributionModal({ goal, onClose, onSave, currency, selectedMonth, available }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(dateForMonth(selectedMonth));
  useEffect(() => { if (goal) { setAmount(""); setDate(dateForMonth(selectedMonth)); } }, [goal, selectedMonth]);
  const submit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;
    onSave(goal.id, { amount: numericAmount, date });
  };
  const maximumAssignment = Math.max(Math.min(available, goal?.remaining ?? available), 0);
  const input = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";
  return (
    <ModalShell open={Boolean(goal)} onClose={onClose} eyebrow="Assign funds" title={goal ? `Fund ${goal.name}` : "Fund goal"}>
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <div className="rounded-xl bg-forest-50 p-3 text-xs text-forest-800"><strong>{formatMoney(Math.max(available, 0), currency)}</strong> currently available before this assignment.</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Amount<input autoFocus value={amount} onChange={(event) => setAmount(event.target.value)} className={input} type="number" min="0.01" max={maximumAssignment || undefined} step="0.01" inputMode="decimal" required /></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Assignment date<input value={date} onChange={(event) => setDate(event.target.value)} className={input} type="date" required /></label>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">This reserves money for the goal and lowers safe-to-spend for the assignment month. It does not create an expense transaction.</p>
        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary">Assign funds</Button></div>
      </form>
    </ModalShell>
  );
}
