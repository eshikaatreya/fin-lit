// Fin-Lit Bank & UPI Statement Importer
// Spec Section 5 - CSV Statement Parsing with Idempotency Key Deduplication

import { predictTransactionCategory } from "../ai/categorizer";

export interface ParsedStatementRow {
  date: Date;
  merchant: string;
  description: string;
  amount: number;
  type: "EXPENSE" | "INCOME";
  referenceId?: string;
  paymentMethod: string;
  suggestedCategory: string;
  idempotencyKey: string;
}

export interface StatementImportResult {
  totalRows: number;
  validRows: ParsedStatementRow[];
  duplicatesCount: number;
  errors: string[];
}

// Simple fast string hash for deterministic idempotency
function generateIdempotencyKey(
  userId: string,
  dateStr: string,
  amount: number,
  merchant: string,
  ref: string = ""
): string {
  const raw = `${userId}_${dateStr}_${amount}_${merchant.toLowerCase().trim()}_${ref.trim()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `tx_${Math.abs(hash).toString(16)}`;
}

/**
 * Parses raw CSV string into normalized transaction records with Indian banking header heuristics
 */
export function parseBankStatementCSV(
  csvContent: string,
  userId: string,
  existingIdempotencyKeys: Set<string> = new Set()
): StatementImportResult {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      totalRows: 0,
      validRows: [],
      duplicatesCount: 0,
      errors: ["CSV file is empty or does not contain header and data rows."],
    };
  }

  // 1. Identify header index and map columns
  const headerLine = lines[0];
  const headers = headerLine.split(",").map((h) => h.toLowerCase().replace(/["\s_]/g, ""));

  let dateIdx = -1;
  let descIdx = -1;
  let debitIdx = -1;
  let creditIdx = -1;
  let amountIdx = -1;
  let typeIdx = -1;
  let refIdx = -1;

  headers.forEach((h, idx) => {
    if (h.includes("date") || h.includes("txn_date") || h.includes("valuedate")) dateIdx = idx;
    else if (h.includes("narration") || h.includes("description") || h.includes("particular") || h.includes("merchant") || h.includes("remark")) descIdx = idx;
    else if (h.includes("debit") || h.includes("withdrawal") || h.includes("dr")) debitIdx = idx;
    else if (h.includes("credit") || h.includes("deposit") || h.includes("cr")) creditIdx = idx;
    else if (h.includes("amount") || h.includes("txnamount")) amountIdx = idx;
    else if (h.includes("type")) typeIdx = idx;
    else if (h.includes("ref") || h.includes("utr") || h.includes("cheque") || h.includes("rrn")) refIdx = idx;
  });

  if (dateIdx === -1 || (descIdx === -1 && amountIdx === -1)) {
    return {
      totalRows: 0,
      validRows: [],
      duplicatesCount: 0,
      errors: ["Unable to auto-detect required columns ('Date', 'Description/Particulars', 'Amount/Debit/Credit')."],
    };
  }

  const validRows: ParsedStatementRow[] = [];
  let duplicatesCount = 0;
  const errors: string[] = [];

  // 2. Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple CSV splitter handling quoted cells
    const cols = rawLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, "").trim());

    if (cols.length <= Math.max(dateIdx, descIdx)) continue;

    try {
      const rawDate = cols[dateIdx];
      const parsedDate = new Date(rawDate);
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      const rawDesc = descIdx !== -1 ? cols[descIdx] || "UPI Transaction" : "Transaction";
      const rawRef = refIdx !== -1 ? cols[refIdx] || "" : "";

      let amount = 0;
      let type: "EXPENSE" | "INCOME" = "EXPENSE";

      if (debitIdx !== -1 && creditIdx !== -1) {
        const debitVal = parseFloat(cols[debitIdx]?.replace(/,/g, "") || "0");
        const creditVal = parseFloat(cols[creditIdx]?.replace(/,/g, "") || "0");

        if (creditVal > 0) {
          amount = creditVal;
          type = "INCOME";
        } else if (debitVal > 0) {
          amount = debitVal;
          type = "EXPENSE";
        }
      } else if (amountIdx !== -1) {
        const amtVal = parseFloat(cols[amountIdx]?.replace(/,/g, "") || "0");
        if (amtVal < 0) {
          amount = Math.abs(amtVal);
          type = "EXPENSE";
        } else {
          amount = amtVal;
          if (typeIdx !== -1) {
            const rawType = cols[typeIdx].toLowerCase();
            type = rawType.includes("cr") || rawType.includes("income") ? "INCOME" : "EXPENSE";
          }
        }
      }

      if (amount <= 0 || isNaN(amount)) continue;

      // Clean merchant name from UPI narration
      // e.g. "UPI/SWIGGY/4128912/Pay" -> "Swiggy"
      let merchant = rawDesc;
      if (rawDesc.toUpperCase().includes("UPI/")) {
        const parts = rawDesc.split("/");
        if (parts.length >= 2 && parts[1].length > 1) {
          merchant = parts[1].trim();
        }
      } else if (rawDesc.toLowerCase().includes("pos-")) {
        merchant = rawDesc.replace(/pos-/i, "").trim();
      }

      const idempotencyKey = generateIdempotencyKey(
        userId,
        validDate.toISOString().slice(0, 10),
        amount,
        merchant,
        rawRef
      );

      // Duplicate check
      if (existingIdempotencyKeys.has(idempotencyKey)) {
        duplicatesCount++;
        continue;
      }

      // Auto-categorize
      const catPrediction = predictTransactionCategory(merchant, rawDesc, amount);

      validRows.push({
        date: validDate,
        merchant,
        description: rawDesc,
        amount,
        type,
        referenceId: rawRef || `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/CR`,
        paymentMethod: "UPI",
        suggestedCategory: catPrediction.suggestedCategory,
        idempotencyKey,
      });

      // Track to avoid duplicates inside the same file
      existingIdempotencyKeys.add(idempotencyKey);
    } catch (err: any) {
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  return {
    totalRows: lines.length - 1,
    validRows,
    duplicatesCount,
    errors,
  };
}
