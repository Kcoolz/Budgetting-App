import { useEffect, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { createPrivacyLock, removePrivacyLock, verifyPrivacyPin } from "../lib/privacy";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function PrivacyLock({ mode, lockConfig, onClose, onUnlocked, onChanged }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setPin("");
    setConfirmPin("");
    setError("");
  }, [mode]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "setup") {
        if (pin !== confirmPin) throw new Error("The PINs do not match.");
        const value = await createPrivacyLock(pin);
        onChanged(value);
      } else {
        const valid = await verifyPrivacyPin(pin, lockConfig);
        if (!valid) throw new Error("That PIN is not correct.");
        if (mode === "remove") {
          removePrivacyLock();
          onChanged(null);
        } else {
          onUnlocked();
        }
      }
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };

  const content = (
    <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
      <div className="flex gap-3 rounded-2xl bg-forest-50 p-4">
        <ShieldCheck className="size-5 shrink-0 text-forest-700" />
        <p className="text-[11px] leading-relaxed text-slate-600">This device-only PIN helps with casual privacy. It is not a replacement for your device password or an encrypted backup.</p>
      </div>
      <label className="mt-5 grid gap-2 text-xs font-semibold text-slate-600">
        {mode === "setup" ? "New PIN" : "PIN"}
        <input autoFocus value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 12))} type="password" inputMode="numeric" autoComplete={mode === "unlock" ? "current-password" : "new-password"} className="min-h-12 rounded-xl border border-black/8 bg-white px-4 text-center text-lg tracking-[0.35em] outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10" minLength="4" required />
      </label>
      {mode === "setup" && <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">Confirm PIN<input value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 12))} type="password" inputMode="numeric" autoComplete="new-password" className="min-h-12 rounded-xl border border-black/8 bg-white px-4 text-center text-lg tracking-[0.35em] outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10" minLength="4" required /></label>}
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700" role="alert">{error}</p>}
      <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5">
        {mode !== "unlock" && <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>}
        <Button type="submit" variant={mode === "remove" ? "danger" : "primary"} disabled={busy || pin.length < 4 || (mode === "setup" && confirmPin.length < 4)}>
          <LockKeyhole className="size-4" /> {mode === "setup" ? "Turn on app lock" : mode === "remove" ? "Remove app lock" : "Unlock Cloud"}
        </Button>
      </div>
    </form>
  );

  if (mode === "unlock") {
    return <div className="privacy-lock-screen fixed inset-0 z-[100] grid place-items-center bg-[#f5f3ee] p-4"><div className="w-full max-w-md rounded-3xl border border-black/5 bg-white shadow-2xl"><div className="px-7 pt-8 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-forest-900 text-white"><LockKeyhole className="size-5" /></span><p className="eyebrow mt-5">Private local planner</p><h1 className="mt-2 text-2xl font-semibold">Cloud is locked</h1></div>{content}</div></div>;
  }
  return <ModalShell open={Boolean(mode)} onClose={onClose} eyebrow="Device privacy" title={mode === "setup" ? "Add a local app lock" : "Remove the app lock"}>{content}</ModalShell>;
}
