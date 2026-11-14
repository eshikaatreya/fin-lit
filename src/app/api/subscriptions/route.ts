import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { nextBillingDate: "asc" },
    });

    const totalMonthly = subscriptions
      .filter((s) => s.status === "ACTIVE")
      .reduce((sum, s) => {
        if (s.billingCycle === "ANNUAL") return sum + s.amount / 12;
        if (s.billingCycle === "QUARTERLY") return sum + s.amount / 3;
        return sum + s.amount;
      }, 0);

    return NextResponse.json({
      subscriptions,
      totalMonthly: Math.round(totalMonthly),
      activeCount: subscriptions.filter((s) => s.status === "ACTIVE").length,
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
      name,
      amount,
      billingCycle = "MONTHLY",
      nextBillingDate = new Date().toISOString(),
      paymentMethod = "UPI",
      categoryId,
      notes = "",
    } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid subscription amount." }, { status: 400 });
    }

    const created = await prisma.subscription.create({
      data: {
        userId: user.id,
        name: name.trim(),
        amount: parsedAmount,
        billingCycle,
        nextBillingDate: new Date(nextBillingDate),
        paymentMethod,
        categoryId: categoryId || null,
        status: "ACTIVE",
        notes,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, subscription: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    const updated = await prisma.subscription.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, subscription: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
