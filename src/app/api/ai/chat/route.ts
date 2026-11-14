import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";
import { getCurrentMonthString } from "@/lib/constants";
import { calculateFinancialSummary } from "@/lib/financial-engine/calculator";
import { generateAssistantResponse, AssistantContext } from "@/lib/ai/assistant";

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, chatHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const currentMonth = getCurrentMonthString();

    // 1. Gather all financial context
    const [budget, transactions, subscriptions, savingsGoals] = await Promise.all([
      prisma.budget.findUnique({
        where: { userId_month: { userId: user.id, month: currentMonth } },
        include: { allocations: { include: { category: true } } },
      }),
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          date: { gte: new Date(`${currentMonth}-01T00:00:00.000Z`) },
        },
        include: { category: true },
        orderBy: { date: "desc" },
      }),
      prisma.subscription.findMany({ where: { userId: user.id } }),
      prisma.savingsGoal.findMany({ where: { userId: user.id } }),
    ]);

    const income = budget?.totalIncome || user.userProfile?.monthlyIncome || 50000;
    const savingsTarget = budget?.savingsTarget || user.financialProfile?.monthlySavingsTarget || 10000;

    const summary = calculateFinancialSummary({
      totalMonthlyIncome: income,
      savingsTarget,
      fixedRecurringExpenses: subscriptions.reduce((sum, s) => sum + s.amount, 0),
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        date: t.date,
        categoryId: t.categoryId,
        status: t.status,
      })),
      allocations: (budget?.allocations || []).map((a) => ({
        categoryId: a.categoryId,
        categoryName: a.category.name,
        allocatedAmount: a.allocatedAmount,
        spentAmount: a.spentAmount,
      })),
    });

    const context: AssistantContext = {
      userName: user.fullName,
      occupationType: user.userProfile?.occupationType || "WORKING_PROFESSIONAL",
      currency: user.currency,
      summary,
      recentTransactions: transactions.slice(0, 15).map((t) => ({
        amount: t.amount,
        merchant: t.merchant,
        category: t.category.name,
        date: t.date.toISOString(),
        type: t.type,
      })),
      subscriptions: subscriptions.map((s) => ({
        name: s.name,
        amount: s.amount,
        billingCycle: s.billingCycle,
        nextBillingDate: s.nextBillingDate.toISOString(),
      })),
      savingsGoals: savingsGoals.map((g) => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
      })),
    };

    const reply = await generateAssistantResponse(message, context, chatHistory);

    return NextResponse.json({
      message: reply,
    });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
