import { Building2, HeartPulse, Laptop, ShoppingBag, Sparkles, Utensils, Bus, MoreHorizontal } from "lucide-react";
import { expenseCategoriesFor, formatMoney, progressTone, sum } from "../lib/budget";
import Button from "./ui/Button";
import Card from "./ui/Card";

const groups = [
  { id: "everyday", name: "Everyday essentials", description: "Food, transport, and health", ids: ["food", "transport", "health"] },
  { id: "flexible", name: "Flexible choices", description: "Entertainment, shopping, and other", ids: ["fun", "shopping", "other"] }
];

const icons = { housing: Building2, bills: Laptop, food: Utensils, transport: Bus, health: HeartPulse, fun: Sparkles, shopping: ShoppingBag, other: MoreHorizontal };
const toneClasses = { healthy: "bg-emerald-600", warning: "bg-amber-400", danger: "bg-rose-400" };

export default function FlexibleSpendingCard({ budgets, spending, currency, onManage, profileType = "personal" }) {
  const business = profileType === "business";
  const categories = expenseCategoriesFor(profileType);
  const visibleGroups = business ? [
    { id: "core", name: "Core operations", description: "Workspace, software, and people", ids: ["housing", "bills", "health"] },
    { id: "growth", name: "Variable and growth costs", description: "Marketing, travel, meals, and equipment", ids: ["fun", "transport", "food", "shopping", "other"] }
  ] : groups;
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">{business ? "Cost controls" : "Beyond the bills"}</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">{business ? "Core and growth spending" : "Everyday and flexible spending"}</h2>
          <p className="mt-1 text-xs text-slate-500">{business ? "Keep essential overhead separate from costs intended to create growth." : "Entertainment stays separate from costs that are harder to change."}</p>
        </div>
        <Button onClick={onManage} className="shrink-0">Adjust limits</Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {visibleGroups.map((group) => {
          const groupBudget = sum(group.ids.map((id) => budgets[id]));
          const groupSpent = sum(group.ids.map((id) => spending[id]));
          return (
            <section key={group.id} className={`rounded-2xl border p-4 sm:p-5 ${["flexible", "growth"].includes(group.id) ? "border-orange-200/60 bg-orange-50/30" : "border-forest-700/10 bg-forest-50/45"}`}>
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="text-sm font-semibold">{group.name}</h3><p className="mt-1 text-[10px] text-slate-400">{group.description}</p></div>
                <div className="text-right"><strong className="block text-sm">{formatMoney(groupSpent, currency)}</strong><span className="text-[9px] text-slate-400">of {formatMoney(groupBudget, currency)}</span></div>
              </div>

              <div className="mt-5 grid gap-4">
                {group.ids.map((id) => {
                  const category = categories.find((item) => item.id === id);
                  const Icon = icons[id];
                  const budget = Number(budgets[id]) || 0;
                  const spent = Number(spending[id]) || 0;
                  const percent = budget > 0 ? spent / budget * 100 : spent > 0 ? 100 : 0;
                  const tone = budget <= 0 && spent > 0 ? "danger" : progressTone(percent);
                  return (
                    <article key={id}>
                      <div className="mb-2 flex items-center gap-2 text-[11px]">
                        <Icon className="size-3.5 text-slate-400" />
                        <strong className="flex-1 font-semibold">{category.shortName}</strong>
                        <span className={tone === "danger" ? "font-semibold text-rose-600" : "text-slate-500"}>{formatMoney(spent, currency)} / {formatMoney(budget, currency)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white">
                        <span className={`block h-full rounded-full transition-all duration-500 ${toneClasses[tone]}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}
