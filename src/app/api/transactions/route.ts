import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";
import { predictTransactionCategory } from "@/lib/ai/categorizer";
import { getCurrentMonthString } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const paymentMethod = searchParams.get("paymentMethod");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { userId: user.id };

    if (category && category !== "ALL") {
      where.category = { name: category };
    }

    if (paymentMethod && paymentMethod !== "ALL") {
      where.paymentMethod = paymentMethod;
    }

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { merchant: { contains: search } },
        { description: { contains: search } },
        { referenceId: { contains: search } },
      ];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          paymentSource: true,
        },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      totalCount,
      limit,
      offset,
    });
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
    const {
      amount,
      type = "EXPENSE",
      merchant,
      description = "",
      categoryId: providedCategoryId,
      paymentMethod = "UPI",
      date = new Date().toISOString(),
      notes = "",
    } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount. Must be greater than 0." }, { status: 400 });
    }

    if (!merchant || merchant.trim().length === 0) {
      return NextResponse.json({ error: "Merchant / Recipient name is required." }, { status: 400 });
    }

    // 1. AI Categorization inference
    let targetCategoryId = providedCategoryId;
    let aiSuggestedCat = "";

    if (!targetCategoryId) {
      const prediction = predictTransactionCategory(merchant, description, parsedAmount);
      aiSuggestedCat = prediction.suggestedCategory;

      const matchedCat = await prisma.transactionCategory.findFirst({
        where: { name: prediction.suggestedCategory },
      });
      if (matchedCat) {
        targetCategoryId = matchedCat.id;
      }
    }

    // Fallback if still no category
    if (!targetCategoryId) {
      const miscCat = await prisma.transactionCategory.findFirst({
        where: { name: "Miscellaneous" },
      });
      targetCategoryId = miscCat?.id;
    }

    // 2. Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: parsedAmount,
        type,
        date: new Date(date),
        merchant: merchant.trim(),
        description: description.trim(),
        categoryId: targetCategoryId,
        paymentMethod,
        referenceId: `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/CR`,
        status: "COMPLETED",
        aiSuggestedCategory: aiSuggestedCat,
        userConfirmedCategory: true,
        notes,
      },
      include: {
        category: true,
      },
    });

    // 3. Update current month budget allocation spent amount if it's an EXPENSE
    const currentMonth = getCurrentMonthString(new Date(date));
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId: user.id,
          month: currentMonth,
        },
      },
      include: {
        allocations: {
          where: { categoryId: targetCategoryId },
        },
      },
    });

    if (budget && type === "EXPENSE") {
      const allocation = budget.allocations[0];
      if (allocation) {
        const newSpent = allocation.spentAmount + parsedAmount;
        await prisma.budgetAllocation.update({
          where: { id: allocation.id },
          data: { spentAmount: newSpent },
        });

        // Check if exceeded threshold
        const thresholdLimit = (allocation.allocatedAmount * allocation.alertThreshold) / 100;
        if (newSpent >= thresholdLimit) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: `Budget Alert: ${transaction.category.name}`,
              message: `You have spent ₹${Math.round(newSpent).toLocaleString("en-IN")} of your ₹${Math.round(allocation.allocatedAmount).toLocaleString("en-IN")} allocation.`,
              type: "BUDGET_ALERT",
              priority: newSpent > allocation.allocatedAmount ? "HIGH" : "MEDIUM",
            },
          });
        }
      }

      // Update total spent on budget
      await prisma.budget.update({
        where: { id: budget.id },
        data: { totalSpent: budget.totalSpent + parsedAmount },
      });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error("Create transaction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.transaction.delete({ where: { id } });

    // Decrement spent on allocation if found
    const currentMonth = getCurrentMonthString(new Date(existing.date));
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId: user.id,
          month: currentMonth,
        },
      },
      include: {
        allocations: {
          where: { categoryId: existing.categoryId },
        },
      },
    });

    if (budget && existing.type === "EXPENSE") {
      const alloc = budget.allocations[0];
      if (alloc) {
        await prisma.budgetAllocation.update({
          where: { id: alloc.id },
          data: { spentAmount: Math.max(0, alloc.spentAmount - existing.amount) },
        });
      }
      await prisma.budget.update({
        where: { id: budget.id },
        data: { totalSpent: Math.max(0, budget.totalSpent - existing.amount) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
