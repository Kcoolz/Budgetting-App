import { getAccountBalances } from "./accounts.js";
import {
  categoryName,
  expenseCategoriesFor,
  expenseSubcategoriesFor,
  getUpcomingBills,
  localDate,
  subcategoryName,
  sum
} from "./budget.js";

export function applyTransactionRules(transaction, rules = []) {
  const description = String(transaction.description ?? "");
  return rules.filter((rule) => rule.active !== false && (
    rule.type === "any" || rule.type === transaction.type
  )).reduce((result, rule) => {
    const source = description.toLowerCase();
    const match = rule.match.toLowerCase();
    const matches = rule.operator === "equals" ? source === match : source.includes(match);
    if (!matches) return result;
    return {
      ...result,
      ...(rule.rename ? { description: rule.rename } : {}),
      ...(rule.category ? { category: rule.category } : {}),
      ...(rule.subcategory ? { subcategory: rule.subcategory } : {}),
      tags: [...new Set([...(result.tags ?? []), ...(rule.tags ?? [])])]
    };
  }, { ...transaction });
}

export function ruleMatchesTransaction(transaction, rule) {
  if (rule.active === false || (rule.type !== "any" && rule.type !== transaction.type)) return false;
  const source = String(transaction.description ?? "").toLowerCase();
  const match = String(rule.match ?? "").toLowerCase();
  return rule.operator === "equals" ? source === match : source.includes(match);
}

export function matchTransactionToSchedule(transaction, schedules = []) {
  const candidate = schedules.find((schedule) => {
    if (schedule.active === false || (schedule.type ?? "expense") !== transaction.type) return false;
    const amountDifference = Math.abs(Number(schedule.amount) - Number(transaction.amount));
    const amountTolerance = Math.max(Number(schedule.amount) * 0.08, 2);
    const nameA = normalizeMerchant(schedule.description);
    const nameB = normalizeMerchant(transaction.description);
    const nameMatches = nameA && nameB && (nameA.includes(nameB) || nameB.includes(nameA));
    return nameMatches && amountDifference <= amountTolerance;
  });
  if (!candidate) return transaction;
  const occurrence = getUpcomingBills([candidate], new Date(`${addDays(transaction.date, -4)}T12:00:00`), 9)
    .find(({ dueDate }) => Math.abs(daysBetween(dueDate, transaction.date)) <= 4);
  return occurrence ? { ...transaction, recurringId: candidate.id, recurringOccurrenceId: occurrence.occurrenceId } : transaction;
}

export function suggestRecurringSchedules(transactions = [], existingSchedules = []) {
  const groups = new Map();
  for (const transaction of transactions) {
    const key = [
      transaction.type,
      normalizeMerchant(transaction.description),
      Math.round(Number(transaction.amount) * 100)
    ].join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(transaction);
  }

  const existingKeys = new Set(existingSchedules.map((schedule) => [
    schedule.type ?? "expense",
    normalizeMerchant(schedule.description),
    Math.round(Number(schedule.amount) * 100)
  ].join("|")));

  return [...groups.entries()].flatMap(([key, items]) => {
    if (items.length < 2 || existingKeys.has(key)) return [];
    const ordered = [...items].sort((a, b) => a.date.localeCompare(b.date));
    const gaps = ordered.slice(1).map((item, index) => daysBetween(ordered[index].date, item.date));
    const median = [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
    const frequency = inferFrequency(median);
    if (!frequency || gaps.some((gap) => Math.abs(gap - expectedDays(frequency)) > toleranceDays(frequency))) return [];
    const latest = ordered.at(-1);
    return [{
      id: `suggestion-${key}`,
      type: latest.type,
      description: latest.description,
      amount: Number(latest.amount),
      category: latest.category,
      accountId: latest.accountId,
      frequency,
      startDate: ordered[0].date,
      occurrences: ordered.length
    }];
  }).sort((a, b) => b.occurrences - a.occurrences || a.description.localeCompare(b.description));
}

export function getScheduleTimeline(state, startDate = localDate(), days = 45) {
  const occurrences = getUpcomingBills(state.recurringBills ?? [], new Date(`${startDate}T12:00:00`), days);
  return occurrences.map((occurrence) => {
    const savedStatus = state.scheduleStatuses?.[occurrence.occurrenceId];
    const transaction = findScheduleTransaction(state.transactions ?? [], occurrence);
    const completed = savedStatus?.status || (transaction ? (occurrence.type === "income" ? "received" : "paid") : null);
    return {
      ...occurrence,
      status: completed ?? (occurrence.dueDate < localDate() ? "overdue" : occurrence.dueDate === localDate() ? "due" : "upcoming"),
      transactionId: savedStatus?.transactionId ?? transaction?.id ?? null
    };
  });
}

export function getProjectedCashFlow(state, accountId, startDate = localDate(), days = 45) {
  const opening = getAccountBalances(state, startDate)[accountId] ?? 0;
  const endDate = addDays(startDate, days);
  const knownFuture = (state.transactions ?? []).filter((transaction) => (
    transaction.accountId === accountId &&
    transaction.date > startDate &&
    transaction.date <= endDate
  )).map((transaction) => ({
    id: `transaction-${transaction.id}`,
    date: transaction.date,
    description: transaction.description,
    amount: transaction.type === "income" ? Number(transaction.amount) : -Number(transaction.amount),
    source: "transaction"
  }));

  const scheduled = getScheduleTimeline(state, addDays(startDate, 1), days)
    .filter((occurrence) => occurrence.accountId === accountId && !["paid", "received", "skipped"].includes(occurrence.status))
    .map((occurrence) => ({
      id: occurrence.occurrenceId,
      date: occurrence.dueDate,
      description: occurrence.description,
      amount: occurrence.type === "income" ? Number(occurrence.amount) : -Number(occurrence.amount),
      source: "schedule"
    }));

  const events = [...knownFuture, ...scheduled].sort((a, b) => a.date.localeCompare(b.date) || a.description.localeCompare(b.description));
  let balance = opening;
  return {
    opening,
    closing: opening + sum(events.map(({ amount }) => amount)),
    lowest: events.reduce((lowest, event) => {
      balance += event.amount;
      return Math.min(lowest, balance);
    }, opening),
    events: events.map((event) => {
      const previousEvents = events.slice(0, events.indexOf(event) + 1);
      return { ...event, balance: opening + sum(previousEvents.map(({ amount }) => amount)) };
    })
  };
}

export function getNetWorthHistory(state, endMonth, months = 12) {
  const [endYear, endMonthNumber] = endMonth.split("-").map(Number);
  return Array.from({ length: months }, (_, index) => {
    const offset = index - months + 1;
    const date = new Date(endYear, endMonthNumber - 1 + offset + 1, 0, 12);
    const throughDate = localDate(date);
    const balances = getAccountBalances(state, throughDate);
    return {
      month: throughDate.slice(0, 7),
      label: new Intl.DateTimeFormat(undefined, { month: "short", year: "2-digit" }).format(date),
      value: sum(Object.values(balances))
    };
  });
}

export function getReconciliationSnapshot(state, accountId, date, statementBalance) {
  const clearedBalance = getAccountBalances(state, date, true)[accountId] ?? 0;
  return {
    accountId,
    date,
    statementBalance: Number(statementBalance),
    clearedBalance,
    difference: Number(statementBalance) - clearedBalance
  };
}

export function transactionsToCsv(transactions, state, profileType = "personal") {
  const accountNames = Object.fromEntries((state.accounts ?? []).map(({ id, name }) => [id, name]));
  const categories = expenseCategoriesFor(profileType, state);
  const subcategories = expenseSubcategoriesFor(profileType, state);
  const tagNames = Object.fromEntries((state.tags ?? []).map(({ id, name }) => [id, name]));
  const rows = [["Date", "Type", "Description", "Account", "Category", "Spending detail", "Splits", "Amount", "Cleared", "Tags", "Notes"]];
  for (const transaction of [...transactions].sort((a, b) => a.date.localeCompare(b.date))) {
    const category = transaction.type === "income"
      ? categoryName(transaction.category, "income", profileType)
      : categories.find(({ id }) => id === transaction.category)?.name ?? "Other";
    const detail = subcategories.find(({ id }) => id === transaction.subcategory)?.name ??
      (transaction.subcategory ? subcategoryName(transaction.subcategory, state) : "");
    const splitSummary = (transaction.splits ?? []).map((split) => {
      const splitCategory = categories.find(({ id }) => id === split.category)?.name ?? split.category;
      return `${splitCategory}: ${split.amount}`;
    }).join("; ");
    rows.push([
      transaction.date,
      transaction.type,
      transaction.description,
      accountNames[transaction.accountId] ?? "",
      category,
      detail,
      splitSummary,
      transaction.amount,
      transaction.cleared === false ? "No" : "Yes",
      (transaction.tags ?? []).map((id) => tagNames[id] ?? id).join("; "),
      transaction.notes ?? ""
    ]);
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

function findScheduleTransaction(transactions, occurrence) {
  return transactions.find((transaction) => transaction.recurringOccurrenceId === occurrence.occurrenceId) ??
    transactions.find((transaction) => (
      transaction.recurringId === occurrence.id &&
      Math.abs(daysBetween(transaction.date, occurrence.dueDate)) <= 3
    ));
}

function normalizeMerchant(value) {
  return String(value ?? "").toLowerCase().replace(/\d+/g, "").replace(/[^a-z]+/g, " ").trim();
}

function inferFrequency(days) {
  if (days >= 6 && days <= 8) return "weekly";
  if (days >= 12 && days <= 16) return "biweekly";
  if (days >= 25 && days <= 35) return "monthly";
  if (days >= 350 && days <= 380) return "yearly";
  return null;
}

function expectedDays(frequency) {
  return { weekly: 7, biweekly: 14, monthly: 30, yearly: 365 }[frequency];
}

function toleranceDays(frequency) {
  return { weekly: 2, biweekly: 3, monthly: 5, yearly: 16 }[frequency];
}

function daysBetween(first, second) {
  return Math.round((new Date(`${second}T12:00:00`) - new Date(`${first}T12:00:00`)) / 86_400_000);
}

function addDays(value, amount) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return localDate(date);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}
