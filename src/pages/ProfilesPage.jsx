import { useRef } from "react";
import { ArrowRight, Building2, Check, Download, Pencil, Plus, ShieldCheck, Trash2, Upload, UsersRound } from "lucide-react";
import PageIntro from "../components/PageIntro";
import ProfileAvatar from "../components/ProfileAvatar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

function profileStats(profile) {
  const budget = profile.budget;
  return [
    { value: budget.transactions.length, label: budget.transactions.length === 1 ? "transaction" : "transactions" },
    { value: budget.goals.length, label: budget.goals.length === 1 ? "goal" : "goals" },
    { value: budget.currency, label: "currency" }
  ];
}

export default function ProfilesPage({ profiles, activeProfile, onSwitch, onAdd, onEdit, onDelete, onExportAll, onImportAll }) {
  const fileInput = useRef(null);
  return (
    <>
      <PageIntro
        eyebrow="Budget profiles"
        title="A separate space for every plan."
        description="Keep personal, household, or side-project finances apart while using the same private app."
        action={<div className="flex flex-wrap gap-2">
          <input ref={fileInput} type="file" accept="application/json,.json" className="sr-only" onChange={(event) => {
            const [file] = event.target.files;
            event.target.value = "";
            if (file) onImportAll(file);
          }} />
          <Button onClick={() => fileInput.current?.click()}><Upload className="size-4" /> Restore all</Button>
          <Button onClick={onExportAll}><Download className="size-4" /> Backup all</Button>
          <Button variant="primary" onClick={onAdd}><Plus className="size-4" /> New profile</Button>
        </div>}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid content-start gap-3 sm:grid-cols-2">
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfile.id;
            return (
              <Card key={profile.id} as="article" className={`group p-5 ${isActive ? "ring-2 ring-forest-700/20" : ""}`}>
                <div className="flex items-start gap-3">
                  <ProfileAvatar profile={profile} className="size-12" textClassName="text-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-base font-semibold tracking-[-0.02em]">{profile.name}</h2>
                      {isActive && <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-forest-700"><Check className="size-3" /> Active</span>}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">{profile.type === "business" && <><Building2 className="size-3 text-teal-600" /> Business <span>·</span></>} Created {new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(new Date(`${profile.createdAt}T12:00:00`))}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(profile)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-forest-50 hover:text-forest-800" aria-label={`Edit ${profile.name}`}><Pencil className="size-3.5" /></button>
                    <button disabled={profiles.length === 1} onClick={() => onDelete(profile)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent" aria-label={`Delete ${profile.name}`}><Trash2 className="size-3.5" /></button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-y border-black/5 py-4">
                  {profileStats(profile).map((stat) => (
                    <div key={stat.label}>
                      <strong className="block text-sm">{stat.value}</strong>
                      <span className="mt-0.5 block truncate text-[9px] text-slate-400">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {isActive ? (
                  <div className="mt-4 flex min-h-10 items-center gap-2 text-xs font-semibold text-forest-700"><Check className="size-4" /> You are budgeting here</div>
                ) : (
                  <Button onClick={() => onSwitch(profile.id)} className="mt-4 w-full">Switch to profile <ArrowRight className="size-4" /></Button>
                )}
              </Card>
            );
          })}
        </div>

        <div className="grid content-start gap-4">
          <Card className="p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-forest-50 text-forest-700"><UsersRound className="size-4" /></span>
            <h2 className="mt-4 text-sm font-semibold">Independent budgets</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">Each profile has its own transactions, category limits, recurring bills, goals, debt plan, and dashboard layout.</p>
          </Card>
          <Card className="p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck className="size-4" /></span>
            <h2 className="mt-4 text-sm font-semibold">Still private by design</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">Profiles are stored only in this browser. They do not create online accounts or sync data between devices.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
