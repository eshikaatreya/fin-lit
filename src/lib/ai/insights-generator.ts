// Fin-Lit Proactive AI Financial Insights Generator
// Spec Section 6.A, 6.E - Detects behavioral patterns, anomalies, and actionable savings opportunities

import { FinancialSummaryReport } from "../financial-engine/calculator";
import { formatINR } from "../constants";

export interface GeneratedInsight {
  title: string;
  summary: string;
  detailedExplanation: string;
  category: "SPENDING" | "BUDGET" | "SAVINGS" | "SUBSCRIPTIONS" | "PATTERN";
  impactLevel: "INFO" | "OPPORTUNITY" | "WARNING" | "CRITICAL";
  metricSnapshot?: Record<string, any>;
}

export function generateProactiveInsights(
  summary: FinancialSummaryReport,
  recentTransactions: Array<{
    amount: number;
    merchant: string;
    category: string;
    date: Date | string;
    type: string;
  }>,
  subscriptions: Array<{
    name: string;
    amount: number;
    billingCycle: string;
    status: string;
  }>
): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];

  // 1. Check overspent categories
  const exceededCategories = summary.categoryMetrics.filter((c) => c.status === "EXCEEDED");
  for (const cat of exceededCategories) {
    insights.push({
      title: `${cat.categoryName} Budget Exceeded`,
      summary: `You have crossed your ${cat.categoryName} limit by ${formatINR(Math.abs(cat.remainingAmount))}.`,
      detailedExplanation: `With ${summary.daysRemaining} days left in the month, current spending in ${cat.categoryName} is ${formatINR(cat.spentAmount)} against an allocation of ${formatINR(cat.allocatedAmount)}. Consider reducing further transactions or initiating a budget reallocation from surplus categories.`,
      category: "BUDGET",
      impactLevel: "CRITICAL",
      metricSnapshot: { category: cat.categoryName, overspend: Math.abs(cat.remainingAmount) },
    });
  }

  // 2. Check velocity warnings (approaching limit)
  const warningCategories = summary.categoryMetrics.filter(
    (c) => c.status === "APPROACHING_LIMIT" && c.remainingAmount > 0
  );
  for (const cat of warningCategories) {
    insights.push({
      title: `${cat.categoryName} Spending Pace Warning`,
      summary: `You have consumed ${cat.percentageConsumed}% of your ${cat.categoryName} budget.`,
      detailedExplanation: `At your current rate of ${formatINR(cat.dailyVelocity)}/day, you are projected to spend ${formatINR(cat.projectedMonthEndSpend)} by month-end, exceeding your target allocation by ${formatINR(Math.abs(cat.variance))}.`,
      category: "SPENDING",
      impactLevel: "WARNING",
      metricSnapshot: { category: cat.categoryName, projected: cat.projectedMonthEndSpend },
    });
  }

  // 3. Small purchase micro-spending analysis (Spec example: "You spend ~₹120/day on small purchases")
  const smallExpenses = recentTransactions.filter(
    (t) => t.type === "EXPENSE" && t.amount <= 300 && t.amount > 0
  );
  if (smallExpenses.length >= 5) {
    const totalSmall = smallExpenses.reduce((sum, t) => sum + t.amount, 0);
    const avgSmall = Math.round(totalSmall / Math.max(1, summary.daysPassed));
    insights.push({
      title: "Micro-Spending Pattern Detected",
      summary: `You spend approximately ${formatINR(avgSmall)} every day on small purchases (under ₹300).`,
      detailedExplanation: `Frequent small UPI transactions (tea, snacks, convenience delivery) have accumulated to ${formatINR(totalSmall)} this month. While each purchase seems negligible, trimming just 2 small purchases a week could save you up to ${formatINR(avgSmall * 7)} per month.`,
      category: "PATTERN",
      impactLevel: "OPPORTUNITY",
      metricSnapshot: { dailyMicroSpend: avgSmall, totalMicroSpend: totalSmall },
    });
  }

  // 4. Weekend vs Weekday spending pattern
  let weekendSpend = 0;
  let weekdaySpend = 0;
  let weekendDays = 0;
  let weekdayDays = 0;

  for (const t of recentTransactions) {
    if (t.type !== "EXPENSE") continue;
    const d = new Date(t.date);
    const day = d.getDay();
    if (day === 0 || day === 6) {
      weekendSpend += t.amount;
      weekendDays++;
    } else {
      weekdaySpend += t.amount;
      weekdayDays++;
    }
  }

  const avgWeekend = weekendDays > 0 ? weekendSpend / weekendDays : 0;
  const avgWeekday = weekdayDays > 0 ? weekdaySpend / weekdayDays : 0;

  if (avgWeekend > avgWeekday * 1.4 && weekendSpend > 1000) {
    const pctHigher = Math.round(((avgWeekend - avgWeekday) / (avgWeekday || 1)) * 100);
    insights.push({
      title: "Elevated Weekend Spending Pattern",
      summary: `Your weekend daily spending is ${pctHigher}% higher than your weekday average.`,
      detailedExplanation: `On Saturdays and Sundays, your average expenditure reaches ${formatINR(Math.round(avgWeekend))}/day compared to ${formatINR(Math.round(avgWeekday))}/day on weekdays, driven primarily by dining out and social outings.`,
      category: "PATTERN",
      impactLevel: "INFO",
      metricSnapshot: { avgWeekend, avgWeekday, pctHigher },
    });
  }

  // 5. Subscription optimization
  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  if (activeSubs.length >= 3) {
    const totalMonthlySubs = activeSubs.reduce((sum, s) => sum + s.amount, 0);
    insights.push({
      title: "Subscription Portfolio Optimization",
      summary: `You have ${activeSubs.length} active recurring subscriptions costing ${formatINR(totalMonthlySubs)}/month.`,
      detailedExplanation: `Your regular subscriptions account for ${formatINR(totalMonthlySubs * 12)} annually. Reviewing your streaming and membership usage could unlock up to ${formatINR(Math.round(totalMonthlySubs * 0.35))}/month in effortless savings.`,
      category: "SUBSCRIPTIONS",
      impactLevel: "OPPORTUNITY",
      metricSnapshot: { count: activeSubs.length, monthlyCost: totalMonthlySubs },
    });
  }

  // 6. Savings Achievement / Health
  if (summary.savingsRatePercentage >= 20) {
    insights.push({
      title: "Strong Savings Pace",
      summary: `You have saved ${summary.savingsRatePercentage}% of your income this month!`,
      detailedExplanation: `Your current net savings of ${formatINR(summary.monthlyActualSavings)} puts you ahead of the typical 20% savings benchmark. You are on track to meet your long-term wealth goals.`,
      category: "SAVINGS",
      impactLevel: "INFO",
      metricSnapshot: { savingsRate: summary.savingsRatePercentage },
    });
  }

  return insights;
}
