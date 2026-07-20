import { useEffect, useState } from "react";
import { createInitialState, guessSubcategory, localDate, normalizeDashboard, normalizeState } from "../lib/budget";
import { getAccountBalances } from "../lib/accounts";
import { useCloudSync } from "../lib/cloudSync";
import { createProfileRecord, normalizeProfileStore } from "../lib/profiles";
import { useAuth } from "../components/AuthGate";

const STORAGE_KEY = "cloud-budget-v1";
const LEGACY_STORAGE_KEY = "sprout-budget-v1";
const PROFILES_STORAGE_KEY = "cloud-budget-profiles-v1";

function loadProfileState() {
  try {
    const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (savedProfiles) return normalizeProfileStore(JSON.parse(savedProfiles));
    const savedState = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    const budget = savedState ? normalizeState(JSON.parse(savedState)) : createInitialState();
    return normalizeProfileStore(null, budget);
  } catch {
    return normalizeProfileStore();
  }
}

export function useBudgetStore() {
  const { user } = useAuth();
  const [profileState, setProfileState] = useState(loadProfileState);
  const activeProfile = profileState.profiles.find(({ id }) => id === profileState.activeProfileId) ?? profileState.profiles[0];
  const state = activeProfile.budget;

  useEffect(() => {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profileState));
  }, [profileState]);

  const syncStatus = useCloudSync({ user, profileState, setProfileState });

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
      const recurringBill = recurrence
        ? {
            id: createId(),
            description: transaction.description,
            amount: Number(transaction.amount),
            category: transaction.category,
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
            ...transactionData,
            id: transactionId,
            accountId: current.accounts.some(({ id }) => id === transactionData.accountId)
              ? transactionData.accountId
              : current.accounts[0].id,
            reviewed: false,
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

  const updateBudget = ({ currency, budgets, rolloverEnabled, rolloverStartMonth }) => {
    setState((current) => normalizeState({
      ...current,
      currency,
      budgets,
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

  const addTransfer = (transfer) => {
    setState((current) => normalizeState({
      ...current,
      transfers: [...current.transfers, { ...transfer, id: createId(), amount: Number(transfer.amount) }]
    }, activeProfile.type));
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

  const addRecurringBill = (bill) => {
    setState((current) => ({
      ...current,
      recurringBills: [...current.recurringBills, { ...bill, id: createId(), active: true }]
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
              openingBalance: Number(account.openingBalance) + (-desiredBalance - (getAccountBalances(current)[accountId] ?? 0))
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
    profiles: profileState.profiles,
    activeProfile,
    syncStatus,
    switchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    addTransaction,
    deleteTransaction,
    reviewTransaction,
    updateTransactionCategory,
    updateTransactionSubcategory,
    saveAccount,
    deleteAccount,
    addTransfer,
    deleteTransfer,
    addRecurringBill,
    deleteRecurringBill,
    saveGoal,
    deleteGoal,
    assignToGoal,
    updateDashboard,
    saveDebt,
    deleteDebt,
    updateDebtPlan,
    updateBudget,
    importState
  };
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
