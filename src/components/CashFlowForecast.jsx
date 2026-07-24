import { useMemo, useState } from "react";
import { AlertTriangle, Check, FastForward, FlaskConical, TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney, localDate } from "../lib/budget";
import { getProjectedCashFlow, getScheduleTimeline } from "../lib/planning";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function CashFlowForecast({ state, onUpdateOccurrence }) {
  const [accountId, setAccountId] = useState(state.accounts[0]?.id ?? "");
  const [scenarioType, setScenarioType] = useState("expense");
  const [scenarioAmount, setScenarioAmount] = useState("");
  const [scenarioDate, setScenarioDate] = useState(localDate());
  const timeline = useMemo(() => getScheduleTimeline(state, localDate(), 45), [state]);
  const forecast = useMemo(() => getProjectedCashFlow(state, accountId, localDate(), 45), [state, accountId]);
  const modeledForecast = useMemo(() => {
    const numericAmount = Number(scenarioAmount);
    if (!numericAmount || !scenarioDate) return forecast;
    let balance = forecast.opening;
    let lowest = balance;
    const events = [...forecast.events, {
      id: "scenario",
      description: scenarioType === "income" ? "What-if income" : "What-if expense",
      date: scenarioDate,
      amount: scenarioType === "income" ? Math.abs(numericAmount) : -Math.abs(numericAmount),
      source: "scenario"
    }].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)).map((event) => {
      balance += event.amount;
      lowest = Math.min(lowest, balance);
      return { ...event, balance };
    });
    return { ...forecast, events, lowest, closing: balance };
  }, [forecast, scenarioAmount, scenarioDate, scenarioType]);
  const nextIncome = modeledForecast.events.find(({ amount, date }) => amount > 0 && date >= localDate());
  const beforeNextIncome = nextIncome
    ? Math.min(modeledForecast.opening, ...modeledForecast.events.filter(({ date }) => date < nextIncome.date).map(({ balance }) => balance))
    : modeledForecast.lowest;
  const active = timeline.filter(({ status }) => !["paid", "received", "skipped"].includes(status)).slice(0, 8);
  const input = "min-h-10 rounded-xl border border-black/8 bg-white px-3 text-xs font-semibold outline-none focus:border-forest-700/30";

  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-black/5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div><p className="eyebrow">Projected cash flow</p><h2 className="mt-1 text-lg font-semibold">Where this account is heading</h2><p className="mt-1 text-xs text-slate-500">Known future activity and unpaid schedules over the next 45 days.</p></div>
          <select value={accountId} onChange={(event) => setAccountId(event.target.value)} className={input} aria-label="Forecast account">
            {state.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4 sm:p-5">
          <Metric label="Today" value={formatMoney(modeledForecast.opening, state.currency)} />
          <Metric label="Before next income" value={formatMoney(beforeNextIncome, state.currency)} tone={beforeNextIncome < 0 ? "negative" : "default"} />
          <Metric label="Lowest" value={formatMoney(modeledForecast.lowest, state.currency)} tone={modeledForecast.lowest < 0 ? "negative" : "default"} />
          <Metric label="In 45 days" value={formatMoney(modeledForecast.closing, state.currency)} tone={modeledForecast.closing >= modeledForecast.opening ? "positive" : "negative"} />
        </div>
        <div className="border-t border-black/5 bg-blue-50/50 p-4 sm:p-5">
          <div className="flex items-center gap-2"><FlaskConical className="size-4 text-blue-700" /><strong className="text-xs text-blue-950">Try a what-if scenario</strong></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <select value={scenarioType} onChange={(event) => setScenarioType(event.target.value)} className={input} aria-label="Scenario type"><option value="expense">Extra expense</option><option value="income">Extra income</option></select>
            <input value={scenarioAmount} onChange={(event) => setScenarioAmount(event.target.value)} className={input} type="number" min="0" step="0.01" placeholder="Amount" aria-label="Scenario amount" />
            <input value={scenarioDate} onChange={(event) => setScenarioDate(event.target.value)} className={input} type="date" aria-label="Scenario date" />
          </div>
          <p className="mt-2 text-[10px] text-blue-800/65">This is a temporary preview. It does not change your budget.</p>
        </div>
        {modeledForecast.events.length ? (
          <div className="border-t border-black/5">
            {modeledForecast.events.slice(0, 10).map((event) => (
              <article key={event.id} className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-black/[0.045] px-5 py-3 last:border-b-0 ${event.source === "scenario" ? "bg-blue-50/60" : ""}`}>
                <div className="min-w-0"><strong className="block truncate text-xs">{event.description}</strong><span className="mt-0.5 block text-[9px] text-slate-400">{event.date} · {event.source === "schedule" ? "Scheduled" : event.source === "scenario" ? "What-if only" : "Future transaction"}</span></div>
                <div className="text-right"><strong className={`block text-xs ${event.amount >= 0 ? "text-emerald-700" : ""}`}>{event.amount >= 0 ? "+" : "−"}{formatMoney(Math.abs(event.amount), state.currency)}</strong><span className="mt-0.5 block text-[9px] text-slate-400">{formatMoney(event.balance, state.currency)} after</span></div>
              </article>
            ))}
          </div>
        ) : <p className="border-t border-black/5 px-6 py-10 text-center text-xs text-slate-400">No future activity is scheduled for this account.</p>}
      </Card>

      <Card className="overflow-hidden">
        <div className="p-5 sm:p-6"><p className="eyebrow">Schedule inbox</p><h2 className="mt-1 text-lg font-semibold">Record what happened</h2><p className="mt-1 text-xs text-slate-500">Mark a scheduled item paid, received, or skipped.</p></div>
        {active.length ? (
          <div className="border-t border-black/5">
            {active.map((occurrence) => (
              <article key={occurrence.occurrenceId} className="border-b border-black/[0.045] px-5 py-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${occurrence.status === "overdue" ? "bg-rose-50 text-rose-700" : occurrence.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                    {occurrence.status === "overdue" ? <AlertTriangle className="size-3.5" /> : occurrence.type === "income" ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1"><strong className="block truncate text-xs">{occurrence.description}</strong><span className="mt-1 block text-[10px] capitalize text-slate-400">{occurrence.dueDate} · {occurrence.status} · {formatMoney(occurrence.amount, state.currency)}</span></div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button onClick={() => onUpdateOccurrence(occurrence, "skipped")} variant="ghost"><FastForward className="size-3.5" /> Skip</Button>
                  <Button onClick={() => onUpdateOccurrence(occurrence, occurrence.type === "income" ? "received" : "paid")} variant="primary"><Check className="size-3.5" /> {occurrence.type === "income" ? "Record received" : "Record paid"}</Button>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="border-t border-black/5 px-6 py-10 text-center text-xs text-slate-400">Everything in the next 45 days has been handled.</p>}
      </Card>
    </div>
  );
}

function Metric({ label, value, tone = "default" }) {
  const toneClass = tone === "positive" ? "text-emerald-700" : tone === "negative" ? "text-rose-700" : "text-ink-900";
  return <div className="rounded-xl bg-slate-50 p-3"><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span><strong className={`mt-1 block truncate text-sm ${toneClass}`}>{value}</strong></div>;
}
