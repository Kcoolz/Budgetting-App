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

export function expenseCategoriesFor(profileType = "personal", state = null) {
  const defaults = profileType === "business" ? BUSINESS_EXPENSE_CATEGORIES : EXPENSE_CATEGORIES;
  return [...defaults, ...(Array.isArray(state?.customCategories) ? state.customCategories : [])]
    .filter((category) => category.archived !== true);
}

export function expenseSubcategoriesFor(profileType = "personal", state = null) {
  const defaults = profileType === "business" ? BUSINESS_EXPENSE_SUBCATEGORIES : EXPENSE_SUBCATEGORIES;
  return [...defaults, ...(Array.isArray(state?.customSubcategories) ? state.customSubcategories : [])]
    .filter((subcategory) => subcategory.archived !== true);
}

export function incomeCategoriesFor(profileType = "personal") {
  return profileType === "business" ? BUSINESS_INCOME_CATEGORIES : INCOME_CATEGORIES;
}

export const RECURRENCE_OPTIONS = [
  { id: "weekly", name: "Weekly" },
  { id: "biweekly", name: "Every two weeks" },
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
    version: 5,
    currency: "CAD",
    budgets: Object.fromEntries(EXPENSE_CATEGORIES.map(({ id }) => [id, 0])),
    monthlyBudgets: {},
    rollover: { enabled: false, startMonth: null },
    customCategories: [],
    customSubcategories: [],
    tags: [],
    rules: [],
    reconciliations: [],
    scheduleStatuses: {},
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
  const customCategories = normalizeCustomCategories(value.customCategories);
  const customSubcategories = normalizeCustomSubcategories(value.customSubcategories, customCategories);
  const categoryIds = [...EXPENSE_CATEGORIES.map(({ id }) => id), ...customCategories.map(({ id }) => id)];
  const budgets = Object.fromEntries(categoryIds.map((id) => [id, 0]));

  for (const id of categoryIds) {
    const amount = Number(value.budgets?.[id]);
    budgets[id] = Number.isFinite(amount) && amount >= 0 ? amount : 0;
  }

  const monthlyBudgets = {};
  if (value.monthlyBudgets && typeof value.monthlyBudgets === "object" && !Array.isArray(value.monthlyBudgets)) {
    for (const [month, plan] of Object.entries(value.monthlyBudgets)) {
      if (!isValidMonthString(month) || !plan || typeof plan !== "object") continue;
      monthlyBudgets[month] = normalizeBudgetAmounts(plan, categoryIds);
    }
  }

  const accounts = normalizeAccounts(value.accounts, profileType);
  const defaultAccountId = accounts[0].id;

  const transactions = Array.isArray(value.transactions)
    ? value.transactions.filter(isValidTransaction).map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
        accountId: accounts.some(({ id }) => id === transaction.accountId) ? transaction.accountId : defaultAccountId,
        reviewed: typeof transaction.reviewed === "boolean" ? transaction.reviewed : true,
        cleared: typeof transaction.cleared === "boolean" ? transaction.cleared : true,
        notes: typeof transaction.notes === "string" ? transaction.notes.slice(0, 500) : "",
        tags: normalizeStringIds(transaction.tags),
        splits: normalizeTransactionSplits(transaction.splits, Number(transaction.amount))
      }))
    : [];

  const transfers = normalizeTransfers(value.transfers, accounts);

  const recurringBills = Array.isArray(value.recurringBills)
    ? value.recurringBills.filter(isValidRecurringBill).map((bill) => ({
        ...bill,
        type: bill.type === "income" ? "income" : "expense",
        amount: Number(bill.amount),
        active: bill.active !== false,
        accountId: accounts.some(({ id }) => id === bill.accountId) ? bill.accountId : defaultAccountId,
        endDate: normalizeOptionalDate(bill.endDate)
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
  const rolloverStartMonth = isValidMonthString(rolloverValue?.startMonth)
    ? rolloverValue.startMonth
    : rolloverEnabled
      ? localDate().slice(0, 7)
      : null;

  return {
    version: 5,
    currency: allowedCurrencies.has(value.currency) ? value.currency : initial.currency,
    budgets,
    monthlyBudgets,
    rollover: { enabled: rolloverEnabled, startMonth: rolloverStartMonth },
    customCategories,
    customSubcategories,
    tags: normalizeTags(value.tags),
    rules: normalizeRules(value.rules),
    reconciliations: normalizeReconciliations(value.reconciliations, accounts),
    scheduleStatuses: normalizeScheduleStatuses(value.scheduleStatuses),
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

function normalizeCustomCategories(value) {
  if (!Array.isArray(value)) return [];
  const reserved = new Set(EXPENSE_CATEGORIES.map(({ id }) => id));
  const seen = new Set();
  return value.filter((category) => {
    const id = typeof category?.id === "string" ? category.id.trim() : "";
    if (!id || reserved.has(id) || seen.has(id) || typeof category.name !== "string" || !category.name.trim()) return false;
    seen.add(id);
    return true;
  }).map((category) => ({
    id: category.id.trim(),
    name: category.name.trim().slice(0, 40),
    shortName: String(category.shortName || category.name).trim().slice(0, 24),
    color: /^#[0-9a-f]{6}$/i.test(category.color ?? "") ? category.color : "#64748b",
    archived: category.archived === true
  }));
}

function normalizeCustomSubcategories(value, customCategories) {
  if (!Array.isArray(value)) return [];
  const categoryIds = new Set([...EXPENSE_CATEGORIES.map(({ id }) => id), ...customCategories.map(({ id }) => id)]);
  const reserved = new Set(ALL_EXPENSE_SUBCATEGORIES.map(({ id }) => id));
  const seen = new Set();
  return value.filter((subcategory) => {
    const id = typeof subcategory?.id === "string" ? subcategory.id.trim() : "";
    if (!id || reserved.has(id) || seen.has(id) || !categoryIds.has(subcategory?.category) || typeof subcategory.name !== "string" || !subcategory.name.trim()) return false;
    seen.add(id);
    return true;
  }).map((subcategory) => ({
    id: subcategory.id.trim(),
    category: subcategory.category,
    name: subcategory.name.trim().slice(0, 40),
    archived: subcategory.archived === true
  }));
}

function normalizeStringIds(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim().slice(0, 48)))]
    : [];
}

function normalizeTags(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter((tag) => {
    const id = typeof tag?.id === "string" ? tag.id.trim() : "";
    if (!id || seen.has(id) || typeof tag.name !== "string" || !tag.name.trim()) return false;
    seen.add(id);
    return true;
  }).map((tag) => ({ id: tag.id.trim(), name: tag.name.trim().slice(0, 32) }));
}

function normalizeRules(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((rule) => (
    typeof rule?.id === "string" &&
    typeof rule.match === "string" &&
    rule.match.trim() &&
    ["contains", "equals"].includes(rule.operator)
  )).map((rule) => ({
    id: rule.id,
    name: String(rule.name || rule.match).trim().slice(0, 48),
    match: rule.match.trim().slice(0, 80),
    operator: rule.operator,
    type: ["income", "expense"].includes(rule.type) ? rule.type : "any",
    category: typeof rule.category === "string" ? rule.category : "",
    subcategory: typeof rule.subcategory === "string" ? rule.subcategory : "",
    rename: typeof rule.rename === "string" ? rule.rename.trim().slice(0, 80) : "",
    tags: normalizeStringIds(rule.tags),
    active: rule.active !== false
  }));
}

function normalizeReconciliations(value, accounts) {
  if (!Array.isArray(value)) return [];
  const accountIds = new Set(accounts.map(({ id }) => id));
  return value.filter((item) => (
    typeof item?.id === "string" &&
    accountIds.has(item.accountId) &&
    isValidDateString(item.date) &&
    Number.isFinite(Number(item.statementBalance))
  )).map((item) => ({
    id: item.id,
    accountId: item.accountId,
    date: item.date,
    statementBalance: Number(item.statementBalance),
    clearedBalance: Number(item.clearedBalance) || 0,
    difference: Number(item.difference) || 0
  }));
}

function normalizeScheduleStatuses(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, item]) => (
    item && ["paid", "received", "skipped"].includes(item.status)
  )).map(([id, item]) => [id, {
    status: item.status,
    transactionId: typeof item.transactionId === "string" ? item.transactionId : null,
    completedAt: isValidDateString(item.completedAt) ? item.completedAt : null
  }]));
}

function normalizeTransactionSplits(value, total) {
  if (!Array.isArray(value) || value.length < 2) return [];
  const splits = value.filter((split) => (
    typeof split?.category === "string" &&
    Number.isFinite(Number(split.amount)) &&
    Number(split.amount) > 0
  )).map((split) => ({
    id: typeof split.id === "string" ? split.id : `${split.category}-${split.subcategory ?? ""}`,
    category: split.category,
    subcategory: typeof split.subcategory === "string" ? split.subcategory : "",
    amount: Number(split.amount)
  }));
  const splitTotal = sum(splits.map(({ amount }) => amount));
  return Math.abs(splitTotal - total) < 0.01 ? splits : [];
}

function isValidTransaction(transaction) {
  return Boolean(
    transaction &&
      typeof transaction.id === "string" &&
      ["income", "expense"].includes(transaction.type) &&
      isValidDateString(transaction.date) &&
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
      isValidDateString(bill.startDate) &&
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
  return isValidDateString(value) ? value : null;
}

function isValidContribution(contribution) {
  return Boolean(
    contribution &&
      typeof contribution.id === "string" &&
      isValidDateString(contribution.date) &&
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
  if (bill?.frequency === "biweekly") return amount * 26 / 12;
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
    .filter((transaction) => transaction.date.startsWith(month) && transaction.excludeFromBudget !== true)
    .sort((a, b) => b.date.localeCompare(a.date));
  const income = sum(transactions.filter(({ type }) => type === "income").map(({ amount }) => amount));
  const expenses = sum(transactions.filter(({ type }) => type === "expense").map(({ amount }) => amount));
  const { budgets: effectiveBudgets, carryovers } = getEffectiveBudgets(state, month);
  const totalBudget = sum(Object.values(effectiveBudgets));
  const categorySpending = getCategorySpending(state.transactions, month, state);
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
  const incomeRemaining = income - expenses;
  const availableBeforeGoals = totalBudget > 0 ? Math.min(budgetRemaining, incomeRemaining) : incomeRemaining;

  return {
    transactions,
    income,
    expenses,
    net: income - expenses,
    totalBudget,
    budgetRemaining,
    incomeRemaining,
    unallocatedIncome: income - totalBudget,
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
  const baseBudgets = getBaseBudgets(state, month);
  const categoryIds = getBudgetCategoryIds(state);
  const emptyCarryovers = Object.fromEntries(categoryIds.map((id) => [id, 0]));
  const rollover = state.rollover ?? {};

  if (!rollover.enabled || !rollover.startMonth || month <= rollover.startMonth) {
    return { budgets: baseBudgets, carryovers: emptyCarryovers };
  }

  let cursor = rollover.startMonth;
  let effective = { ...getBaseBudgets(state, cursor) };
  let iterations = 0;

  while (cursor < month && iterations < 240) {
    const spending = getCategorySpending(state.transactions, cursor, state);
    const carryovers = Object.fromEntries(
      categoryIds.map((id) => [id, (effective[id] ?? 0) - (spending[id] ?? 0)])
    );
    const nextMonth = shiftMonth(cursor, 1);
    const nextBaseBudgets = getBaseBudgets(state, nextMonth);
    effective = Object.fromEntries(
      categoryIds.map((id) => [id, (nextBaseBudgets[id] ?? 0) + (carryovers[id] ?? 0)])
    );
    cursor = nextMonth;
    iterations += 1;
  }

  return {
    budgets: effective,
    carryovers: Object.fromEntries(
      categoryIds.map((id) => [id, (effective[id] ?? 0) - (baseBudgets[id] ?? 0)])
    )
  };
}

export function getBaseBudgets(state, month) {
  const categoryIds = getBudgetCategoryIds(state);
  const monthlyBudgets = state?.monthlyBudgets && typeof state.monthlyBudgets === "object"
    ? state.monthlyBudgets
    : {};
  const exact = monthlyBudgets[month];
  if (exact) return normalizeBudgetAmounts(exact, categoryIds);

  const inheritedMonth = Object.keys(monthlyBudgets)
    .filter((candidate) => isValidMonthString(candidate) && candidate < month)
    .sort()
    .at(-1);
  return normalizeBudgetAmounts(inheritedMonth ? monthlyBudgets[inheritedMonth] : state?.budgets, categoryIds);
}

function getBudgetCategoryIds(state) {
  return [...new Set([
    ...EXPENSE_CATEGORIES.map(({ id }) => id),
    ...(state?.customCategories ?? []).map(({ id }) => id)
  ])];
}

function normalizeBudgetAmounts(value, categoryIds = EXPENSE_CATEGORIES.map(({ id }) => id)) {
  return Object.fromEntries(categoryIds.map((id) => {
    const amount = Number(value?.[id]);
    return [id, Number.isFinite(amount) && amount >= 0 ? amount : 0];
  }));
}

function getCategorySpending(transactions, month, state = null) {
  const spending = Object.fromEntries(getBudgetCategoryIds(state).map((id) => [id, 0]));
  for (const transaction of transactions) {
    if (transaction.type !== "expense" || transaction.excludeFromBudget === true || !transaction.date.startsWith(month)) continue;
    const parts = transaction.splits?.length ? transaction.splits : [transaction];
    for (const part of parts) {
      if (part.category in spending) spending[part.category] += Number(part.amount);
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
    const end = bill.endDate ? parseLocalDate(bill.endDate) : null;
    const addOccurrence = (occurrence) => {
      if (occurrence >= rangeStart && (!end || occurrence <= end)) occurrences.push(toOccurrence(bill, occurrence));
    };
    if (bill.frequency === "weekly" || bill.frequency === "biweekly") {
      const intervalDays = bill.frequency === "biweekly" ? 14 : 7;
      const elapsedDays = Math.max(0, Math.ceil((rangeStart - start) / 86_400_000));
      let occurrence = addDays(start, Math.ceil(elapsedDays / intervalDays) * intervalDays);
      while (occurrence <= rangeEnd) {
        addOccurrence(occurrence);
        occurrence = addDays(occurrence, intervalDays);
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
        if (occurrence >= start) addOccurrence(occurrence);
        index += 1;
        occurrence = addMonthsAnchored(start, index);
      }
      continue;
    }

    let year = Math.max(start.getFullYear(), rangeStart.getFullYear() - 1);
    let occurrence = addYearsAnchored(start, year - start.getFullYear());
    while (occurrence <= rangeEnd) {
      if (occurrence >= start) addOccurrence(occurrence);
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
            transaction.excludeFromBudget !== true &&
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

export function getTransactionSubcategory(transaction, profileType = "personal", state = null) {
  const explicit = expenseSubcategoriesFor(profileType, state).find(
    ({ id, category }) => id === transaction?.subcategory && category === transaction?.category
  );
  return explicit?.id ?? guessSubcategory(transaction?.description ?? "", transaction?.category, profileType);
}

export function getSpendingTrends(state, endMonth, monthCount = 6, profileType = "personal") {
  const count = Math.max(1, Math.min(Math.round(Number(monthCount) || 6), 24));
  const months = Array.from({ length: count }, (_, index) => shiftMonth(endMonth, index - count + 1));
  const categories = expenseCategoriesFor(profileType, state);
  const subcategories = expenseSubcategoriesFor(profileType, state);

  return months.map((month) => {
    const expenses = state.transactions.filter(
      (transaction) => transaction.type === "expense" && transaction.excludeFromBudget !== true && transaction.date.startsWith(month)
    );
    const byCategory = Object.fromEntries(categories.map(({ id }) => [id, 0]));
    const bySubcategory = Object.fromEntries(subcategories.map(({ id }) => [id, 0]));

    for (const transaction of expenses) {
      const parts = transaction.splits?.length ? transaction.splits : [transaction];
      for (const part of parts) {
        const amount = Number(part.amount) || 0;
        if (part.category in byCategory) byCategory[part.category] += amount;
        const detail = getTransactionSubcategory(part, profileType, state);
        if (detail in bySubcategory) bySubcategory[detail] += amount;
      }
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

export function categoryName(id, type = "expense", profileType = "personal", state = null) {
  const categories = type === "income" ? incomeCategoriesFor(profileType) : expenseCategoriesFor(profileType, state);
  return categories.find((category) => category.id === id)?.name ?? "Other";
}

export function subcategoryName(id, state = null) {
  return [...ALL_EXPENSE_SUBCATEGORIES, ...(state?.customSubcategories ?? [])]
    .find((subcategory) => subcategory.id === id)?.name ?? "Other";
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

export function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isValidMonthString(value) {
  if (!/^\d{4}-\d{2}$/.test(value ?? "")) return false;
  const [year, month] = value.split("-").map(Number);
  return year >= 1 && month >= 1 && month <= 12;
}
