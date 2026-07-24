import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import AccountModal from "./components/AccountModal";
import BudgetModal from "./components/BudgetModal";
import ConfirmModal from "./components/ConfirmModal";
import DashboardCustomizeModal from "./components/DashboardCustomizeModal";
import DebtModal from "./components/DebtModal";
import EncryptedBackupModal from "./components/EncryptedBackupModal";
import GoalContributionModal from "./components/GoalContributionModal";
import GoalModal from "./components/GoalModal";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import ProfileModal from "./components/ProfileModal";
import PrivacyLock from "./components/PrivacyLock";
import ReconcileModal from "./components/ReconcileModal";
import RecurringModal from "./components/RecurringModal";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import TransactionModal from "./components/TransactionModal";
import TransactionImportModal from "./components/TransactionImportModal";
import TransferModal from "./components/TransferModal";
import UpdateBanner from "./components/UpdateBanner";
import { useBudgetStore } from "./hooks/useBudgetStore";
import { useTheme } from "./hooks/useTheme";
import {
  dateForMonth,
  expenseCategoriesFor,
  expenseSubcategoriesFor,
  getGoalSummaries,
  getMonthlySummary,
  getSafeToSpend,
  getSpendingComparison,
  getUpcomingBills,
  localDate,
  parseQuickTransaction,
  shiftMonth
} from "./lib/budget";
import { accountHasActivity, getAccountBalances, getLinkedDebts } from "./lib/accounts";
import { getPrivacyLock } from "./lib/privacy";

const AccountsPage = lazy(() => import("./pages/AccountsPage"));
const BusinessOverviewPage = lazy(() => import("./pages/BusinessOverviewPage"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const OrganizePage = lazy(() => import("./pages/OrganizePage"));
const OverviewPage = lazy(() => import("./pages/OverviewPage"));
const ProfilesPage = lazy(() => import("./pages/ProfilesPage"));
const RecurringPage = lazy(() => import("./pages/RecurringPage"));
const SpendingPage = lazy(() => import("./pages/SpendingPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const TrendsPage = lazy(() => import("./pages/TrendsPage"));

const routeTitles = {
  "/": "Overview",
  "/spending": "Spending",
  "/trends": "Trends",
  "/recurring": "Recurring",
  "/goals": "Goals",
  "/transactions": "Transactions",
  "/accounts": "Accounts",
  "/organize": "Organize",
  "/profiles": "Profiles"
};

function RouteEffects({ profileType = "personal" }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const businessTitles = { "/": "Business Overview", "/spending": "Operations", "/trends": "Business Insights", "/recurring": "Schedules", "/goals": "Reserves", "/transactions": "Business Ledger", "/accounts": "Business Accounts", "/organize": "Organize", "/profiles": "Profiles" };
    const title = profileType === "business" ? businessTitles[pathname] : routeTitles[pathname];
    document.title = `${title ?? "Overview"} - Cloud Budget`;
  }, [pathname, profileType]);

  return null;
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    state,
    dataReady,
    profileBackup,
    storageError,
    profiles,
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
  } = useBudgetStore();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(localDate().slice(0, 7));
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [transactionImportOpen, setTransactionImportOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [newTransactionType, setNewTransactionType] = useState("expense");
  const [accountOpen, setAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [reconcilingAccount, setReconcilingAccount] = useState(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [transferAfterAccount, setTransferAfterAccount] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [debtOpen, setDebtOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [quickValue, setQuickValue] = useState("");
  const [quickError, setQuickError] = useState("");
  const [toast, setToast] = useState("");
  const [toastAction, setToastAction] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [updateRegistration, setUpdateRegistration] = useState(null);
  const [backupMode, setBackupMode] = useState(null);
  const [privacyMode, setPrivacyMode] = useState(null);
  const [lockConfig, setLockConfig] = useState(() => getPrivacyLock());
  const [unlocked, setUnlocked] = useState(() => !getPrivacyLock());
  const [installPrompt, setInstallPrompt] = useState(null);
  const toastTimer = useRef(null);
  const expenseCategories = expenseCategoriesFor(activeProfile.type, state);
  const expenseSubcategories = expenseSubcategoriesFor(activeProfile.type, state);

  const summary = useMemo(() => getMonthlySummary(state, selectedMonth), [state, selectedMonth]);
  const comparison = useMemo(() => getSpendingComparison(state, selectedMonth), [state, selectedMonth]);
  const safeToSpend = useMemo(
    () => getSafeToSpend(summary.spendableRemaining, selectedMonth),
    [summary.spendableRemaining, selectedMonth]
  );
  const upcomingBills = useMemo(
    () => getUpcomingBills(state.recurringBills.filter((bill) => bill.type !== "income")),
    [state.recurringBills]
  );
  const goals = useMemo(() => getGoalSummaries(state.goals, selectedMonth), [state.goals, selectedMonth]);
  const linkedDebts = useMemo(() => getLinkedDebts(state, localDate()), [state]);
  const backupDue = state.transactions.length > 0 && (
    !state.lastBackupAt || Date.now() - new Date(state.lastBackupAt).getTime() > 30 * 24 * 60 * 60 * 1000
  );
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(
    new Date(`${selectedMonth}-01T12:00:00`)
  );

  useEffect(() => {
    const capturePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const installed = () => {
      setInstallPrompt(null);
      notify("Cloud was installed.");
    };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const updateAvailable = (event) => setUpdateRegistration(event.detail);
    window.addEventListener("cloud-update-available", updateAvailable);
    return () => window.removeEventListener("cloud-update-available", updateAvailable);
  }, []);

  const notify = (message, action = null) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    setToastAction(action);
    toastTimer.current = setTimeout(() => {
      setToast("");
      setToastAction(null);
    }, action ? 6000 : 2600);
  };

  const handleTransaction = (transaction) => {
    if (transaction.id) updateTransaction(transaction);
    else addTransaction(transaction);
    setSelectedMonth(transaction.date.slice(0, 7));
    setTransactionOpen(false);
    setEditingTransaction(null);
    notify(transaction.id ? "Transaction updated." : "Transaction saved.");
  };

  const openTransactionEditor = (transaction = null, defaultType = "expense") => {
    setEditingTransaction(transaction);
    setNewTransactionType(transaction?.type ?? defaultType);
    setTransactionOpen(true);
  };

  const handleQuickAdd = (event) => {
    event.preventDefault();
    const parsed = parseQuickTransaction(quickValue, activeProfile.type);
    if (!parsed) {
      setQuickError('Use an amount followed by a description, like "15 Coffee".');
      return;
    }
    addTransaction({ ...parsed, type: "expense", date: dateForMonth(selectedMonth), accountId: state.accounts[0].id, cleared: true });
    setQuickValue("");
    setQuickError("");
    notify(`${parsed.description} added to ${parsed.category}.`);
  };

  const handleTransactionImport = (transactions, metadata) => {
    const batchId = importTransactions(transactions, metadata);
    const latestMonth = transactions.map(({ date }) => date.slice(0, 7)).sort().at(-1);
    if (latestMonth) setSelectedMonth(latestMonth);
    setTransactionImportOpen(false);
    notify(`${transactions.length} transaction${transactions.length === 1 ? "" : "s"} imported for review.`, {
      label: "Undo import",
      run: () => undoImport(batchId)
    });
  };

  const handleBudgetSave = (value) => {
    updateBudget(value, selectedMonth);
    setBudgetOpen(false);
    notify("Monthly budget saved.");
  };

  const handleDashboardSave = (dashboard) => {
    updateDashboard(dashboard);
    setCustomizeOpen(false);
    notify("Overview layout saved.");
  };

  const handleRecurringSave = (bill) => {
    saveRecurringBill(bill);
    setRecurringOpen(false);
    setEditingRecurring(null);
    notify(bill.id ? "Schedule updated." : "Recurring payment scheduled.");
  };

  const openRecurringEditor = (bill = null) => {
    setEditingRecurring(bill);
    setRecurringOpen(true);
  };

  const handleRecurringDelete = (bill) => {
    setConfirmation({
      title: "Delete recurring schedule?",
      message: `${bill.description} will no longer appear in your upcoming payments or forecast.`,
      onConfirm: () => {
        deleteRecurringBill(bill.id);
        notify("Recurring schedule deleted.", { label: "Undo", run: () => saveRecurringBill(bill) });
      }
    });
  };

  const handleRecurringSuggestion = (suggestion) => {
    const { id: _suggestionId, occurrences: _occurrences, ...schedule } = suggestion;
    saveRecurringBill({ ...schedule, active: true });
    notify(`${suggestion.description} added as a ${suggestion.frequency} schedule.`);
  };

  const handleScheduleOccurrence = (occurrence, status) => {
    updateScheduleOccurrence(occurrence, status);
    notify(status === "skipped" ? `${occurrence.description} skipped.` : `${occurrence.description} recorded.`);
  };

  const handleGoalSave = (goal) => {
    saveGoal(goal);
    setGoalOpen(false);
    setEditingGoal(null);
    notify(goal.id ? "Savings goal updated." : "Savings goal created.");
  };

  const openGoalEditor = (goal = null) => {
    setEditingGoal(goal);
    setGoalOpen(true);
  };

  const handleGoalContribution = (goalId, contribution) => {
    const amount = Number(contribution.amount);
    const goal = goals.find((item) => item.id === goalId);
    const contributionMonth = contribution.date.slice(0, 7);
    const contributionSummary = getMonthlySummary(state, contributionMonth);
    if (amount > 0 && amount > Math.max(contributionSummary.spendableRemaining, 0)) {
      notify("That assignment is higher than your available amount.");
      return;
    }
    if (amount > 0 && goal && amount > goal.remaining) {
      notify("That assignment is higher than the goal amount remaining.");
      return;
    }
    if (amount < 0 && goal && Math.abs(amount) > goal.saved) {
      notify("That withdrawal is higher than the amount saved.");
      return;
    }
    assignToGoal(goalId, contribution);
    setSelectedGoal(null);
    notify(amount < 0 ? "Funds withdrawn from your goal." : "Funds assigned to your goal.");
  };

  const handleGoalContributionDelete = (goal, contribution) => {
    setConfirmation({
      title: "Remove goal activity?",
      message: `Remove the ${formatContributionAmount(contribution.amount, state.currency)} entry from ${goal.name}?`,
      onConfirm: () => {
        removeGoalContribution(goal.id, contribution.id);
        notify("Goal activity removed.", {
          label: "Undo",
          run: () => restoreGoalContribution(goal.id, contribution)
        });
      }
    });
  };

  const handleGoalDelete = (goal) => {
    setConfirmation({
      title: "Delete savings goal?",
      message: `${goal.name} and its complete activity history will be removed.`,
      onConfirm: () => {
        deleteGoal(goal.id);
        notify("Savings goal deleted.", { label: "Undo", run: () => restoreGoal(goal) });
      }
    });
  };

  const handleDebtSave = (debt) => {
    saveDebt(debt);
    setDebtOpen(false);
    setSelectedDebt(null);
    notify(debt.id ? "Credit card updated." : "Credit card added to your plan.");
  };

  const handleDebtDelete = (debt) => {
    setConfirmation({
      title: "Remove credit card plan?",
      message: `${debt.name} will be removed from debt projections. Its linked account stays available.`,
      onConfirm: () => {
        deleteDebt(debt.id);
        notify("Credit card removed from your plan.");
      }
    });
  };

  const openDebtEditor = (debt = null) => {
    setSelectedDebt(debt);
    setDebtOpen(true);
  };

  const handleDelete = (transaction) => {
    setConfirmation({
      title: "Delete transaction?",
      message: `"${transaction.description}" will be removed from your budget totals.`,
      onConfirm: () => {
        deleteTransaction(transaction.id);
        notify("Transaction deleted.", { label: "Undo", run: () => restoreTransactions([transaction]) });
      }
    });
  };

  const handleBulkUpdate = (ids, changes) => {
    const originals = state.transactions.filter((transaction) => ids.includes(transaction.id));
    bulkUpdateTransactions(ids, changes);
    notify(`${ids.length} transactions updated.`, {
      label: "Undo",
      run: () => restoreTransactions(originals)
    });
  };

  const handleBulkDelete = (ids) => {
    const originals = state.transactions.filter((transaction) => ids.includes(transaction.id));
    setConfirmation({
      title: `Delete ${ids.length} transactions?`,
      message: "These entries will be removed from budget totals. You can undo this immediately afterward.",
      onConfirm: () => {
        bulkDeleteTransactions(ids);
        notify(`${ids.length} transactions deleted.`, {
          label: "Undo",
          run: () => restoreTransactions(originals)
        });
      }
    });
  };

  const openAccountEditor = (account = null) => {
    setTransferAfterAccount(false);
    setEditingAccount(account);
    setAccountOpen(true);
  };

  const requestTransfer = () => {
    setEditingTransfer(null);
    if (state.accounts.length > 1) {
      setTransferOpen(true);
      return;
    }
    setTransferAfterAccount(true);
    setEditingAccount(null);
    setAccountOpen(true);
    notify("Add the other account first, then Cloud will open the transfer form.");
  };

  const handleAccountSave = (account) => {
    const continueToTransfer = transferAfterAccount && !account.id;
    saveAccount(account);
    setAccountOpen(false);
    setEditingAccount(null);
    setTransferAfterAccount(false);
    if (continueToTransfer) {
      setTransferOpen(true);
      notify("Account added. Now choose where the money should move.");
    } else {
      notify(account.id ? "Account updated." : "Account added.");
    }
  };

  const handleAccountDelete = (account) => {
    if (state.accounts.length === 1) {
      notify("Each profile needs at least one account.");
      return;
    }
    if (accountHasActivity(state, account.id)) {
      notify("This account has linked activity and cannot be deleted yet.");
      return;
    }
    setConfirmation({
      title: "Delete account?",
      message: `${account.name} has no linked activity and can be safely removed.`,
      onConfirm: () => {
        deleteAccount(account.id);
        notify("Account deleted.", { label: "Undo", run: () => saveAccount(account) });
      }
    });
  };

  const handleReconciliation = (snapshot, addAdjustment) => {
    saveReconciliation(snapshot, addAdjustment);
    setReconcilingAccount(null);
    notify(Math.abs(snapshot.difference) < 0.005 ? "Account reconciled with no difference." : addAdjustment ? "Account reconciled and adjusted." : "Reconciliation checkpoint saved.");
  };

  const handleTransferSave = (transfer) => {
    saveTransfer(transfer);
    setTransferOpen(false);
    setEditingTransfer(null);
    notify(transfer.id ? "Transfer updated." : "Transfer saved without changing spending totals.");
  };

  const openTransferEditor = (transfer) => {
    setEditingTransfer(transfer);
    setTransferOpen(true);
  };

  const handleTransferDelete = (transfer) => {
    setConfirmation({
      title: "Delete transfer?",
      message: `${transfer.description} will be removed from both account histories.`,
      onConfirm: () => {
        deleteTransfer(transfer.id);
        notify("Transfer deleted.", { label: "Undo", run: () => saveTransfer(transfer) });
      }
    });
  };

  const handleProfileSwitch = (id) => {
    const profile = profiles.find((item) => item.id === id);
    if (!profile || profile.id === activeProfile.id) return;
    switchProfile(id);
    notify(`Switched to ${profile.name}.`);
  };

  const openProfileEditor = (profile = null) => {
    setEditingProfile(profile);
    setProfileOpen(true);
  };

  const handleProfileSave = (profile) => {
    if (editingProfile) {
      updateProfile(editingProfile.id, profile);
      notify("Profile updated.");
    } else {
      createProfile(profile);
      notify(`${profile.name} created.`);
    }
    setProfileOpen(false);
    setEditingProfile(null);
  };

  const handleProfileDelete = (profile) => {
    if (profiles.length === 1) return;
    setConfirmation({
      title: "Permanently delete profile?",
      message: `${profile.name} and all of its local budget data will be deleted. Create a backup first if you may need it later.`,
      confirmLabel: "Delete permanently",
      onConfirm: () => {
        deleteProfile(profile.id);
        notify(`${profile.name} deleted.`);
      }
    });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const profileName = activeProfile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "profile";
    link.download = `cloud-budget-${profileName}-${localDate()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    markBackupCreated();
    notify("Backup downloaded.");
  };

  const handleProfilesExport = () => {
    const blob = new Blob([JSON.stringify({ format: "cloud-budget-profiles", ...profileBackup }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cloud-budget-all-profiles-${localDate()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    markBackupCreated();
    notify("Complete local backup downloaded.");
  };

  const handleEncryptedExport = (text) => {
    const blob = new Blob([text], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cloud-budget-encrypted-${localDate()}.cloudbackup`;
    link.click();
    URL.revokeObjectURL(link.href);
    markBackupCreated();
    notify("Encrypted backup downloaded.");
  };

  const handleEncryptedRestore = (value) => {
    setBackupMode(null);
    setConfirmation({
      title: "Restore every profile?",
      message: "This replaces all local Cloud profiles. A safety backup will download before the restore begins.",
      confirmLabel: "Restore backup",
      onConfirm: () => {
        handleProfilesExport();
        importProfileStore(value);
        notify("Encrypted backup restored.");
      }
    });
  };

  const handleProfilesImport = async (file) => {
    try {
      const value = JSON.parse(await file.text());
      if (value?.format !== "cloud-budget-profiles" || !Array.isArray(value.profiles)) throw new Error("Invalid profile backup");
      setConfirmation({
        title: "Restore every profile?",
        message: "This replaces all local Cloud profiles. A safety backup will download before the restore begins.",
        confirmLabel: "Restore backup",
        onConfirm: () => {
          handleProfilesExport();
          importProfileStore(value);
          notify("All profiles restored.");
        }
      });
    } catch {
      notify("That file is not a valid all-profile Cloud backup.");
    }
  };

  const handleImport = async (file) => {
    try {
      const value = JSON.parse(await file.text());
      const valid = [1, 2, 3, 4, 5, 6].includes(value?.version) && value.budgets && Array.isArray(value.transactions);
      if (!valid) throw new Error("Invalid backup");
      setConfirmation({
        title: `Restore ${activeProfile.name}?`,
        message: "This replaces this profile's budget data. A safety backup will download first.",
        confirmLabel: "Restore backup",
        onConfirm: () => {
          handleExport();
          importState(value);
          setBudgetOpen(false);
          notify("Backup restored.");
        }
      });
    } catch {
      notify("That file is not a valid Cloud backup.");
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  const transactionProps = {
    transactions: summary.transactions,
    accounts: state.accounts,
    currency: state.currency,
    categories: expenseCategories,
    subcategories: expenseSubcategories,
    tags: state.tags,
    quickValue,
    quickError,
    onQuickChange: (value) => {
      setQuickValue(value);
      if (quickError) setQuickError("");
    },
    onQuickAdd: handleQuickAdd,
    onAdd: () => openTransactionEditor(),
    onImport: () => setTransactionImportOpen(true),
    onEdit: openTransactionEditor,
    onTransfer: requestTransfer,
    onDelete: handleDelete,
    onReview: reviewTransaction,
    onCategoryChange: updateTransactionCategory,
    onSubcategoryChange: updateTransactionSubcategory,
    onBulkUpdate: handleBulkUpdate,
    onBulkDelete: handleBulkDelete,
    profileType: activeProfile.type
  };

  if (lockConfig && !unlocked) {
    return <PrivacyLock mode="unlock" lockConfig={lockConfig} onUnlocked={() => setUnlocked(true)} />;
  }
  if (!dataReady) {
    return <div className="privacy-lock-screen grid min-h-screen place-items-center bg-[#f5f3ee] text-sm font-semibold text-slate-500" role="status">Opening your private planner…</div>;
  }

  return (
    <div className={`min-h-screen ${activeProfile.type === "business" ? "business-shell" : ""}`}>
      <RouteEffects profileType={activeProfile.type} />
      <Sidebar profileType={activeProfile.type} />
      <div className="lg:ml-60">
        <Header
          selectedMonth={selectedMonth}
          onMonthChange={(month) => month && setSelectedMonth(month)}
          onMonthStep={(amount) => setSelectedMonth((month) => shiftMonth(month, amount))}
          onCurrentMonth={() => setSelectedMonth(localDate().slice(0, 7))}
          onAdd={() => openTransactionEditor()}
          installAvailable={Boolean(installPrompt)}
          onInstall={handleInstall}
          profiles={profiles}
          activeProfile={activeProfile}
          onSwitchProfile={handleProfileSwitch}
          onManageProfiles={() => navigate("/profiles")}
          theme={theme}
          onToggleTheme={toggleTheme}
          profileType={activeProfile.type}
        />

        <main className="mx-auto w-full max-w-[1240px] px-4 pb-32 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pb-20 xl:px-14">
          <UpdateBanner registration={updateRegistration} onDismiss={() => setUpdateRegistration(null)} />
          {storageError && (
            <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 sm:flex-row sm:items-center" role="alert">
              <p className="flex-1 text-xs font-semibold leading-relaxed">{storageError}</p>
              <button onClick={handleProfilesExport} className="interactive-button min-h-10 rounded-xl bg-rose-700 px-4 text-xs font-bold text-white hover:bg-rose-800">Export all profiles</button>
            </section>
          )}
          {backupDue && !storageError && (
            <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center" role="status">
              <div className="flex-1"><strong className="block text-xs">Keep your private data recoverable</strong><p className="mt-1 text-[11px] text-amber-800/75">Your data stays on this device, so download an encrypted backup at least monthly.</p></div>
              <button type="button" onClick={() => setBackupMode("export")} className="interactive-button min-h-10 rounded-xl bg-amber-800 px-4 text-xs font-bold text-white hover:bg-amber-900">Create encrypted backup</button>
            </section>
          )}
          <Suspense fallback={<div className="grid min-h-64 place-items-center text-xs font-semibold text-slate-400" role="status">Loading this view…</div>}>
          <Routes>
            <Route
              index
              element={
                activeProfile.type === "business" ? (
                  <BusinessOverviewPage
                    state={state}
                    summary={summary}
                    debts={linkedDebts}
                    selectedMonth={selectedMonth}
                    profile={activeProfile}
                    onAddTransaction={() => openTransactionEditor()}
                    onManageBudget={() => setBudgetOpen(true)}
                  />
                ) : (
                <OverviewPage
                  monthLabel={monthLabel}
                  state={state}
                  summary={summary}
                  comparison={comparison}
                  safeToSpend={safeToSpend}
                  upcomingBills={upcomingBills}
                  goals={goals}
                  debts={linkedDebts}
                  onManageBudget={() => setBudgetOpen(true)}
                  onCustomize={() => setCustomizeOpen(true)}
                  onAddIncome={() => openTransactionEditor(null, "income")}
                  onAddSchedule={() => openRecurringEditor()}
                />
                )
              }
            />
            <Route
              path="spending"
              element={
                <SpendingPage
                  monthLabel={monthLabel}
                  state={state}
                  debts={linkedDebts}
                  summary={summary}
                  onManageBudget={() => setBudgetOpen(true)}
                  onAddDebt={() => openDebtEditor()}
                  onEditDebt={openDebtEditor}
                  onDeleteDebt={handleDebtDelete}
                  onDebtPlanChange={(debtPlan) => {
                    updateDebtPlan(debtPlan);
                    notify("Debt projection updated.");
                  }}
                  profileType={activeProfile.type}
                />
              }
            />
            <Route path="trends" element={<TrendsPage state={state} endMonth={selectedMonth} profileType={activeProfile.type} />} />
            <Route
              path="recurring"
              element={
                <RecurringPage
                  state={state}
                  goals={goals}
                  onAddBill={() => setRecurringOpen(true)}
                  onEditBill={openRecurringEditor}
                  onToggleBill={(bill) => {
                    toggleRecurringBill(bill.id);
                    notify(bill.active === false ? "Schedule resumed." : "Schedule paused.");
                  }}
                  onDeleteBill={handleRecurringDelete}
                  onAddGoal={() => openGoalEditor()}
                  onEditGoal={openGoalEditor}
                  onUpdateOccurrence={handleScheduleOccurrence}
                  profileType={activeProfile.type}
                />
              }
            />
            <Route
              path="goals"
              element={
                <GoalsPage
                  goals={goals}
                  currency={state.currency}
                  onAdd={() => openGoalEditor()}
                  onAssign={setSelectedGoal}
                  onEdit={openGoalEditor}
                  onDelete={handleGoalDelete}
                  onRemoveContribution={handleGoalContributionDelete}
                  accounts={state.accounts}
                  profileType={activeProfile.type}
                />
              }
            />
            <Route path="transactions" element={<TransactionsPage transactionProps={transactionProps} />} />
            <Route
              path="accounts"
              element={
                <AccountsPage
                  state={state}
                  profileType={activeProfile.type}
                  onAddAccount={() => openAccountEditor()}
                  onEditAccount={openAccountEditor}
                  onDeleteAccount={handleAccountDelete}
                  onReconcileAccount={setReconcilingAccount}
                  onAddTransfer={requestTransfer}
                  onEditTransfer={openTransferEditor}
                  onDeleteTransfer={handleTransferDelete}
                />
              }
            />
            <Route
              path="organize"
              element={
                <OrganizePage
                  state={state}
                  profileType={activeProfile.type}
                  onSaveCategory={(category) => {
                    saveCustomCategory(category);
                    notify("Category saved.");
                  }}
                  onToggleCategory={(id) => {
                    toggleCustomCategory(id);
                    notify("Category visibility updated.");
                  }}
                  onMoveCategory={moveCustomCategory}
                  onMergeCategory={(sourceId, targetId) => {
                    const source = state.customCategories.find(({ id }) => id === sourceId);
                    const target = expenseCategories.find(({ id }) => id === targetId);
                    setConfirmation({
                      title: "Merge spending categories?",
                      message: `Move all budgets, rules, schedules, and transaction history from ${source?.name ?? "this category"} into ${target?.name ?? "the selected category"}? The original category will be archived.`,
                      confirmLabel: "Merge categories",
                      onConfirm: () => {
                        mergeCustomCategory(sourceId, targetId);
                        notify("Categories merged.");
                      }
                    });
                  }}
                  onSaveSubcategory={(subcategory) => {
                    saveCustomSubcategory(subcategory);
                    notify("Spending detail saved.");
                  }}
                  onSaveTag={(tag) => {
                    saveTag(tag);
                    notify("Tag saved.");
                  }}
                  onDeleteTag={(id) => {
                    deleteTag(id);
                    notify("Tag removed.");
                  }}
                  onSaveRule={(rule, applyExisting) => {
                    saveRule(rule, applyExisting);
                    notify(rule.id ? "Transaction rule updated." : "Transaction rule created.");
                  }}
                  onToggleRule={toggleRule}
                  onMoveRule={moveRule}
                  onDeleteRule={(id) => {
                    deleteRule(id);
                    notify("Transaction rule deleted.");
                  }}
                  onAcceptSuggestion={handleRecurringSuggestion}
                />
              }
            />
            <Route
              path="profiles"
              element={
                <ProfilesPage
                  profiles={profiles}
                  activeProfile={activeProfile}
                  onSwitch={handleProfileSwitch}
                  onAdd={() => openProfileEditor()}
                  onEdit={openProfileEditor}
                  onDelete={handleProfileDelete}
                  onExportAll={handleProfilesExport}
                  onImportAll={handleProfilesImport}
                  onEncryptedExport={() => setBackupMode("export")}
                  onEncryptedImport={() => setBackupMode("import")}
                  appLockEnabled={Boolean(lockConfig)}
                  onConfigureLock={() => setPrivacyMode(lockConfig ? "remove" : "setup")}
                  onLockNow={() => setUnlocked(false)}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </main>
      </div>

      <button
        onClick={() => openTransactionEditor()}
        className={`interactive-button fixed bottom-20 right-5 z-20 grid size-14 place-items-center rounded-2xl text-white shadow-xl hover:-translate-y-px sm:hidden ${activeProfile.type === "business" ? "bg-[#174c47] hover:bg-[#102c2b]" : "bg-forest-900 hover:bg-forest-800"}`}
        aria-label="Add transaction"
      >
        <Plus className="size-5" />
      </button>
      <MobileNav profileType={activeProfile.type} />

      <TransactionModal
        open={transactionOpen}
        transaction={editingTransaction}
        defaultType={newTransactionType}
        onClose={() => {
          setTransactionOpen(false);
          setEditingTransaction(null);
          setNewTransactionType("expense");
        }}
        onSave={handleTransaction}
        onTransfer={() => {
          setTransactionOpen(false);
          setEditingTransaction(null);
          requestTransfer();
        }}
        currency={state.currency}
        selectedMonth={selectedMonth}
        accounts={state.accounts}
        categories={expenseCategories}
        subcategories={expenseSubcategories}
        tags={state.tags}
        profileType={activeProfile.type}
      />
      <TransactionImportModal
        open={transactionImportOpen}
        onClose={() => setTransactionImportOpen(false)}
        onImport={handleTransactionImport}
        onUndoImport={(batchId) => {
          undoImport(batchId);
          notify("Import removed.");
        }}
        importHistory={state.importHistory}
        accounts={state.accounts}
        existingTransactions={state.transactions}
        currency={state.currency}
        profileType={activeProfile.type}
      />
      <AccountModal
        open={accountOpen}
        account={editingAccount}
        onClose={() => {
          setAccountOpen(false);
          setEditingAccount(null);
          setTransferAfterAccount(false);
        }}
        onSave={handleAccountSave}
        currency={state.currency}
        profileType={activeProfile.type}
      />
      <ReconcileModal
        open={Boolean(reconcilingAccount)}
        account={reconcilingAccount}
        state={state}
        onClose={() => setReconcilingAccount(null)}
        onSave={handleReconciliation}
      />
      <TransferModal
        open={transferOpen}
        transfer={editingTransfer}
        accounts={state.accounts}
        balances={getAccountBalances(state, localDate())}
        currency={state.currency}
        selectedMonth={selectedMonth}
        onClose={() => {
          setTransferOpen(false);
          setEditingTransfer(null);
        }}
        onSave={handleTransferSave}
      />
      <BudgetModal
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        state={state}
        selectedMonth={selectedMonth}
        recordedIncome={summary.income}
        onSave={handleBudgetSave}
        onExport={handleExport}
        onImport={handleImport}
        categories={expenseCategories}
        profileType={activeProfile.type}
      />
      <DashboardCustomizeModal
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        layout={state.dashboard}
        onSave={handleDashboardSave}
      />
      <RecurringModal
        open={recurringOpen}
        schedule={editingRecurring}
        onClose={() => {
          setRecurringOpen(false);
          setEditingRecurring(null);
        }}
        onSave={handleRecurringSave}
        currency={state.currency}
        categories={expenseCategories}
        accounts={state.accounts}
        profileType={activeProfile.type}
      />
      <GoalModal
        open={goalOpen}
        goal={editingGoal}
        onClose={() => {
          setGoalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleGoalSave}
        currency={state.currency}
        accounts={state.accounts}
        profileType={activeProfile.type}
      />
      <DebtModal
        open={debtOpen}
        debt={selectedDebt}
        accounts={state.accounts.filter((account) => account.type === "credit" && (
          account.id === selectedDebt?.accountId || !state.debts.some((debt) => debt.accountId === account.id)
        ))}
        balances={getAccountBalances(state, localDate())}
        onClose={() => {
          setDebtOpen(false);
          setSelectedDebt(null);
        }}
        onSave={handleDebtSave}
        currency={state.currency}
      />
      <GoalContributionModal
        goal={selectedGoal}
        onClose={() => setSelectedGoal(null)}
        onSave={handleGoalContribution}
        currency={state.currency}
        selectedMonth={selectedMonth}
        available={summary.spendableRemaining}
        availableForDate={(date) => getMonthlySummary(state, date.slice(0, 7)).spendableRemaining}
        goals={goals}
        onTransfer={(fromGoalId, toGoalId, amount, date) => {
          transferGoalFunds(fromGoalId, toGoalId, amount, date);
          setSelectedGoal(null);
          notify("Funds transferred between goals.");
        }}
      />
      <ProfileModal
        open={profileOpen}
        profile={editingProfile}
        activeProfile={activeProfile}
        onClose={() => {
          setProfileOpen(false);
          setEditingProfile(null);
        }}
        onSave={handleProfileSave}
      />
      <EncryptedBackupModal
        mode={backupMode}
        profileBackup={profileBackup}
        onClose={() => setBackupMode(null)}
        onExport={handleEncryptedExport}
        onRestore={handleEncryptedRestore}
      />
      <PrivacyLock
        mode={privacyMode}
        lockConfig={lockConfig}
        onClose={() => setPrivacyMode(null)}
        onChanged={(value) => {
          setLockConfig(value);
          setUnlocked(true);
          setPrivacyMode(null);
          notify(value ? "Local app lock enabled." : "Local app lock removed.");
        }}
      />
      <ConfirmModal confirmation={confirmation} onClose={() => setConfirmation(null)} />
      <Toast
        message={toast}
        actionLabel={toastAction?.label}
        onAction={toastAction ? () => {
          toastAction.run();
          clearTimeout(toastTimer.current);
          setToast("");
          setToastAction(null);
        } : undefined}
      />
    </div>
  );
}

function formatContributionAmount(amount, currency) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}
