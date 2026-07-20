import { useEffect, useState } from "react";
import { Building2, Copy, Sparkles, UserRound } from "lucide-react";
import { DEFAULT_PROFILE_COLOR, PROFILE_COLORS } from "../lib/profiles";
import Button from "./ui/Button";
import ModalShell from "./ui/ModalShell";

export default function ProfileModal({ open, profile, activeProfile, onClose, onSave }) {
  const editing = Boolean(profile);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_PROFILE_COLOR);
  const [type, setType] = useState("personal");
  const [copyCurrent, setCopyCurrent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(profile?.name ?? "");
    setColor(profile?.color ?? DEFAULT_PROFILE_COLOR);
    setType(profile?.type ?? "personal");
    setCopyCurrent(false);
  }, [open, profile]);

  const submit = (event) => {
    event.preventDefault();
    const value = name.trim();
    if (!value) return;
    onSave({ name: value, color, type, copyCurrent });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      eyebrow={editing ? "Profile details" : "New space"}
      title={editing ? "Edit profile" : "Create a profile"}
    >
      <form onSubmit={submit} className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7">
        {!editing && (
          <fieldset className="mb-6">
            <legend className="text-xs font-semibold text-slate-600">Profile type</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setType("personal")} className={`interactive-button rounded-xl border p-4 text-left ${type === "personal" ? "border-forest-700/30 bg-forest-50" : "border-black/8 hover:bg-slate-50"}`}>
                <UserRound className="size-4 text-forest-700" /><strong className="mt-3 block text-xs">Personal</strong><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">Everyday budgets, savings goals, and household bills.</span>
              </button>
              <button type="button" onClick={() => { setType("business"); if (color === DEFAULT_PROFILE_COLOR) setColor("emerald"); }} className={`interactive-button rounded-xl border p-4 text-left ${type === "business" ? "border-teal-700/30 bg-teal-50" : "border-black/8 hover:bg-slate-50"}`}>
                <Building2 className="size-4 text-teal-700" /><strong className="mt-3 block text-xs">Business</strong><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">Revenue, profit, tax planning, and operating costs.</span>
              </button>
            </div>
          </fieldset>
        )}
        <label className="grid gap-2 text-xs font-semibold text-slate-600">
          Profile name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-11 rounded-xl border border-black/8 bg-white px-3 text-sm text-ink-900 outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10"
            maxLength="32"
            placeholder="Personal, Household, Side business..."
            autoFocus
            required
          />
        </label>

        <fieldset className="mt-6">
          <legend className="text-xs font-semibold text-slate-600">Profile colour</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROFILE_COLORS.map((option) => (
              <label key={option.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="profile-color"
                  value={option.id}
                  checked={color === option.id}
                  onChange={() => setColor(option.id)}
                  className="peer sr-only"
                />
                <span
                  className="grid size-10 place-items-center rounded-xl border-2 border-transparent transition-transform hover:-translate-y-px peer-checked:border-ink-900 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-forest-700/30"
                  style={{ backgroundColor: option.soft }}
                  title={option.label}
                >
                  <span className="size-3 rounded-full" style={{ backgroundColor: option.accent }} />
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {!editing && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-600">Starting point</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCopyCurrent(false)}
                className={`interactive-button rounded-xl border p-4 text-left ${!copyCurrent ? "border-forest-700/30 bg-forest-50" : "border-black/8 hover:bg-slate-50"}`}
              >
                <Sparkles className="size-4 text-forest-700" />
                <strong className="mt-3 block text-xs">Start fresh</strong>
                <span className="mt-1 block text-[10px] leading-relaxed text-slate-500">An empty budget with the default categories.</span>
              </button>
              <button
                type="button"
                onClick={() => setCopyCurrent(true)}
                className={`interactive-button rounded-xl border p-4 text-left ${copyCurrent ? "border-forest-700/30 bg-forest-50" : "border-black/8 hover:bg-slate-50"}`}
              >
                <Copy className="size-4 text-forest-700" />
                <strong className="mt-3 block text-xs">Copy {activeProfile.name}</strong>
                <span className="mt-1 block text-[10px] leading-relaxed text-slate-500">Duplicate its transactions, plans, goals, and settings.</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-7 flex justify-end gap-2 border-t border-black/5 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{editing ? "Save profile" : "Create profile"}</Button>
        </div>
      </form>
    </ModalShell>
  );
}
