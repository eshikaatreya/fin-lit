import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";
import { getCurrentMonthString } from "@/lib/constants";
import { calculateFinancialSummary } from "@/lib/financial-engine/calculator";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || getCurrentMonthString();

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId: user.id,
          month,
        },
      },
      include: {
        allocations: {
          include: {
            category: true,
          },
        },
        transfers: {
          include: {
            fromAllocation: { include: { category: true } },
            toAllocation: { include: { category: true } },
          },
          orderBy: { transferredAt: "desc" },
        },
      },
    });

    if (!budget) {
      return NextResponse.json({ budget: null, summary: null });
    }

    // Fetch transactions for this month to calculate accurate metrics
    const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
    const nextMonthYear = parseInt(month.split("-")[0]);
    const nextMonthNum = parseInt(month.split("-")[1]);
    const endOfMonth = new Date(Date.UTC(nextMonthYear, nextMonthNum, 0, 23, 59, 59, 999));

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfMonth, lte: endOfMonth },
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

    return NextResponse.json({ budget, summary });
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
    const { month = getCurrentMonthString(), allocations, totalIncome, savingsTarget } = body;

    let budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId: user.id,
          month,
        },
      },
    });

    if (!budget) {
      budget = await prisma.budget.create({
        data: {
          userId: user.id,
          month,
          totalIncome: totalIncome || 50000,
          totalAllocated: 0,
          savingsTarget: savingsTarget || 10000,
        },
      });
    } else if (totalIncome !== undefined || savingsTarget !== undefined) {
      budget = await prisma.budget.update({
        where: { id: budget.id },
        data: {
          totalIncome: totalIncome !== undefined ? totalIncome : budget.totalIncome,
          savingsTarget: savingsTarget !== undefined ? savingsTarget : budget.savingsTarget,
        },
      });
    }

    // Update allocations
    if (Array.isArray(allocations)) {
      let totalAllocatedSum = 0;
      for (const item of allocations) {
        const amt = parseFloat(item.allocatedAmount);
        totalAllocatedSum += amt;

        await prisma.budgetAllocation.upsert({
          where: {
            budgetId_categoryId: {
              budgetId: budget.id,
              categoryId: item.categoryId,
            },
          },
          update: {
            allocatedAmount: amt,
            alertThreshold: item.alertThreshold || 80,
          },
          create: {
            budgetId: budget.id,
            categoryId: item.categoryId,
            allocatedAmount: amt,
            alertThreshold: item.alertThreshold || 80,
          },
        });
      }

      await prisma.budget.update({
        where: { id: budget.id },
        data: { totalAllocated: totalAllocatedSum },
      });
    }

    return NextResponse.json({ success: true, budgetId: budget.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
