import { ArrowRight, Banknote, Building2, Calculator, Percent, Plus, ReceiptText, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import OverviewDebtCard from "../components/OverviewDebtCard";
import {
  BUSINESS_EXPENSE_CATEGORIES,
  formatMoney,
  getTransactionSubcategory,
  monthlyRecurringAmount,
  shiftMonth,
  subcategoryName,
  sum
} from "../lib/budget";

function monthlyPerformance(transactions, endMonth, count = 6) {
  return Array.from({ length: count }, (_, index) => shiftMonth(endMonth, index - count + 1)).map((month) => {
    const monthTransactions = transactions.filter(({ date }) => date.startsWith(month));
    const revenue = sum(monthTransactions.filter(({ type }) => type === "income").map(({ amount }) => amount));
    const expenses = sum(monthTransactions.filter(({ type }) => type === "expense").map(({ amount }) => amount));
    return {
      month,
      label: new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(`${month}-01T12:00:00`)),
      revenue,
      expenses,
      profit: revenue - expenses
    };
  });
}

function MetricCard({ icon: Icon, label, value, detail, tone = "neutral" }) {
  const tones = {
    revenue: "border-teal-700/10 bg-gradient-to-br from-white to-teal-50 text-teal-800",
    expense: "border-orange-600/10 bg-gradient-to-br from-white to-orange-50 text-orange-700",
    profit: "border-slate-800/10 bg-[#102c2b] text-white shadow-[0_16px_35px_rgba(16,44,43,0.18)]",
    neutral: "border-slate-700/10 bg-white text-slate-800"
  };
  return (
    <article className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.11em] opacity-65"><span className={`grid size-7 place-items-center rounded-lg ${tone === "profit" ? "bg-white/10" : "bg-white shadow-sm"}`}><Icon className="size-3.5" /></span>{label}</div>
      <strong className="mt-4 block font-display text-[1.8rem] font-normal leading-none tracking-[-0.04em]">{value}</strong>
      <span className="mt-2 block text-[10px] opacity-55">{detail}</span>
    </article>
  );
}

export default function BusinessOverviewPage({ state, summary, selectedMonth, profile, debts, onAddTransaction, onManageBudget }) {
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(`${selectedMonth}-01T12:00:00`));
  const profit = summary.net;
  const margin = summary.income ? profit / summary.income * 100 : 0;
  const estimatedTaxRate = 20;
  const taxReserve = Math.max(profit, 0) * estimatedTaxRate / 100;
  const afterTaxReserve = profit - taxReserve;
  const performance = monthlyPerformance(state.transactions, selectedMonth);
  const chartMax = Math.max(...performance.flatMap(({ revenue, expenses }) => [revenue, expenses]), 1);
  const monthlyOverhead = sum(state.recurringBills.filter(({ active, type }) => active !== false && type !== "income").map(monthlyRecurringAmount));
  const unreviewed = state.transactions.filter(({ reviewed }) => reviewed === false).length;
  const expenseRows = BUSINESS_EXPENSE_CATEGORIES
    .map((category) => ({ ...category, amount: summary.categorySpending[category.id] ?? 0 }))
    .filter(({ amount }) => amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const recent = [...summary.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <>
      <section className="business-hero relative mb-4 overflow-hidden rounded-[28px] px-5 py-7 text-white shadow-[0_22px_60px_rgba(16,44,43,0.2)] sm:px-8 sm:py-9 lg:px-10">
        <span className="absolute -right-12 -top-20 size-56 rounded-full border border-teal-100/10 bg-teal-100/[0.04]" aria-hidden="true" />
        <div className="relative flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-[0.675rem] font-extrabold uppercase tracking-[0.15em] text-teal-200"><Building2 className="size-3.5" /> Business command centre</p>
            <h1 className="mt-2 max-w-3xl font-display text-[2.4rem] font-normal leading-[1.02] tracking-[-0.045em] sm:text-[3.15rem]">{profile.name}, at a glance.</h1>
            <p className="mt-3 max-w-2xl text-sm text-teal-50/65">A profit-first view of {monthLabel}: revenue, operating costs, margin, and the cash that needs a job.</p>
          </div>
          <div className="flex flex-wrap gap-2"><Button variant="heroGhost" onClick={onManageBudget}>Operating plan</Button><Button variant="heroPrimary" onClick={onAddTransaction}><Plus className="size-4" /> Add activity</Button></div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4" aria-label="Business performance summary">
        <MetricCard icon={Banknote} label="Revenue" value={formatMoney(summary.income, state.currency, { whole: true })} detail="earned this month" tone="revenue" />
        <MetricCard icon={ReceiptText} label="Operating costs" value={formatMoney(summary.expenses, state.currency, { whole: true })} detail="recorded expenses" tone="expense" />
        <MetricCard icon={TrendingUp} label="Net profit" value={formatMoney(profit, state.currency, { whole: true })} detail={profit >= 0 ? "before tax reserve" : "monthly loss"} tone="profit" />
        <MetricCard icon={Percent} label="Profit margin" value={`${Math.round(margin)}%`} detail="profit as a share of revenue" />
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-black/5 p-5 sm:p-6"><div><p className="eyebrow">Six-month performance</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Revenue against operating costs</h2><p className="mt-1 text-xs text-slate-500">The gap between these bars is the direction of the business.</p></div><span className="flex items-center gap-3 text-[9px] font-bold text-slate-400"><span className="flex items-center gap-1"><span className="size-2 rounded-full bg-teal-600" /> Revenue</span><span className="flex items-center gap-1"><span className="size-2 rounded-full bg-orange-400" /> Costs</span></span></div>
          <div className="grid h-64 grid-cols-6 items-end gap-2 px-4 pb-5 pt-8 sm:px-6 sm:pb-6">
            {performance.map((month) => (
              <div key={month.month} className="flex h-full flex-col justify-end text-center" title={`${month.label}: ${formatMoney(month.revenue, state.currency)} revenue, ${formatMoney(month.expenses, state.currency)} costs`}>
                <div className="mx-auto flex h-[180px] w-full max-w-14 items-end justify-center gap-1"><span className="w-2.5 rounded-t-md bg-teal-600 transition-[height]" style={{ height: Math.max(month.revenue / chartMax * 180, month.revenue ? 4 : 0) }} /><span className="w-2.5 rounded-t-md bg-orange-400 transition-[height]" style={{ height: Math.max(month.expenses / chartMax * 180, month.expenses ? 4 : 0) }} /></div>
                <span className={`mt-2 text-[9px] font-bold ${month.profit < 0 ? "text-rose-600" : "text-slate-500"}`}>{month.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-[#f0fdfa] p-5 sm:p-6">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
          <span className="grid size-10 place-items-center rounded-xl bg-white text-teal-700 shadow-sm"><Calculator className="size-4" /></span>
          <p className="eyebrow mt-5">Tax planning</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Suggested set-aside</h2>
          <strong className="mt-5 block font-display text-4xl font-normal tracking-[-0.04em] text-teal-900">{formatMoney(taxReserve, state.currency, { whole: true })}</strong>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">A planning estimate using {estimatedTaxRate}% of positive monthly profit. Your actual obligation depends on jurisdiction and business structure.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-teal-900/10 pt-5"><div><span className="text-[9px] uppercase tracking-wider text-slate-400">After reserve</span><strong className="mt-1 block text-sm">{formatMoney(afterTaxReserve, state.currency, { whole: true })}</strong></div><div><span className="text-[9px] uppercase tracking-wider text-slate-400">Recurring overhead</span><strong className="mt-1 block text-sm">{formatMoney(monthlyOverhead, state.currency, { whole: true })}/mo</strong></div></div>
          <Link to="/goals" className="interactive-button mt-5 flex items-center justify-between border-t border-teal-900/10 pt-4 text-xs font-bold text-teal-800 hover:text-teal-950">Create a tax reserve <ArrowRight className="size-4" /></Link>
        </Card>
      </div>

      <div className="mt-4"><OverviewDebtCard debts={debts} debtPlan={state.debtPlan} currency={state.currency} profileType="business" /></div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Cost structure</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Where operations cost the most</h2></div><Link to="/trends" className="text-[10px] font-bold text-teal-700">View insights →</Link></div>
          {expenseRows.length ? <div className="mt-6 grid gap-4">{expenseRows.map((category) => { const share = summary.expenses ? category.amount / summary.expenses * 100 : 0; return <div key={category.id}><div className="flex items-center justify-between gap-3 text-[11px]"><span className="flex items-center gap-2 font-semibold"><span className="size-2.5 rounded-[3px]" style={{ backgroundColor: category.color }} />{category.name}</span><strong>{formatMoney(category.amount, state.currency, { whole: true })}</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${share}%`, backgroundColor: category.color }} /></div></div>; })}</div> : <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-[11px] text-slate-400">Record operating expenses to reveal your cost structure.</p>}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-3 p-5 sm:p-6"><div><p className="eyebrow">Bookkeeping pulse</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Recent ledger activity</h2></div>{unreviewed > 0 && <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-bold text-orange-700">{unreviewed} needs review</span>}</div>
          {recent.length ? <div className="border-t border-black/5">{recent.map((transaction) => <article key={transaction.id} className="flex items-center gap-3 border-b border-black/5 px-5 py-3 last:border-b-0 sm:px-6"><span className={`size-2.5 rounded-full ${transaction.type === "income" ? "bg-teal-500" : "bg-orange-400"}`} /><div className="min-w-0 flex-1"><strong className="block truncate text-xs">{transaction.description}</strong><span className="text-[9px] text-slate-400">{transaction.type === "income" ? "Revenue" : subcategoryName(getTransactionSubcategory(transaction, "business"))}</span></div><strong className={`text-xs ${transaction.type === "income" ? "text-teal-700" : ""}`}>{transaction.type === "income" ? "+" : "−"}{formatMoney(transaction.amount, state.currency)}</strong></article>)}</div> : <p className="mx-5 mb-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-[11px] text-slate-400 sm:mx-6 sm:mb-6">No ledger activity this month.</p>}
          <Link to="/transactions" className="interactive-button flex items-center justify-between border-t border-black/5 px-5 py-4 text-xs font-bold text-teal-800 hover:bg-teal-50 sm:px-6">Open business ledger <ArrowRight className="size-4" /></Link>
        </Card>
      </div>
    </>
  );
}
