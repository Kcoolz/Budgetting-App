import { ArrowRight, Target } from "lucide-react";
import { Link } from "react-router";
import { formatMoney, sum } from "../lib/budget";
import Card from "./ui/Card";

export default function OverviewGoalsCard({ goals, currency }) {
  const saved = sum(goals.map(({ saved: amount }) => amount));
  const target = sum(goals.map(({ target: amount }) => amount));
  const nextGoal = [...goals].filter(({ remaining }) => remaining > 0).sort((a, b) => {
    const aDate = a.deadline ?? a.targetDate ?? "9999-12-31";
    const bDate = b.deadline ?? b.targetDate ?? "9999-12-31";
    return aDate.localeCompare(bDate) || b.percent - a.percent;
  })[0];
  const percent = target ? saved / target * 100 : 0;

  return (
    <Card className="relative h-full overflow-hidden p-5 sm:p-6">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-violet-400" aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <div><p className="eyebrow">Savings snapshot</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Goals in motion</h2></div>
        <span className="grid size-9 place-items-center rounded-xl bg-forest-50 text-forest-700"><Target className="size-4" /></span>
      </div>
      {goals.length ? (
        <>
          <div className="mt-5 grid grid-cols-[72px_1fr] items-center gap-4 rounded-xl bg-gradient-to-br from-forest-50 to-violet-50/60 p-4">
            <span className="grid size-[72px] place-items-center rounded-full" style={{ background: `conic-gradient(#3478b8 ${Math.min(percent, 100)}%, #dbeafe 0)` }}><span className="grid size-14 place-items-center rounded-full bg-white text-[11px] font-extrabold text-forest-800 shadow-sm">{Math.round(percent)}%</span></span>
            <span><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total saved</span><strong className="mt-1 block font-display text-2xl font-normal">{formatMoney(saved, currency, { whole: true })}</strong><span className="mt-1 block text-[9px] text-slate-400">of {formatMoney(target, currency, { whole: true })}</span></span>
          </div>
          {nextGoal && <div className="mt-4 flex items-center gap-3"><div className="min-w-0 flex-1"><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Next focus</span><strong className="mt-1 block truncate text-xs">{nextGoal.name}</strong></div><span className="text-right text-[10px] text-slate-400"><strong className="block text-xs text-ink-900">{formatMoney(nextGoal.remaining, currency, { whole: true })}</strong>remaining</span></div>}
        </>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center text-[11px] text-slate-400">Create a goal to track your savings direction.</p>
      )}
      <Link to="/goals" className="interactive-button mt-5 flex items-center justify-between border-t border-black/5 pt-4 text-xs font-bold text-forest-700 hover:text-forest-900">Manage savings goals <ArrowRight className="size-4" /></Link>
    </Card>
  );
}
