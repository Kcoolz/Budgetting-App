import { useMemo, useState } from "react";
import { CalendarCheck2, CalendarDays, ChevronLeft, ChevronRight, ReceiptText, ShieldAlert } from "lucide-react";
import { formatMoney, getUpcomingBills, localDate, shiftMonth, sum } from "../lib/budget";
import Button from "./ui/Button";
import Card from "./ui/Card";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthGrid(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(year, monthNumber - 1, 1, 12);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function eventClasses(type) {
  if (type === "plan") return "bg-blue-50 text-blue-800 hover:bg-blue-100";
  if (type === "deadline") return "bg-rose-50 text-rose-800 hover:bg-rose-100";
  return "bg-orange-50 text-orange-800";
}

function EventIcon({ type }) {
  if (type === "plan") return <CalendarCheck2 className="size-3 shrink-0" />;
  if (type === "deadline") return <ShieldAlert className="size-3 shrink-0" />;
  return <ReceiptText className="size-3 shrink-0" />;
}

export default function PlanningCalendar({ bills, goals, currency, onEditGoal, profileType = "personal" }) {
  const business = profileType === "business";
  const today = localDate();
  const [calendarMonth, setCalendarMonth] = useState(today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(today);
  const days = useMemo(() => monthGrid(calendarMonth), [calendarMonth]);
  const gridStart = days[0];
  const billOccurrences = useMemo(() => getUpcomingBills(bills, gridStart, 42), [bills, gridStart]);

  const events = useMemo(() => {
    const billEvents = billOccurrences.map((bill) => ({
      id: bill.occurrenceId,
      date: bill.dueDate,
      type: "bill",
      label: bill.description,
      amount: bill.amount,
      bill
    }));
    const goalEvents = goals.flatMap((goal) => [
      goal.targetDate ? { id: `${goal.id}-plan`, date: goal.targetDate, type: "plan", label: goal.name, goal } : null,
      goal.deadline ? { id: `${goal.id}-deadline`, date: goal.deadline, type: "deadline", label: goal.name, goal } : null
    ].filter(Boolean));
    return [...billEvents, ...goalEvents];
  }, [billOccurrences, goals]);

  const eventsByDate = useMemo(() => events.reduce((result, event) => {
    result[event.date] = [...(result[event.date] ?? []), event];
    return result;
  }, {}), [events]);
  const monthEvents = events.filter((event) => event.date.startsWith(calendarMonth));
  const monthBills = monthEvents.filter(({ type }) => type === "bill");
  const goalMilestones = monthEvents.filter(({ type }) => type !== "bill");
  const selectedEvents = eventsByDate[selectedDate] ?? [];
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(`${calendarMonth}-01T12:00:00`));

  const changeMonth = (amount) => {
    const month = shiftMonth(calendarMonth, amount);
    setCalendarMonth(month);
    setSelectedDate(`${month}-01`);
  };

  const returnToToday = () => {
    setCalendarMonth(today.slice(0, 7));
    setSelectedDate(today);
  };

  return (
    <Card className="overflow-hidden p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Planning calendar</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{business ? "Payments and reserve milestones" : "Bills and goal milestones"}</h2>
          <p className="mt-1 text-xs text-slate-500">{business ? "See recurring costs and capital deadlines together in one operating calendar." : "See scheduled payments, preferred goal dates, and hard deadlines in one month."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={returnToToday} className="min-h-9 px-3 text-xs">Today</Button>
          <div className="flex rounded-xl border border-black/8 bg-white p-1">
            <button onClick={() => changeMonth(-1)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-forest-50 hover:text-forest-900" aria-label="Previous month"><ChevronLeft className="size-4" /></button>
            <strong className="min-w-32 self-center px-2 text-center text-sm">{monthLabel}</strong>
            <button onClick={() => changeMonth(1)} className="interactive-button grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-forest-50 hover:text-forest-900" aria-label="Next month"><ChevronRight className="size-4" /></button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-orange-50 px-3 py-2.5"><span className="text-[9px] font-bold uppercase tracking-wider text-orange-700">Bills this month</span><strong className="mt-1 block text-sm">{formatMoney(sum(monthBills.map(({ amount }) => amount)), currency)}</strong></div>
        <div className="rounded-xl bg-blue-50 px-3 py-2.5"><span className="text-[9px] font-bold uppercase tracking-wider text-blue-700">{business ? "Reserve milestones" : "Goal milestones"}</span><strong className="mt-1 block text-sm">{goalMilestones.length} {goalMilestones.length === 1 ? "date" : "dates"}</strong></div>
        <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-3 py-2.5 text-[9px] font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-400" /> Bill</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-500" /> Plan</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-500" /> Must</span>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-black/5">
        <div className="grid grid-cols-7 border-b border-black/5 bg-slate-50/80">
          {weekdayLabels.map((label) => <div key={label} className="px-1 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:px-2 sm:text-[10px]">{label}</div>)}
        </div>
        <div className="grid grid-cols-7" role="grid" aria-label={`${monthLabel} calendar`}>
          {days.map((date) => {
            const key = localDate(date);
            const dayEvents = eventsByDate[key] ?? [];
            const inMonth = key.startsWith(calendarMonth);
            const selected = key === selectedDate;
            return (
              <div key={key} className={`relative min-h-16 border-b border-r border-black/5 p-1 sm:min-h-28 sm:p-2 ${inMonth ? "bg-white" : "bg-slate-50/55"} ${selected ? "ring-2 ring-inset ring-forest-700/25" : ""}`} role="gridcell">
                <button onClick={() => setSelectedDate(key)} className={`grid size-7 place-items-center rounded-lg text-[11px] font-semibold sm:size-8 sm:text-xs ${key === today ? "bg-forest-900 text-white" : inMonth ? "text-ink-900 hover:bg-forest-50" : "text-slate-300 hover:bg-slate-100"}`} aria-label={`Select ${key}`}>{date.getDate()}</button>
                <div className="mt-1 hidden gap-1 sm:grid">
                  {dayEvents.slice(0, 3).map((event) => event.type === "bill" ? (
                    <div key={event.id} className={`flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-semibold ${eventClasses(event.type)}`} title={`${event.label} ${formatMoney(event.amount, currency)}`}><EventIcon type={event.type} /><span className="truncate">{event.label}</span></div>
                  ) : (
                    <button key={event.id} onClick={() => onEditGoal(event.goal)} className={`interactive-button flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-left text-[9px] font-semibold ${eventClasses(event.type)}`} title={`${event.type === "plan" ? "Planned" : "Must-have"}: ${event.label}`}><EventIcon type={event.type} /><span className="truncate">{event.type === "plan" ? "Plan" : "Must"}: {event.label}</span></button>
                  ))}
                  {dayEvents.length > 3 && <span className="px-1 text-[8px] font-bold text-slate-400">+{dayEvents.length - 3} more</span>}
                </div>
                <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5 sm:hidden" aria-hidden="true">
                  {dayEvents.slice(0, 5).map((event) => <span key={event.id} className={`size-1.5 rounded-full ${event.type === "bill" ? "bg-orange-400" : event.type === "plan" ? "bg-blue-500" : "bg-rose-500"}`} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 sm:hidden">
        <div className="mb-2 flex items-center gap-2"><CalendarDays className="size-4 text-forest-700" /><strong className="text-xs">{new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${selectedDate}T12:00:00`))}</strong></div>
        {selectedEvents.length ? <div className="grid gap-2">{selectedEvents.map((event) => (
          <button key={event.id} onClick={() => event.goal && onEditGoal(event.goal)} disabled={!event.goal} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold ${eventClasses(event.type)}`}><EventIcon type={event.type} /><span className="min-w-0 flex-1 truncate">{event.type === "plan" ? "Plan" : event.type === "deadline" ? "Must" : "Bill"}: {event.label}</span>{event.amount && <span>{formatMoney(event.amount, currency)}</span>}</button>
        ))}</div> : <p className="rounded-xl bg-slate-50 px-3 py-3 text-[11px] text-slate-400">Nothing scheduled for this date.</p>}
      </div>
    </Card>
  );
}
