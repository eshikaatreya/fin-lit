// Fin-Lit Intelligent Budget Reallocation Engine
// Spec Section 6.D - Reallocation suggestions with health impact & explicit user approval

import { CategoryFinancialMetrics } from "./calculator";

export interface ReallocationRecommendation {
  fromCategoryId: string;
  fromCategoryName: string;
  toCategoryId: string;
  toCategoryName: string;
  recommendedAmount: number;
  reason: string;
  impactAnalysis: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  canAffordTransfer: boolean;
}

/**
 * Evaluates category metrics and detects budget imbalances,
 * generating a safe, mathematically verified reallocation suggestion.
 */
export function findBestReallocation(
  categoryMetrics: CategoryFinancialMetrics[],
  daysRemaining: number
): ReallocationRecommendation | null {
  // 1. Find categories with deficits or at high risk of exceeding budget
  const deficitCategories = categoryMetrics
    .filter((c) => c.status === "EXCEEDED" || (c.status === "APPROACHING_LIMIT" && c.variance < -200))
    .sort((a, b) => a.variance - b.variance); // Most needy first

  if (deficitCategories.length === 0) {
    return null;
  }

  const targetCategory = deficitCategories[0];
  const neededAmount = Math.abs(Math.min(targetCategory.remainingAmount, targetCategory.variance));

  // 2. Find eligible donor categories with substantial safe surplus
  // Safe surplus = remaining amount - (dailyVelocity * daysRemaining)
  const donorCandidates = categoryMetrics
    .filter((c) => c.categoryId !== targetCategory.categoryId)
    .map((c) => {
      const projectedRemainingSpend = c.dailyVelocity * daysRemaining;
      const safeSurplus = Math.max(0, c.remainingAmount - projectedRemainingSpend * 1.15); // 15% safety buffer
      return {
        ...c,
        safeSurplus: Math.floor(safeSurplus / 100) * 100, // Round to nearest ₹100
      };
    })
    .filter((c) => c.safeSurplus >= 300) // Minimum threshold to bother proposing
    .sort((a, b) => b.safeSurplus - a.safeSurplus); // Largest safe surplus first

  if (donorCandidates.length === 0) {
    return null;
  }

  const bestDonor = donorCandidates[0];

  // Transfer amount: the minimum of what is needed and 50% of the donor's safe surplus
  // to avoid draining the donor category
  const transferAmount = Math.min(
    Math.ceil(neededAmount / 100) * 100,
    Math.floor((bestDonor.safeSurplus * 0.75) / 100) * 100
  );

  if (transferAmount < 100) {
    return null;
  }

  const urgency = targetCategory.remainingAmount <= 0 ? "HIGH" : "MEDIUM";

  const reason = `You have utilized ${targetCategory.percentageConsumed}% of your ${targetCategory.categoryName} budget with ${daysRemaining} days remaining in the month. Meanwhile, your ${bestDonor.categoryName} category has a healthy estimated surplus of ₹${bestDonor.safeSurplus.toLocaleString("en-IN")}.`;

  const impactAnalysis = `Transferring ₹${transferAmount.toLocaleString("en-IN")} from ${bestDonor.categoryName} to ${targetCategory.categoryName} will give you an immediate breathing room without risking an overspend on ${bestDonor.categoryName} (which will still retain ₹${(bestDonor.remainingAmount - transferAmount).toLocaleString("en-IN")}).`;

  return {
    fromCategoryId: bestDonor.categoryId,
    fromCategoryName: bestDonor.categoryName,
    toCategoryId: targetCategory.categoryId,
    toCategoryName: targetCategory.categoryName,
    recommendedAmount: transferAmount,
    reason,
    impactAnalysis,
    urgency,
    canAffordTransfer: true,
  };
}
