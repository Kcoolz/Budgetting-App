import { useEffect, useState } from "react";
import { createInitialState, guessSubcategory, localDate, normalizeDashboard, normalizeState } from "../lib/budget";
import { getAccountBalances } from "../lib/accounts";
import { applyTransactionRules, matchTransactionToSchedule, ruleMatchesTransaction } from "../lib/planning";
import { createProfileRecord, normalizeProfileStore } from "../lib/profiles";
import { loadProfileStoreFromIndexedDb, saveProfileStoreToIndexedDb } from "../lib/storage";

const STORAGE_KEY = "cloud-budget-v1";
const LEGACY_STORAGE_KEY = "sprout-budget-v1";
const PROFILES_STORAGE_KEY = "cloud-budget-profiles-v1";
let loadedExistingBrowserState = false;

function loadProfileState() {
  try {
    const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (savedProfiles) {
      loadedExistingBrowserState = true;
      return normalizeProfileStore(JSON.parse(savedProfiles));
    }
    const savedState = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (savedState) loadedExistingBrowserState = true;
    const budget = savedState ? normalizeState(JSON.parse(savedState)) : createInitialState();
    return normalizeProfileStore(null, budget);
  } catch {
    return normalizeProfileStore();
  }
}

export function useBudgetStore() {
  const [profileState, setProfileState] = useState(loadProfileState);
  const [storageError, setStorageError] = useState("");
  const [indexedDbReady, setIndexedDbReady] = useState(loadedExistingBrowserState);
  const activeProfile = profileState.profiles.find(({ id }) => id === profileState.activeProfileId) ?? profileState.profiles[0];
  const state = activeProfile.budget;

  useEffect(() => {
    if (indexedDbReady) return undefined;
    let cancelled = false;
    loadProfileStoreFromIndexedDb()
      .then((stored) => {
        if (!cancelled && stored) setProfileState(normalizeProfileStore(stored));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIndexedDbReady(true); });
    return () => { cancelled = true; };
  }, [indexedDbReady]);

  useEffect(() => {
    if (!indexedDbReady) return;
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profileState));
      saveProfileStoreToIndexedDb(profileState).catch(() => {
        setStorageError("Cloud saved a compact browser copy, but its larger local database could not be updated. Download a backup before importing more data.");
      });
      setStorageError("");
    } catch {
      setStorageError("Cloud could not save to this browser. Export a backup now; recent changes may exist only until this tab closes.");
    }
  }, [profileState, indexedDbReady]);

  useEffect(() => {
    const synchronizeTabs = (event) => {
      if (event.key !== PROFILES_STORAGE_KEY || !event.newValue) return;
      try {
        setProfileState(normalizeProfileStore(JSON.parse(event.newValue)));
      } catch {
        setStorageError("Another tab changed Cloud data, but this tab could not read the update. Export a backup before continuing.");
      }
    };
    window.addEventListener("storage", synchronizeTabs);
    return () => window.removeEventListener("storage", synchronizeTabs);
  }, []);

  const setState = (updater) => {
    setProfileState((current) => ({
      ...current,
      profiles: current.profiles.map((profile) => profile.id === current.activeProfileId
        ? { ...profile, budget: typeof updater === "function" ? updater(profile.budget) : updater }
        : profile)
    }));
  };

  const addTransaction = (transaction) => {
    setState((current) => {
      const transactionId = createId();
      const { recurrence, ...transactionData } = transaction;
      const ruledTransaction = applyTransactionRules(transactionData, current.rules);
      const recurringBill = recurrence
        ? {
            id: createId(),
            type: transaction.type === "income" ? "income" : "expense",
            description: ruledTransaction.description,
            amount: Number(ruledTransaction.amount),
            category: ruledTransaction.category,
            accountId: ruledTransaction.accountId,
            frequency: recurrence,
            startDate: transaction.date,
            active: true
          }
        : null;

      return {
        ...current,
        transactions: [
          ...current.transactions,
          {
            ...ruledTransaction,
            id: transactionId,
            accountId: current.accounts.some(({ id }) => id === ruledTransaction.accountId)
              ? ruledTransaction.accountId
              : current.accounts[0].id,
            reviewed: false,
            cleared: transactionData.cleared !== false,
            recurringId: recurringBill?.id ?? null
          }
        ],
        recurringBills: recurringBill ? [...current.recurringBills, recurringBill] : current.recurringBills
      };
    });
  };

  const deleteTransaction = (id) => {
    setState((current) => ({
      ...current,
      transactions: current.transactions.filter((transaction) => transaction.id !== id)
    }));
  };

  const restoreTransactions = (transactions) => {
    setState((current) => ({
      ...current,
      transactions: [
        ...current.transactions.filter((item) => !transactions.some(({ id }) => id === item.id)),
        ...transactions
      ]
    }));
  };

  const bulkUpdateTransactions = (ids, changes) => {
    const selected = new Set(ids);
    setState((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) => selected.has(transaction.id)
        ? {
            ...transaction,
            ...(typeof changes === "function" ? changes(transaction) : changes)
          }
        : transaction)
    }));
  };

  const bulkDeleteTransactions = (ids) => {
    const selected = new Set(ids);
    setState((current) => ({ ...current, transactions: current.transactions.filter(({ id }) => !selected.has(id)) }));
  };

  const updateTransaction = (transaction) => {
    setState((current) => ({
      ...current,
      transactions: current.transactions.map((item) => item.id === transaction.id
        ? {
            ...item,
            ...applyTransactionRules(transaction, current.rules),
            amount: Number(transaction.amount),
            accountId: current.accounts.some(({ id }) => id === transaction.accountId)
              ? transaction.accountId
              : current.accounts[0].id,
            description: transaction.description.trim()
          }
        : item)
    }));
  };

  const importTransactions = (transactions, metadata = {}) => {
    const batchId = createId();
    setState((current) => {
      const imported = transactions.map((transaction) => {
        const ruled = applyTransactionRules(transaction, current.rules);
        const matched = matchTransactionToSchedule(ruled, current.recurringBills);
        return {
          ...matched,
          id: createId(),
          importBatchId: batchId,
          amount: Number(transaction.amount),
          accountId: current.accounts.some(({ id }) => id === transaction.accountId)
            ? transaction.accountId
            : current.accounts[0].id,
          reviewed: false,
          cleared: transaction.cleared !== false
        };
      });
      return {
        ...current,
        transactions: [...current.transactions, ...imported],
        importHistory: [...(current.importHistory ?? []), {
          id: batchId,
          fileName: metadata.fileName || "Imported transactions",
          date: localDate(),
          count: imported.length,
          accountId: imported[0]?.accountId ?? null
        }].slice(-25)
      };
    });
    return batchId;
  };

  const undoImport = (batchId) => {
    setState((current) => ({
      ...current,
      transactions: current.transactions.filter((transaction) => transaction.importBatchId !== batchId),
      importHistory: (current.importHistory ?? []).filter((item) => item.id !== batchId)
    }));
  };

  const updateBudget = ({ currency, budgets, rolloverEnabled, rolloverStartMonth }, month) => {
    setState((current) => normalizeState({
      ...current,
      currency,
      monthlyBudgets: {
        ...current.monthlyBudgets,
        [month]: budgets
      },
      rollover: {
        enabled: rolloverEnabled,
        startMonth: rolloverEnabled
          ? rolloverStartMonth ?? current.rollover?.startMonth ?? localDate().slice(0, 7)
          : null
      }
    }, activeProfile.type));
  };

  const saveAccount = (account) => {
    setState((current) => {
      const savedAccount = {
        id: account.id ?? createId(),
        name: account.name.trim(),
        type: account.type,
        openingBalance: Number(account.openingBalance)
      };
      const exists = current.accounts.some(({ id }) => id === savedAccount.id);
      return normalizeState({
        ...current,
        accounts: exists
          ? current.accounts.map((item) => item.id === savedAccount.id ? savedAccount : item)
          : [...current.accounts, savedAccount]
      }, activeProfile.type);
    });
  };

  const deleteAccount = (id) => {
    setState((current) => {
      const hasActivity = current.transactions.some((transaction) => transaction.accountId === id) ||
        current.transfers.some((transfer) => transfer.fromAccountId === id || transfer.toAccountId === id);
      if (current.accounts.length === 1 || hasActivity) return current;
      return { ...current, accounts: current.accounts.filter((account) => account.id !== id) };
    });
  };

  const saveTransfer = (transfer) => {
    setState((current) => {
      const savedTransfer = { ...transfer, id: transfer.id ?? createId(), amount: Number(transfer.amount) };
      const exists = current.transfers.some(({ id }) => id === savedTransfer.id);
      return normalizeState({
        ...current,
        transfers: exists
          ? current.transfers.map((item) => item.id === savedTransfer.id ? savedTransfer : item)
          : [...current.transfers, savedTransfer]
      }, activeProfile.type);
    });
  };

  const deleteTransfer = (id) => {
    setState((current) => ({
      ...current,
      transfers: current.transfers.filter((transfer) => transfer.id !== id)
    }));
  };

  const reviewTransaction = (id) => {
    setState((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === id ? { ...transaction, reviewed: true } : transaction
      )
    }));
  };

  const updateTransactionCategory = (id, category) => {
    setState((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === id
          ? { ...transaction, category, subcategory: transaction.type === "expense" ? guessSubcategory(transaction.description, category, activeProfile.type) : undefined }
          : transaction
      )
    }));
  };

  const updateTransactionSubcategory = (id, subcategory) => {
    setState((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === id ? { ...transaction, subcategory } : transaction
      )
    }));
  };

  const saveRecurringBill = (bill) => {
    setState((current) => {
      const savedBill = {
        ...bill,
        id: bill.id ?? createId(),
        type: bill.type === "income" ? "income" : "expense",
        amount: Number(bill.amount),
        accountId: current.accounts.some(({ id }) => id === bill.accountId) ? bill.accountId : current.accounts[0].id,
        endDate: bill.endDate || null,
        active: bill.active !== false
      };
      const exists = current.recurringBills.some(({ id }) => id === savedBill.id);
      return {
        ...current,
        recurringBills: exists
          ? current.recurringBills.map((item) => item.id === savedBill.id ? savedBill : item)
          : [...current.recurringBills, savedBill]
      };
    });
  };

  const saveCustomCategory = (category) => {
    setState((current) => {
      const saved = {
        ...category,
        id: category.id ?? uniqueSlug(category.name, current.customCategories.map(({ id }) => id)),
        name: category.name.trim(),
        shortName: (category.shortName || category.name).trim(),
        color: category.color || "#64748b",
        archived: category.archived === true
      };
      const exists = current.customCategories.some(({ id }) => id === saved.id);
      return normalizeState({
        ...current,
        customCategories: exists
          ? current.customCategories.map((item) => item.id === saved.id ? saved : item)
          : [...current.customCategories, saved]
      }, activeProfile.type);
    });
  };

  const toggleCustomCategory = (id) => {
    setState((current) => normalizeState({
      ...current,
      customCategories: current.customCategories.map((category) => category.id === id
        ? { ...category, archived: category.archived !== true }
        : category)
    }, activeProfile.type));
  };

  const moveCustomCategory = (id, direction) => {
    setState((current) => {
      const categories = [...current.customCategories];
      const index = categories.findIndex((category) => category.id === id);
      const nextIndex = Math.max(0, Math.min(categories.length - 1, index + direction));
      if (index < 0 || index === nextIndex) return current;
      [categories[index], categories[nextIndex]] = [categories[nextIndex], categories[index]];
      return { ...current, customCategories: categories };
    });
  };

  const mergeCustomCategory = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setState((current) => {
      const replaceBudget = (plan = {}) => ({
        ...plan,
        [targetId]: Number(plan[targetId] || 0) + Number(plan[sourceId] || 0),
        [sourceId]: 0
      });
      return normalizeState({
        ...current,
        budgets: replaceBudget(current.budgets),
        monthlyBudgets: Object.fromEntries(Object.entries(current.monthlyBudgets).map(([month, plan]) => [month, replaceBudget(plan)])),
        customCategories: current.customCategories.map((category) => category.id === sourceId ? { ...category, archived: true } : category),
        customSubcategories: current.customSubcategories.map((detail) => detail.category === sourceId ? { ...detail, category: targetId } : detail),
        transactions: current.transactions.map((transaction) => ({
          ...transaction,
          category: transaction.category === sourceId ? targetId : transaction.category,
          splits: (transaction.splits ?? []).map((split) => split.category === sourceId ? { ...split, category: targetId } : split)
        })),
        recurringBills: current.recurringBills.map((schedule) => schedule.category === sourceId ? { ...schedule, category: targetId } : schedule),
        rules: current.rules.map((rule) => rule.category === sourceId ? { ...rule, category: targetId } : rule)
      }, activeProfile.type);
    });
  };

  const saveCustomSubcategory = (subcategory) => {
    setState((current) => {
      const saved = {
        ...subcategory,
        id: subcategory.id ?? uniqueSlug(subcategory.name, current.customSubcategories.map(({ id }) => id)),
        name: subcategory.name.trim(),
        archived: false
      };
      const exists = current.customSubcategories.some(({ id }) => id === saved.id);
      return normalizeState({
        ...current,
        customSubcategories: exists
          ? current.customSubcategories.map((item) => item.id === saved.id ? saved : item)
          : [...current.customSubcategories, saved]
      }, activeProfile.type);
    });
  };

  const saveTag = (tag) => {
    setState((current) => {
      const saved = { ...tag, id: tag.id ?? uniqueSlug(tag.name, current.tags.map(({ id }) => id)), name: tag.name.trim() };
      const exists = current.tags.some(({ id }) => id === saved.id);
      return normalizeState({
        ...current,
        tags: exists ? current.tags.map((item) => item.id === saved.id ? saved : item) : [...current.tags, saved]
      }, activeProfile.type);
    });
  };

  const deleteTag = (id) => {
    setState((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag.id !== id),
      transactions: current.transactions.map((transaction) => ({ ...transaction, tags: (transaction.tags ?? []).filter((tagId) => tagId !== id) })),
      rules: current.rules.map((rule) => ({ ...rule, tags: (rule.tags ?? []).filter((tagId) => tagId !== id) }))
    }));
  };

  const saveRule = (rule, applyExisting = false) => {
    setState((current) => {
      const saved = { ...rule, id: rule.id ?? createId(), active: rule.active !== false };
      const exists = current.rules.some(({ id }) => id === saved.id);
      const next = normalizeState({
        ...current,
        rules: exists ? current.rules.map((item) => item.id === saved.id ? saved : item) : [...current.rules, saved]
      }, activeProfile.type);
      return applyExisting
        ? { ...next, transactions: next.transactions.map((transaction) => ruleMatchesTransaction(transaction, saved) ? applyTransactionRules(transaction, [saved]) : transaction) }
        : next;
    });
  };

  const moveRule = (id, direction) => {
    setState((current) => {
      const rules = [...current.rules];
      const index = rules.findIndex((rule) => rule.id === id);
      const nextIndex = Math.max(0, Math.min(rules.length - 1, index + direction));
      if (index < 0 || nextIndex === index) return current;
      [rules[index], rules[nextIndex]] = [rules[nextIndex], rules[index]];
      return { ...current, rules };
    });
  };

  const toggleRule = (id) => {
    setState((current) => ({ ...current, rules: current.rules.map((rule) => rule.id === id ? { ...rule, active: rule.active === false } : rule) }));
  };

  const deleteRule = (id) => {
    setState((current) => ({ ...current, rules: current.rules.filter((rule) => rule.id !== id) }));
  };

  const updateScheduleOccurrence = (occurrence, status) => {
    setState((current) => {
      if (status === "skipped") {
        return {
          ...current,
          scheduleStatuses: {
            ...current.scheduleStatuses,
            [occurrence.occurrenceId]: { status: "skipped", transactionId: null, completedAt: localDate() }
          }
        };
      }
      const transactionId = createId();
      const transaction = {
        id: transactionId,
        type: occurrence.type === "income" ? "income" : "expense",
        amount: Number(occurrence.amount),
        date: occurrence.dueDate,
        description: occurrence.description,
        category: occurrence.category,
        accountId: current.accounts.some(({ id }) => id === occurrence.accountId) ? occurrence.accountId : current.accounts[0].id,
        reviewed: true,
        cleared: true,
        recurringId: occurrence.id,
        recurringOccurrenceId: occurrence.occurrenceId,
        tags: [],
        notes: ""
      };
      return {
        ...current,
        transactions: [...current.transactions, applyTransactionRules(transaction, current.rules)],
        scheduleStatuses: {
          ...current.scheduleStatuses,
          [occurrence.occurrenceId]: {
            status: transaction.type === "income" ? "received" : "paid",
            transactionId,
            completedAt: localDate()
          }
        }
      };
    });
  };

  const saveReconciliation = (snapshot, addAdjustment = false) => {
    setState((current) => {
      const reconciliation = { ...snapshot, id: createId() };
      const difference = Number(snapshot.difference);
      const adjustment = addAdjustment && Math.abs(difference) >= 0.005
        ? {
            id: createId(),
            accountId: snapshot.accountId,
            type: difference > 0 ? "income" : "expense",
            amount: Math.abs(difference),
            date: snapshot.date,
            category: difference > 0 ? "other-income" : "other",
            description: "Balance adjustment",
            notes: "Created during account reconciliation.",
            tags: [],
            reviewed: true,
            cleared: true,
            excludeFromBudget: true
          }
        : null;
      return {
        ...current,
        reconciliations: [...current.reconciliations, reconciliation],
        transactions: adjustment ? [...current.transactions, adjustment] : current.transactions
      };
    });
  };

  const toggleRecurringBill = (id) => {
    setState((current) => ({
      ...current,
      recurringBills: current.recurringBills.map((bill) =>
        bill.id === id ? { ...bill, active: bill.active === false } : bill
      )
    }));
  };

  const deleteRecurringBill = (id) => {
    setState((current) => ({
      ...current,
      recurringBills: current.recurringBills.filter((bill) => bill.id !== id)
    }));
  };

  const saveGoal = (goal) => {
    setState((current) => {
      const existing = current.goals.find(({ id }) => id === goal.id);
      const savedGoal = {
        id: goal.id ?? createId(),
        name: goal.name,
        target: Number(goal.target),
        targetDate: goal.targetDate || null,
        deadline: goal.deadline || null,
        accountId: current.accounts.some(({ id }) => id === goal.accountId) ? goal.accountId : null,
        autoContribution: goal.autoContribution?.amount ? {
          amount: Number(goal.autoContribution.amount),
          frequency: goal.autoContribution.frequency,
          startDate: goal.autoContribution.startDate,
          active: goal.autoContribution.active !== false
        } : null,
        contributions: existing?.contributions ?? []
      };
      return {
        ...current,
        goals: existing
          ? current.goals.map((item) => item.id === savedGoal.id ? savedGoal : item)
          : [...current.goals, savedGoal]
      };
    });
  };

  const deleteGoal = (id) => {
    setState((current) => ({
      ...current,
      goals: current.goals.filter((goal) => goal.id !== id)
    }));
  };

  const assignToGoal = (goalId, contribution) => {
    setState((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, contributions: [...goal.contributions, { ...contribution, id: createId() }] }
          : goal
      )
    }));
  };

  const restoreGoal = (goal) => {
    setState((current) => ({
      ...current,
      goals: [...current.goals.filter(({ id }) => id !== goal.id), goal]
    }));
  };

  const restoreGoalContribution = (goalId, contribution) => {
    setState((current) => ({
      ...current,
      goals: current.goals.map((goal) => goal.id === goalId
        ? { ...goal, contributions: [...goal.contributions.filter(({ id }) => id !== contribution.id), contribution] }
        : goal)
    }));
  };

  const transferGoalFunds = (fromGoalId, toGoalId, amount, date) => {
    const numericAmount = Math.abs(Number(amount));
    if (!numericAmount || fromGoalId === toGoalId) return;
    setState((current) => ({
      ...current,
      goals: current.goals.map((goal) => {
        if (goal.id === fromGoalId) return { ...goal, contributions: [...goal.contributions, { id: createId(), amount: -numericAmount, date, transferGoalId: toGoalId }] };
        if (goal.id === toGoalId) return { ...goal, contributions: [...goal.contributions, { id: createId(), amount: numericAmount, date, transferGoalId: fromGoalId }] };
        return goal;
      })
    }));
  };

  const markBackupCreated = () => {
    setState((current) => ({ ...current, lastBackupAt: new Date().toISOString() }));
  };

  const removeGoalContribution = (goalId, contributionId) => {
    setState((current) => ({
      ...current,
      goals: current.goals.map((goal) => goal.id === goalId
        ? { ...goal, contributions: goal.contributions.filter((contribution) => contribution.id !== contributionId) }
        : goal)
    }));
  };

  const updateDashboard = (dashboard) => {
    setState((current) => ({ ...current, dashboard: normalizeDashboard(dashboard) }));
  };

  const saveDebt = (debt) => {
    setState((current) => {
      const existingAccount = current.accounts.find(({ id }) => id === debt.accountId);
      const accountId = existingAccount?.id ?? createId();
      const desiredBalance = Number(debt.balance);
      const accounts = existingAccount
        ? current.accounts.map((account) => account.id === accountId
          ? {
              ...account,
              name: debt.name,
              type: "credit",
              openingBalance: Number(account.openingBalance) + (-desiredBalance - (getAccountBalances(current, localDate())[accountId] ?? 0))
            }
          : account)
        : [...current.accounts, { id: accountId, name: debt.name, type: "credit", openingBalance: -desiredBalance }];
      const normalizedDebt = { ...debt, id: debt.id ?? createId(), accountId };
      const exists = current.debts.some(({ id }) => id === normalizedDebt.id);
      return {
        ...current,
        accounts,
        debts: exists
          ? current.debts.map((item) => item.id === normalizedDebt.id ? normalizedDebt : item)
          : [...current.debts, normalizedDebt]
      };
    });
  };

  const deleteDebt = (id) => {
    setState((current) => ({ ...current, debts: current.debts.filter((debt) => debt.id !== id) }));
  };

  const updateDebtPlan = (debtPlan) => {
    setState((current) => normalizeState({ ...current, debtPlan: { ...current.debtPlan, ...debtPlan } }, activeProfile.type));
  };

  const importState = (value) => setState(normalizeState(value, activeProfile.type));
  const importProfileStore = (value) => setProfileState(normalizeProfileStore(value));

  const switchProfile = (id) => {
    setProfileState((current) => current.profiles.some((profile) => profile.id === id)
      ? { ...current, activeProfileId: id }
      : current);
  };

  const createProfile = ({ name, color, type, copyCurrent = false }) => {
    setProfileState((current) => {
      const currentBudget = current.profiles.find(({ id }) => id === current.activeProfileId)?.budget;
      const profile = createProfileRecord({
        name,
        color,
        type,
        budget: copyCurrent ? currentBudget : createInitialState(type)
      });
      return {
        ...current,
        activeProfileId: profile.id,
        profiles: [...current.profiles, profile]
      };
    });
  };

  const updateProfile = (id, changes) => {
    setProfileState((current) => normalizeProfileStore({
      ...current,
      profiles: current.profiles.map((profile) => profile.id === id
        ? { ...profile, name: changes.name ?? profile.name, color: changes.color ?? profile.color }
        : profile)
    }));
  };

  const deleteProfile = (id) => {
    setProfileState((current) => {
      if (current.profiles.length === 1 || !current.profiles.some((profile) => profile.id === id)) return current;
      const profiles = current.profiles.filter((profile) => profile.id !== id);
      return {
        ...current,
        profiles,
        activeProfileId: current.activeProfileId === id ? profiles[0].id : current.activeProfileId
      };
    });
  };

  return {
    state,
    dataReady: indexedDbReady,
    profileBackup: profileState,
    storageError,
    profiles: profileState.profiles,
    activeProfile,
    switchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    addTransaction,
    updateTransaction,
    importTransactions,
    undoImport,
    deleteTransaction,
    restoreTransactions,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
    reviewTransaction,
    updateTransactionCategory,
    updateTransactionSubcategory,
    saveCustomCategory,
    toggleCustomCategory,
    moveCustomCategory,
    mergeCustomCategory,
    saveCustomSubcategory,
    saveTag,
    deleteTag,
    saveRule,
    toggleRule,
    moveRule,
    deleteRule,
    saveAccount,
    deleteAccount,
    saveTransfer,
    deleteTransfer,
    saveRecurringBill,
    toggleRecurringBill,
    deleteRecurringBill,
    updateScheduleOccurrence,
    saveReconciliation,
    saveGoal,
    deleteGoal,
    restoreGoal,
    assignToGoal,
    restoreGoalContribution,
    transferGoalFunds,
    removeGoalContribution,
    updateDashboard,
    saveDebt,
    deleteDebt,
    updateDebtPlan,
    updateBudget,
    importState,
    importProfileStore,
    markBackupCreated
  };
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function uniqueSlug(name, existingIds = []) {
  const base = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "custom";
  const used = new Set(existingIds);
  let candidate = `custom-${base}`;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `custom-${base}-${index}`;
    index += 1;
  }
  return candidate;
}
