import { useMemo, useState } from "react";
import { Fuel, Laptop, Megaphone, Plane, ShoppingBasket, TrendingDown, TrendingUp, Utensils } from "lucide-react";
import PageIntro from "../components/PageIntro";
import Card from "../components/ui/Card";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_SUBCATEGORIES,
  expenseCategoriesFor,
  expenseSubcategoriesFor,
  formatMoney,
  getSpendingTrends,
  sum
} from "../lib/budget";

const spotlights = [
  { id: "dining-out", label: "Dining out", description: "Restaurants and takeout", icon: Utensils },
  { id: "groceries", label: "Groceries", description: "Markets and supermarkets", icon: ShoppingBasket },
  { id: "gas", label: "Gas & fuel", description: "Fuel station spending", icon: Fuel }
];

const businessSpotlights = [
  { id: "software", label: "Software", description: "Subscriptions and cloud tools", icon: Laptop },
  { id: "advertising", label: "Advertising", description: "Campaign and promotion costs", icon: Megaphone },
  { id: "business-travel", label: "Business travel", description: "Flights, hotels, and transport", icon: Plane }
];

function filterMeta(value, categories = EXPENSE_CATEGORIES, subcategories = EXPENSE_SUBCATEGORIES) {
  if (value === "all") return { label: "All spending", color: "#3478b8", read: (month) => month.total };
  const [type, id] = value.split(":");
  if (type === "category") {
    const category = categories.find((item) => item.id === id) ?? categories[0];
    return { label: category.name, color: category.color, read: (month) => month.byCategory[id] ?? 0 };
  }
  const detail = subcategories.find((item) => item.id === id) ?? subcategories.at(-1);
  const category = categories.find((item) => item.id === detail.category);
  return { label: detail.name, color: category?.color ?? "#3478b8", read: (month) => month.bySubcategory[detail.id] ?? 0 };
}

function comparisonLabel(current, previous) {
  if (!previous) return current ? "New spending this month" : "No spending this month";
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return "Same as last month";
  return `${Math.abs(change)}% ${change < 0 ? "less" : "more"} than last month`;
}

export default function TrendsPage({ state, endMonth, profileType = "personal" }) {
  const business = profileType === "business";
  const categories = expenseCategoriesFor(profileType);
  const subcategories = expenseSubcategoriesFor(profileType);
  const visibleSpotlights = business ? businessSpotlights : spotlights;
  const [period, setPeriod] = useState(6);
  const [filter, setFilter] = useState("all");
  const trends = useMemo(() => getSpendingTrends(state, endMonth, period, profileType), [state, endMonth, period, profileType]);
  const meta = filterMeta(filter, categories, subcategories);
  const values = trends.map(meta.read);
  const current = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? 0;
  const average = sum(values) / values.length;
  const maximum = Math.max(...values, 0);
  const highestIndex = values.indexOf(maximum);
  const currentTrend = trends.at(-1);
  const previousTrend = trends.at(-2);
  const currentTotal = currentTrend?.total ?? 0;
  const detailMovers = subcategories
    .map((detail) => {
      const currentAmount = currentTrend?.bySubcategory[detail.id] ?? 0;
      const previousAmount = previousTrend?.bySubcategory[detail.id] ?? 0;
      return {
        ...detail,
        currentAmount,
        previousAmount,
        delta: currentAmount - previousAmount,
        color: categories.find(({ id }) => id === detail.category)?.color ?? "#3478b8"
      };
    })
    .filter(({ currentAmount, previousAmount }) => currentAmount || previousAmount)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || b.currentAmount - a.currentAmount)
    .slice(0, 6);

  return (
    <>
      <PageIntro
        eyebrow={business ? "Business insights" : "Spending trends"}
        title={business ? "Know what is moving the margin." : "See where your money is going."}
        description={business ? "Compare operating costs across months and isolate software, advertising, travel, payroll, and other business drivers." : "Compare months, spot changes, and separate everyday details such as dining out, groceries, and gas."}
        action={(
          <div className="flex rounded-xl border border-black/8 bg-white p-1">
            {[3, 6, 12].map((value) => (
              <button key={value} onClick={() => setPeriod(value)} className={`interactive-button min-h-8 rounded-lg px-3 text-[11px] font-bold ${period === value ? "bg-forest-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}>{value} months</button>
            ))}
          </div>
        )}
      />

      <section className="mb-4 grid gap-3 sm:grid-cols-3" aria-label="Popular spending details">
        {visibleSpotlights.map((spotlight) => {
          const Icon = spotlight.icon;
          const amount = currentTrend?.bySubcategory[spotlight.id] ?? 0;
          const prior = trends.at(-2)?.bySubcategory[spotlight.id] ?? 0;
          const selected = filter === `detail:${spotlight.id}`;
          return (
            <button key={spotlight.id} onClick={() => setFilter(`detail:${spotlight.id}`)} className={`premium-card interactive-button rounded-2xl p-4 text-left hover:-translate-y-0.5 hover:shadow-md ${selected ? "ring-2 ring-forest-700/25" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-forest-50 text-forest-700"><Icon className="size-4" /></span>
                <span className={`text-[9px] font-bold ${amount <= prior ? "text-emerald-700" : "text-orange-600"}`}>{comparisonLabel(amount, prior)}</span>
              </div>
              <strong className="mt-4 block font-display text-2xl font-normal tracking-[-0.03em]">{formatMoney(amount, state.currency, { whole: true })}</strong>
              <span className="mt-1 block text-xs font-semibold">{spotlight.label}</span>
              <span className="mt-0.5 block text-[10px] text-slate-400">{spotlight.description}</span>
            </button>
          );
        })}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,.7fr)]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-black/5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div>
              <p className="eyebrow">Month by month</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">{meta.label}</h2>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-slate-400">
                <span><strong className="text-ink-900">{formatMoney(average, state.currency, { whole: true })}</strong> monthly average</span>
                <span><strong className="text-ink-900">{formatMoney(current, state.currency, { whole: true })}</strong> this month</span>
                <span>{comparisonLabel(current, previous)}</span>
              </div>
            </div>
            <label className="grid gap-1.5 text-[10px] font-bold text-slate-500">
              Show trend for
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="min-h-10 min-w-48 rounded-xl border border-black/8 bg-white px-3 text-xs font-semibold text-ink-900 outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10">
                <option value="all">All spending</option>
                <optgroup label="Categories">
                  {categories.map((category) => <option key={category.id} value={`category:${category.id}`}>{category.name}</option>)}
                </optgroup>
                <optgroup label="Spending details">
                  {subcategories.map((detail) => <option key={detail.id} value={`detail:${detail.id}`}>{detail.name}</option>)}
                </optgroup>
              </select>
            </label>
          </div>

          <div className="overflow-x-auto px-4 pb-5 pt-7 sm:px-6 sm:pb-6">
            {maximum > 0 ? (
              <div className="grid h-64 items-end gap-2" style={{ gridTemplateColumns: `repeat(${trends.length}, minmax(54px, 1fr))`, minWidth: trends.length > 6 ? 720 : 420 }} role="img" aria-label={`${meta.label} spending over ${period} months`}>
                {trends.map((month, index) => {
                  const amount = values[index];
                  const height = amount ? Math.max((amount / maximum) * 180, 5) : 0;
                  return (
                    <div key={month.month} className="flex h-full flex-col justify-end text-center" title={`${month.label}: ${formatMoney(amount, state.currency)}`}>
                      <span className="mb-2 truncate text-[9px] font-semibold text-slate-400">{period <= 6 && amount ? formatMoney(amount, state.currency, { whole: true }) : ""}</span>
                      <span className="mx-auto block w-full max-w-12 rounded-t-lg transition-[height] duration-300" style={{ height, backgroundColor: meta.color, opacity: index === trends.length - 1 ? 1 : 0.68 }} />
                      <span className="mt-2 border-t border-black/5 pt-2 text-[9px] font-bold text-slate-500">{month.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid h-64 place-items-center rounded-xl bg-slate-50/60 text-center">
                <div>
                  <span className="mx-auto grid size-10 place-items-center rounded-full bg-white text-slate-400 shadow-sm"><TrendingUp className="size-4" /></span>
                  <strong className="mt-3 block text-xs">No {meta.label.toLowerCase()} data yet</strong>
                  <p className="mt-1 text-[10px] text-slate-400">Add expenses and their monthly pattern will appear here.</p>
                </div>
              </div>
            )}
          </div>

          {maximum > 0 && (
            <div className="flex items-center gap-2 border-t border-black/5 bg-slate-50/50 px-5 py-3 text-[10px] text-slate-500 sm:px-6">
              {current <= previous ? <TrendingDown className="size-3.5 text-emerald-600" /> : <TrendingUp className="size-3.5 text-orange-500" />}
              Highest month: <strong className="text-ink-900">{trends[highestIndex]?.label}</strong> at <strong className="text-ink-900">{formatMoney(maximum, state.currency)}</strong>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="eyebrow">What changed</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Biggest spending moves</h2>
          <p className="mt-1 text-xs text-slate-500">The details that changed most from {previousTrend?.label ?? "last month"} to {currentTrend?.label}. Total this month: {formatMoney(currentTotal, state.currency)}.</p>
          {detailMovers.length ? (
            <div className="mt-6 grid gap-2">
              {detailMovers.map((detail) => {
                const lower = detail.delta <= 0;
                const change = detail.previousAmount === 0
                  ? detail.currentAmount > 0 ? "New this month" : "No spending"
                  : detail.delta === 0
                    ? "No change"
                    : `${formatMoney(Math.abs(detail.delta), state.currency, { whole: true })} ${lower ? "less" : "more"}`;
                return (
                  <button key={detail.id} onClick={() => setFilter(`detail:${detail.id}`)} className="interactive-button flex items-center gap-3 rounded-xl p-2.5 text-left hover:bg-slate-50" title={`Show ${detail.name} trend`}>
                    <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: detail.color }} />
                    <span className="min-w-0 flex-1"><strong className="block truncate text-[11px]">{detail.name}</strong><span className={`mt-0.5 block text-[9px] font-semibold ${lower ? "text-emerald-700" : "text-orange-600"}`}>{change}</span></span>
                    <strong className="text-xs">{formatMoney(detail.currentAmount, state.currency, { whole: true })}</strong>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 grid min-h-48 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center"><div><TrendingUp className="mx-auto size-4 text-slate-400" /><strong className="mt-2 block text-xs">No changes to compare yet</strong><span className="mt-1 block text-[10px] text-slate-400">Two months of expenses will reveal your biggest moves.</span></div></div>
          )}
        </Card>
      </div>
    </>
  );
}
