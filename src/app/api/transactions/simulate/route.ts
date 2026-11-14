import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";
import { generateRandomUPITransaction } from "@/lib/passbook/simulator";

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sim = generateRandomUPITransaction(user.id);

    // Find category ID
    const category = await prisma.transactionCategory.findFirst({
      where: { name: sim.aiSuggestedCategory },
    });
    const fallbackCategory = await prisma.transactionCategory.findFirst();

    const created = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: sim.amount,
        type: sim.type,
        date: sim.date,
        merchant: sim.merchant,
        description: sim.description,
        categoryId: category?.id || fallbackCategory!.id,
        paymentMethod: sim.paymentMethod,
        referenceId: sim.referenceId,
        idempotencyKey: sim.idempotencyKey,
        status: sim.status,
        aiSuggestedCategory: sim.aiSuggestedCategory,
        userConfirmedCategory: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, transaction: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
