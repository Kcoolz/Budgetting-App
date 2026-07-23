import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import AccountModal from "./components/AccountModal";
import BudgetModal from "./components/BudgetModal";
import DashboardCustomizeModal from "./components/DashboardCustomizeModal";
import DebtModal from "./components/DebtModal";
import GoalContributionModal from "./components/GoalContributionModal";
import GoalModal from "./components/GoalModal";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import ProfileModal from "./components/ProfileModal";
import ReconcileModal from "./components/ReconcileModal";
import RecurringModal from "./components/RecurringModal";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import TransactionModal from "./components/TransactionModal";
import TransactionImportModal from "./components/TransactionImportModal";
import TransferModal from "./components/TransferModal";
import { useBudgetStore } from "./hooks/useBudgetStore";
import GoalsPage from "./pages/GoalsPage";
import AccountsPage from "./pages/AccountsPage";
import BusinessOverviewPage from "./pages/BusinessOverviewPage";
import OverviewPage from "./pages/OverviewPage";
import OrganizePage from "./pages/OrganizePage";
import ProfilesPage from "./pages/ProfilesPage";
import RecurringPage from "./pages/RecurringPage";
import SpendingPage from "./pages/SpendingPage";
import TransactionsPage from "./pages/TransactionsPage";
import TrendsPage from "./pages/TrendsPage";
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
  const {
    state,
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
    deleteTransaction,
    reviewTransaction,
    updateTransactionCategory,
    updateTransactionSubcategory,
    saveCustomCategory,
    toggleCustomCategory,
    saveCustomSubcategory,
    saveTag,
    deleteTag,
    saveRule,
    toggleRule,
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
    assignToGoal,
    removeGoalContribution,
    updateDashboard,
    saveDebt,
    deleteDebt,
    updateDebtPlan,
    updateBudget,
    importState,
    importProfileStore
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

  const notify = (message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
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

  const handleTransactionImport = (transactions) => {
    importTransactions(transactions);
    const latestMonth = transactions.map(({ date }) => date.slice(0, 7)).sort().at(-1);
    if (latestMonth) setSelectedMonth(latestMonth);
    setTransactionImportOpen(false);
    notify(`${transactions.length} transaction${transactions.length === 1 ? "" : "s"} imported for review.`);
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
    if (!window.confirm(`Delete the ${bill.description} schedule?`)) return;
    deleteRecurringBill(bill.id);
    notify("Recurring schedule deleted.");
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
    const contributionMonth = contribution.date.slice(0, 7);
    const contributionSummary = getMonthlySummary(state, contributionMonth);
    if (Number(contribution.amount) > Math.max(contributionSummary.spendableRemaining, 0)) {
      notify("That assignment is higher than your available amount.");
      return;
    }
    if (selectedGoal && Number(contribution.amount) > selectedGoal.remaining) {
      notify("That assignment is higher than the goal amount remaining.");
      return;
    }
    assignToGoal(goalId, contribution);
    setSelectedGoal(null);
    notify("Funds assigned to your goal.");
  };

  const handleGoalContributionDelete = (goal, contribution) => {
    if (!window.confirm(`Remove the ${formatContributionAmount(contribution.amount, state.currency)} assignment from ${goal.name}?`)) return;
    removeGoalContribution(goal.id, contribution.id);
    notify("Goal assignment removed.");
  };

  const handleGoalDelete = (goal) => {
    if (!window.confirm(`Delete the ${goal.name} goal and its assignment history?`)) return;
    deleteGoal(goal.id);
    notify("Savings goal deleted.");
  };

  const handleDebtSave = (debt) => {
    saveDebt(debt);
    setDebtOpen(false);
    setSelectedDebt(null);
    notify(debt.id ? "Credit card updated." : "Credit card added to your plan.");
  };

  const handleDebtDelete = (debt) => {
    if (!window.confirm(`Remove ${debt.name} from your debt plan?`)) return;
    deleteDebt(debt.id);
    notify("Credit card removed from your plan.");
  };

  const openDebtEditor = (debt = null) => {
    setSelectedDebt(debt);
    setDebtOpen(true);
  };

  const handleDelete = (transaction) => {
    if (!window.confirm(`Delete "${transaction.description}"?`)) return;
    deleteTransaction(transaction.id);
    notify("Transaction deleted.");
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
    if (!window.confirm(`Delete ${account.name}?`)) return;
    deleteAccount(account.id);
    notify("Account deleted.");
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
    if (!window.confirm(`Delete the ${transfer.description} transfer?`)) return;
    deleteTransfer(transfer.id);
    notify("Transfer deleted.");
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
    if (!window.confirm(`Delete ${profile.name} and all of its budget data? This cannot be undone.`)) return;
    deleteProfile(profile.id);
    notify(`${profile.name} deleted.`);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const profileName = activeProfile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "profile";
    link.download = `cloud-budget-${profileName}-${localDate()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    notify("Backup downloaded.");
  };

  const handleProfilesExport = () => {
    const blob = new Blob([JSON.stringify({ format: "cloud-budget-profiles", ...profileBackup }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cloud-budget-all-profiles-${localDate()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    notify("Complete local backup downloaded.");
  };

  const handleProfilesImport = async (file) => {
    try {
      const value = JSON.parse(await file.text());
      if (value?.format !== "cloud-budget-profiles" || !Array.isArray(value.profiles)) throw new Error("Invalid profile backup");
      if (!window.confirm("Replace every local Cloud profile with this backup? A safety backup will download first.")) return;
      handleProfilesExport();
      importProfileStore(value);
      notify("All profiles restored.");
    } catch {
      notify("That file is not a valid all-profile Cloud backup.");
    }
  };

  const handleImport = async (file) => {
    try {
      const value = JSON.parse(await file.text());
      const valid = [1, 2, 3, 4, 5].includes(value?.version) && value.budgets && Array.isArray(value.transactions);
      if (!valid) throw new Error("Invalid backup");
      if (!window.confirm(`Replace the budget data in ${activeProfile.name} with this backup?`)) return;
      handleExport();
      importState(value);
      setBudgetOpen(false);
      notify("Backup restored.");
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
    profileType: activeProfile.type
  };

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
          profileType={activeProfile.type}
        />

        <main className="mx-auto w-full max-w-[1240px] px-4 pb-32 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pb-20 xl:px-14">
          {storageError && (
            <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 sm:flex-row sm:items-center" role="alert">
              <p className="flex-1 text-xs font-semibold leading-relaxed">{storageError}</p>
              <button onClick={handleProfilesExport} className="interactive-button min-h-10 rounded-xl bg-rose-700 px-4 text-xs font-bold text-white hover:bg-rose-800">Export all profiles</button>
            </section>
          )}
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
                  onSaveRule={(rule) => {
                    saveRule(rule);
                    notify("Transaction rule created.");
                  }}
                  onToggleRule={toggleRule}
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
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
      <Toast message={toast} />
    </div>
  );
}

function formatContributionAmount(amount, currency) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}
