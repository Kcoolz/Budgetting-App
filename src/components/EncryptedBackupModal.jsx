import { useEffect, useState } from "react";
import { Download, LockKeyhole, Upload } from "lucide-react";
import { decryptBackup, encryptBackup, summarizeBackup } from "../lib/backup";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function EncryptedBackupModal({ mode, profileBackup, onClose, onExport, onRestore }) {
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!mode) return;
    setPassword("");
    setFile(null);
    setPreview(null);
    setDecoded(null);
    setError("");
  }, [mode]);
  const processImport = async () => {
    if (!file || !password) return;
    setBusy(true);
    try {
      const value = await decryptBackup(await file.text(), password);
      if (!Array.isArray(value?.profiles)) throw new Error("The backup does not contain Cloud profiles.");
      setDecoded(value);
      setPreview(summarizeBackup(value));
      setError("");
    } catch (reason) {
      setError(reason.message);
      setDecoded(null);
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };
  const exportBackup = async () => {
    setBusy(true);
    try {
      const text = await encryptBackup({ format: "cloud-budget-profiles", ...profileBackup }, password);
      onExport(text);
      onClose();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };
  const input = "min-h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";
  return (
    <ModalShell open={Boolean(mode)} onClose={onClose} eyebrow="Private backup" title={mode === "export" ? "Create an encrypted backup" : "Restore an encrypted backup"}>
      <div className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <div className="flex gap-3 rounded-2xl bg-forest-50 p-4"><LockKeyhole className="size-5 shrink-0 text-forest-700" /><p className="text-[11px] leading-relaxed text-slate-600">The password encrypts the file in this browser. Cloud cannot recover it if you forget it.</p></div>
        {mode === "import" && <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">Encrypted backup file<input type="file" accept=".cloudbackup,.json,application/json" onChange={(event) => { setFile(event.target.files[0] ?? null); setPreview(null); }} className={input} /></label>}
        <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">Backup password<input autoFocus value={password} onChange={(event) => { setPassword(event.target.value); setPreview(null); }} className={input} type="password" minLength="8" autoComplete="new-password" placeholder="At least 8 characters" /></label>
        {preview && <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-blue-50 p-4 text-xs sm:grid-cols-4">{Object.entries(preview).map(([label, value]) => <div key={label}><strong className="block text-base text-blue-950">{value}</strong><span className="capitalize text-blue-700">{label}</span></div>)}</div>}
        {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</p>}
        <div className="mt-7 flex flex-wrap justify-end gap-2 border-t border-black/5 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          {mode === "export" ? <Button type="button" variant="primary" disabled={busy || password.length < 8} onClick={exportBackup}><Download className="size-4" /> Download encrypted backup</Button> : preview ? <Button type="button" variant="primary" onClick={() => onRestore(decoded)}><Upload className="size-4" /> Replace with this backup</Button> : <Button type="button" variant="primary" disabled={busy || !file || password.length < 8} onClick={processImport}>Preview backup</Button>}
        </div>
      </div>
    </ModalShell>
  );
}
