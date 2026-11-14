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

    const [transactions, budgets, savingsGoals, subscriptions, notifications] = await Promise.all([
      prisma.transaction.findMany({ where: { userId: user.id }, include: { category: true } }),
      prisma.budget.findMany({ where: { userId: user.id }, include: { allocations: { include: { category: true } } } }),
      prisma.savingsGoal.findMany({ where: { userId: user.id } }),
      prisma.subscription.findMany({ where: { userId: user.id } }),
      prisma.notification.findMany({ where: { userId: user.id } }),
    ]);

    const exportData = {
      exportTimestamp: new Date().toISOString(),
      platform: "Fin-Lit",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        age: user.age,
        currency: user.currency,
        financialExperience: user.financialExperience,
        profile: user.userProfile,
        financialProfile: user.financialProfile,
      },
      transactions,
      budgets,
      savingsGoals,
      subscriptions,
      notifications,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="finlit_export_${user.fullName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
