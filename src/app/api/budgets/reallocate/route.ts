import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";
import { getCurrentMonthString } from "@/lib/constants";
import { calculateFinancialSummary } from "@/lib/financial-engine/calculator";
import { findBestReallocation } from "@/lib/financial-engine/reallocator";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentMonth = getCurrentMonthString();
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId: user.id,
          month: currentMonth,
        },
      },
      include: {
        allocations: {
          include: { category: true },
        },
      },
    });

    if (!budget) {
      return NextResponse.json({ recommendation: null });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(`${currentMonth}-01T00:00:00.000Z`),
        },
      },
    });

    const summary = calculateFinancialSummary({
      totalMonthlyIncome: budget.totalIncome,
      savingsTarget: budget.savingsTarget,
      fixedRecurringExpenses: 0,
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        date: t.date,
        categoryId: t.categoryId,
        status: t.status,
      })),
      allocations: budget.allocations.map((a) => ({
        categoryId: a.categoryId,
        categoryName: a.category.name,
        allocatedAmount: a.allocatedAmount,
        spentAmount: a.spentAmount,
      })),
    });

    const recommendation = findBestReallocation(summary.categoryMetrics, summary.daysRemaining);

    return NextResponse.json({ recommendation, daysRemaining: summary.daysRemaining });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fromCategoryId, toCategoryId, amount, reason, recommendationId } = body;

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json({ error: "Invalid transfer amount." }, { status: 400 });
    }

    const currentMonth = getCurrentMonthString();
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId: user.id,
          month: currentMonth,
        },
      },
      include: {
        allocations: true,
      },
    });

    if (!budget) {
      return NextResponse.json({ error: "Active budget not found." }, { status: 404 });
    }

    const fromAlloc = budget.allocations.find((a) => a.categoryId === fromCategoryId);
    const toAlloc = budget.allocations.find((a) => a.categoryId === toCategoryId);

    if (!fromAlloc || !toAlloc) {
      return NextResponse.json({ error: "One or both category allocations do not exist in active budget." }, { status: 400 });
    }

    if (fromAlloc.allocatedAmount < transferAmount) {
      return NextResponse.json(
        { error: `Insufficient allocation in source category to transfer ₹${transferAmount}.` },
        { status: 400 }
      );
    }

    // Execute transfer inside atomic transaction
    await prisma.$transaction([
      // Decrement donor
      prisma.budgetAllocation.update({
        where: { id: fromAlloc.id },
        data: { allocatedAmount: fromAlloc.allocatedAmount - transferAmount },
      }),
      // Increment recipient
      prisma.budgetAllocation.update({
        where: { id: toAlloc.id },
        data: { allocatedAmount: toAlloc.allocatedAmount + transferAmount },
      }),
      // Log transfer record
      prisma.budgetTransfer.create({
        data: {
          budgetId: budget.id,
          fromAllocId: fromAlloc.id,
          toAllocId: toAlloc.id,
          amount: transferAmount,
          reason: reason || "AI suggested budget rebalance approved by user",
          suggestedByAI: true,
          userApproved: true,
        },
      }),
      // Log Notification
      prisma.notification.create({
        data: {
          userId: user.id,
          title: "Budget Reallocation Approved",
          message: `Successfully reallocated ₹${transferAmount.toLocaleString("en-IN")} from source category to target category.`,
          type: "BUDGET_ALERT",
          priority: "LOW",
        },
      }),
    ]);

    // Update recommendation status if provided
    if (recommendationId) {
      await prisma.aIRecommendation.update({
        where: { id: recommendationId },
        data: { status: "ACCEPTED" },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Reallocated ₹${transferAmount.toLocaleString("en-IN")} successfully.`,
    });
  } catch (error: any) {
    console.error("Reallocation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
