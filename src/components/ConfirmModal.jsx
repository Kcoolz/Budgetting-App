import { AlertTriangle } from "lucide-react";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function ConfirmModal({ confirmation, onClose }) {
  if (!confirmation) return null;
  return (
    <ModalShell open onClose={onClose} eyebrow="Please confirm" title={confirmation.title ?? "Are you sure?"}>
      <div className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        <div className="flex gap-3 rounded-2xl bg-rose-50 p-4 text-rose-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600" />
          <p className="text-xs leading-relaxed">{confirmation.message}</p>
        </div>
        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" onClick={() => {
            confirmation.onConfirm();
            onClose();
          }}>{confirmation.confirmLabel ?? "Delete"}</Button>
        </div>
      </div>
    </ModalShell>
  );
}
