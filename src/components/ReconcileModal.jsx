import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { isLiabilityAccount } from "../lib/accounts";
import { formatMoney, localDate } from "../lib/budget";
import { getReconciliationSnapshot } from "../lib/planning";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function ReconcileModal({ open, account, state, onClose, onSave }) {
  const [date, setDate] = useState(localDate());
  const [statementBalance, setStatementBalance] = useState("");
  const [addAdjustment, setAddAdjustment] = useState(false);
  const liability = account ? isLiabilityAccount(account) : false;
  const internalBalance = statementBalance === "" ? 0 : liability ? -Math.abs(Number(statementBalance)) : Number(statementBalance);
  const snapshot = useMemo(
    () => account ? getReconciliationSnapshot(state, account.id, date, internalBalance) : null,
    [state, account, date, internalBalance]
  );
  const difference = snapshot?.difference ?? 0;

  useEffect(() => {
    if (!open) return;
    setDate(localDate());
    setStatementBalance("");
    setAddAdjustment(false);
  }, [open, account]);

  const submit = (event) => {
    event.preventDefault();
    if (!snapshot || statementBalance === "" || !Number.isFinite(Number(statementBalance))) return;
    onSave(snapshot, addAdjustment);
  };
  const input = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";
  const display = (value) => formatMoney(liability ? Math.abs(value) : value, state.currency);

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Statement check" title={`Reconcile ${account?.name ?? "account"}`}>
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Statement date<input autoFocus value={date} onChange={(event) => setDate(event.target.value)} className={input} type="date" required /></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-600">{liability ? "Statement amount owed" : "Statement ending balance"}<input value={statementBalance} onChange={(event) => setStatementBalance(event.target.value)} className={input} type="number" step="0.01" min={liability ? "0" : undefined} placeholder="0.00" required /></label>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Metric label="Cloud cleared" value={snapshot ? display(snapshot.clearedBalance) : "—"} />
          <Metric label="Statement" value={statementBalance === "" ? "—" : display(internalBalance)} />
          <Metric label="Difference" value={statementBalance === "" ? "—" : formatMoney(Math.abs(difference), state.currency)} tone={Math.abs(difference) < 0.005 ? "positive" : "warning"} />
        </div>

        {statementBalance !== "" && Math.abs(difference) < 0.005 ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="size-5" /><div><strong className="block text-xs">Everything matches</strong><span className="mt-0.5 block text-[10px]">Save this reconciliation as a verified checkpoint.</span></div></div>
        ) : statementBalance !== "" ? (
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-orange-200 bg-orange-50/70 p-4">
            <input type="checkbox" checked={addAdjustment} onChange={(event) => setAddAdjustment(event.target.checked)} className="mt-0.5 size-4 accent-forest-800" />
            <span><strong className="block text-xs">Add a balance adjustment</strong><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">This creates a cleared, budget-excluded adjustment so the account matches the statement. Leave it off if you want to find the missing transaction yourself.</span></span>
          </label>
        ) : null}

        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary">Save reconciliation</Button></div>
      </form>
    </ModalShell>
  );
}

function Metric({ label, value, tone = "default" }) {
  const toneClass = tone === "positive" ? "text-emerald-700" : tone === "warning" ? "text-orange-700" : "text-ink-900";
  return <div className="rounded-xl bg-slate-50 p-3"><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span><strong className={`mt-1 block truncate text-xs ${toneClass}`}>{value}</strong></div>;
}
