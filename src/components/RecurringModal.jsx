import { useEffect, useState } from "react";
import { EXPENSE_CATEGORIES, RECURRENCE_OPTIONS, incomeCategoriesFor, localDate } from "../lib/budget";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function RecurringModal({ open, schedule, onClose, onSave, currency, categories = EXPENSE_CATEGORIES, accounts = [], profileType = "personal" }) {
  const business = profileType === "business";
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("bills");
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState(localDate());
  const [endDate, setEndDate] = useState("");
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    if (!open) return;
    setType(schedule?.type === "income" ? "income" : "expense");
    setDescription(schedule?.description ?? "");
    setAmount(schedule?.amount ?? "");
    setCategory(schedule?.category ?? "bills");
    setFrequency(schedule?.frequency ?? "monthly");
    setStartDate(schedule?.startDate ?? localDate());
    setEndDate(schedule?.endDate ?? "");
    setAccountId(schedule?.accountId ?? accounts[0]?.id ?? "");
  }, [open, schedule, accounts]);

  const submit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return;
    onSave({ ...schedule, type, description: description.trim(), amount: numericAmount, category, frequency, startDate, endDate: endDate || null, accountId });
  };
  const input = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";
  const visibleCategories = type === "income" ? incomeCategoriesFor(profileType) : categories;

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Recurring activity" title={schedule ? "Edit payment schedule" : "Add a payment schedule"}>
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <fieldset className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <legend className="sr-only">Schedule type</legend>
          {[["expense", business ? "Outgoing cost" : "Payment"], ["income", business ? "Revenue" : "Income"]].map(([value, label]) => (
            <button key={value} type="button" onClick={() => {
              setType(value);
              setCategory(value === "income" ? incomeCategoriesFor(profileType)[0].id : "bills");
            }} className={`interactive-button min-h-10 rounded-lg text-xs font-bold ${type === value ? "bg-white text-ink-900 shadow-sm" : "text-slate-500"}`}>{label}</button>
          ))}
        </fieldset>
        <label className="grid gap-2 text-xs font-semibold text-slate-600">{type === "income" ? "Income name" : business ? "Cost name" : "Payment name"}<input autoFocus value={description} onChange={(event) => setDescription(event.target.value)} className={input} placeholder={type === "income" ? "e.g. Paycheque" : business ? "e.g. Accounting software" : "e.g. Internet"} required /></label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} className={input} type="number" min="0.01" step="0.01" inputMode="decimal" placeholder={`${currency} 0.00`} required /></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Frequency<select value={frequency} onChange={(event) => setFrequency(event.target.value)} className={input}>{RECURRENCE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Account<select value={accountId} onChange={(event) => setAccountId(event.target.value)} className={input} required>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">End date <span className="font-normal text-slate-400">(optional)</span><input value={endDate} onChange={(event) => setEndDate(event.target.value)} min={startDate} className={input} type="date" /></label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">First due date<input value={startDate} onChange={(event) => setStartDate(event.target.value)} className={input} type="date" required /></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className={input}>{visibleCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-slate-400">Schedules appear on the planning calendar. Record the real transaction when money actually arrives or leaves so the budget stays based on actual income.</p>
        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary">{schedule ? "Save changes" : "Save schedule"}</Button></div>
      </form>
    </ModalShell>
  );
}
