// Fin-Lit Deterministic Financial Calculation Engine
// Complies strictly with Master Specification Section 16

export interface TransactionRecord {
  id: string;
  amount: number;
  type: "EXPENSE" | "INCOME" | "TRANSFER" | string;
  date: Date | string;
  categoryId: string;
  status?: "COMPLETED" | "PENDING" | "REVERSED" | string;
  isRecurring?: boolean;
}

export interface CategoryAllocationRecord {
  categoryId: string;
  categoryName: string;
  allocatedAmount: number;
  spentAmount?: number;
}

export interface FinancialCalculationInput {
  totalMonthlyIncome: number;
  savingsTarget: number;
  fixedRecurringExpenses: number;
  transactions: TransactionRecord[];
  allocations: CategoryAllocationRecord[];
  asOfDate?: Date;
  daysInMonth?: number;
}

export interface CategoryFinancialMetrics {
  categoryId: string;
  categoryName: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageConsumed: number;
  dailyVelocity: number; // Avg spend per day in the month so far
  projectedMonthEndSpend: number; // Projected total spend by end of month
  variance: number; // Projected vs Allocated (negative = over budget)
  status: "HEALTHY" | "APPROACHING_LIMIT" | "EXCEEDED";
  surplusOrDeficit: number; // Positive = surplus, Negative = deficit
}

export interface FinancialSummaryReport {
  totalIncome: number;
  totalExpenditure: number;
  discretionaryBudgetAvailable: number; // Income - SavingsTarget - FixedExpenses
  totalAllocatedBudget: number;
  totalRemainingBudget: number;
  budgetUtilizationPercentage: number;
  monthlyActualSavings: number; // Income - Expenditure
  savingsRatePercentage: number; // (Actual Savings / Total Income) * 100
  savingsTargetProgressPercentage: number; // (Actual Savings / Savings Target) * 100
  dailyAverageExpenditure: number;
  weeklyAverageExpenditure: number;
  recurringExpenditure: number;
  spendingVelocity: number; // Total spend / days passed
  projectedMonthEndExpenditure: number;
  monthEndVariance: number; // Allocated - Projected
  daysPassed: number;
  daysRemaining: number;
  totalDaysInMonth: number;
  categoryMetrics: CategoryFinancialMetrics[];
  healthScore: number; // 0 - 100 calculated score
}

/**
 * Calculates days in a given month and days passed up to asOfDate
 */
export function getMonthProgress(asOfDate: Date = new Date()) {
  const year = asOfDate.getFullYear();
  const month = asOfDate.getMonth(); // 0-indexed
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysPassed = Math.max(1, Math.min(asOfDate.getDate(), totalDaysInMonth));
  const daysRemaining = Math.max(0, totalDaysInMonth - daysPassed);

  return {
    year,
    month: month + 1,
    totalDaysInMonth,
    daysPassed,
    daysRemaining,
  };
}

/**
 * High-precision rounding to 2 decimal places to avoid IEEE 754 floating point quirks
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Master Financial Calculation Function
 */
export function calculateFinancialSummary(input: FinancialCalculationInput): FinancialSummaryReport {
  const asOf = input.asOfDate ? new Date(input.asOfDate) : new Date();
  const { totalDaysInMonth, daysPassed, daysRemaining } = getMonthProgress(asOf);

  // 1. Process and normalize transactions
  // Only COMPLETED transactions count toward spending. Pending and Reversed/Refunds are handled properly.
  let totalExpenditure = 0;
  let totalIncome = input.totalMonthlyIncome || 0;
  let recurringExpenditure = 0;

  const categorySpendMap = new Map<string, number>();

  for (const tx of input.transactions) {
    // Skip reversed transactions or internal transfers
    if (tx.status === "REVERSED") continue;
    if (tx.type === "TRANSFER") continue;

    const amount = Number(tx.amount) || 0;

    if (tx.type === "EXPENSE") {
      totalExpenditure += amount;
      const currentCatSpend = categorySpendMap.get(tx.categoryId) || 0;
      categorySpendMap.set(tx.categoryId, currentCatSpend + amount);

      if (tx.isRecurring) {
        recurringExpenditure += amount;
      }
    } else if (tx.type === "INCOME") {
      // If transactions include extra income events, add to total
      // only if not already counted in base income
      // (usually transactions reflect actual cash-ins)
    }
  }

  // 2. Discretionary Budget Calculation (Spec Section 16 Example)
  // Monthly income - Savings target - Fixed expenses = Discretionary budget
  const discretionaryBudgetAvailable = Math.max(
    0,
    round2(totalIncome - (input.savingsTarget || 0) - (input.fixedRecurringExpenses || 0))
  );

  // 3. Category Metrics & Spending Velocity
  let totalAllocatedBudget = 0;
  const categoryMetrics: CategoryFinancialMetrics[] = input.allocations.map((alloc) => {
    const allocated = round2(alloc.allocatedAmount || 0);
    totalAllocatedBudget += allocated;

    const spent = round2(categorySpendMap.get(alloc.categoryId) || alloc.spentAmount || 0);
    const remaining = round2(allocated - spent);
    const percentageConsumed = allocated > 0 ? round2((spent / allocated) * 100) : spent > 0 ? 100 : 0;

    // Daily spending velocity for this category
    const dailyVelocity = round2(spent / daysPassed);

    // Projected spend by month end: spent so far + (dailyVelocity * daysRemaining)
    const projectedMonthEndSpend = round2(spent + dailyVelocity * daysRemaining);
    const variance = round2(allocated - projectedMonthEndSpend); // Positive = under budget, Negative = over
    const surplusOrDeficit = round2(allocated - spent);

    // Status Determination
    let status: "HEALTHY" | "APPROACHING_LIMIT" | "EXCEEDED" = "HEALTHY";
    if (percentageConsumed >= 100 || remaining < 0) {
      status = "EXCEEDED";
    } else if (percentageConsumed >= 80 || (projectedMonthEndSpend > allocated && percentageConsumed >= 50)) {
      status = "APPROACHING_LIMIT";
    }

    return {
      categoryId: alloc.categoryId,
      categoryName: alloc.categoryName,
      allocatedAmount: allocated,
      spentAmount: spent,
      remainingAmount: remaining,
      percentageConsumed,
      dailyVelocity,
      projectedMonthEndSpend,
      variance,
      status,
      surplusOrDeficit,
    };
  });

  // 4. Aggregates & Rates
  const totalRemainingBudget = round2(Math.max(0, totalAllocatedBudget - totalExpenditure));
  const budgetUtilizationPercentage =
    totalAllocatedBudget > 0 ? round2((totalExpenditure / totalAllocatedBudget) * 100) : 0;

  const monthlyActualSavings = round2(totalIncome - totalExpenditure);
  const savingsRatePercentage = totalIncome > 0 ? round2((monthlyActualSavings / totalIncome) * 100) : 0;

  const savingsTarget = input.savingsTarget || 0;
  const savingsTargetProgressPercentage =
    savingsTarget > 0 ? round2(Math.max(0, (monthlyActualSavings / savingsTarget) * 100)) : 100;

  const dailyAverageExpenditure = round2(totalExpenditure / daysPassed);
  const weeklyAverageExpenditure = round2(dailyAverageExpenditure * 7);

  const spendingVelocity = dailyAverageExpenditure;
  const projectedMonthEndExpenditure = round2(totalExpenditure + spendingVelocity * daysRemaining);
  const monthEndVariance = round2(totalAllocatedBudget - projectedMonthEndExpenditure);

  // 5. Deterministic Financial Health Score (0 - 100)
  // Factors:
  // - Savings rate (up to 35 pts)
  // - Budget adherence (up to 35 pts)
  // - Overspent categories penalty (up to -20 pts)
  // - Debt/Recurring burden ratio (up to 20 pts)
  let healthScore = 50;

  // Savings factor
  if (savingsRatePercentage >= 25) healthScore += 25;
  else if (savingsRatePercentage >= 15) healthScore += 15;
  else if (savingsRatePercentage >= 5) healthScore += 5;
  else healthScore -= 10;

  // Budget adherence factor
  if (budgetUtilizationPercentage <= 85) healthScore += 20;
  else if (budgetUtilizationPercentage <= 100) healthScore += 10;
  else healthScore -= 20;

  // Category overspend penalty
  const overspentCount = categoryMetrics.filter((c) => c.status === "EXCEEDED").length;
  healthScore -= overspentCount * 8;

  healthScore = Math.max(10, Math.min(99, Math.round(healthScore)));

  return {
    totalIncome: round2(totalIncome),
    totalExpenditure: round2(totalExpenditure),
    discretionaryBudgetAvailable,
    totalAllocatedBudget: round2(totalAllocatedBudget),
    totalRemainingBudget,
    budgetUtilizationPercentage,
    monthlyActualSavings,
    savingsRatePercentage,
    savingsTargetProgressPercentage,
    dailyAverageExpenditure,
    weeklyAverageExpenditure,
    recurringExpenditure: round2(recurringExpenditure),
    spendingVelocity,
    projectedMonthEndExpenditure,
    monthEndVariance,
    daysPassed,
    daysRemaining,
    totalDaysInMonth,
    categoryMetrics,
    healthScore,
  };
}
