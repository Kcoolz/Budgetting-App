import { useMemo, useState } from "react";
import { Archive, Check, Plus, RotateCcw, Sparkles, Tag, Trash2, WandSparkles } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageIntro from "../components/PageIntro";
import { expenseCategoriesFor, expenseSubcategoriesFor } from "../lib/budget";
import { suggestRecurringSchedules } from "../lib/planning";

const COLORS = ["#3478b8", "#4f8b71", "#c8834f", "#9a6ca8", "#cb6671", "#64748b"];
const input = "min-h-10 w-full rounded-xl border border-black/8 bg-white px-3 text-xs outline-none focus:border-forest-700/30 focus:ring-4 focus:ring-forest-700/10";

export default function OrganizePage({
  state,
  profileType = "personal",
  onSaveCategory,
  onToggleCategory,
  onSaveSubcategory,
  onSaveTag,
  onDeleteTag,
  onSaveRule,
  onToggleRule,
  onDeleteRule,
  onAcceptSuggestion
}) {
  const categories = expenseCategoriesFor(profileType, state);
  const allCategories = [...(profileType === "business" ? categories.slice(0, 8) : categories.slice(0, 8)), ...state.customCategories];
  const subcategories = expenseSubcategoriesFor(profileType, state);
  const suggestions = useMemo(
    () => suggestRecurringSchedules(state.transactions, state.recurringBills),
    [state.transactions, state.recurringBills]
  );
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(COLORS[0]);
  const [detailName, setDetailName] = useState("");
  const [detailCategory, setDetailCategory] = useState(categories[0]?.id ?? "other");
  const [tagName, setTagName] = useState("");
  const [rule, setRule] = useState({ name: "", match: "", operator: "contains", type: "any", category: "", subcategory: "", rename: "", tag: "" });

  const submitCategory = (event) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    onSaveCategory({ name: categoryName, shortName: categoryName, color: categoryColor });
    setCategoryName("");
  };

  const submitDetail = (event) => {
    event.preventDefault();
    if (!detailName.trim()) return;
    onSaveSubcategory({ name: detailName, category: detailCategory });
    setDetailName("");
  };

  const submitTag = (event) => {
    event.preventDefault();
    if (!tagName.trim()) return;
    onSaveTag({ name: tagName });
    setTagName("");
  };

  const submitRule = (event) => {
    event.preventDefault();
    if (!rule.match.trim()) return;
    onSaveRule({
      name: rule.name.trim() || `When description contains ${rule.match.trim()}`,
      match: rule.match,
      operator: rule.operator,
      type: rule.type,
      category: rule.category,
      subcategory: rule.subcategory,
      rename: rule.rename,
      tags: rule.tag ? [rule.tag] : []
    });
    setRule({ name: "", match: "", operator: "contains", type: "any", category: "", subcategory: "", rename: "", tag: "" });
  };

  const ruleSubcategories = subcategories.filter(({ category }) => category === rule.category);

  return (
    <>
      <PageIntro
        eyebrow="Local automation"
        title="Make Cloud work your way."
        description="Create your own categories and tags, teach imported transactions what to do, and turn repeating history into schedules. Everything runs in this browser."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Plus className="size-4" /></span>
            <div><p className="eyebrow">Categories</p><h2 className="mt-1 text-lg font-semibold">Your spending structure</h2></div>
          </div>

          <form onSubmit={submitCategory} className="mt-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_46px_auto]">
            <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className={input} placeholder="New category name" maxLength="40" />
            <input value={categoryColor} onChange={(event) => setCategoryColor(event.target.value)} className="h-10 w-full cursor-pointer rounded-xl border border-black/8 bg-white p-1" type="color" aria-label="Category colour" />
            <Button type="submit">Add category</Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {allCategories.map((category) => {
              const custom = state.customCategories.some(({ id }) => id === category.id);
              return (
                <span key={category.id} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${category.archived ? "border-slate-200 bg-slate-50 text-slate-400" : "border-black/5 bg-white"}`}>
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: category.color }} />{category.name}
                  {custom && <button type="button" onClick={() => onToggleCategory(category.id)} title={category.archived ? "Restore category" : "Archive category"} className="text-slate-400 hover:text-ink-900">{category.archived ? <RotateCcw className="size-3" /> : <Archive className="size-3" />}</button>}
                </span>
              );
            })}
          </div>

          <form onSubmit={submitDetail} className="mt-6 grid gap-2 border-t border-black/5 pt-5 sm:grid-cols-[minmax(0,1fr)_minmax(140px,.8fr)_auto]">
            <input value={detailName} onChange={(event) => setDetailName(event.target.value)} className={input} placeholder="New spending detail" maxLength="40" />
            <select value={detailCategory} onChange={(event) => setDetailCategory(event.target.value)} className={input}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <Button type="submit">Add detail</Button>
          </form>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><Tag className="size-4" /></span>
            <div><p className="eyebrow">Tags</p><h2 className="mt-1 text-lg font-semibold">Add another way to organize</h2></div>
          </div>
          <form onSubmit={submitTag} className="mt-5 flex gap-2">
            <input value={tagName} onChange={(event) => setTagName(event.target.value)} className={input} placeholder="e.g. Vacation, Client A, Reimbursable" maxLength="32" />
            <Button type="submit">Add</Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {state.tags.length ? state.tags.map((tag) => (
              <span key={tag.id} className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-800">#{tag.name}<button type="button" onClick={() => onDeleteTag(tag.id)} aria-label={`Delete ${tag.name}`}><Trash2 className="size-3" /></button></span>
            )) : <p className="text-xs text-slate-400">No tags yet. Tags can span different categories.</p>}
          </div>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-black/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><WandSparkles className="size-4" /></span>
            <div><p className="eyebrow">Transaction rules</p><h2 className="mt-1 text-lg font-semibold">Automatically clean up imported activity</h2><p className="mt-1 text-xs text-slate-500">Rules run in order whenever activity is added or imported.</p></div>
          </div>
          <form onSubmit={submitRule} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input value={rule.name} onChange={(event) => setRule({ ...rule, name: event.target.value })} className={input} placeholder="Rule name (optional)" />
            <div className="grid grid-cols-[110px_1fr] gap-2">
              <select value={rule.operator} onChange={(event) => setRule({ ...rule, operator: event.target.value })} className={input}><option value="contains">Contains</option><option value="equals">Equals</option></select>
              <input value={rule.match} onChange={(event) => setRule({ ...rule, match: event.target.value })} className={input} placeholder="Description text" required />
            </div>
            <select value={rule.type} onChange={(event) => setRule({ ...rule, type: event.target.value })} className={input}><option value="any">Any activity</option><option value="expense">Expenses only</option><option value="income">Income only</option></select>
            <select value={rule.category} onChange={(event) => setRule({ ...rule, category: event.target.value, subcategory: "" })} className={input}><option value="">Keep category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
            <select value={rule.subcategory} onChange={(event) => setRule({ ...rule, subcategory: event.target.value })} disabled={!rule.category} className={input}><option value="">Keep spending detail</option>{ruleSubcategories.map((detail) => <option key={detail.id} value={detail.id}>{detail.name}</option>)}</select>
            <input value={rule.rename} onChange={(event) => setRule({ ...rule, rename: event.target.value })} className={input} placeholder="Rename to (optional)" />
            <select value={rule.tag} onChange={(event) => setRule({ ...rule, tag: event.target.value })} className={input}><option value="">No tag</option>{state.tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}</select>
            <Button type="submit" variant="primary">Create rule</Button>
          </form>
        </div>
        {state.rules.length ? (
          <div>
            {state.rules.map((item) => (
              <article key={item.id} className="flex flex-col gap-3 border-b border-black/[0.045] px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:px-6">
                <button type="button" onClick={() => onToggleRule(item.id)} className={`grid size-7 shrink-0 place-items-center rounded-full ${item.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`} aria-label={item.active ? "Pause rule" : "Resume rule"}>{item.active && <Check className="size-3.5" />}</button>
                <div className="min-w-0 flex-1"><strong className="block truncate text-xs">{item.name}</strong><span className="mt-1 block text-[10px] text-slate-400">{item.operator === "equals" ? "Description equals" : "Description contains"} “{item.match}”{item.category ? ` → ${categories.find(({ id }) => id === item.category)?.name ?? item.category}` : ""}{item.rename ? ` → rename “${item.rename}”` : ""}</span></div>
                <button type="button" onClick={() => onDeleteRule(item.id)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${item.name}`}><Trash2 className="size-3.5" /></button>
              </article>
            ))}
          </div>
        ) : <p className="px-6 py-8 text-center text-xs text-slate-400">No automation rules yet.</p>}
      </Card>

      <Card className="mt-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-700"><Sparkles className="size-4" /></span>
          <div><p className="eyebrow">Recurring suggestions</p><h2 className="mt-1 text-lg font-semibold">Patterns found in your history</h2><p className="mt-1 text-xs text-slate-500">Cloud looks for matching amounts and regular dates without sending anything away.</p></div>
        </div>
        {suggestions.length ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {suggestions.map((suggestion) => (
              <article key={suggestion.id} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-slate-50/60 p-4">
                <div className="min-w-0 flex-1"><strong className="block truncate text-xs">{suggestion.description}</strong><span className="mt-1 block text-[10px] capitalize text-slate-400">{suggestion.frequency} · {suggestion.occurrences} matching transactions</span></div>
                <Button onClick={() => onAcceptSuggestion(suggestion)}>Add schedule</Button>
              </article>
            ))}
          </div>
        ) : <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center text-xs text-slate-400">Import or record at least two regularly spaced matching transactions to see suggestions.</p>}
      </Card>
    </>
  );
}
