import { useEffect, useState } from "react";
import { EXPENSE_CATEGORIES, RECURRENCE_OPTIONS, localDate } from "../lib/budget";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function RecurringModal({ open, onClose, onSave, currency, categories = EXPENSE_CATEGORIES, profileType = "personal" }) {
  const business = profileType === "business";
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("bills");
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState(localDate());

  useEffect(() => {
    if (!open) return;
    setDescription("");
    setAmount("");
    setCategory("bills");
    setFrequency("monthly");
    setStartDate(localDate());
  }, [open]);

  const submit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return;
    onSave({ description: description.trim(), amount: numericAmount, category, frequency, startDate });
  };
  const input = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";

  return (
    <ModalShell open={open} onClose={onClose} eyebrow={business ? "Recurring cost" : "Recurring bill"} title="Add a schedule">
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <label className="grid gap-2 text-xs font-semibold text-slate-600">{business ? "Cost name" : "Bill name"}<input autoFocus value={description} onChange={(event) => setDescription(event.target.value)} className={input} placeholder={business ? "e.g. Accounting software" : "e.g. Internet"} required /></label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} className={input} type="number" min="0.01" step="0.01" inputMode="decimal" placeholder={`${currency} 0.00`} required /></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Frequency<select value={frequency} onChange={(event) => setFrequency(event.target.value)} className={input}>{RECURRENCE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">First due date<input value={startDate} onChange={(event) => setStartDate(event.target.value)} className={input} type="date" required /></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className={input}>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary">Save schedule</Button></div>
      </form>
    </ModalShell>
  );
}
