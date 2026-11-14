// Fin-Lit Affordability Calculation Engine
// Spec Section 6.F - Evaluates purchases against discretionary budget, days remaining, and upcoming commitments

import { FinancialSummaryReport } from "./calculator";
import { formatINR } from "../constants";

export interface AffordabilityAssessment {
  amount: number;
  isAffordable: boolean;
  verdict: "EASILY_AFFORDABLE" | "AFFORDABLE_WITH_CAUTION" | "NOT_RECOMMENDED" | "UNAFFORDABLE";
  shortReason: string;
  detailedAnalysis: string;
  safeDailyBudgetRemaining: number;
  newDailyBudgetIfPurchased: number;
  recommendedCategory?: string;
  suggestedAlternatives?: string[];
}

export function evaluateAffordability(
  purchaseAmount: number,
  summary: FinancialSummaryReport,
  categoryName?: string
): AffordabilityAssessment {
  const daysRemaining = Math.max(1, summary.daysRemaining);
  const totalRemaining = summary.totalRemainingBudget;
  const currentSafeDaily = Math.max(0, Math.floor(totalRemaining / daysRemaining));

  const remainingAfterPurchase = totalRemaining - purchaseAmount;
  const newSafeDaily = Math.max(0, Math.floor(remainingAfterPurchase / daysRemaining));

  let verdict: AffordabilityAssessment["verdict"] = "EASILY_AFFORDABLE";
  let isAffordable = true;
  let shortReason = "";
  let detailedAnalysis = "";
  const suggestedAlternatives: string[] = [];

  if (purchaseAmount > totalRemaining) {
    verdict = "UNAFFORDABLE";
    isAffordable = false;
    shortReason = `This exceeds your total remaining budget of ${formatINR(totalRemaining)} for this month.`;
    detailedAnalysis = `Making this purchase of ${formatINR(purchaseAmount)} would push your overall monthly budget into an immediate deficit of ${formatINR(Math.abs(remainingAfterPurchase))}. This would directly eat into your savings target or emergency reserve.`;
    suggestedAlternatives.push(`Postpone this purchase to next month's fresh budget allocation.`);
    suggestedAlternatives.push(`Create a dedicated Savings Goal to set aside ${formatINR(Math.ceil(purchaseAmount / 2))} over the next 2 months.`);
  } else if (remainingAfterPurchase < summary.totalAllocatedBudget * 0.1 && daysRemaining > 7) {
    verdict = "NOT_RECOMMENDED";
    isAffordable = false;
    shortReason = `It leaves very little buffer (${formatINR(remainingAfterPurchase)}) for the remaining ${daysRemaining} days.`;
    detailedAnalysis = `While you technically have ${formatINR(totalRemaining)} left, spending ${formatINR(purchaseAmount)} now would reduce your safe daily spending allowance from ${formatINR(currentSafeDaily)}/day to just ${formatINR(newSafeDaily)}/day for the next ${daysRemaining} days.`;
    suggestedAlternatives.push(`Wait until the final week of the month to see if you have leftover surplus.`);
    suggestedAlternatives.push(`Look for a lower-priced alternative or defer by 10 days.`);
  } else if (purchaseAmount > currentSafeDaily * 4) {
    verdict = "AFFORDABLE_WITH_CAUTION";
    isAffordable = true;
    shortReason = `You can afford it, but it consumes ${Math.round((purchaseAmount / totalRemaining) * 100)}% of your remaining budget.`;
    detailedAnalysis = `You have ${formatINR(totalRemaining)} remaining. After this purchase of ${formatINR(purchaseAmount)}, you will have ${formatINR(remainingAfterPurchase)} left. Your daily allowance will decrease from ${formatINR(currentSafeDaily)} to ${formatINR(newSafeDaily)}/day for ${daysRemaining} days.`;
    suggestedAlternatives.push(`Compensate by cutting non-essential dining/entertainment spending by ${formatINR(Math.round(purchaseAmount * 0.3))} over the next week.`);
  } else {
    verdict = "EASILY_AFFORDABLE";
    isAffordable = true;
    shortReason = `Comfortably within your remaining budget of ${formatINR(totalRemaining)}.`;
    detailedAnalysis = `This purchase of ${formatINR(purchaseAmount)} only represents ${Math.round((purchaseAmount / totalRemaining) * 100)}% of your available funds. You will still have a comfortable daily spending allowance of ${formatINR(newSafeDaily)} for the next ${daysRemaining} days.`;
  }

  return {
    amount: purchaseAmount,
    isAffordable,
    verdict,
    shortReason,
    detailedAnalysis,
    safeDailyBudgetRemaining: currentSafeDaily,
    newDailyBudgetIfPurchased: newSafeDaily,
    recommendedCategory: categoryName,
    suggestedAlternatives,
  };
}
