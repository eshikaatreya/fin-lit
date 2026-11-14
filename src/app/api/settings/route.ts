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

    const [paymentSources, recurringCount] = await Promise.all([
      prisma.paymentSource.findMany({ where: { userId: user.id } }),
      prisma.recurringTransaction.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      user,
      paymentSources,
      recurringCount,
    });
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
    const {
      fullName,
      mobileNumber,
      age,
      currency,
      financialExperience,
      monthlyIncome,
      monthlySavingsTarget,
      riskTolerance,
      aiConsentGiven,
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: fullName || user.fullName,
        mobileNumber: mobileNumber !== undefined ? mobileNumber : user.mobileNumber,
        age: age ? parseInt(age) : user.age,
        currency: currency || user.currency,
        financialExperience: financialExperience || user.financialExperience,
        userProfile: {
          update: {
            monthlyIncome: monthlyIncome !== undefined ? parseFloat(monthlyIncome) : user.userProfile?.monthlyIncome,
          },
        },
        financialProfile: {
          update: {
            monthlySavingsTarget: monthlySavingsTarget !== undefined ? parseFloat(monthlySavingsTarget) : user.financialProfile?.monthlySavingsTarget,
            riskTolerance: riskTolerance || user.financialProfile?.riskTolerance,
            aiConsentGiven: aiConsentGiven !== undefined ? Boolean(aiConsentGiven) : user.financialProfile?.aiConsentGiven,
          },
        },
      },
      include: {
        userProfile: true,
        financialProfile: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
