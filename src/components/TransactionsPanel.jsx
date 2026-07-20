import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, ChevronDown, Plus, Repeat2, Trash2, Zap } from "lucide-react";
import {
  categoryName,
  expenseCategoriesFor,
  expenseSubcategoriesFor,
  formatMoney,
  getTransactionSubcategory,
  incomeCategoriesFor,
  subcategoryName
} from "../lib/budget";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function TransactionsPanel({ transactions, accounts = [], currency, quickValue, quickError, onQuickChange, onQuickAdd, onAdd, onTransfer, onDelete, onReview, onCategoryChange, onSubcategoryChange, profileType = "personal" }) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const unreviewed = transactions.filter((transaction) => transaction.reviewed === false);
  const business = profileType === "business";
  const accountNames = Object.fromEntries(accounts.map(({ id, name }) => [id, name]));

  return (
    <Card id="transactions" className="overflow-hidden">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Activity</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">{business ? "Ledger entries" : "Transactions"}</h2>
          </div>
          <div className="mobile-hidden flex gap-2">
            <Button onClick={onTransfer}><Repeat2 className="size-4" /> Transfer</Button>
            <Button onClick={onAdd}><Plus className="size-4" /> Add transaction</Button>
          </div>
        </div>

        <form onSubmit={onQuickAdd} className="relative">
          <div className={`flex min-h-12 items-center rounded-xl border bg-slate-50/70 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-forest-700/8 ${quickError ? "border-rose-300" : "border-black/[0.06] focus-within:border-forest-700/25"}`}>
            <span className="grid w-11 shrink-0 place-items-center text-forest-700"><Zap className="size-4" /></span>
            <input
              value={quickValue}
              onChange={(event) => onQuickChange(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent py-3 pr-3 text-sm text-ink-900 outline-none placeholder:text-slate-400"
              placeholder={business ? 'Quick add — try “49 Adobe software”' : 'Quick add — try “15 Coffee”'}
              aria-label="Quick add transaction"
            />
            <button className="interactive-button mr-1.5 rounded-lg px-3 py-2 text-xs font-bold text-forest-700 hover:-translate-y-px hover:bg-forest-50 hover:text-forest-900" type="submit">
              Add
            </button>
          </div>
          {quickError && <p className="absolute left-1 top-full mt-1.5 text-[11px] font-medium text-rose-600">{quickError}</p>}
        </form>

        {unreviewed.length > 0 && (
          <div className="rounded-xl border border-orange-200/70 bg-orange-50/70">
            <button type="button" onClick={() => setReviewOpen((value) => !value)} className="interactive-button flex w-full items-center gap-3 px-4 py-3 text-left hover:-translate-y-px">
              <span className="size-2 rounded-full bg-orange-400 shadow-[0_0_0_4px_rgba(251,146,60,0.12)]" />
              <span className="flex-1 text-xs"><strong>You have {unreviewed.length} new transaction{unreviewed.length === 1 ? "" : "s"} to review.</strong><span className="ml-1 text-slate-500">Verify each category before approving.</span></span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-orange-700">Review <ChevronDown className={`size-3.5 transition-transform ${reviewOpen ? "rotate-180" : ""}`} /></span>
            </button>

            {reviewOpen && (
              <div className="grid gap-2 border-t border-orange-200/60 p-3">
                {unreviewed.map((transaction) => {
                  const categories = transaction.type === "income" ? incomeCategoriesFor(profileType) : expenseCategoriesFor(profileType);
                  const subcategories = expenseSubcategoriesFor(profileType).filter((item) => item.category === transaction.category);
                  return (
                    <article key={transaction.id} className="grid gap-2 rounded-xl bg-white p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_150px_150px_auto] sm:items-center">
                      <div className="min-w-0">
                        <strong className="block truncate text-xs">{transaction.description}</strong>
                        <span className="mt-0.5 block text-[10px] text-slate-400">{formatMoney(transaction.amount, currency)} on {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${transaction.date}T12:00:00`))} · {accountNames[transaction.accountId] ?? "Main account"}</span>
                      </div>
                      <select value={transaction.category} onChange={(event) => onCategoryChange(transaction.id, event.target.value)} className="min-h-9 rounded-lg border border-black/8 bg-white px-2 text-[11px] font-semibold outline-none focus:border-forest-700/30">
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                      </select>
                      {transaction.type === "expense" ? (
                        <select value={getTransactionSubcategory(transaction, profileType)} onChange={(event) => onSubcategoryChange(transaction.id, event.target.value)} className="min-h-9 rounded-lg border border-black/8 bg-white px-2 text-[11px] font-semibold outline-none focus:border-forest-700/30" aria-label={`Spending detail for ${transaction.description}`}>
                          {subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}
                        </select>
                      ) : <span className="px-2 text-[11px] text-slate-400">Income</span>}
                      <button type="button" onClick={() => onReview(transaction.id)} className="interactive-button flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-forest-900 px-3 text-[11px] font-bold text-white hover:-translate-y-px hover:bg-forest-800"><Check className="size-3.5" /> Approve</button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {!transactions.length ? (
        <div className="grid min-h-48 place-items-center border-t border-black/5 px-6 text-center">
          <div>
            <span className="mx-auto grid size-10 place-items-center rounded-full border border-dashed border-slate-300 text-slate-400">○</span>
            <strong className="mt-3 block text-sm">No {business ? "ledger entries" : "transactions"} this month</strong>
            <p className="mt-1 text-xs text-slate-400">{business ? "Record revenue or an operating expense to get started." : "Quick add an expense or record income to get started."}</p>
          </div>
        </div>
      ) : (
        <div className="border-t border-black/5">
          <div className="hidden grid-cols-[minmax(220px,1.5fr)_minmax(140px,.8fr)_90px_120px_32px] gap-4 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:grid">
            <span>Description</span><span>Category</span><span>Date</span><span className="text-right">Amount</span><span />
          </div>
          {transactions.map((transaction) => {
            const income = transaction.type === "income";
            const date = new Date(`${transaction.date}T12:00:00`);
            return (
              <article key={transaction.id} className="group grid grid-cols-[minmax(0,1fr)_auto_28px] items-center gap-x-3 gap-y-1 border-t border-black/[0.045] px-5 py-3.5 text-xs first:border-t-0 md:grid-cols-[minmax(220px,1.5fr)_minmax(140px,.8fr)_90px_120px_32px] md:gap-4 md:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${income ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                    {income ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex min-w-0 items-center gap-2"><strong className="truncate font-semibold">{transaction.description}</strong>{transaction.reviewed === false && <span className="size-1.5 shrink-0 rounded-full bg-orange-400" title="Needs review" />}</span>
                    <span className="mt-0.5 block truncate text-[9px] text-slate-400">{accountNames[transaction.accountId] ?? "Main account"}</span>
                  </span>
                </div>
                <span className="col-start-1 pl-12 text-[11px] text-slate-500 md:col-auto md:pl-0 md:text-xs">
                  {categoryName(transaction.category, transaction.type, profileType)}
                  {!income && <span className="mt-0.5 block text-[9px] text-slate-400">{subcategoryName(getTransactionSubcategory(transaction, profileType))}</span>}
                </span>
                <time className="col-start-2 row-start-2 text-right text-[11px] text-slate-500 md:col-auto md:row-auto md:text-left md:text-xs" dateTime={transaction.date}>
                  {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date)}
                </time>
                <strong className={`col-start-2 row-start-1 text-right font-bold ${income ? "text-emerald-700" : "text-ink-900"}`}>
                  {income ? "+" : "−"}{formatMoney(transaction.amount, currency)}
                </strong>
                <button
                  onClick={() => onDelete(transaction)}
                  className="interactive-button col-start-3 row-span-2 row-start-1 grid size-8 place-items-center rounded-lg text-slate-400 hover:-translate-y-px hover:bg-rose-50 hover:text-rose-600 md:col-auto md:row-auto md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                  aria-label={`Delete ${transaction.description}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}
