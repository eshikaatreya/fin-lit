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

    const goals = await prisma.savingsGoal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    return NextResponse.json({
      goals,
      totalTarget,
      totalSaved,
      overallProgress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
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
    const { name, targetAmount, currentAmount = 0, deadline, category = "OTHER", icon = "Target", color = "#10B981" } = body;

    const parsedTarget = parseFloat(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      return NextResponse.json({ error: "Invalid target amount." }, { status: 400 });
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name: name.trim(),
        targetAmount: parsedTarget,
        currentAmount: parseFloat(currentAmount) || 0,
        deadline: deadline ? new Date(deadline) : null,
        category,
        icon,
        color,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({ success: true, goal });
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
    const { id, addAmount } = body;

    const parsedAdd = parseFloat(addAmount);
    if (isNaN(parsedAdd) || parsedAdd <= 0) {
      return NextResponse.json({ error: "Invalid amount to add." }, { status: 400 });
    }

    const goal = await prisma.savingsGoal.findUnique({ where: { id } });
    if (!goal || goal.userId !== user.id) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    const newAmount = goal.currentAmount + parsedAdd;
    const isCompleted = newAmount >= goal.targetAmount;

    const updated = await prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
      },
    });

    if (isCompleted) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `Goal Achieved: ${goal.name}! 🎉`,
          message: `Congratulations! You've successfully hit your target of ₹${goal.targetAmount.toLocaleString("en-IN")}.`,
          type: "SAVINGS_ACHIEVEMENT",
          priority: "HIGH",
        },
      });
    }

    return NextResponse.json({ success: true, goal: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
