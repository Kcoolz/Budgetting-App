import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function DebtModal({ open, debt, accounts = [], balances = {}, onClose, onSave, currency }) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(debt?.name ?? "");
    setBalance(debt?.balance ?? "");
    setApr(debt?.apr ?? "");
    setMinimumPayment(debt?.minimumPayment ?? "");
    setAccountId(debt?.accountId ?? "");
    setError("");
  }, [open, debt]);

  const submit = (event) => {
    event.preventDefault();
    const values = { balance: Number(balance), apr: Number(apr), minimumPayment: Number(minimumPayment) };
    if (!name.trim() || !Number.isFinite(values.balance) || values.balance <= 0 || !Number.isFinite(values.apr) || values.apr < 0 || values.apr > 100 || !Number.isFinite(values.minimumPayment) || values.minimumPayment <= 0) {
      setError("Enter a name, positive balance and minimum payment, and an APR from 0% to 100%.");
      return;
    }
    onSave({ ...debt, accountId: accountId || null, name: name.trim(), ...values });
  };

  const input = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Debt payoff" title={debt ? "Edit credit card" : "Add a credit card"}>
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-forest-50 p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-forest-800"><CreditCard className="size-4" /></span>
          <p className="text-xs leading-relaxed text-slate-500">Use the statement balance, annual interest rate, and required monthly minimum. This information stays on your device.</p>
        </div>
        {accounts.length > 0 && (
          <label className="mb-4 grid gap-2 text-xs font-semibold text-slate-600">Linked account
            <select value={accountId} onChange={(event) => {
              const value = event.target.value;
              setAccountId(value);
              const account = accounts.find(({ id }) => id === value);
              if (account) {
                setName(account.name);
                setBalance(String(Math.max(-(balances[account.id] ?? 0), 0)));
              }
            }} className={input}>
              <option value="">Create a new credit-card account</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
            <span className="font-normal leading-relaxed text-slate-400">Linking keeps the payoff balance synchronized with Accounts.</span>
          </label>
        )}
        <label className="grid gap-2 text-xs font-semibold text-slate-600">Card name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} className={input} placeholder="e.g. Rewards Visa" required /></label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Current balance<input value={balance} onChange={(event) => setBalance(event.target.value)} className={input} type="number" min="0.01" step="0.01" inputMode="decimal" placeholder={`${currency} 0.00`} required /></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">APR<input value={apr} onChange={(event) => setApr(event.target.value)} className={input} type="number" min="0" max="100" step="0.01" inputMode="decimal" placeholder="19.99%" required /></label>
        </div>
        <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">Minimum monthly payment<input value={minimumPayment} onChange={(event) => setMinimumPayment(event.target.value)} className={input} type="number" min="0.01" step="0.01" inputMode="decimal" placeholder={`${currency} 0.00`} required /></label>
        {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700" role="alert">{error}</p>}
        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary">{debt ? "Save changes" : "Add card"}</Button></div>
      </form>
    </ModalShell>
  );
}
