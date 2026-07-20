import { useEffect, useState } from "react";
import { CalendarCheck2, ShieldAlert } from "lucide-react";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function GoalModal({ open, goal, onClose, onSave, currency, profileType = "personal" }) {
  const business = profileType === "business";
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setName(goal?.name ?? "");
    setTarget(goal?.target ?? "");
    setTargetDate(goal?.targetDate ?? "");
    setDeadline(goal?.deadline ?? "");
    setError("");
  }, [open, goal]);
  const submit = (event) => {
    event.preventDefault();
    const amount = Number(target);
    if (!name.trim() || !Number.isFinite(amount) || amount <= 0) return;
    if (targetDate && deadline && targetDate > deadline) {
      setError("The must-have date needs to be on or after your planned finish date.");
      return;
    }
    onSave({ id: goal?.id, name: name.trim(), target: amount, targetDate: targetDate || null, deadline: deadline || null });
  };
  const input = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";
  return (
    <ModalShell open={open} onClose={onClose} eyebrow={business ? "Capital target" : "Savings target"} title={goal ? `Edit ${business ? "reserve" : "savings goal"}` : `Create a ${business ? "reserve" : "goal"}`} width="max-w-2xl">
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <label className="grid gap-2 text-xs font-semibold text-slate-600">{business ? "Reserve name" : "Goal name"}<input autoFocus value={name} onChange={(event) => setName(event.target.value)} className={input} placeholder={business ? "e.g. Quarterly tax reserve" : "e.g. Emergency fund"} required /></label>
        <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">Target amount<input value={target} onChange={(event) => setTarget(event.target.value)} className={input} type="number" min="1" step="1" inputMode="decimal" placeholder={`${currency} 5,000`} required /></label>

        <div className="mt-5 rounded-2xl bg-forest-50 p-4">
          <strong className="text-xs">Give yourself a plan and a safety margin</strong>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Your planned date sets the preferred saving pace. The must-have date is the latest acceptable finish if life interrupts the plan.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-2"><CalendarCheck2 className="size-3.5 text-forest-700" /> Plan to finish by</span>
              <input value={targetDate} onChange={(event) => { setTargetDate(event.target.value); setError(""); }} className={input} type="date" />
              <span className="text-[9px] font-normal text-slate-400">Your preferred completion date</span>
            </label>
            <label className="grid gap-2 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-2"><ShieldAlert className="size-3.5 text-rose-500" /> Must have by</span>
              <input value={deadline} onChange={(event) => { setDeadline(event.target.value); setError(""); }} min={targetDate || undefined} className={input} type="date" />
              <span className="text-[9px] font-normal text-slate-400">Your firm, latest deadline</span>
            </label>
          </div>
        </div>
        {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700" role="alert">{error}</p>}
        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary">{goal ? "Save changes" : "Create goal"}</Button></div>
      </form>
    </ModalShell>
  );
}
