import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";
import { getCurrentMonthString } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    const categories = await prisma.transactionCategory.findMany({
      where: {
        OR: [
          { isSystemDefault: true },
          { userId: user?.id },
        ],
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
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
    const { name, icon = "MoreHorizontal", color = "#64748B", initialAllocation = 0 } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    // Create Category
    const category = await prisma.transactionCategory.create({
      data: {
        userId: user.id,
        name: name.trim(),
        icon,
        color,
        type: "EXPENSE",
        isSystemDefault: false,
      },
    });

    // Add allocation to active budget if requested
    const currentMonth = getCurrentMonthString();
    const budget = await prisma.budget.findUnique({
      where: { userId_month: { userId: user.id, month: currentMonth } },
    });

    if (budget && parseFloat(initialAllocation) > 0) {
      await prisma.budgetAllocation.create({
        data: {
          budgetId: budget.id,
          categoryId: category.id,
          allocatedAmount: parseFloat(initialAllocation),
          spentAmount: 0,
        },
      });

      await prisma.budget.update({
        where: { id: budget.id },
        data: { totalAllocated: budget.totalAllocated + parseFloat(initialAllocation) },
      });
    }

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
