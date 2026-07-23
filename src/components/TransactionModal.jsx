import { useEffect, useState } from "react";
import { Plus, Repeat2, Trash2 } from "lucide-react";
import {
  RECURRENCE_OPTIONS,
  dateForMonth,
  expenseCategoriesFor,
  expenseSubcategoriesFor,
  guessSubcategory,
  incomeCategoriesFor
} from "../lib/budget";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

function currencySymbol(currency) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency })
    .formatToParts(0)
    .find(({ type }) => type === "currency")?.value ?? "$";
}

export default function TransactionModal({ open, transaction, defaultType = "expense", onClose, onSave, onTransfer, currency, selectedMonth, accounts = [], categories: providedCategories, subcategories: providedSubcategories, tags = [], profileType = "personal" }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(dateForMonth(selectedMonth));
  const [category, setCategory] = useState("housing");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [cleared, setCleared] = useState(true);
  const [frequency, setFrequency] = useState("monthly");
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splits, setSplits] = useState([]);
  const expenseCategories = providedCategories ?? expenseCategoriesFor(profileType);
  const incomeCategories = incomeCategoriesFor(profileType);
  const categories = type === "income" ? incomeCategories : expenseCategories;
  const allSubcategories = providedSubcategories ?? expenseSubcategoriesFor(profileType);
  const subcategories = allSubcategories.filter((item) => item.category === category);

  useEffect(() => {
    if (!open) return;
    const nextType = transaction?.type ?? defaultType;
    setType(nextType);
    setAmount(transaction?.amount ?? "");
    setDate(transaction?.date ?? dateForMonth(selectedMonth));
    setCategory(transaction?.category ?? (nextType === "income" ? incomeCategoriesFor(profileType)[0].id : expenseCategoriesFor(profileType)[0].id));
    setSubcategory(transaction?.subcategory ?? "");
    setDescription(transaction?.description ?? "");
    setAccountId(transaction?.accountId ?? accounts[0]?.id ?? "");
    setRecurring(false);
    setCleared(transaction?.cleared !== false);
    setFrequency("monthly");
    setNotes(transaction?.notes ?? "");
    setSelectedTags(transaction?.tags ?? []);
    setSplitEnabled(Boolean(transaction?.splits?.length));
    setSplits(transaction?.splits?.length ? transaction.splits : [
      { id: "split-1", category: nextType === "expense" ? expenseCategories[0]?.id : "", amount: "" },
      { id: "split-2", category: nextType === "expense" ? expenseCategories[1]?.id ?? expenseCategories[0]?.id : "", amount: "" }
    ]);
  }, [open, transaction, defaultType, selectedMonth, accounts, profileType, providedCategories]);

  const submit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !description.trim()) return;
    const normalizedSplits = type === "expense" && splitEnabled
      ? splits.map((split) => ({ ...split, amount: Number(split.amount) })).filter((split) => split.amount > 0)
      : [];
    if (splitEnabled && (normalizedSplits.length < 2 || Math.abs(normalizedSplits.reduce((total, split) => total + split.amount, 0) - numericAmount) >= 0.01)) return;
    onSave({
      ...(transaction ? { id: transaction.id, reviewed: transaction.reviewed, recurringId: transaction.recurringId } : {}),
      type,
      amount: numericAmount,
      date,
      category,
      description: description.trim(),
      accountId,
      cleared,
      notes: notes.trim(),
      tags: selectedTags,
      splits: normalizedSplits,
      ...(type === "expense" ? { subcategory: subcategory || guessSubcategory(description, category, profileType) } : {}),
      recurrence: !transaction && recurring ? frequency : null
    });
  };

  const inputClass = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm text-ink-900 outline-none transition-all focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";

  return (
    <ModalShell open={open} onClose={onClose} eyebrow={transaction ? "Correct activity" : "New activity"} title={transaction ? "Edit transaction" : "Add activity"}>
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <fieldset className={`grid gap-1 rounded-xl bg-slate-100 p-1 ${transaction ? "grid-cols-2" : "grid-cols-3"}`}>
          <legend className="sr-only">Transaction type</legend>
          {["expense", "income"].map((value) => (
            <label key={value} className="cursor-pointer">
              <input className="peer sr-only" type="radio" name="type" value={value} checked={type === value} onChange={() => {
                setType(value);
                setCategory(value === "income" ? incomeCategories[0].id : expenseCategories[0].id);
                setSubcategory("");
              }} />
              <span className="grid min-h-10 place-items-center rounded-lg text-xs font-bold capitalize text-slate-500 transition-all peer-checked:bg-white peer-checked:text-ink-900 peer-checked:shadow-sm">{value}</span>
            </label>
          ))}
          {!transaction && <button type="button" onClick={onTransfer} className="interactive-button flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-white hover:text-ink-900 hover:shadow-sm"><Repeat2 className="size-3.5" /> Transfer</button>}
        </fieldset>

        <label className="mt-5 grid gap-2 text-xs font-semibold text-slate-600">
          Amount
          <span className="flex items-center rounded-xl border border-black/8 focus-within:border-forest-700/30 focus-within:ring-4 focus-within:ring-forest-700/10">
            <span className="pl-4 font-display text-2xl text-slate-400">{currencySymbol(currency)}</span>
            <input autoFocus value={amount} onChange={(event) => setAmount(event.target.value)} className="min-h-14 min-w-0 flex-1 border-0 bg-transparent px-3 font-display text-2xl outline-none" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" required />
          </span>
        </label>

        <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
          Account
          <select value={accountId} onChange={(event) => setAccountId(event.target.value)} className={inputClass} required>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </label>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-black/5 bg-slate-50/70 p-3.5">
          <input type="checkbox" checked={cleared} onChange={(event) => setCleared(event.target.checked)} className="size-4 accent-forest-800" />
          <span className="flex-1"><strong className="block text-xs">Cleared by the account</strong><span className="mt-0.5 block text-[10px] font-normal text-slate-400">Turn this off for pending or expected activity.</span></span>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">
            Date
            <input value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} type="date" required />
          </label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">
            Category
            <select value={category} onChange={(event) => {
              setCategory(event.target.value);
              setSubcategory("");
            }} className={inputClass} required>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        </div>

        {type === "expense" && (
          <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
            Spending detail
            <select value={subcategory} onChange={(event) => setSubcategory(event.target.value)} className={inputClass}>
              <option value="">Choose automatically from description</option>
              {subcategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        )}

        <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
          Description
          <input value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} maxLength="80" placeholder="e.g. Weekly groceries" required />
        </label>

        {type === "expense" && (
          <div className="mt-4 rounded-xl border border-black/5 bg-slate-50/70 p-3.5">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={splitEnabled} onChange={(event) => setSplitEnabled(event.target.checked)} className="size-4 accent-forest-800" />
              <span className="flex-1"><strong className="block text-xs">Split across categories</strong><span className="mt-0.5 block text-[10px] font-normal text-slate-400">The split amounts must equal the transaction total.</span></span>
            </label>
            {splitEnabled && (
              <div className="mt-3 grid gap-2 border-t border-black/5 pt-3">
                {splits.map((split, index) => (
                  <div key={split.id} className="grid grid-cols-[minmax(0,1fr)_110px_32px] gap-2">
                    <select value={split.category} onChange={(event) => setSplits((current) => current.map((item) => item.id === split.id ? { ...item, category: event.target.value } : item))} className={inputClass}>
                      {expenseCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    <input value={split.amount} onChange={(event) => setSplits((current) => current.map((item) => item.id === split.id ? { ...item, amount: event.target.value } : item))} className={inputClass} type="number" min="0.01" step="0.01" placeholder="0.00" aria-label={`Split ${index + 1} amount`} />
                    <button type="button" onClick={() => setSplits((current) => current.filter((item) => item.id !== split.id))} disabled={splits.length <= 2} className="grid size-8 place-items-center self-center rounded-lg text-slate-400 enabled:hover:bg-rose-50 enabled:hover:text-rose-600 disabled:opacity-25" aria-label={`Remove split ${index + 1}`}><Trash2 className="size-3.5" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setSplits((current) => [...current, { id: `split-${Date.now()}`, category: expenseCategories[0]?.id, amount: "" }])} className="interactive-button flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-[11px] font-bold text-slate-500 hover:bg-white"><Plus className="size-3.5" /> Add split</button>
                <p className={`text-[10px] font-semibold ${Math.abs(splits.reduce((total, split) => total + Number(split.amount || 0), 0) - Number(amount || 0)) < 0.01 ? "text-emerald-700" : "text-orange-600"}`}>
                  Assigned {splits.reduce((total, split) => total + Number(split.amount || 0), 0).toFixed(2)} of {Number(amount || 0).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {tags.length > 0 && (
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-slate-600">Tags</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => <label key={tag.id} className={`cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold ${selectedTags.includes(tag.id) ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-500"}`}><input type="checkbox" className="sr-only" checked={selectedTags.includes(tag.id)} onChange={() => setSelectedTags((current) => current.includes(tag.id) ? current.filter((id) => id !== tag.id) : [...current, tag.id])} />#{tag.name}</label>)}
            </div>
          </fieldset>
        )}

        <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
          Notes <span className="font-normal text-slate-400">(optional)</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className={`${inputClass} min-h-20 py-3`} maxLength="500" placeholder="Add context for later" />
        </label>

        {!transaction && <div className="mt-4 rounded-xl border border-black/5 bg-slate-50/70 p-3.5">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} className="size-4 accent-forest-800" />
              <span className="grid size-8 place-items-center rounded-lg bg-forest-50 text-forest-700"><Repeat2 className="size-3.5" /></span>
              <span className="flex-1"><strong className="block text-xs">This repeats on a schedule</strong><span className="mt-0.5 block text-[10px] font-normal text-slate-400">Create a calendar schedule from this transaction.</span></span>
            </label>
            {recurring && (
              <label className="mt-3 grid gap-2 border-t border-black/5 pt-3 text-xs font-semibold text-slate-600">
                Repeats
                <select value={frequency} onChange={(event) => setFrequency(event.target.value)} className={inputClass}>
                  {RECURRENCE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
              </label>
            )}
          </div>}

        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{transaction ? "Save changes" : "Save transaction"}</Button>
        </div>
      </form>
    </ModalShell>
  );
}
