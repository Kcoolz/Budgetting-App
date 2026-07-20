import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateDebtPlan,
  createInitialState,
  getEffectiveBudgets,
  getGoalSummaries,
  getGoalMonthlyPace,
  getMonthlySummary,
  getSafeToSpend,
  getSpendingComparison,
  getSpendingTrends,
  getUpcomingBills,
  guessSubcategory,
  normalizeDashboard,
  normalizeState,
  monthlyRecurringAmount,
  parseQuickTransaction,
  progressTone
} from "../src/lib/budget.js";
import { createProfileRecord, getProfileInitials, normalizeProfileStore } from "../src/lib/profiles.js";
import { accountHasActivity, getAccountBalances, getAccountOverview, getLinkedDebts } from "../src/lib/accounts.js";

test("monthly summary totals the selected month and builds daily sparkline data", () => {
  const state = createInitialState();
  state.budgets.food = 500;
  state.budgets.housing = 1200;
  state.transactions = [
    { id: "1", type: "income", amount: 3000, date: "2026-07-01", category: "pay", description: "Pay" },
    { id: "2", type: "expense", amount: 200, date: "2026-07-03", category: "food", description: "Groceries" },
    { id: "3", type: "expense", amount: 900, date: "2026-06-03", category: "housing", description: "Rent" }
  ];

  const summary = getMonthlySummary(state, "2026-07");

  assert.equal(summary.income, 3000);
  assert.equal(summary.expenses, 200);
  assert.equal(summary.net, 2800);
  assert.equal(summary.totalBudget, 1700);
  assert.equal(summary.budgetRemaining, 1500);
  assert.equal(summary.categorySpending.food, 200);
  assert.equal(summary.dailySpending[2], 200);
  assert.equal(summary.dailySpending.length, 31);
});

test("quick add parses an amount, description, and useful category", () => {
  assert.deepEqual(parseQuickTransaction("15.50 Coffee"), {
    amount: 15.5,
    description: "Coffee",
    category: "food",
    subcategory: "coffee"
  });
  assert.equal(parseQuickTransaction("Coffee 15"), null);
});

test("safe-to-spend uses the remaining days including today", () => {
  const result = getSafeToSpend(180, "2026-07", new Date("2026-07-14T12:00:00"));
  assert.equal(result.daysRemaining, 18);
  assert.equal(result.dailyAmount, 10);
});

test("comparison reports spending against the same period last month", () => {
  const state = createInitialState();
  state.transactions = [
    { id: "1", type: "expense", amount: 80, date: "2026-07-10", category: "food", description: "Food" },
    { id: "2", type: "expense", amount: 100, date: "2026-06-10", category: "food", description: "Food" }
  ];
  const comparison = getSpendingComparison(state, "2026-07", new Date("2026-07-14T12:00:00"));
  assert.equal(comparison.percent, 20);
  assert.equal(comparison.direction, "less");
});

test("spending trends separate dining, groceries, and gas across months", () => {
  const state = createInitialState();
  state.transactions = [
    { id: "1", type: "expense", amount: 45, date: "2026-06-10", category: "food", description: "Dinner out" },
    { id: "2", type: "expense", amount: 110, date: "2026-07-08", category: "food", subcategory: "groceries", description: "Weekly shop" },
    { id: "3", type: "expense", amount: 60, date: "2026-07-12", category: "transport", description: "Shell fuel" }
  ];

  const trends = getSpendingTrends(state, "2026-07", 2);

  assert.deepEqual(trends.map(({ month, total }) => ({ month, total })), [
    { month: "2026-06", total: 45 },
    { month: "2026-07", total: 170 }
  ]);
  assert.equal(trends[0].bySubcategory["dining-out"], 45);
  assert.equal(trends[1].bySubcategory.groceries, 110);
  assert.equal(trends[1].bySubcategory.gas, 60);
  assert.equal(guessSubcategory("Uber ride", "transport"), "rideshare");
});

test("business quick add and trends use operating classifications", () => {
  assert.deepEqual(parseQuickTransaction("49 Adobe software", "business"), {
    amount: 49,
    description: "Adobe software",
    category: "bills",
    subcategory: "software"
  });

  const state = createInitialState();
  state.transactions = [
    { id: "ad", type: "expense", amount: 250, date: "2026-07-05", category: "fun", description: "Advertising campaign" },
    { id: "flight", type: "expense", amount: 500, date: "2026-07-10", category: "transport", subcategory: "business-travel", description: "Client flight" }
  ];
  const [trend] = getSpendingTrends(state, "2026-07", 1, "business");
  assert.equal(trend.bySubcategory.advertising, 250);
  assert.equal(trend.bySubcategory["business-travel"], 500);
  assert.equal(trend.total, 750);
});

test("progress tones change at requested thresholds", () => {
  assert.equal(progressTone(69.9), "healthy");
  assert.equal(progressTone(70), "warning");
  assert.equal(progressTone(90), "danger");
});

test("normalization repairs unsafe saved values", () => {
  const state = normalizeState({
    currency: "NOPE",
    budgets: { food: -20, housing: "900" },
    transactions: [{ id: "bad", type: "expense", amount: -1, date: "today" }]
  });
  assert.equal(state.currency, "CAD");
  assert.equal(state.budgets.food, 0);
  assert.equal(state.budgets.housing, 900);
  assert.deepEqual(state.transactions, []);
});

test("dashboard customization keeps valid order and safely restores missing sections", () => {
  const dashboard = normalizeDashboard({
    order: ["goals", "summary", "goals", "unknown"],
    hidden: ["transactions", "unknown", "transactions"]
  });

  assert.deepEqual(dashboard.order, ["goals", "summary", "spending", "recurring", "debt", "transactions"]);
  assert.deepEqual(dashboard.hidden, ["transactions"]);
});

test("recurring bills normalize weekly, monthly, and yearly costs", () => {
  assert.equal(monthlyRecurringAmount({ amount: 120, frequency: "monthly" }), 120);
  assert.equal(monthlyRecurringAmount({ amount: 120, frequency: "yearly" }), 10);
  assert.equal(Math.round(monthlyRecurringAmount({ amount: 15, frequency: "weekly" }) * 100) / 100, 65);
});

test("debt planner prioritizes high interest and projects a payoff", () => {
  const debts = [
    { id: "low", name: "Low rate", balance: 1000, apr: 8, minimumPayment: 50 },
    { id: "high", name: "High rate", balance: 800, apr: 22, minimumPayment: 40 }
  ];
  const plan = calculateDebtPlan(debts, 110, "avalanche");

  assert.equal(plan.status, "ok");
  assert.equal(plan.payoffOrder[0].id, "high");
  assert.equal(plan.monthlyPayment, 200);
  assert.ok(plan.months > 0 && plan.months < 12);
  assert.ok(plan.totalInterest > 0);
});

test("debt normalization drops invalid cards and repairs planner settings", () => {
  const state = normalizeState({
    debts: [
      { id: "valid", name: "Visa", balance: "1200", apr: "19.99", minimumPayment: "45" },
      { id: "invalid", name: "Broken", balance: -10, apr: 300, minimumPayment: 0 }
    ],
    debtPlan: { strategy: "unknown", extraPayment: -50 }
  });

  assert.equal(state.debts.length, 1);
  assert.equal(state.debts[0].balance, 1200);
  assert.deepEqual(state.debtPlan, { strategy: "avalanche", extraPayment: 0 });
});

test("version one transactions migrate as reviewed and attach to a default account", () => {
  const state = normalizeState({
    version: 1,
    currency: "CAD",
    budgets: {},
    transactions: [
      { id: "old", type: "expense", amount: 25, date: "2026-07-02", category: "food", description: "Lunch" }
    ]
  });
  assert.equal(state.version, 3);
  assert.equal(state.transactions[0].reviewed, true);
  assert.equal(state.transactions[0].accountId, "main");
  assert.equal(state.accounts.length, 1);
  assert.deepEqual(state.recurringBills, []);
  assert.deepEqual(state.goals, []);
});

test("account balances include activity and transfers without changing spending", () => {
  const state = normalizeState({
    version: 3,
    currency: "CAD",
    budgets: {},
    accounts: [
      { id: "bank", name: "Checking", type: "checking", openingBalance: 1000 },
      { id: "card", name: "Visa", type: "credit", openingBalance: -200 }
    ],
    transactions: [
      { id: "pay", accountId: "bank", type: "income", amount: 500, date: "2026-07-01", category: "pay", description: "Pay" },
      { id: "food", accountId: "card", type: "expense", amount: 50, date: "2026-07-02", category: "food", description: "Dinner" }
    ],
    transfers: [
      { id: "payment", fromAccountId: "bank", toAccountId: "card", amount: 100, date: "2026-07-03", description: "Card payment" }
    ]
  });

  assert.deepEqual(getAccountBalances(state), { bank: 1400, card: -150 });
  assert.deepEqual(getAccountOverview(state), {
    balances: { bank: 1400, card: -150 },
    assets: 1400,
    liabilities: 150,
    netWorth: 1250
  });
  const summary = getMonthlySummary(state, "2026-07");
  assert.equal(summary.income, 500);
  assert.equal(summary.expenses, 50);
});

test("account normalization removes transfers that reference missing accounts", () => {
  const state = normalizeState({
    accounts: [{ id: "cash", name: "Cash", type: "cash", openingBalance: 20 }],
    transfers: [{ id: "bad", fromAccountId: "cash", toAccountId: "missing", amount: 10, date: "2026-07-01" }]
  });

  assert.equal(state.accounts[0].id, "cash");
  assert.deepEqual(state.transfers, []);
});

test("linked payoff cards reuse their account balance instead of duplicating it", () => {
  const state = normalizeState({
    accounts: [{ id: "visa", name: "Rewards Visa", type: "credit", openingBalance: -500 }],
    transactions: [{ id: "charge", accountId: "visa", type: "expense", amount: 75, date: "2026-07-04", category: "food", description: "Dinner" }],
    debts: [{ id: "plan", accountId: "visa", name: "Old name", balance: 999, apr: 19.99, minimumPayment: 45 }]
  });

  const [debt] = getLinkedDebts(state);
  assert.equal(debt.name, "Rewards Visa");
  assert.equal(debt.balance, 575);
  assert.equal(accountHasActivity(state, "visa"), true);
});

test("rollover carries both unused funds and overspending forward", () => {
  const state = createInitialState();
  state.budgets.food = 100;
  state.rollover = { enabled: true, startMonth: "2026-06" };
  state.transactions = [
    { id: "june", type: "expense", amount: 80, date: "2026-06-10", category: "food", description: "Food", reviewed: true },
    { id: "july", type: "expense", amount: 130, date: "2026-07-10", category: "food", description: "Food", reviewed: true }
  ];

  const july = getEffectiveBudgets(state, "2026-07");
  const august = getEffectiveBudgets(state, "2026-08");
  assert.equal(july.budgets.food, 120);
  assert.equal(july.carryovers.food, 20);
  assert.equal(august.budgets.food, 90);
  assert.equal(august.carryovers.food, -10);
});

test("recurring schedules expand into the upcoming fourteen-day window", () => {
  const bills = [
    { id: "monthly", description: "Internet", amount: 75, category: "bills", frequency: "monthly", startDate: "2026-06-20", active: true },
    { id: "weekly", description: "Meal plan", amount: 20, category: "food", frequency: "weekly", startDate: "2026-07-10", active: true }
  ];
  const upcoming = getUpcomingBills(bills, new Date("2026-07-14T12:00:00"), 14);
  assert.deepEqual(upcoming.map(({ dueDate }) => dueDate), ["2026-07-17", "2026-07-20", "2026-07-24"]);
  assert.equal(upcoming.reduce((total, bill) => total + bill.amount, 0), 115);
});

test("goal assignments reduce spendable cash for their assignment month", () => {
  const state = createInitialState();
  state.budgets.food = 1000;
  state.transactions = [
    { id: "food", type: "expense", amount: 100, date: "2026-07-10", category: "food", description: "Food", reviewed: true }
  ];
  state.goals = [{
    id: "trip",
    name: "Trip",
    target: 2000,
    contributions: [{ id: "save", amount: 200, date: "2026-07-14" }]
  }];

  const summary = getMonthlySummary(state, "2026-07");
  const [goal] = getGoalSummaries(state.goals, "2026-07");
  assert.equal(summary.budgetRemaining, 900);
  assert.equal(summary.goalReserved, 200);
  assert.equal(summary.spendableRemaining, 700);
  assert.equal(goal.saved, 200);
  assert.equal(goal.percent, 10);
});

test("goal dates calculate separate planned and hard-deadline monthly amounts", () => {
  const pace = getGoalMonthlyPace(1200, "2026-12-01", new Date("2026-07-14T12:00:00"));
  assert.equal(pace, 200);

  const [goal] = getGoalSummaries([{
    id: "vacation",
    name: "Vacation",
    target: 2400,
    targetDate: "2026-12-01",
    deadline: "2027-02-01",
    contributions: [{ id: "saved", amount: 1200, date: "2026-07-01" }]
  }], "2026-07", new Date("2026-07-14T12:00:00"));

  assert.equal(goal.targetMonthly, 200);
  assert.equal(goal.deadlineMonthly, 150);
  assert.equal(goal.dateStatus, "on-track");
});

test("goal normalization keeps valid milestones and removes invalid dates", () => {
  const state = normalizeState({
    goals: [{ id: "trip", name: "Trip", target: 1000, targetDate: "2026-10-01", deadline: "not-a-date" }]
  });
  assert.equal(state.goals[0].targetDate, "2026-10-01");
  assert.equal(state.goals[0].deadline, null);
});

test("an existing budget migrates into a personal profile", () => {
  const budget = createInitialState();
  budget.currency = "USD";
  budget.budgets.food = 450;

  const store = normalizeProfileStore(null, budget);

  assert.equal(store.activeProfileId, "personal");
  assert.equal(store.profiles.length, 1);
  assert.equal(store.profiles[0].name, "Personal");
  assert.equal(store.profiles[0].budget.currency, "USD");
  assert.equal(store.profiles[0].budget.budgets.food, 450);
});

test("profile normalization repairs metadata and keeps budgets separate", () => {
  const first = createProfileRecord({ id: "one", name: " Home ", color: "emerald", type: "business" });
  first.budget.budgets.housing = 1200;
  const store = normalizeProfileStore({
    activeProfileId: "missing",
    profiles: [first, { id: "two", name: "", color: "invalid", budget: { currency: "EUR" } }]
  });

  assert.equal(store.activeProfileId, "one");
  assert.equal(store.profiles[0].name, "Home");
  assert.equal(store.profiles[0].type, "business");
  assert.equal(store.profiles[0].budget.budgets.housing, 1200);
  assert.equal(store.profiles[1].name, "Personal");
  assert.equal(store.profiles[1].type, "personal");
  assert.equal(store.profiles[1].color, "blue");
  assert.equal(store.profiles[1].budget.currency, "EUR");
  assert.equal(store.profiles[1].budget.budgets.housing, 0);
  assert.equal(getProfileInitials("Home budget"), "HB");
});
