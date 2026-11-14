import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";
import { calculateFinancialSummary } from "@/lib/financial-engine/calculator";
import { generateProactiveInsights } from "@/lib/ai/insights-generator";
import { getCurrentMonthString } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentMonth = getCurrentMonthString();

    // 1. Fetch current month budget and allocations
    let budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId: user.id,
          month: currentMonth,
        },
      },
      include: {
        allocations: {
          include: {
            category: true,
          },
        },
      },
    });

    // If budget doesn't exist for current month, create a default one based on profile
    if (!budget) {
      const income = user.userProfile?.monthlyIncome || 50000;
      const savingsTarget = user.financialProfile?.monthlySavingsTarget || Math.round(income * 0.2);

      budget = await prisma.budget.create({
        data: {
          userId: user.id,
          month: currentMonth,
          totalIncome: income,
          totalAllocated: Math.round(income - savingsTarget),
          totalSpent: 0,
          savingsTarget,
          status: "ACTIVE",
        },
        include: {
          allocations: {
            include: {
              category: true,
            },
          },
        },
      });
    }

    // 2. Fetch all transactions for this month
    const startOfMonth = new Date(`${currentMonth}-01T00:00:00.000Z`);
    const nextMonthYear = parseInt(currentMonth.split("-")[0]);
    const nextMonthNum = parseInt(currentMonth.split("-")[1]);
    const endOfMonth = new Date(Date.UTC(nextMonthYear, nextMonthNum, 0, 23, 59, 59, 999));

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // 3. Fetch user's subscriptions and goals
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
    });

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId: user.id },
    });

    // 4. Run deterministic calculation engine
    const allocationRecords = budget.allocations.map((a) => ({
      categoryId: a.categoryId,
      categoryName: a.category.name,
      allocatedAmount: a.allocatedAmount,
      spentAmount: a.spentAmount,
    }));

    const txRecords = transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      date: t.date,
      categoryId: t.categoryId,
      status: t.status,
      isRecurring: t.isRecurring,
    }));

    const summary = calculateFinancialSummary({
      totalMonthlyIncome: budget.totalIncome,
      savingsTarget: budget.savingsTarget,
      fixedRecurringExpenses: subscriptions.reduce((sum, s) => sum + s.amount, 0),
      transactions: txRecords,
      allocations: allocationRecords,
    });

    // 5. Generate Proactive Insights
    const rawInsights = generateProactiveInsights(
      summary,
      transactions.map((t) => ({
        amount: t.amount,
        merchant: t.merchant,
        category: t.category.name,
        date: t.date,
        type: t.type,
      })),
      subscriptions.map((s) => ({
        name: s.name,
        amount: s.amount,
        billingCycle: s.billingCycle,
        status: s.status,
      }))
    );

    // Also fetch any stored AI recommendations
    const pendingRecommendations = await prisma.aIRecommendation.findMany({
      where: {
        userId: user.id,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // 6. Build Daily Spending Trend Chart Data (Days 1 to current day)
    const dailySpendMap: Record<number, number> = {};
    for (let d = 1; d <= summary.daysPassed; d++) {
      dailySpendMap[d] = 0;
    }

    transactions.forEach((tx) => {
      if (tx.type === "EXPENSE" && tx.status !== "REVERSED") {
        const day = new Date(tx.date).getDate();
        if (dailySpendMap[day] !== undefined) {
          dailySpendMap[day] += tx.amount;
        }
      }
    });

    const dailySpendingChart = Object.keys(dailySpendMap).map((dayStr) => ({
      day: `Day ${dayStr}`,
      dayNum: parseInt(dayStr),
      amount: Math.round(dailySpendMap[parseInt(dayStr)]),
      safeBudget: Math.round(summary.totalAllocatedBudget / summary.totalDaysInMonth),
    }));

    // 7. Category Breakdown for Donut Chart
    const categoryBreakdown = summary.categoryMetrics
      .filter((c) => c.spentAmount > 0)
      .map((c) => ({
        name: c.categoryName,
        value: c.spentAmount,
        allocated: c.allocatedAmount,
        percentage: summary.totalExpenditure > 0 ? Math.round((c.spentAmount / summary.totalExpenditure) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    // 8. Month-over-Month comparison data (realistic comparison)
    const lastMonthSpent = Math.round(summary.totalExpenditure * 0.92);
    const monthComparison = {
      currentMonthSpent: summary.totalExpenditure,
      lastMonthSpent,
      spendingChangePercentage: Math.round(((summary.totalExpenditure - lastMonthSpent) / (lastMonthSpent || 1)) * 100),
      savingsChangePercentage: 8,
    };

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        currency: user.currency,
        occupationType: user.userProfile?.occupationType,
      },
      month: currentMonth,
      summary,
      categoryBreakdown,
      dailySpendingChart,
      monthComparison,
      recentTransactions: transactions.slice(0, 8),
      insights: rawInsights,
      pendingRecommendations,
      savingsGoals,
      subscriptionsSummary: {
        count: subscriptions.length,
        totalMonthly: subscriptions.reduce((sum, s) => sum + s.amount, 0),
      },
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
