import { useEffect, useState } from "react";
import { dateForMonth, formatMoney } from "../lib/budget";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function TransferModal({ open, accounts, balances, currency, selectedMonth, onClose, onSave }) {
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(dateForMonth(selectedMonth));
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setFromAccountId(accounts[0]?.id ?? "");
    setToAccountId(accounts[1]?.id ?? "");
    setAmount("");
    setDate(dateForMonth(selectedMonth));
    setDescription("");
  }, [open, accounts, selectedMonth]);

  const submit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!fromAccountId || !toAccountId || fromAccountId === toAccountId || !Number.isFinite(numericAmount) || numericAmount <= 0) return;
    onSave({
      fromAccountId,
      toAccountId,
      amount: numericAmount,
      date,
      description: description.trim() || "Transfer"
    });
  };

  const inputClass = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm text-ink-900 outline-none transition-all focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";
  const options = (excludedId) => accounts.filter(({ id }) => id !== excludedId).map((account) => (
    <option key={account.id} value={account.id}>{account.name} · {formatMoney(balances[account.id] ?? 0, currency)}</option>
  ));

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Move money" title="Transfer between accounts">
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">
            From
            <select value={fromAccountId} onChange={(event) => {
              const value = event.target.value;
              setFromAccountId(value);
              if (value === toAccountId) setToAccountId(accounts.find(({ id }) => id !== value)?.id ?? "");
            }} className={inputClass} required>{options(toAccountId)}</select>
          </label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">
            To
            <select value={toAccountId} onChange={(event) => setToAccountId(event.target.value)} className={inputClass} required>{options(fromAccountId)}</select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">
            Amount
            <input autoFocus value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" required />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">
            Date
            <input value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} type="date" required />
          </label>
        </div>

        <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
          Note <span className="font-normal text-slate-400">optional</span>
          <input value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} maxLength="80" placeholder="e.g. Credit card payment" />
        </label>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-[11px] leading-relaxed text-blue-800">Transfers update account balances but are not counted as income or spending.</div>

        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save transfer</Button>
        </div>
      </form>
    </ModalShell>
  );
}
