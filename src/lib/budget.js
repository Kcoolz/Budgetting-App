import { createDefaultAccount, normalizeAccounts, normalizeTransfers } from "./accounts.js";

export const EXPENSE_CATEGORIES = [
  { id: "housing", name: "Housing", shortName: "Rent", color: "#4b86b4" },
  { id: "food", name: "Food & groceries", shortName: "Food", color: "#e59b62" },
  { id: "transport", name: "Transportation", shortName: "Transport", color: "#6f83ad" },
  { id: "bills", name: "Bills & utilities", shortName: "Bills", color: "#9a7ea8" },
  { id: "fun", name: "Fun & leisure", shortName: "Entertainment", color: "#d97778" },
  { id: "health", name: "Health", shortName: "Health", color: "#55a18d" },
  { id: "shopping", name: "Shopping", shortName: "Shopping", color: "#be8b55" },
  { id: "other", name: "Other", shortName: "Other", color: "#87908f" }
];

export const BUSINESS_EXPENSE_CATEGORIES = [
  { id: "housing", name: "Rent & workspace", shortName: "Workspace", color: "#3b7f77" },
  { id: "food", name: "Meals & hospitality", shortName: "Meals", color: "#c58a4a" },
  { id: "transport", name: "Travel & vehicle", shortName: "Travel", color: "#587c91" },
  { id: "bills", name: "Software & utilities", shortName: "Software", color: "#6f63a5" },
  { id: "fun", name: "Marketing & sales", shortName: "Marketing", color: "#b85e6c" },
  { id: "health", name: "Payroll & people", shortName: "People", color: "#4b927a" },
  { id: "shopping", name: "Supplies & equipment", shortName: "Equipment", color: "#a77546" },
  { id: "other", name: "Professional & other", shortName: "Professional", color: "#66747a" }
];

export const EXPENSE_SUBCATEGORIES = [
  { id: "rent-mortgage", category: "housing", name: "Rent & mortgage" },
  { id: "home-maintenance", category: "housing", name: "Home maintenance" },
  { id: "housing-other", category: "housing", name: "Other housing" },
  { id: "groceries", category: "food", name: "Groceries" },
  { id: "dining-out", category: "food", name: "Dining out" },
  { id: "coffee", category: "food", name: "Coffee & snacks" },
  { id: "food-other", category: "food", name: "Other food" },
  { id: "gas", category: "transport", name: "Gas & fuel" },
  { id: "transit", category: "transport", name: "Public transit" },
  { id: "rideshare", category: "transport", name: "Rideshare & taxi" },
  { id: "parking", category: "transport", name: "Parking" },
  { id: "vehicle", category: "transport", name: "Vehicle costs" },
  { id: "transport-other", category: "transport", name: "Other transportation" },
  { id: "utilities", category: "bills", name: "Utilities" },
  { id: "phone-internet", category: "bills", name: "Phone & internet" },
  { id: "insurance", category: "bills", name: "Insurance" },
  { id: "subscriptions", category: "bills", name: "Subscriptions" },
  { id: "bills-other", category: "bills", name: "Other bills" },
  { id: "entertainment", category: "fun", name: "Entertainment" },
  { id: "hobbies", category: "fun", name: "Hobbies" },
  { id: "travel", category: "fun", name: "Travel" },
  { id: "fun-other", category: "fun", name: "Other fun" },
  { id: "medical", category: "health", name: "Medical" },
  { id: "fitness", category: "health", name: "Fitness" },
  { id: "health-other", category: "health", name: "Other health" },
  { id: "clothing", category: "shopping", name: "Clothing" },
  { id: "household", category: "shopping", name: "Household items" },
  { id: "online-shopping", category: "shopping", name: "Online shopping" },
  { id: "shopping-other", category: "shopping", name: "Other shopping" },
  { id: "gifts", category: "other", name: "Gifts & donations" },
  { id: "fees", category: "other", name: "Fees" },
  { id: "other-detail", category: "other", name: "Other" }
];

export const BUSINESS_EXPENSE_SUBCATEGORIES = [
  { id: "workspace-rent", category: "housing", name: "Workspace rent" },
  { id: "workspace-services", category: "housing", name: "Workspace services" },
  { id: "client-meals", category: "food", name: "Client meals" },
  { id: "staff-meals", category: "food", name: "Staff meals" },
  { id: "business-travel", category: "transport", name: "Business travel" },
  { id: "business-fuel", category: "transport", name: "Fuel & mileage" },
  { id: "business-parking", category: "transport", name: "Parking & transit" },
  { id: "software", category: "bills", name: "Software" },
  { id: "business-utilities", category: "bills", name: "Utilities & telecom" },
  { id: "advertising", category: "fun", name: "Advertising" },
  { id: "sales-events", category: "fun", name: "Sales & events" },
  { id: "payroll", category: "health", name: "Payroll" },
  { id: "employee-benefits", category: "health", name: "Benefits" },
  { id: "office-supplies", category: "shopping", name: "Office supplies" },
  { id: "equipment", category: "shopping", name: "Equipment" },
  { id: "professional-services", category: "other", name: "Professional services" },
  { id: "taxes-fees", category: "other", name: "Taxes & fees" },
  { id: "business-other", category: "other", name: "Other operating cost" }
];

export const ALL_EXPENSE_SUBCATEGORIES = [...EXPENSE_SUBCATEGORIES, ...BUSINESS_EXPENSE_SUBCATEGORIES];

export const INCOME_CATEGORIES = [
  { id: "pay", name: "Paycheque" },
  { id: "freelance", name: "Freelance" },
  { id: "refund", name: "Refund" },
  { id: "other-income", name: "Other income" }
];

export const BUSINESS_INCOME_CATEGORIES = [
  { id: "pay", name: "Product sales" },
  { id: "freelance", name: "Service revenue" },
  { id: "refund", name: "Refunds & credits" },
  { id: "other-income", name: "Other revenue" }
];

export function expenseCategoriesFor(profileType = "personal") {
  return profileType === "business" ? BUSINESS_EXPENSE_CATEGORIES : EXPENSE_CATEGORIES;
}

export function expenseSubcategoriesFor(profileType = "personal") {
  return profileType === "business" ? BUSINESS_EXPENSE_SUBCATEGORIES : EXPENSE_SUBCATEGORIES;
}

export function incomeCategoriesFor(profileType = "personal") {
  return profileType === "business" ? BUSINESS_INCOME_CATEGORIES : INCOME_CATEGORIES;
}

export const RECURRENCE_OPTIONS = [
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "yearly", name: "Yearly" }
];

export const DASHBOARD_SECTIONS = [
  { id: "summary", name: "Monthly snapshot", description: "Income, spending, and safe-to-spend cards" },
  { id: "spending", name: "Budget health", description: "Categories needing attention and cash-flow snapshot" },
  { id: "recurring", name: "Upcoming bills", description: "The next three obligations at a glance" },
  { id: "goals", name: "Savings snapshot", description: "Total progress and the next goal to focus on" },
  { id: "debt", name: "Debt payoff snapshot", description: "Card balances, monthly payment, payoff target, and current focus" },
  { id: "transactions", name: "Recent activity", description: "The latest four transactions and review count" }
];

export function createDefaultDashboard() {
  return { order: DASHBOARD_SECTIONS.map(({ id }) => id), hidden: [] };
}

export function normalizeDashboard(value) {
  const validIds = DASHBOARD_SECTIONS.map(({ id }) => id);
  const validIdSet = new Set(validIds);
  const suppliedOrder = Array.isArray(value?.order) ? value.order : [];
  const order = [...new Set(suppliedOrder.filter((id) => validIdSet.has(id)))];
  for (const id of validIds) if (!order.includes(id)) order.push(id);

  const hidden = Array.isArray(value?.hidden)
    ? [...new Set(value.hidden.filter((id) => validIdSet.has(id)))]
    : [];

  return { order, hidden };
}

export function createInitialState(profileType = "personal") {
  return {
    version: 3,
    currency: "CAD",
    budgets: Object.fromEntries(EXPENSE_CATEGORIES.map(({ id }) => [id, 0])),
    rollover: { enabled: false, startMonth: null },
    accounts: [createDefaultAccount(profileType)],
    transfers: [],
    transactions: [],
    recurringBills: [],
    goals: [],
    debts: [],
    debtPlan: { strategy: "avalanche", extraPayment: 0 },
    dashboard: createDefaultDashboard()
  };
}

export function normalizeState(value, profileType = "personal") {
  const initial = createInitialState(profileType);
  if (!value || typeof value !== "object") return initial;

  const allowedCurrencies = new Set(["CAD", "USD", "EUR", "GBP", "AUD"]);
  const budgets = { ...initial.budgets };

  for (const category of EXPENSE_CATEGORIES) {
    const amount = Number(value.budgets?.[category.id]);
    budgets[category.id] = Number.isFinite(amount) && amount >= 0 ? amount : 0;
  }

  const accounts = normalizeAccounts(value.accounts, profileType);
  const defaultAccountId = accounts[0].id;

  const transactions = Array.isArray(value.transactions)
    ? value.transactions.filter(isValidTransaction).map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
        accountId: accounts.some(({ id }) => id === transaction.accountId) ? transaction.accountId : defaultAccountId,
        reviewed: typeof transaction.reviewed === "boolean" ? transaction.reviewed : true
      }))
    : [];

  const transfers = normalizeTransfers(value.transfers, accounts);

  const recurringBills = Array.isArray(value.recurringBills)
    ? value.recurringBills.filter(isValidRecurringBill).map((bill) => ({
        ...bill,
        amount: Number(bill.amount),
        active: bill.active !== false
      }))
    : [];

  const goals = Array.isArray(value.goals)
    ? value.goals.filter(isValidGoal).map((goal) => ({
        ...goal,
        target: Number(goal.target),
        targetDate: normalizeOptionalDate(goal.targetDate),
        deadline: normalizeOptionalDate(goal.deadline),
        contributions: Array.isArray(goal.contributions)
          ? goal.contributions.filter(isValidContribution).map((contribution) => ({
              ...contribution,
              amount: Number(contribution.amount)
            }))
          : []
      }))
    : [];

  const debts = Array.isArray(value.debts)
    ? value.debts.filter(isValidDebt).map((debt) => ({
        ...debt,
        accountId: accounts.some(({ id }) => id === debt.accountId) ? debt.accountId : null,
        balance: Number(debt.balance),
        apr: Number(debt.apr),
        minimumPayment: Number(debt.minimumPayment)
      }))
    : [];

  const extraPayment = Number(value.debtPlan?.extraPayment);
  const debtPlan = {
    strategy: ["avalanche", "snowball"].includes(value.debtPlan?.strategy)
      ? value.debtPlan.strategy
      : "avalanche",
    extraPayment: Number.isFinite(extraPayment) && extraPayment >= 0 ? extraPayment : 0
  };

  const rolloverValue = value.rollover ?? {
    enabled: Boolean(value.rolloverEnabled),
    startMonth: value.rolloverStartMonth ?? null
  };
  const rolloverEnabled = rolloverValue?.enabled === true;
  const rolloverStartMonth = /^\d{4}-\d{2}$/.test(rolloverValue?.startMonth ?? "")
    ? rolloverValue.startMonth
    : rolloverEnabled
      ? localDate().slice(0, 7)
      : null;

  return {
    version: 3,
    currency: allowedCurrencies.has(value.currency) ? value.currency : initial.currency,
    budgets,
    rollover: { enabled: rolloverEnabled, startMonth: rolloverStartMonth },
    accounts,
    transfers,
    transactions,
    recurringBills,
    goals,
    debts,
    debtPlan,
    dashboard: normalizeDashboard(value.dashboard)
  };
}

function isValidTransaction(transaction) {
  return Boolean(
    transaction &&
      typeof transaction.id === "string" &&
      ["income", "expense"].includes(transaction.type) &&
      typeof transaction.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(transaction.date) &&
      typeof transaction.description === "string" &&
      typeof transaction.category === "string" &&
      Number.isFinite(Number(transaction.amount)) &&
      Number(transaction.amount) > 0
  );
}

function isValidRecurringBill(bill) {
  return Boolean(
    bill &&
      typeof bill.id === "string" &&
      typeof bill.description === "string" &&
      typeof bill.category === "string" &&
      RECURRENCE_OPTIONS.some(({ id }) => id === bill.frequency) &&
      /^\d{4}-\d{2}-\d{2}$/.test(bill.startDate ?? "") &&
      Number.isFinite(Number(bill.amount)) &&
      Number(bill.amount) > 0
  );
}

function isValidGoal(goal) {
  return Boolean(
    goal &&
      typeof goal.id === "string" &&
      typeof goal.name === "string" &&
      Number.isFinite(Number(goal.target)) &&
      Number(goal.target) > 0
  );
}

function normalizeOptionalDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return null;
  return Number.isNaN(new Date(`${value}T12:00:00`).getTime()) ? null : value;
}

function isValidContribution(contribution) {
  return Boolean(
    contribution &&
      typeof contribution.id === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(contribution.date ?? "") &&
      Number.isFinite(Number(contribution.amount)) &&
      Number(contribution.amount) > 0
  );
}

function isValidDebt(debt) {
  return Boolean(
    debt &&
      typeof debt.id === "string" &&
      typeof debt.name === "string" &&
      debt.name.trim() &&
      Number.isFinite(Number(debt.balance)) &&
      Number(debt.balance) > 0 &&
      Number.isFinite(Number(debt.apr)) &&
      Number(debt.apr) >= 0 &&
      Number(debt.apr) <= 100 &&
      Number.isFinite(Number(debt.minimumPayment)) &&
      Number(debt.minimumPayment) > 0
  );
}

export function monthlyRecurringAmount(bill) {
  const amount = Math.max(Number(bill?.amount) || 0, 0);
  if (bill?.frequency === "weekly") return amount * 52 / 12;
  if (bill?.frequency === "yearly") return amount / 12;
  return amount;
}

export function calculateDebtPlan(debts, extraPayment = 0, strategy = "avalanche") {
  const cards = (Array.isArray(debts) ? debts : [])
    .filter(isValidDebt)
    .map((debt) => ({
      ...debt,
      balance: Number(debt.balance),
      apr: Number(debt.apr),
      minimumPayment: Number(debt.minimumPayment)
    }));
  const extra = Math.max(Number(extraPayment) || 0, 0);
  const minimumPayment = sum(cards.map(({ minimumPayment: payment }) => payment));
  const monthlyPayment = minimumPayment + extra;
  const totalBalance = sum(cards.map(({ balance }) => balance));
  const payoffOrder = [...cards]
    .sort((a, b) => strategy === "snowball"
      ? a.balance - b.balance || b.apr - a.apr
      : b.apr - a.apr || a.balance - b.balance)
    .map(({ id, name, apr, balance }) => ({ id, name, apr, balance }));

  if (!cards.length) {
    return { status: "empty", months: 0, totalBalance: 0, totalInterest: 0, minimumPayment: 0, monthlyPayment: extra, payoffOrder };
  }

  const balances = Object.fromEntries(cards.map(({ id, balance }) => [id, balance]));
  let months = 0;
  let totalInterest = 0;
  let previousBalance = totalBalance;

  while (sum(Object.values(balances)) > 0.005 && months < 600) {
    for (const card of cards) {
      if (balances[card.id] <= 0) continue;
      const interest = balances[card.id] * (card.apr / 100 / 12);
      balances[card.id] += interest;
      totalInterest += interest;
    }

    let remainingPayment = monthlyPayment;
    for (const card of cards) {
      if (balances[card.id] <= 0 || remainingPayment <= 0) continue;
      const payment = Math.min(card.minimumPayment, balances[card.id], remainingPayment);
      balances[card.id] -= payment;
      remainingPayment -= payment;
    }

    for (const target of payoffOrder) {
      if (balances[target.id] <= 0 || remainingPayment <= 0) continue;
      const payment = Math.min(balances[target.id], remainingPayment);
      balances[target.id] -= payment;
      remainingPayment -= payment;
    }

    months += 1;
    const currentBalance = sum(Object.values(balances));
    if (currentBalance >= previousBalance - 0.005) {
      return { status: "payment-too-low", months: null, totalBalance, totalInterest, minimumPayment, monthlyPayment, payoffOrder };
    }
    previousBalance = currentBalance;
  }

  return {
    status: months >= 600 ? "long-term" : "ok",
    months: months >= 600 ? null : months,
    totalBalance,
    totalInterest,
    minimumPayment,
    monthlyPayment,
    payoffOrder
  };
}

export function getMonthlySummary(state, month) {
  const daysInMonth = getDaysInMonth(month);
  const transactions = state.transactions
    .filter((transaction) => transaction.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));
  const income = sum(transactions.filter(({ type }) => type === "income").map(({ amount }) => amount));
  const expenses = sum(transactions.filter(({ type }) => type === "expense").map(({ amount }) => amount));
  const { budgets: effectiveBudgets, carryovers } = getEffectiveBudgets(state, month);
  const totalBudget = sum(Object.values(effectiveBudgets));
  const categorySpending = getCategorySpending(state.transactions, month);
  const dailySpending = Array.from({ length: daysInMonth }, () => 0);

  for (const transaction of transactions) {
    if (transaction.type === "expense") {
      dailySpending[Number(transaction.date.slice(8, 10)) - 1] += Number(transaction.amount);
    }
  }

  const goalReserved = sum(
    state.goals.flatMap((goal) => goal.contributions ?? [])
      .filter((contribution) => contribution.date.startsWith(month))
      .map(({ amount }) => amount)
  );
  const budgetRemaining = totalBudget - expenses;
  const availableBeforeGoals = totalBudget > 0 ? budgetRemaining : income - expenses;

  return {
    transactions,
    income,
    expenses,
    net: income - expenses,
    totalBudget,
    budgetRemaining,
    goalReserved,
    spendableRemaining: availableBeforeGoals - goalReserved,
    percentSpent: totalBudget > 0 ? (expenses / totalBudget) * 100 : 0,
    categorySpending,
    effectiveBudgets,
    carryovers,
    dailySpending,
    unreviewedCount: transactions.filter((transaction) => transaction.reviewed === false).length
  };
}

export function getEffectiveBudgets(state, month) {
  const baseBudgets = Object.fromEntries(
    EXPENSE_CATEGORIES.map(({ id }) => [id, Math.max(Number(state.budgets?.[id]) || 0, 0)])
  );
  const emptyCarryovers = Object.fromEntries(EXPENSE_CATEGORIES.map(({ id }) => [id, 0]));
  const rollover = state.rollover ?? {};

  if (!rollover.enabled || !rollover.startMonth || month <= rollover.startMonth) {
    return { budgets: baseBudgets, carryovers: emptyCarryovers };
  }

  let cursor = rollover.startMonth;
  let effective = { ...baseBudgets };
  let iterations = 0;

  while (cursor < month && iterations < 240) {
    const spending = getCategorySpending(state.transactions, cursor);
    const carryovers = Object.fromEntries(
      EXPENSE_CATEGORIES.map(({ id }) => [id, effective[id] - spending[id]])
    );
    effective = Object.fromEntries(
      EXPENSE_CATEGORIES.map(({ id }) => [id, baseBudgets[id] + carryovers[id]])
    );
    cursor = shiftMonth(cursor, 1);
    iterations += 1;
  }

  return {
    budgets: effective,
    carryovers: Object.fromEntries(
      EXPENSE_CATEGORIES.map(({ id }) => [id, effective[id] - baseBudgets[id]])
    )
  };
}

function getCategorySpending(transactions, month) {
  const spending = Object.fromEntries(EXPENSE_CATEGORIES.map(({ id }) => [id, 0]));
  for (const transaction of transactions) {
    if (
      transaction.type === "expense" &&
      transaction.date.startsWith(month) &&
      transaction.category in spending
    ) {
      spending[transaction.category] += Number(transaction.amount);
    }
  }
  return spending;
}

export function getGoalMonthlyPace(remaining, date, referenceDate = new Date()) {
  const normalizedDate = normalizeOptionalDate(date);
  const amount = Math.max(Number(remaining) || 0, 0);
  if (!normalizedDate) return null;
  if (amount === 0) return 0;

  const today = localDate(referenceDate);
  if (normalizedDate < today) return null;
  const [targetYear, targetMonth] = normalizedDate.slice(0, 7).split("-").map(Number);
  const [currentYear, currentMonth] = today.slice(0, 7).split("-").map(Number);
  const monthsRemaining = Math.max((targetYear - currentYear) * 12 + targetMonth - currentMonth + 1, 1);
  return amount / monthsRemaining;
}

export function getGoalSummaries(goals, month, referenceDate = new Date()) {
  return goals.map((goal) => {
    const saved = sum((goal.contributions ?? []).map(({ amount }) => amount));
    const remaining = Math.max(Number(goal.target) - saved, 0);
    const assignedThisMonth = sum(
      (goal.contributions ?? [])
        .filter((contribution) => contribution.date.startsWith(month))
        .map(({ amount }) => amount)
    );
    return {
      ...goal,
      saved,
      assignedThisMonth,
      remaining,
      percent: Number(goal.target) > 0 ? (saved / Number(goal.target)) * 100 : 0,
      targetMonthly: getGoalMonthlyPace(remaining, goal.targetDate, referenceDate),
      deadlineMonthly: getGoalMonthlyPace(remaining, goal.deadline, referenceDate),
      dateStatus: remaining === 0
        ? "funded"
        : goal.deadline && goal.deadline < localDate(referenceDate)
          ? "deadline-overdue"
          : goal.targetDate && goal.targetDate < localDate(referenceDate)
            ? "plan-overdue"
            : goal.targetDate && goal.deadline && goal.targetDate > goal.deadline
              ? "date-conflict"
              : "on-track"
    };
  });
}

export function getUpcomingBills(recurringBills, referenceDate = new Date(), days = 14) {
  const rangeStart = startOfLocalDay(referenceDate);
  const rangeEnd = addDays(rangeStart, days - 1);
  const occurrences = [];

  for (const bill of recurringBills.filter((item) => item.active !== false)) {
    const start = parseLocalDate(bill.startDate);
    if (bill.frequency === "weekly") {
      const elapsedDays = Math.max(0, Math.ceil((rangeStart - start) / 86_400_000));
      let occurrence = addDays(start, Math.ceil(elapsedDays / 7) * 7);
      while (occurrence <= rangeEnd) {
        if (occurrence >= rangeStart) occurrences.push(toOccurrence(bill, occurrence));
        occurrence = addDays(occurrence, 7);
      }
      continue;
    }

    if (bill.frequency === "monthly") {
      const monthDifference =
        (rangeStart.getFullYear() - start.getFullYear()) * 12 +
        rangeStart.getMonth() - start.getMonth();
      let index = Math.max(0, monthDifference - 1);
      let occurrence = addMonthsAnchored(start, index);
      while (occurrence <= rangeEnd) {
        if (occurrence >= rangeStart && occurrence >= start) occurrences.push(toOccurrence(bill, occurrence));
        index += 1;
        occurrence = addMonthsAnchored(start, index);
      }
      continue;
    }

    let year = Math.max(start.getFullYear(), rangeStart.getFullYear() - 1);
    let occurrence = addYearsAnchored(start, year - start.getFullYear());
    while (occurrence <= rangeEnd) {
      if (occurrence >= rangeStart && occurrence >= start) occurrences.push(toOccurrence(bill, occurrence));
      year += 1;
      occurrence = addYearsAnchored(start, year - start.getFullYear());
    }
  }

  return occurrences.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

function toOccurrence(bill, date) {
  return { ...bill, occurrenceId: `${bill.id}-${localDate(date)}`, dueDate: localDate(date) };
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function parseLocalDate(value) {
  return new Date(`${value}T12:00:00`);
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function addMonthsAnchored(start, amount) {
  const year = start.getFullYear();
  const month = start.getMonth() + amount;
  const target = new Date(year, month, 1, 12);
  target.setDate(Math.min(start.getDate(), new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()));
  return target;
}

function addYearsAnchored(start, amount) {
  const year = start.getFullYear() + amount;
  const month = start.getMonth();
  const day = Math.min(start.getDate(), new Date(year, month + 1, 0).getDate());
  return new Date(year, month, day, 12);
}

export function getSpendingComparison(state, month, referenceDate = new Date()) {
  const currentMonth = localDate(referenceDate).slice(0, 7);
  const cutoffDay = month === currentMonth ? referenceDate.getDate() : getDaysInMonth(month);
  const previousMonth = shiftMonth(month, -1);
  const previousCutoff = Math.min(cutoffDay, getDaysInMonth(previousMonth));
  const expenseThrough = (targetMonth, day) =>
    sum(
      state.transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.date.startsWith(targetMonth) &&
            Number(transaction.date.slice(8, 10)) <= day
        )
        .map(({ amount }) => amount)
    );

  const current = expenseThrough(month, cutoffDay);
  const previous = expenseThrough(previousMonth, previousCutoff);
  if (previous === 0) return { percent: null, direction: "none", label: "No prior-month comparison yet" };

  const change = ((current - previous) / previous) * 100;
  const rounded = Math.abs(Math.round(change));
  if (rounded === 0) return { percent: 0, direction: "same", label: "About the same as last month" };
  return {
    percent: rounded,
    direction: change < 0 ? "less" : "more",
    label: `${rounded}% ${change < 0 ? "less" : "more"} than this time last month`
  };
}

export function getSafeToSpend(availableAmount, month, referenceDate = new Date()) {
  const currentMonth = localDate(referenceDate).slice(0, 7);
  if (month < currentMonth) return { daysRemaining: 0, dailyAmount: 0, label: "Month complete" };

  const daysRemaining = month === currentMonth
    ? getDaysInMonth(month) - referenceDate.getDate() + 1
    : getDaysInMonth(month);
  return {
    daysRemaining,
    dailyAmount: Math.max(availableAmount, 0) / daysRemaining,
    label: null
  };
}

export function parseQuickTransaction(value, profileType = "personal") {
  const match = value.match(/^\s*(?:CA\$|US\$|A\$|[$\u00A3\u20AC])?\s*(\d+(?:[.,]\d{1,2})?)\s+(.+?)\s*$/i);
  if (!match) return null;
  const amount = Number(match[1].replace(",", "."));
  const description = match[2].trim();
  if (!Number.isFinite(amount) || amount <= 0 || !description) return null;
  const category = guessCategory(description, profileType);
  return { amount, description, category, subcategory: guessSubcategory(description, category, profileType) };
}

export function guessCategory(description, profileType = "personal") {
  const value = description.toLowerCase();
  if (profileType === "business") {
    if (/rent|lease|cowork|office space/.test(value)) return "housing";
    if (/meal|lunch|dinner|restaurant|catering|coffee/.test(value)) return "food";
    if (/flight|hotel|travel|gas|fuel|mileage|parking|transit|uber|taxi/.test(value)) return "transport";
    if (/software|subscription|hosting|domain|phone|internet|utility/.test(value)) return "bills";
    if (/marketing|advertis|campaign|promotion|conference|trade show/.test(value)) return "fun";
    if (/payroll|salary|wage|benefit|contractor/.test(value)) return "health";
    if (/supplies|equipment|computer|laptop|printer|furniture/.test(value)) return "shopping";
    if (/accountant|legal|lawyer|consult|tax|fee|bookkeep/.test(value)) return "other";
    return "other";
  }
  if (/rent|mortgage|condo/.test(value)) return "housing";
  if (/coffee|cafe|grocery|groceries|food|lunch|dinner|restaurant/.test(value)) return "food";
  if (/gas|fuel|uber|taxi|bus|train|transit|parking/.test(value)) return "transport";
  if (/phone|internet|hydro|utility|utilities|electric|insurance/.test(value)) return "bills";
  if (/movie|game|concert|netflix|spotify|entertainment/.test(value)) return "fun";
  if (/doctor|dentist|pharmacy|medicine|gym/.test(value)) return "health";
  if (/shop|clothes|amazon/.test(value)) return "shopping";
  return "other";
}

export function guessSubcategory(description, category = guessCategory(description), profileType = "personal") {
  const value = description.toLowerCase();
  if (profileType === "business") {
    const businessMatches = {
      housing: [[/rent|lease|cowork|office space/, "workspace-rent"], [/clean|repair|security|workspace/, "workspace-services"]],
      food: [[/client|customer|prospect|restaurant|dinner/, "client-meals"], [/staff|team|catering|lunch|coffee/, "staff-meals"]],
      transport: [[/flight|hotel|travel|uber|taxi/, "business-travel"], [/gas|fuel|mileage/, "business-fuel"], [/parking|transit|train|bus/, "business-parking"]],
      bills: [[/software|subscription|hosting|domain|cloud|saas/, "software"], [/phone|internet|utility|utilities|hydro/, "business-utilities"]],
      fun: [[/marketing|advertis|campaign|promotion/, "advertising"], [/conference|event|trade show|sales/, "sales-events"]],
      health: [[/payroll|salary|wage|contractor/, "payroll"], [/benefit|insurance|wellness/, "employee-benefits"]],
      shopping: [[/supplies|stationery|paper|ink/, "office-supplies"], [/equipment|computer|laptop|printer|furniture/, "equipment"]],
      other: [[/accountant|legal|lawyer|consult|bookkeep/, "professional-services"], [/tax|fee|license|permit/, "taxes-fees"]]
    };
    const fallback = {
      housing: "workspace-services",
      food: "staff-meals",
      transport: "business-travel",
      bills: "software",
      fun: "advertising",
      health: "payroll",
      shopping: "office-supplies",
      other: "business-other"
    };
    return businessMatches[category]?.find(([pattern]) => pattern.test(value))?.[1] ?? fallback[category] ?? "business-other";
  }
  const matches = {
    housing: [
      [/rent|mortgage|condo fee/, "rent-mortgage"],
      [/repair|maintenance|plumber|hardware|renovation/, "home-maintenance"]
    ],
    food: [
      [/coffee|cafe|café|tea|bakery|snack/, "coffee"],
      [/restaurant|dinner|lunch|breakfast|takeout|take-out|delivery|doordash|skip|uber\s*eats|bar|pub|pizza/, "dining-out"],
      [/grocery|groceries|supermarket|market|costco|walmart/, "groceries"]
    ],
    transport: [
      [/gas|fuel|petro|shell|esso|chevron/, "gas"],
      [/uber|lyft|taxi|cab/, "rideshare"],
      [/bus|train|transit|subway|metro|streetcar/, "transit"],
      [/parking/, "parking"],
      [/car|auto|mechanic|repair|tire|oil change|registration/, "vehicle"]
    ],
    bills: [
      [/hydro|utility|utilities|electric|water|heating|natural gas/, "utilities"],
      [/phone|internet|mobile|cell/, "phone-internet"],
      [/insurance/, "insurance"],
      [/subscription|netflix|spotify|prime|icloud/, "subscriptions"]
    ],
    fun: [
      [/movie|cinema|concert|show|theatre|theater|game|museum/, "entertainment"],
      [/hobby|craft|book|music/, "hobbies"],
      [/hotel|flight|vacation|travel|airbnb/, "travel"]
    ],
    health: [
      [/doctor|dentist|pharmacy|medicine|medical|therapy/, "medical"],
      [/gym|fitness|yoga|sport/, "fitness"]
    ],
    shopping: [
      [/clothes|clothing|shirt|shoes|apparel/, "clothing"],
      [/household|furniture|decor|kitchen/, "household"],
      [/amazon|online/, "online-shopping"]
    ],
    other: [
      [/gift|donation|charity/, "gifts"],
      [/fee|charge|interest/, "fees"]
    ]
  };
  const fallback = {
    housing: "housing-other",
    food: "food-other",
    transport: "transport-other",
    bills: "bills-other",
    fun: "fun-other",
    health: "health-other",
    shopping: "shopping-other",
    other: "other-detail"
  };
  return matches[category]?.find(([pattern]) => pattern.test(value))?.[1] ?? fallback[category] ?? "other-detail";
}

export function getTransactionSubcategory(transaction, profileType = "personal") {
  const explicit = expenseSubcategoriesFor(profileType).find(
    ({ id, category }) => id === transaction?.subcategory && category === transaction?.category
  );
  return explicit?.id ?? guessSubcategory(transaction?.description ?? "", transaction?.category, profileType);
}

export function getSpendingTrends(state, endMonth, monthCount = 6, profileType = "personal") {
  const count = Math.max(1, Math.min(Math.round(Number(monthCount) || 6), 24));
  const months = Array.from({ length: count }, (_, index) => shiftMonth(endMonth, index - count + 1));
  const categories = expenseCategoriesFor(profileType);
  const subcategories = expenseSubcategoriesFor(profileType);

  return months.map((month) => {
    const expenses = state.transactions.filter(
      (transaction) => transaction.type === "expense" && transaction.date.startsWith(month)
    );
    const byCategory = Object.fromEntries(categories.map(({ id }) => [id, 0]));
    const bySubcategory = Object.fromEntries(subcategories.map(({ id }) => [id, 0]));

    for (const transaction of expenses) {
      const amount = Number(transaction.amount) || 0;
      if (transaction.category in byCategory) byCategory[transaction.category] += amount;
      bySubcategory[getTransactionSubcategory(transaction, profileType)] += amount;
    }

    return {
      month,
      label: new Intl.DateTimeFormat(undefined, { month: "short", year: "2-digit" }).format(new Date(`${month}-01T12:00:00`)),
      total: sum(expenses.map(({ amount }) => amount)),
      byCategory,
      bySubcategory
    };
  });
}

export function progressTone(percent) {
  if (percent >= 90) return "danger";
  if (percent >= 70) return "warning";
  return "healthy";
}

export function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

export function formatMoney(amount, currency, options = {}) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: options.code ? "narrowSymbol" : "symbol",
    minimumFractionDigits: options.whole ? 0 : 2,
    maximumFractionDigits: options.whole ? 0 : 2
  }).format(amount);
}

export function categoryName(id, type = "expense", profileType = "personal") {
  const categories = type === "income" ? incomeCategoriesFor(profileType) : expenseCategoriesFor(profileType);
  return categories.find((category) => category.id === id)?.name ?? "Other";
}

export function subcategoryName(id) {
  return ALL_EXPENSE_SUBCATEGORIES.find((subcategory) => subcategory.id === id)?.name ?? "Other";
}

export function getDaysInMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber, 0).getDate();
}

export function shiftMonth(month, amount) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1, 12);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function dateForMonth(month, referenceDate = new Date()) {
  const current = localDate(referenceDate);
  return current.startsWith(month) ? current : `${month}-01`;
}
