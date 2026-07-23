import { guessCategory, guessSubcategory, isValidDateString } from "./budget.js";

export function parseTransactionFile(fileName, text, profileType = "personal") {
  const extension = String(fileName ?? "").toLowerCase().split(".").at(-1);
  const rows = extension === "ofx" || extension === "qfx"
    ? parseOfx(text)
    : parseCsv(text);

  return rows.map((row) => {
    const category = guessCategory(row.description, profileType);
    return {
      type: row.amount < 0 ? "expense" : "income",
      amount: Math.abs(row.amount),
      date: row.date,
      description: row.description,
      category,
      ...(row.amount < 0 ? { subcategory: guessSubcategory(row.description, category, profileType) } : {}),
      reviewed: false,
      cleared: true,
      importId: row.importId ?? null
    };
  });
}

export function removeDuplicateTransactions(imported, existing, accountId) {
  const knownImportIds = new Set(existing.filter(({ importId }) => importId).map((transaction) => `${transaction.accountId ?? ""}|${transaction.importId}`));
  const knownFingerprints = new Set(existing.map((transaction) => transactionFingerprint(transaction)));
  const acceptedFingerprints = new Set();
  const transactions = [];
  let duplicateCount = 0;

  for (const transaction of imported) {
    const candidate = { ...transaction, accountId };
    const fingerprint = transactionFingerprint(candidate);
    if (
      (candidate.importId && knownImportIds.has(`${candidate.accountId ?? ""}|${candidate.importId}`)) ||
      knownFingerprints.has(fingerprint) ||
      acceptedFingerprints.has(fingerprint)
    ) {
      duplicateCount += 1;
      continue;
    }
    acceptedFingerprints.add(fingerprint);
    transactions.push(candidate);
  }

  return { transactions, duplicateCount };
}

export function transactionFingerprint(transaction) {
  const description = String(transaction.description ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return [
    transaction.accountId ?? "",
    transaction.date,
    transaction.type,
    Number(transaction.amount).toFixed(2),
    description
  ].join("|");
}

function parseCsv(text) {
  const rows = readCsvRows(text).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length < 2) throw new Error("The CSV file does not contain transaction rows.");
  const headers = rows[0].map(normalizeHeader);
  const dateIndex = findHeader(headers, ["date", "transactiondate", "posteddate", "postingdate"]);
  const descriptionIndex = findHeader(headers, ["description", "payee", "merchant", "name", "memo", "details"]);
  const amountIndex = findHeader(headers, ["amount", "transactionamount"]);
  const debitIndex = findHeader(headers, ["debit", "withdrawal", "moneyout"]);
  const creditIndex = findHeader(headers, ["credit", "deposit", "moneyin"]);
  if (dateIndex < 0 || descriptionIndex < 0 || (amountIndex < 0 && debitIndex < 0 && creditIndex < 0)) {
    throw new Error("CSV headers need Date, Description or Payee, and Amount—or Debit/Credit—columns.");
  }

  const transactions = [];
  for (const row of rows.slice(1)) {
    const date = normalizeDate(row[dateIndex]);
    const description = String(row[descriptionIndex] ?? "").trim();
    let amount = amountIndex >= 0 ? parseMoney(row[amountIndex]) : NaN;
    if (amountIndex < 0) {
      const debit = debitIndex >= 0 ? Math.abs(parseMoney(row[debitIndex]) || 0) : 0;
      const credit = creditIndex >= 0 ? Math.abs(parseMoney(row[creditIndex]) || 0) : 0;
      amount = credit > 0 ? credit : debit > 0 ? -debit : NaN;
    }
    if (!date || !description || !Number.isFinite(amount) || amount === 0) continue;
    transactions.push({ date, description: description.slice(0, 80), amount });
  }
  if (!transactions.length) throw new Error("No valid transactions were found in the CSV file.");
  return transactions;
}

function parseOfx(text) {
  const transactions = [];
  const blocks = String(text ?? "").match(/<STMTTRN>[\s\S]*?(?=<STMTTRN>|<\/STMTTRN>|<\/BANKTRANLIST>)/gi) ?? [];
  for (const block of blocks) {
    const rawDate = ofxField(block, "DTPOSTED");
    const amount = parseMoney(ofxField(block, "TRNAMT"));
    const description = [ofxField(block, "NAME"), ofxField(block, "MEMO")].filter(Boolean).join(" — ").trim();
    const date = normalizeDate(rawDate?.slice(0, 8));
    if (!date || !description || !Number.isFinite(amount) || amount === 0) continue;
    transactions.push({
      date,
      amount,
      description: description.slice(0, 80),
      importId: ofxField(block, "FITID") || null
    });
  }
  if (!transactions.length) throw new Error("No valid transactions were found in the OFX/QFX file.");
  return transactions;
}

function ofxField(block, name) {
  return block.match(new RegExp(`<${name}>([^<\\r\\n]+)`, "i"))?.[1]?.trim() ?? "";
}

function readCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const value = String(text ?? "").replace(/^\uFEFF/, "");
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === '"') {
      if (quoted && value[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && value[index + 1] === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findHeader(headers, candidates) {
  return headers.findIndex((header) => candidates.includes(header));
}

function parseMoney(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return NaN;
  const negative = /^\(.*\)$/.test(raw) || raw.startsWith("-");
  const numeric = Number(raw.replace(/[()$£€,\s]/g, "").replace(/^\+/, ""));
  return Number.isFinite(numeric) ? (negative ? -Math.abs(numeric) : numeric) : NaN;
}

function normalizeDate(value) {
  const raw = String(value ?? "").trim();
  if (/^\d{8}$/.test(raw)) {
    const candidate = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    return isValidDateString(candidate) ? candidate : null;
  }
  if (isValidDateString(raw)) return raw;
  const match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return null;
  const first = Number(match[1]);
  const second = Number(match[2]);
  const month = first > 12 ? second : first;
  const day = first > 12 ? first : second;
  const candidate = `${match[3]}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return isValidDateString(candidate) ? candidate : null;
}
