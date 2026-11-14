// Fin-Lit AI Assistant Engine - Grounded Financial Intelligence System
// Spec Section 6 & 7 - Deterministic Grounding + Dual Mode (Gemini API with Fallback Reasoning)

import { FinancialSummaryReport } from "../financial-engine/calculator";
import { evaluateAffordability, AffordabilityAssessment } from "../financial-engine/affordability";
import { findBestReallocation, ReallocationRecommendation } from "../financial-engine/reallocator";
import { formatINR } from "../constants";

export interface AssistantMessage {
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    type?: "AFFORDABILITY" | "REALLOCATION" | "SUMMARY" | "INSIGHT" | "GENERAL";
    affordability?: AffordabilityAssessment;
    reallocation?: ReallocationRecommendation;
    suggestedActions?: string[];
  };
}

export interface AssistantContext {
  userName: string;
  occupationType: string;
  currency: string;
  summary: FinancialSummaryReport;
  recentTransactions: Array<{
    amount: number;
    merchant: string;
    category: string;
    date: string;
    type: string;
  }>;
  subscriptions: Array<{
    name: string;
    amount: number;
    billingCycle: string;
    nextBillingDate: string;
  }>;
  savingsGoals: Array<{
    name: string;
    targetAmount: number;
    currentAmount: number;
  }>;
}

/**
 * Deterministic Financial Query Handler for Core Natural Language Questions
 */
export function handleFinancialQueryDeterministically(
  query: string,
  ctx: AssistantContext
): AssistantMessage {
  const q = query.toLowerCase();
  const summary = ctx.summary;

  // 1. "Can I afford X?" or "Afford ₹X"
  const affordMatch = q.match(/afford.*?([0-9,]+)/i) || q.match(/spend.*?([0-9,]+).*?(can i|should i)/i);
  if (affordMatch) {
    const rawNum = affordMatch[1].replace(/,/g, "");
    const amount = parseFloat(rawNum);
    if (!isNaN(amount) && amount > 0) {
      const assessment = evaluateAffordability(amount, summary);
      const content = `### Affordability Assessment for ${formatINR(amount)}

**Verdict:** ${assessment.shortReason}

${assessment.detailedAnalysis}

- **Current Daily Safe Spending:** ${formatINR(assessment.safeDailyBudgetRemaining)}/day
- **Post-Purchase Daily Spending:** ${formatINR(assessment.newDailyBudgetIfPurchased)}/day
- **Days Remaining in Month:** ${summary.daysRemaining} days

${assessment.suggestedAlternatives?.length ? `**Actionable Suggestion:**\n` + assessment.suggestedAlternatives.map(s => `• ${s}`).join("\n") : ""}`;

      return {
        role: "assistant",
        content,
        metadata: {
          type: "AFFORDABILITY",
          affordability: assessment,
          suggestedActions: ["View Budget Dashboard", "Set up a Savings Goal"],
        },
      };
    }
  }

  // 2. "How much did I spend today?"
  if (q.includes("spend today") || q.includes("today's spend") || q.includes("spent today")) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTxs = ctx.recentTransactions.filter(
      (t) => t.type === "EXPENSE" && t.date.slice(0, 10) === todayStr
    );
    const todayTotal = todayTxs.reduce((sum, t) => sum + t.amount, 0);

    const safeDaily = Math.floor(summary.totalRemainingBudget / Math.max(1, summary.daysRemaining));

    let response = `You have spent **${formatINR(todayTotal)}** today.`;
    if (todayTxs.length > 0) {
      response += `\n\n**Transactions recorded today:**\n` +
        todayTxs.map(t => `• ${t.merchant}: ${formatINR(t.amount)} (${t.category})`).join("\n");
    } else {
      response += ` No expenses have been logged yet for today.`;
    }
    response += `\n\nYour planned safe spending pace is **${formatINR(safeDaily)}/day** with ${summary.daysRemaining} days remaining in ${new Date().toLocaleString("en-US", { month: "long" })}.`;

    return {
      role: "assistant",
      content: response,
      metadata: { type: "SUMMARY" },
    };
  }

  // 3. Category spending inquiry: e.g. "How much did I spend on food?"
  for (const cat of summary.categoryMetrics) {
    const catNameLower = cat.categoryName.toLowerCase();
    const firstWord = catNameLower.split(" ")[0]; // e.g. "food", "groceries", "travel"
    if (q.includes(catNameLower) || q.includes(firstWord)) {
      const statusText = cat.status === "EXCEEDED"
        ? "⚠️ You have exceeded your budget by " + formatINR(Math.abs(cat.remainingAmount))
        : cat.status === "APPROACHING_LIMIT"
        ? `⚡ You have used ${cat.percentageConsumed}% of this budget.`
        : `✅ You have ${formatINR(cat.remainingAmount)} remaining.`;

      const response = `### ${cat.categoryName} Spending
- **Spent so far:** ${formatINR(cat.spentAmount)} of ${formatINR(cat.allocatedAmount)} allocated (${cat.percentageConsumed}%)
- **Remaining budget:** ${formatINR(cat.remainingAmount)}
- **Daily spending velocity:** ${formatINR(cat.dailyVelocity)}/day
- **Projected month-end spend:** ${formatINR(cat.projectedMonthEndSpend)} (${cat.variance >= 0 ? formatINR(cat.variance) + " surplus expected" : formatINR(Math.abs(cat.variance)) + " deficit projected"})

**Status:** ${statusText}`;

      return {
        role: "assistant",
        content: response,
        metadata: { type: "SUMMARY" },
      };
    }
  }

  // 4. "Which category is consuming most of my money?"
  if (q.includes("most of my money") || q.includes("highest spend") || q.includes("top category") || q.includes("biggest expense")) {
    const sorted = [...summary.categoryMetrics].sort((a, b) => b.spentAmount - a.spentAmount);
    const top = sorted[0];
    const second = sorted[1];

    let response = `Your biggest spending category this month is **${top.categoryName}** at **${formatINR(top.spentAmount)}**, which accounts for **${Math.round((top.spentAmount / summary.totalExpenditure) * 100) || 0}%** of your total monthly expenditure.`;

    if (second && second.spentAmount > 0) {
      response += `\n\nComing in second is **${second.categoryName}** with **${formatINR(second.spentAmount)}**.`;
    }

    if (top.status === "EXCEEDED" || top.status === "APPROACHING_LIMIT") {
      response += `\n\n💡 **Tip:** Since ${top.categoryName} is running high, consider checking for an intelligent budget reallocation from an under-utilized category.`;
    }

    return {
      role: "assistant",
      content: response,
      metadata: { type: "INSIGHT" },
    };
  }

  // 5. "How much money can I safely spend this week?"
  if (q.includes("safely spend") || q.includes("safe spend") || q.includes("spend this week") || q.includes("daily budget")) {
    const daysRemaining = Math.max(1, summary.daysRemaining);
    const safeDaily = Math.floor(summary.totalRemainingBudget / daysRemaining);
    const safeWeekly = Math.min(summary.totalRemainingBudget, safeDaily * 7);

    const response = `### Safe Spending Allowance
- **Total Remaining Discretionary Budget:** ${formatINR(summary.totalRemainingBudget)}
- **Days Remaining in Month:** ${daysRemaining} days
- **Safe Daily Allowance:** **${formatINR(safeDaily)} / day**
- **Safe Weekly Allowance:** **${formatINR(safeWeekly)} / week**

Staying within ${formatINR(safeDaily)} per day ensures you will achieve your monthly savings target of **${formatINR(summary.totalIncome - summary.totalAllocatedBudget)}** without running into overdraft.`;

    return {
      role: "assistant",
      content: response,
      metadata: { type: "SUMMARY" },
    };
  }

  // 6. "How much have I saved this month?" or "Savings goal"
  if (q.includes("saved") || q.includes("savings") || q.includes("savings goal") || q.includes("track")) {
    const response = `### Monthly Savings Progress
- **Monthly Net Savings (Income - Expenses):** **${formatINR(summary.monthlyActualSavings)}**
- **Savings Rate:** **${summary.savingsRatePercentage}%** of total income (${formatINR(summary.totalIncome)})
- **Planned Savings Target:** **${formatINR(summary.totalIncome - summary.totalAllocatedBudget)}**

${summary.monthlyActualSavings >= (summary.totalIncome - summary.totalAllocatedBudget)
  ? "🎉 **Excellent work!** You are currently meeting or exceeding your savings target for the month."
  : "⚠️ You are slightly below your target savings pace due to recent high velocity. Keeping daily spend under " + formatINR(Math.floor(summary.totalRemainingBudget / Math.max(1, summary.daysRemaining))) + " will help recover ground."}`;

    return {
      role: "assistant",
      content: response,
      metadata: { type: "SUMMARY" },
    };
  }

  // 7. "Which subscriptions are costing me the most?"
  if (q.includes("subscription") || q.includes("recurring") || q.includes("netflix") || q.includes("spotify")) {
    if (ctx.subscriptions.length === 0) {
      return {
        role: "assistant",
        content: "You do not have any active subscriptions registered. Add your streaming, gym, or software subscriptions in the Subscriptions section to track renewals and optimizations.",
        metadata: { type: "GENERAL" },
      };
    }

    const sortedSubs = [...ctx.subscriptions].sort((a, b) => b.amount - a.amount);
    const totalSubsMonthly = ctx.subscriptions.reduce((sum, s) => {
      if (s.billingCycle === "ANNUAL") return sum + s.amount / 12;
      return sum + s.amount;
    }, 0);

    const subList = sortedSubs
      .map((s) => `• **${s.name}**: ${formatINR(s.amount)} (${s.billingCycle.toLowerCase()}) — Next renewal: ${new Date(s.nextBillingDate).toLocaleDateString("en-IN")}`)
      .join("\n");

    const response = `### Active Subscriptions Overview
Your recurring subscriptions cost approximately **${formatINR(Math.round(totalSubsMonthly))}/month** (${formatINR(Math.round(totalSubsMonthly * 12))}/year).

${subList}

💡 **Fin-Lit Recommendation:** Review any service you haven't accessed this week to see if switching to a quarterly or paused plan saves you money.`;

    return {
      role: "assistant",
      content: response,
      metadata: { type: "SUMMARY" },
    };
  }

  // 8. Reallocation query: "Can I move money?", "Reallocate budget"
  if (q.includes("reallocate") || q.includes("transfer budget") || q.includes("move money") || q.includes("rebalance")) {
    const proposal = findBestReallocation(summary.categoryMetrics, summary.daysRemaining);
    if (proposal) {
      return {
        role: "assistant",
        content: `### Intelligent Budget Reallocation Proposal

${proposal.reason}

**Recommendation:** Transfer **${formatINR(proposal.recommendedAmount)}** from **${proposal.fromCategoryName}** to **${proposal.toCategoryName}**.

${proposal.impactAnalysis}

*Note: Per Fin-Lit privacy & security policy, transfers require your explicit approval and do not alter bank accounts.*`,
        metadata: {
          type: "REALLOCATION",
          reallocation: proposal,
          suggestedActions: ["Approve Reallocation", "Decline Reallocation"],
        },
      };
    } else {
      return {
        role: "assistant",
        content: `All your budget categories are currently well-balanced or within expected spending velocity for the remaining ${summary.daysRemaining} days. No budget transfers are necessary at this time!`,
        metadata: { type: "GENERAL" },
      };
    }
  }

  // 9. General financial summary / overview fallback
  return {
    role: "assistant",
    content: `Hello ${ctx.userName}! Here is your current financial snapshot:

- **Total Monthly Income:** ${formatINR(summary.totalIncome)}
- **Total Spent So Far:** ${formatINR(summary.totalExpenditure)} (${summary.budgetUtilizationPercentage}% of allocated budget)
- **Remaining Discretionary Budget:** ${formatINR(summary.totalRemainingBudget)}
- **Estimated Savings:** ${formatINR(summary.monthlyActualSavings)} (${summary.savingsRatePercentage}% savings rate)
- **Daily Safe Spending Pace:** ${formatINR(Math.floor(summary.totalRemainingBudget / Math.max(1, summary.daysRemaining)))}/day for the remaining ${summary.daysRemaining} days.

You can ask me questions like:
- *"Can I afford to buy headphones for ₹3,500?"*
- *"How much did I spend on Food & Dining?"*
- *"How much money can I safely spend this week?"*
- *"Suggest a budget reallocation"*`,
    metadata: {
      type: "GENERAL",
      suggestedActions: [
        "Can I afford to spend ₹2,000?",
        "How much have I spent on food this month?",
        "Suggest a budget reallocation",
        "Which subscriptions cost the most?",
      ],
    },
  };
}

/**
 * Main Assistant Entrypoint: Tries Gemini API if key exists, otherwise falls back gracefully
 */
export async function generateAssistantResponse(
  userQuery: string,
  ctx: AssistantContext,
  chatHistory: AssistantMessage[] = []
): Promise<AssistantMessage> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  // If no Gemini key is provided, execute deterministic reasoning engine
  if (!geminiKey) {
    return handleFinancialQueryDeterministically(userQuery, ctx);
  }

  try {
    // LLM Call with strict financial grounding context
    const systemPrompt = `You are Fin-Lit AI, an intelligent, empathetic, and precision-oriented personal financial advisor for the Indian market.
You advise ${ctx.userName} (${ctx.occupationType === "STUDENT" ? "College Student" : "Working Professional"}).
CURRENCY: INR (₹).

STRICT FINANCIAL GROUNDING:
- Total Income: ₹${ctx.summary.totalIncome}
- Total Spent: ₹${ctx.summary.totalExpenditure}
- Remaining Budget: ₹${ctx.summary.totalRemainingBudget}
- Actual Savings: ₹${ctx.summary.monthlyActualSavings} (Rate: ${ctx.summary.savingsRatePercentage}%)
- Safe Daily Spending: ₹${Math.floor(ctx.summary.totalRemainingBudget / Math.max(1, ctx.summary.daysRemaining))}/day
- Days Remaining: ${ctx.summary.daysRemaining}

CATEGORIES:
${ctx.summary.categoryMetrics.map(c => `- ${c.categoryName}: Allocated ₹${c.allocatedAmount}, Spent ₹${c.spentAmount}, Remaining ₹${c.remainingAmount}, Velocity ₹${c.dailyVelocity}/day, Status: ${c.status}`).join("\n")}

SUBSCRIPTIONS:
${ctx.subscriptions.map(s => `- ${s.name}: ₹${s.amount} (${s.billingCycle})`).join("\n")}

RULES:
1. Always base all numbers strictly on the authoritative calculations above. NEVER hallucinate or contradict them.
2. Provide concise, actionable, and encouraging financial guidance.
3. Suggest practical habits suitable for the Indian context (e.g. UPI payments, canteens, dining out, subscriptions).`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuery}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn("Gemini API call failed, falling back to deterministic reasoning engine");
      return handleFinancialQueryDeterministically(userQuery, ctx);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return handleFinancialQueryDeterministically(userQuery, ctx);
    }

    return {
      role: "assistant",
      content: candidateText,
      metadata: { type: "GENERAL" },
    };
  } catch (error) {
    console.error("Error in AI assistant, falling back to deterministic logic:", error);
    return handleFinancialQueryDeterministically(userQuery, ctx);
  }
}
