import { Gauge, Home, ReceiptText, Repeat2, WalletCards } from "lucide-react";
import { Link } from "react-router";
import { expenseCategoriesFor, formatMoney, monthlyRecurringAmount, sum } from "../lib/budget";
import Card from "./ui/Card";

const fixedCategoryIds = ["housing", "bills"];

export default function BillsFocusCard({ bills, budgets, spending, currency, profileType = "personal" }) {
  const business = profileType === "business";
  const categories = expenseCategoriesFor(profileType);
  const activeBills = bills.filter((bill) => bill.active !== false && bill.type !== "income");
  const monthlyScheduled = sum(activeBills.map(monthlyRecurringAmount));
  const fixedBudget = sum(fixedCategoryIds.map((id) => budgets[id]));
  const fixedSpent = sum(fixedCategoryIds.map((id) => spending[id]));
  const fixedRemaining = fixedBudget - fixedSpent;
  const totalBudget = sum(Object.values(budgets));
  const commitmentPercent = totalBudget ? monthlyScheduled / totalBudget * 100 : 0;

  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">{business ? "Operating baseline" : "Bills first"}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{business ? "Overhead before growth" : "Commitments before choices"}</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{business ? "See workspace, software, and scheduled operating costs before allocating money to growth." : "See housing, utilities, and scheduled payments before deciding what is available for flexible spending."}</p>
        </div>
        <Link to="/recurring" className="interactive-button inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-black/8 bg-white px-4 text-sm font-semibold text-ink-900 hover:-translate-y-px hover:border-forest-700/25 hover:bg-forest-50">
          Manage schedules
        </Link>
      </div>

      <dl className="mt-6 grid gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl bg-forest-50 p-4">
          <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500"><ReceiptText className="size-3.5 text-forest-700" /> Fixed spending</dt>
          <dd className="mt-2 font-display text-2xl">{formatMoney(fixedSpent, currency)}</dd>
          <span className="mt-1 block text-[10px] text-slate-400">of {formatMoney(fixedBudget, currency)} planned</span>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500"><Repeat2 className="size-3.5 text-forest-700" /> Monthly schedules</dt>
          <dd className="mt-2 font-display text-2xl">{formatMoney(monthlyScheduled, currency)}</dd>
          <span className="mt-1 block text-[10px] text-slate-400">estimated recurring cost</span>
        </div>
        <div className={`rounded-2xl p-4 ${fixedRemaining < 0 ? "bg-rose-50" : "bg-forest-50"}`}>
          <dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500"><WalletCards className={`size-3.5 ${fixedRemaining < 0 ? "text-rose-600" : "text-forest-700"}`} /> Bills budget left</dt>
          <dd className={`mt-2 font-display text-2xl ${fixedRemaining < 0 ? "text-rose-700" : ""}`}>{formatMoney(fixedRemaining, currency)}</dd>
          <span className="mt-1 block text-[10px] text-slate-400">after fixed spending this month</span>
        </div>
      </dl>

      <div className="mt-6 grid gap-6 border-t border-black/5 pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.65fr)]">
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Fixed categories</p>
          <div className="grid gap-5">
            {fixedCategoryIds.map((id) => {
              const category = categories.find((item) => item.id === id);
              const budget = Number(budgets[id]) || 0;
              const spent = Number(spending[id]) || 0;
              const percent = budget > 0 ? spent / budget * 100 : spent > 0 ? 100 : 0;
              const over = budget > 0 && percent > 100;
              return (
                <article key={id}>
                  <div className="mb-2 flex items-center gap-2 text-xs">
                    <span className="grid size-7 place-items-center rounded-lg bg-forest-50 text-forest-700">{id === "housing" ? <Home className="size-3.5" /> : <ReceiptText className="size-3.5" />}</span>
                    <strong className="flex-1">{category.name}</strong>
                    <span className={over ? "font-semibold text-rose-600" : "text-slate-500"}>{formatMoney(spent, currency)} of {formatMoney(budget, currency)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <span className={`block h-full rounded-full transition-all duration-500 ${over ? "bg-rose-400" : percent >= 70 ? "bg-amber-400" : "bg-forest-700"}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50/70 p-4 sm:p-5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Gauge className="size-3.5 text-forest-700" /> Commitment load</p>
          <strong className="mt-4 block font-display text-3xl font-normal">{Math.round(commitmentPercent)}%</strong>
          <p className="mt-1 text-[10px] leading-relaxed text-slate-500">of your category plan is represented by recurring schedules.</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white"><span className={`block h-full rounded-full ${commitmentPercent > 75 ? "bg-rose-400" : commitmentPercent > 50 ? "bg-orange-400" : "bg-forest-700"}`} style={{ width: `${Math.min(commitmentPercent, 100)}%` }} /></div>
          <p className="mt-4 border-t border-black/5 pt-4 text-[10px] leading-relaxed text-slate-400">Use this ratio to judge how much of the plan is flexible before changing discretionary limits.</p>
        </div>
      </div>
    </Card>
  );
}
