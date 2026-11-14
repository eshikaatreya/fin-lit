import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";
import { getCurrentMonthString } from "@/lib/constants";
import { calculateFinancialSummary } from "@/lib/financial-engine/calculator";
import { evaluateAffordability } from "@/lib/financial-engine/affordability";

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, categoryName } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid purchase amount." }, { status: 400 });
    }

    const currentMonth = getCurrentMonthString();
    const [budget, transactions, subscriptions] = await Promise.all([
      prisma.budget.findUnique({
        where: { userId_month: { userId: user.id, month: currentMonth } },
        include: { allocations: { include: { category: true } } },
      }),
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          date: { gte: new Date(`${currentMonth}-01T00:00:00.000Z`) },
        },
      }),
      prisma.subscription.findMany({ where: { userId: user.id } }),
    ]);

    const income = budget?.totalIncome || user.userProfile?.monthlyIncome || 50000;
    const savingsTarget = budget?.savingsTarget || 10000;

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

    const assessment = evaluateAffordability(parsedAmount, summary, categoryName);

    return NextResponse.json({ assessment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
