export const ACCOUNT_TYPES = [
  { id: "checking", name: "Checking", group: "asset" },
  { id: "savings", name: "Savings", group: "asset" },
  { id: "cash", name: "Cash", group: "asset" },
  { id: "investment", name: "Investment", group: "asset" },
  { id: "credit", name: "Credit card", group: "liability" },
  { id: "loan", name: "Loan", group: "liability" }
];

export function createDefaultAccount(profileType = "personal") {
  return {
    id: "main",
    name: profileType === "business" ? "Business checking" : "Main account",
    type: "checking",
    openingBalance: 0
  };
}

export function normalizeAccounts(value, profileType = "personal") {
  const accounts = [];
  const usedIds = new Set();

  if (Array.isArray(value)) {
    for (const candidate of value) {
      if (!candidate || typeof candidate.id !== "string" || !candidate.id.trim() || usedIds.has(candidate.id)) continue;
      const type = ACCOUNT_TYPES.some(({ id }) => id === candidate.type) ? candidate.type : "checking";
      const openingBalance = Number(candidate.openingBalance);
      const name = typeof candidate.name === "string" ? candidate.name.trim().slice(0, 48) : "";
      if (!name || !Number.isFinite(openingBalance)) continue;
      usedIds.add(candidate.id);
      accounts.push({ id: candidate.id, name, type, openingBalance });
    }
  }

  return accounts.length ? accounts : [createDefaultAccount(profileType)];
}

export function normalizeTransfers(value, accounts) {
  if (!Array.isArray(value)) return [];
  const accountIds = new Set(accounts.map(({ id }) => id));

  return value.filter((transfer) => Boolean(
    transfer &&
      typeof transfer.id === "string" &&
      accountIds.has(transfer.fromAccountId) &&
      accountIds.has(transfer.toAccountId) &&
      transfer.fromAccountId !== transfer.toAccountId &&
      isValidDateString(transfer.date) &&
      Number.isFinite(Number(transfer.amount)) &&
      Number(transfer.amount) > 0
  )).map((transfer) => ({
    id: transfer.id,
    fromAccountId: transfer.fromAccountId,
    toAccountId: transfer.toAccountId,
    amount: Number(transfer.amount),
    date: transfer.date,
    description: typeof transfer.description === "string" && transfer.description.trim()
      ? transfer.description.trim().slice(0, 80)
      : "Transfer"
  }));
}

export function getAccountType(type) {
  return ACCOUNT_TYPES.find(({ id }) => id === type) ?? ACCOUNT_TYPES[0];
}

export function isLiabilityAccount(account) {
  return getAccountType(account?.type).group === "liability";
}

export function getAccountBalances(state, throughDate = null, clearedOnly = false) {
  const balances = Object.fromEntries(
    (state.accounts ?? []).map((account) => [account.id, Number(account.openingBalance) || 0])
  );

  for (const transaction of state.transactions ?? []) {
    if (!(transaction.accountId in balances)) continue;
    if (throughDate && transaction.date > throughDate) continue;
    if (clearedOnly && transaction.cleared === false) continue;
    balances[transaction.accountId] += transaction.type === "income"
      ? Number(transaction.amount) || 0
      : -(Number(transaction.amount) || 0);
  }

  for (const transfer of state.transfers ?? []) {
    if (!(transfer.fromAccountId in balances) || !(transfer.toAccountId in balances)) continue;
    if (throughDate && transfer.date > throughDate) continue;
    balances[transfer.fromAccountId] -= Number(transfer.amount) || 0;
    balances[transfer.toAccountId] += Number(transfer.amount) || 0;
  }

  return balances;
}

export function getAccountOverview(state, throughDate = null) {
  const balances = getAccountBalances(state, throughDate);
  let assets = 0;
  let liabilities = 0;

  for (const account of state.accounts ?? []) {
    const balance = balances[account.id] ?? 0;
    if (isLiabilityAccount(account)) liabilities += Math.max(-balance, 0);
    else assets += balance;
  }

  const netWorth = Object.values(balances).reduce((total, balance) => total + balance, 0);
  return { balances, assets, liabilities, netWorth };
}

export function accountHasActivity(state, accountId) {
  return (state.transactions ?? []).some((transaction) => transaction.accountId === accountId) ||
    (state.transfers ?? []).some((transfer) => transfer.fromAccountId === accountId || transfer.toAccountId === accountId) ||
    (state.debts ?? []).some((debt) => debt.accountId === accountId);
}

export function getLinkedDebts(state, throughDate = null) {
  const balances = getAccountBalances(state, throughDate);
  return (state.debts ?? []).map((debt) => {
    const account = (state.accounts ?? []).find(({ id }) => id === debt.accountId);
    if (!account) return debt;
    return {
      ...debt,
      name: account.name,
      balance: Math.max(-(balances[account.id] ?? 0), 0)
    };
  });
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
