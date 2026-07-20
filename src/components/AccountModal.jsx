import { useEffect, useState } from "react";
import { ACCOUNT_TYPES, getAccountType } from "../lib/accounts";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

function currencySymbol(currency) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency })
    .formatToParts(0)
    .find(({ type }) => type === "currency")?.value ?? "$";
}

export default function AccountModal({ open, account, onClose, onSave, currency, profileType = "personal" }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("checking");
  const [openingBalance, setOpeningBalance] = useState("");
  const liability = getAccountType(type).group === "liability";

  useEffect(() => {
    if (!open) return;
    setName(account?.name ?? "");
    setType(account?.type ?? "checking");
    setOpeningBalance(account ? String(Math.abs(Number(account.openingBalance) || 0)) : "");
  }, [open, account]);

  const submit = (event) => {
    event.preventDefault();
    const balance = Number(openingBalance || 0);
    if (!name.trim() || !Number.isFinite(balance) || balance < 0) return;
    onSave({
      ...(account ? { id: account.id } : {}),
      name: name.trim(),
      type,
      openingBalance: liability ? -balance : balance
    });
  };

  const inputClass = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm text-ink-900 outline-none transition-all focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";

  return (
    <ModalShell open={open} onClose={onClose} eyebrow={account ? "Account settings" : "New account"} title={account ? "Edit financial account" : `Add ${profileType === "business" ? "a business" : "an"} account`}>
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <label className="grid gap-2 text-xs font-semibold text-slate-600">
          Account name
          <input autoFocus value={name} onChange={(event) => setName(event.target.value)} className={inputClass} maxLength="48" placeholder={profileType === "business" ? "e.g. Operating account" : "e.g. Everyday checking"} required />
        </label>

        <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
          Account type
          <select value={type} onChange={(event) => setType(event.target.value)} className={inputClass}>
            <optgroup label="Money you own">
              {ACCOUNT_TYPES.filter(({ group }) => group === "asset").map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </optgroup>
            <optgroup label="Money you owe">
              {ACCOUNT_TYPES.filter(({ group }) => group === "liability").map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </optgroup>
          </select>
        </label>

        <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
          {liability ? "Starting amount owed" : "Starting balance"}
          <span className="flex items-center rounded-xl border border-black/8 focus-within:border-forest-700/30 focus-within:ring-4 focus-within:ring-forest-700/10">
            <span className="pl-4 font-display text-xl text-slate-400">{currencySymbol(currency)}</span>
            <input value={openingBalance} onChange={(event) => setOpeningBalance(event.target.value)} className="min-h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-base outline-none" type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" />
          </span>
        </label>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">Use the balance immediately before the activity you plan to record in Cloud. Later transactions and transfers will update it automatically.</p>

        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{account ? "Save changes" : "Add account"}</Button>
        </div>
      </form>
    </ModalShell>
  );
}
