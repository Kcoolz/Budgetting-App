import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CreditCard,
  Landmark,
  Pencil,
  PiggyBank,
  Plus,
  Repeat2,
  Scale,
  Trash2,
  TrendingUp,
  Wallet
} from "lucide-react";
import { accountHasActivity, getAccountBalances, getAccountOverview, getAccountType, isLiabilityAccount } from "../lib/accounts";
import { formatMoney, localDate } from "../lib/budget";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageIntro from "../components/PageIntro";

const ACCOUNT_ICONS = {
  checking: Landmark,
  savings: PiggyBank,
  cash: Wallet,
  investment: TrendingUp,
  credit: CreditCard,
  loan: Building2
};

function Metric({ label, value, tone = "default" }) {
  const tones = {
    default: "text-ink-900",
    positive: "text-emerald-700",
    negative: "text-rose-700"
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.075] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">{label}</p>
      <strong className={`mt-2 block font-display text-2xl font-normal text-white ${tones[tone]}`}>{value}</strong>
    </div>
  );
}

export default function AccountsPage({ state, profileType = "personal", onAddAccount, onEditAccount, onDeleteAccount, onReconcileAccount, onAddTransfer, onEditTransfer, onDeleteTransfer }) {
  const business = profileType === "business";
  const { balances, assets, liabilities, netWorth } = getAccountOverview(state, localDate());
  const clearedBalances = getAccountBalances(state, localDate(), true);
  const accountNames = Object.fromEntries(state.accounts.map(({ id, name }) => [id, name]));
  const transfers = [...state.transfers].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageIntro
        eyebrow={business ? "Cash accounts" : "Accounts"}
        title={business ? "Know where the business stands." : "See every balance in one place."}
        description={business ? "Track operating cash, cards, loans, and internal transfers without inflating revenue or expenses." : "Connect each transaction to where it happened and move money without counting it twice."}
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={onAddAccount}><Plus className="size-4" /> Add account</Button>
            <Button onClick={onAddTransfer}><Repeat2 className="size-4" /> Transfer</Button>
          </div>
        }
      />

      <section className={`relative overflow-hidden rounded-[26px] px-5 py-6 text-white shadow-[0_18px_45px_rgba(11,31,58,0.14)] sm:px-7 sm:py-7 ${business ? "business-hero" : "overview-hero"}`}>
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.9fr)] lg:items-end">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/55">{business ? "Net financial position" : "Net worth snapshot"}</p>
            <strong className="mt-2 block font-display text-4xl font-normal tracking-[-0.04em] sm:text-5xl">{formatMoney(netWorth, state.currency)}</strong>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/65">Based on starting balances plus every transaction and transfer recorded in this profile.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label={business ? "Cash & assets" : "Assets"} value={formatMoney(assets, state.currency)} />
            <Metric label="Amount owed" value={formatMoney(liabilities, state.currency)} />
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <p className="eyebrow">Balance sheet</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Your accounts</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">{state.accounts.length} total</span>
          </div>

          <div className="grid gap-3 border-t border-black/5 p-4 sm:grid-cols-2 sm:p-5">
            {state.accounts.map((account) => {
              const Icon = ACCOUNT_ICONS[account.type] ?? Landmark;
              const liability = isLiabilityAccount(account);
              const balance = balances[account.id] ?? 0;
              const hasActivity = accountHasActivity(state, account.id);
              const canDelete = state.accounts.length > 1 && !hasActivity;
              const balanceLabel = liability ? (balance > 0 ? "Credit balance" : "Amount owed") : "Current balance";
              const lastReconciliation = [...(state.reconciliations ?? [])].filter(({ accountId }) => accountId === account.id).sort((a, b) => b.date.localeCompare(a.date))[0];
              return (
                <article key={account.id} className="group rounded-2xl border border-black/[0.065] bg-slate-50/45 p-4 transition-colors hover:bg-white hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`grid size-10 place-items-center rounded-xl ${liability ? "bg-rose-50 text-rose-700" : business ? "bg-teal-50 text-teal-800" : "bg-blue-50 text-blue-700"}`}><Icon className="size-[18px]" /></span>
                    <div className="flex gap-1">
                      <button onClick={() => onReconcileAccount(account)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-700" aria-label={`Reconcile ${account.name}`} title="Reconcile statement"><Scale className="size-3.5" /></button>
                      <button onClick={() => onEditAccount(account)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-ink-900" aria-label={`Edit ${account.name}`}><Pencil className="size-3.5" /></button>
                      <button onClick={() => onDeleteAccount(account)} disabled={!canDelete} title={!canDelete ? (hasActivity ? "Remove linked activity before deleting this account" : "At least one account is required") : "Delete account"} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-400 enabled:hover:bg-rose-50 enabled:hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Delete ${account.name}`}><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <strong className="block truncate text-sm">{account.name}</strong>
                    <span className="mt-0.5 block text-[10px] text-slate-400">{getAccountType(account.type).name}</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-black/5 pt-3">
                    <span className="text-[10px] font-semibold text-slate-400">{balanceLabel}<span className="mt-1 block font-normal">Cleared {formatMoney(liability && clearedBalances[account.id] <= 0 ? Math.abs(clearedBalances[account.id]) : clearedBalances[account.id], state.currency)}</span>{lastReconciliation && <span className="mt-1 block font-normal text-emerald-700">Checked {lastReconciliation.date}</span>}</span>
                    <strong className={`text-base ${liability && balance <= 0 ? "text-rose-700" : "text-ink-900"}`}>{formatMoney(liability && balance <= 0 ? Math.abs(balance) : balance, state.currency)}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <p className="eyebrow">Internal movement</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">Recent transfers</h2>
            </div>
            <button onClick={onAddTransfer} className="interactive-button grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-forest-50 hover:text-forest-800" aria-label="Add transfer"><Plus className="size-4" /></button>
          </div>

          {!transfers.length ? (
            <div className="grid min-h-52 place-items-center border-t border-black/5 px-6 text-center">
              <div>
                <span className="mx-auto grid size-10 place-items-center rounded-full border border-dashed border-slate-300 text-slate-400"><Repeat2 className="size-4" /></span>
                <strong className="mt-3 block text-sm">No transfers yet</strong>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400">Add a second account, then move money between accounts without changing spending totals.</p>
              </div>
            </div>
          ) : (
            <div className="border-t border-black/5">
              {transfers.slice(0, 8).map((transfer) => (
                <article key={transfer.id} className="group grid grid-cols-[minmax(0,1fr)_auto_68px] items-center gap-3 border-t border-black/[0.045] px-5 py-4 first:border-t-0">
                  <div className="min-w-0">
                    <strong className="block truncate text-xs">{transfer.description}</strong>
                    <span className="mt-1 flex min-w-0 items-center gap-1 text-[10px] text-slate-400"><span className="truncate">{accountNames[transfer.fromAccountId]}</span><ArrowRight className="size-3 shrink-0" /><span className="truncate">{accountNames[transfer.toAccountId]}</span></span>
                    <time className="mt-1 block text-[9px] text-slate-400" dateTime={transfer.date}>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${transfer.date}T12:00:00`))}</time>
                  </div>
                  <strong className="text-xs">{formatMoney(transfer.amount, state.currency)}</strong>
                  <div className="flex md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
                    <button onClick={() => onEditTransfer(transfer)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-ink-900" aria-label={`Edit ${transfer.description}`}><Pencil className="size-3.5" /></button>
                    <button onClick={() => onDeleteTransfer(transfer)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${transfer.description}`}><Trash2 className="size-3.5" /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <span className="grid size-8 place-items-center rounded-lg bg-white text-emerald-700"><ArrowDownLeft className="size-4" /></span>
          <strong className="mt-3 block text-xs">Income raises an account balance</strong>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Assign deposits to the account that received the money.</p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
          <span className="grid size-8 place-items-center rounded-lg bg-white text-orange-700"><ArrowUpRight className="size-4" /></span>
          <strong className="mt-3 block text-xs">Expenses lower an account balance</strong>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Credit-card expenses increase the amount owed; payments should be recorded as transfers.</p>
        </div>
      </div>
    </>
  );
}
