import { useEffect, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { formatMoney } from "../lib/budget";
import { inspectCsv, parseTransactionFile, parseTransactionFileWithMapping, removeDuplicateTransactions } from "../lib/imports";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function TransactionImportModal({ open, onClose, onImport, onUndoImport, importHistory = [], accounts, existingTransactions, currency, profileType = "personal" }) {
  const [accountId, setAccountId] = useState("");
  const [fileName, setFileName] = useState("");
  const [rawTransactions, setRawTransactions] = useState([]);
  const [parsed, setParsed] = useState([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [error, setError] = useState("");
  const [rawText, setRawText] = useState("");
  const [csvInfo, setCsvInfo] = useState(null);
  const [showMapping, setShowMapping] = useState(false);
  const [mapping, setMapping] = useState({ date: "", description: "", amount: "", debit: "", credit: "" });

  useEffect(() => {
    if (!open) return;
    setAccountId(accounts[0]?.id ?? "");
    setFileName("");
    setRawTransactions([]);
    setParsed([]);
    setDuplicateCount(0);
    setError("");
    setRawText("");
    setCsvInfo(null);
    setShowMapping(false);
    setMapping({ date: "", description: "", amount: "", debit: "", credit: "" });
  }, [open, accounts]);

  const readFile = async (file) => {
    const text = await file.text();
    const csv = file.name.toLowerCase().endsWith(".csv");
    let inspected = null;
    try {
      if (csv) {
        setRawText(text);
        inspected = inspectCsv(text);
        setCsvInfo(inspected);
      }
      const imported = parseTransactionFile(file.name, text, profileType);
      const result = removeDuplicateTransactions(imported, existingTransactions, accountId || accounts[0]?.id);
      setFileName(file.name);
      setRawTransactions(imported);
      setParsed(result.transactions);
      setDuplicateCount(result.duplicateCount);
      setError("");
      setShowMapping(false);
    } catch (reason) {
      setFileName(file.name);
      setRawTransactions([]);
      setParsed([]);
      setDuplicateCount(0);
      setError(reason instanceof Error ? reason.message : "Cloud could not read that transaction file.");
      setShowMapping(csv);
      if (inspected) setMapping(suggestMapping(inspected.headers));
    }
  };

  const applyMapping = () => {
    try {
      const imported = parseTransactionFileWithMapping(rawText, mapping, profileType);
      const result = removeDuplicateTransactions(imported, existingTransactions, accountId || accounts[0]?.id);
      setRawTransactions(imported);
      setParsed(result.transactions);
      setDuplicateCount(result.duplicateCount);
      setError("");
    } catch (reason) {
      setError(reason.message);
    }
  };

  const changeAccount = (value) => {
    setAccountId(value);
    if (!rawTransactions.length) return;
    const result = removeDuplicateTransactions(rawTransactions, existingTransactions, value);
    setParsed(result.transactions);
    setDuplicateCount(result.duplicateCount);
  };

  const totalIncome = parsed.filter(({ type }) => type === "income").reduce((total, item) => total + item.amount, 0);
  const totalExpenses = parsed.filter(({ type }) => type === "expense").reduce((total, item) => total + item.amount, 0);

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Bring in activity" title="Import transactions" width="max-w-2xl">
      <div className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <label className="grid min-h-28 cursor-pointer place-items-center rounded-2xl border border-dashed border-forest-700/25 bg-forest-50/60 px-5 text-center hover:bg-forest-50">
            <input type="file" accept=".csv,.ofx,.qfx,text/csv,application/x-ofx" className="sr-only" onChange={(event) => {
              const [file] = event.target.files;
              event.target.value = "";
              if (file) readFile(file);
            }} />
            <span><Upload className="mx-auto size-5 text-forest-700" /><strong className="mt-2 block text-xs">{fileName || "Choose CSV, OFX, or QFX"}</strong><span className="mt-1 block text-[10px] font-normal text-slate-400">Your file is processed only in this browser.</span></span>
          </label>
          <label className="grid content-center gap-2 text-xs font-semibold text-slate-600">
            Import into account
            <select value={accountId} onChange={(event) => changeAccount(event.target.value)} className="min-h-11 rounded-xl border border-black/8 bg-white px-3 text-sm outline-none">
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
          </label>
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700" role="alert">{error}</p>}

        {showMapping && csvInfo && (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
            <strong className="text-xs text-blue-950">Map this CSV’s columns</strong>
            <p className="mt-1 text-[10px] text-blue-800/70">Choose which columns Cloud should use. This mapping is applied only to this file.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["date", "Date"],
                ["description", "Description"],
                ["amount", "Signed amount"],
                ["debit", "Debit"],
                ["credit", "Credit"]
              ].map(([field, label]) => <label key={field} className="grid gap-1 text-[10px] font-bold text-blue-900">{label}<select value={mapping[field]} onChange={(event) => setMapping({ ...mapping, [field]: event.target.value })} className="min-h-9 rounded-lg border border-blue-200 bg-white px-2 text-[10px]"><option value="">Not used</option>{csvInfo.headers.map((header, index) => <option key={`${header}-${index}`} value={index}>{header}</option>)}</select></label>)}
            </div>
            <Button type="button" className="mt-3" onClick={applyMapping}>Apply mapping</Button>
          </div>
        )}

        {(parsed.length > 0 || duplicateCount > 0) && (
          <div className="mt-5">
            <div className="grid gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-3"><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ready</span><strong className="mt-1 block text-sm">{parsed.length}</strong></div>
              <div className="rounded-xl bg-emerald-50 p-3"><span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Income</span><strong className="mt-1 block text-sm">{formatMoney(totalIncome, currency)}</strong></div>
              <div className="rounded-xl bg-orange-50 p-3"><span className="text-[9px] font-bold uppercase tracking-wider text-orange-700">Expenses</span><strong className="mt-1 block text-sm">{formatMoney(totalExpenses, currency)}</strong></div>
              <div className="rounded-xl bg-blue-50 p-3"><span className="text-[9px] font-bold uppercase tracking-wider text-blue-700">Duplicates skipped</span><strong className="mt-1 block text-sm">{duplicateCount}</strong></div>
            </div>
            {parsed.length > 0 && (
              <div className="mt-3 max-h-52 overflow-y-auto rounded-xl border border-black/5">
                {parsed.slice(0, 50).map((transaction, index) => (
                  <div key={`${transaction.date}-${transaction.description}-${index}`} className="flex items-center gap-3 border-b border-black/5 px-3 py-2.5 text-xs last:border-b-0">
                    <FileSpreadsheet className="size-3.5 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1"><strong className="block truncate">{transaction.description}</strong><span className="text-[9px] text-slate-400">{transaction.date}</span></span>
                    <strong className={transaction.type === "income" ? "text-emerald-700" : ""}>{transaction.type === "income" ? "+" : "−"}{formatMoney(transaction.amount, currency)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="primary" disabled={!parsed.length} onClick={() => onImport(parsed, { fileName })}>Import {parsed.length || ""} transaction{parsed.length === 1 ? "" : "s"}</Button>
        </div>

        {importHistory.length > 0 && (
          <details className="mt-5 border-t border-black/5 pt-4">
            <summary className="cursor-pointer text-[11px] font-bold text-slate-500">Recent imports ({importHistory.length})</summary>
            <div className="mt-2 grid gap-2">
              {[...importHistory].reverse().slice(0, 5).map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-[10px]"><span className="min-w-0 flex-1 truncate"><strong>{item.fileName}</strong> · {item.count} items · {item.date}</span>{index === 0 && <button type="button" onClick={() => onUndoImport(item.id)} className="font-bold text-rose-700">Undo import</button>}</div>)}
            </div>
          </details>
        )}
      </div>
    </ModalShell>
  );
}

function suggestMapping(headers) {
  const normalized = headers.map((header) => header.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const find = (...names) => {
    const index = normalized.findIndex((header) => names.includes(header));
    return index < 0 ? "" : String(index);
  };
  return {
    date: find("date", "transactiondate", "posteddate", "postingdate"),
    description: find("description", "payee", "merchant", "name", "memo", "details"),
    amount: find("amount", "transactionamount"),
    debit: find("debit", "withdrawal", "moneyout"),
    credit: find("credit", "deposit", "moneyin")
  };
}
