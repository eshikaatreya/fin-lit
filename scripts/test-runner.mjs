// Fin-Lit Comprehensive Automated Test Suite
// Complies with Master Specification Section 19
// Run with: node scripts/test-runner.mjs

import { calculateFinancialSummary } from "../src/lib/financial-engine/calculator.ts";
import { findBestReallocation } from "../src/lib/financial-engine/reallocator.ts";
import { evaluateAffordability } from "../src/lib/financial-engine/affordability.ts";
import { predictTransactionCategory } from "../src/lib/ai/categorizer.ts";
import { parseBankStatementCSV } from "../src/lib/passbook/statement-importer.ts";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    testsFailed++;
  }
}

function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`  ✅ PASS: ${testName} (expected: ${expected}, got: ${actual})`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} (expected: ${expected}, got: ${actual})`);
    testsFailed++;
  }
}

console.log("\n=======================================================");
console.log("🧪 RUNNING FIN-LIT AUTOMATED QUALITY ASSURANCE SUITE");
console.log("=======================================================\n");

// ---------------------------------------------------------------------
// TEST SUITE 1: Deterministic Financial Calculation Engine
// ---------------------------------------------------------------------
console.log("📊 SUITE 1: Financial Calculation Engine (Spec Section 16)");

const testDate = new Date("2026-11-15T12:00:00Z"); // Day 15 of 30
const sampleSummary = calculateFinancialSummary({
  totalMonthlyIncome: 80000,
  savingsTarget: 20000,
  fixedRecurringExpenses: 25000,
  asOfDate: testDate,
  transactions: [
    { id: "1", amount: 1500, type: "EXPENSE", date: "2026-11-05", categoryId: "food", status: "COMPLETED" },
    { id: "2", amount: 3500, type: "EXPENSE", date: "2026-11-10", categoryId: "food", status: "COMPLETED" },
    { id: "3", amount: 2000, type: "EXPENSE", date: "2026-11-12", categoryId: "shopping", status: "COMPLETED" },
    // Reversed refund should NOT count toward expenditure
    { id: "4", amount: 1200, type: "EXPENSE", date: "2026-11-13", categoryId: "food", status: "REVERSED" },
    // Internal transfer should NOT count toward expenditure
    { id: "5", amount: 5000, type: "TRANSFER", date: "2026-11-14", categoryId: "savings", status: "COMPLETED" },
  ],
  allocations: [
    { categoryId: "food", categoryName: "Food & Dining", allocatedAmount: 10000 },
    { categoryId: "shopping", categoryName: "Shopping & Clothing", allocatedAmount: 8000 },
    { categoryId: "entertainment", categoryName: "Entertainment", allocatedAmount: 5000 },
  ],
});

assertEqual(sampleSummary.totalIncome, 80000, "Calculates exact total income");
assertEqual(sampleSummary.totalExpenditure, 7000, "Calculates total expenditure excluding reversals and transfers");
assertEqual(sampleSummary.discretionaryBudgetAvailable, 35000, "Discretionary budget = Income - SavingsTarget - FixedExpenses");
assertEqual(sampleSummary.monthlyActualSavings, 73000, "Calculates monthly actual savings (Income - Expenditure)");
assertEqual(sampleSummary.daysPassed, 15, "Correctly computes days elapsed");
assertEqual(sampleSummary.daysRemaining, 15, "Correctly computes days remaining");

// Spending velocity: 7000 / 15 days = 466.67/day
assertEqual(sampleSummary.spendingVelocity, 466.67, "Calculates accurate daily spending velocity");

// Food category: Spent 5000 / 15 days = 333.33/day. Projected month end = 5000 + (333.33 * 15) = 10000
const foodMetric = sampleSummary.categoryMetrics.find((c) => c.categoryId === "food");
assert(foodMetric !== undefined, "Finds food category metric");
assertEqual(foodMetric.spentAmount, 5000, "Accurate category spent amount");
assertEqual(foodMetric.remainingAmount, 5000, "Accurate category remaining amount");
assertEqual(foodMetric.percentageConsumed, 50, "Accurate percentage consumed");

// ---------------------------------------------------------------------
// TEST SUITE 2: Intelligent Budget Reallocation Engine (Spec Section 6.D)
// ---------------------------------------------------------------------
console.log("\n🔄 SUITE 2: Budget Reallocation Engine (Spec Section 6.D)");

const deficitCategories = [
  {
    categoryId: "dining",
    categoryName: "Food & Dining",
    allocatedAmount: 6000,
    spentAmount: 5800,
    remainingAmount: 200,
    percentageConsumed: 96.67,
    dailyVelocity: 386.67,
    projectedMonthEndSpend: 11600,
    variance: -5600,
    status: "EXCEEDED",
    surplusOrDeficit: -5600,
  },
  {
    categoryId: "ent",
    categoryName: "Entertainment",
    allocatedAmount: 5000,
    spentAmount: 800,
    remainingAmount: 4200,
    percentageConsumed: 16,
    dailyVelocity: 53.33,
    projectedMonthEndSpend: 1600,
    variance: 3400,
    status: "HEALTHY",
    surplusOrDeficit: 3400,
  },
];

const reallocationSuggestion = findBestReallocation(deficitCategories, 15);
assert(reallocationSuggestion !== null, "Generates reallocation proposal when imbalance exists");
assertEqual(reallocationSuggestion.fromCategoryName, "Entertainment", "Selects category with verified surplus as donor");
assertEqual(reallocationSuggestion.toCategoryName, "Food & Dining", "Selects high-velocity deficit category as recipient");
assert(reallocationSuggestion.recommendedAmount > 0, "Proposes positive transfer amount");
assert(reallocationSuggestion.canAffordTransfer === true, "Verifies donor can afford transfer without running into deficit");

// ---------------------------------------------------------------------
// TEST SUITE 3: Affordability Engine (Spec Section 6.F)
// ---------------------------------------------------------------------
console.log("\n💰 SUITE 3: Affordability Engine (Spec Section 6.F)");

const smallAfford = evaluateAffordability(500, sampleSummary);
assertEqual(smallAfford.verdict, "EASILY_AFFORDABLE", "Small purchase evaluates as EASILY_AFFORDABLE");
assert(smallAfford.isAffordable === true, "isAffordable flag is true");

const excessiveAfford = evaluateAffordability(150000, sampleSummary);
assertEqual(excessiveAfford.verdict, "UNAFFORDABLE", "Purchase exceeding total available budget evaluates as UNAFFORDABLE");
assert(excessiveAfford.isAffordable === false, "isAffordable flag is false");

// ---------------------------------------------------------------------
// TEST SUITE 4: Indian Merchant Knowledge Base & Auto-Categorization
// ---------------------------------------------------------------------
console.log("\n🧠 SUITE 4: AI Auto-Categorization (Spec Section 4)");

const c1 = predictTransactionCategory("Swiggy", "Dinner bowl");
assertEqual(c1.suggestedCategory, "Food & Dining", "Identifies Swiggy as Food & Dining");

const c2 = predictTransactionCategory("Zepto", "Grocery order");
assertEqual(c2.suggestedCategory, "Groceries", "Identifies Zepto as Groceries");

const c3 = predictTransactionCategory("Uber India", "Cab ride to Koramangala");
assertEqual(c3.suggestedCategory, "Transportation", "Identifies Uber as Transportation");

const c4 = predictTransactionCategory("Cult.fit", "Gym fitness membership");
assertEqual(c4.suggestedCategory, "Health & Fitness", "Identifies Cult.fit as Health & Fitness");

const c5 = predictTransactionCategory("Netflix", "Monthly streaming auto-debit");
assertEqual(c5.suggestedCategory, "Subscriptions", "Identifies Netflix as Subscriptions");

// ---------------------------------------------------------------------
// TEST SUITE 5: Statement Importer & Idempotency Deduplication (Spec Section 5)
// ---------------------------------------------------------------------
console.log("\n📄 SUITE 5: Statement Importer & Deduplication (Spec Section 5)");

const sampleCSV = `Date,Narration,Debit,Credit,RefNo
2026-11-04,UPI/SWIGGY/412891,450.00,,UPI123456
2026-11-05,UPI/BLINKIT/987654,620.00,,UPI987654
2026-11-06,SALARY CREDIT,,85000.00,SAL202611
`;

const importResult1 = parseBankStatementCSV(sampleCSV, "user_1");
assertEqual(importResult1.validRows.length, 3, "Parses 3 valid rows from statement CSV");
assertEqual(importResult1.duplicatesCount, 0, "Initial import has zero duplicates");

// Second import of the identical content with existing keys tracked:
const existingKeys = new Set(importResult1.validRows.map((r) => r.idempotencyKey));
const importResult2 = parseBankStatementCSV(sampleCSV, "user_1", existingKeys);
assertEqual(importResult2.validRows.length, 0, "Prevents duplicate rows on subsequent import");
assertEqual(importResult2.duplicatesCount, 3, "Correctly flags all 3 rows as duplicates");

console.log("\n=======================================================");
console.log(`🏁 TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log("=======================================================\n");

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
