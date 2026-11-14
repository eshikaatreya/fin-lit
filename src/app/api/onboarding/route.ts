import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEFAULT_CATEGORIES, getCurrentMonthString } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Step 1: Personal
      fullName,
      email,
      age,
      mobileNumber,
      currency = "INR",
      financialExperience = "BEGINNER",

      // Step 2: Occupation
      occupationType, // "STUDENT" | "WORKING_PROFESSIONAL"
      monthlyIncome,
      additionalIncome = 0,
      salaryFrequency = "MONTHLY",
      occupationDetails = {},

      // Step 3: Savings Target & Goals
      monthlySavingsTarget,
      savingsTargetType = "PERCENTAGE",
      savingsGoals = [],

      // Step 4: Fixed commitments
      commitments = [],

      // Step 5: Budget
      budgetPreference = "AI_RECOMMENDED", // "AI_RECOMMENDED" | "MANUAL"
      customAllocations = {},
    } = body;

    if (!fullName || !email || !monthlyIncome) {
      return NextResponse.json(
        { error: "Full name, email, and monthly income/allowance are required." },
        { status: 400 }
      );
    }

    const incomeVal = parseFloat(monthlyIncome);
    const savingsVal = parseFloat(monthlySavingsTarget) || Math.round(incomeVal * 0.2);

    // 1. Create User
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        age: age ? parseInt(age) : null,
        mobileNumber: mobileNumber || null,
        currency,
        financialExperience,
        userProfile: {
          create: {
            occupationType,
            monthlyIncome: incomeVal,
            additionalIncome: parseFloat(additionalIncome) || 0,
            salaryFrequency,
            detailsJson: JSON.stringify(occupationDetails),
          },
        },
        financialProfile: {
          create: {
            monthlySavingsTarget: savingsVal,
            savingsTargetType,
            savingsPercentage: incomeVal > 0 ? Math.round((savingsVal / incomeVal) * 100) : 20,
            financialHealthScore: 75,
            aiConsentGiven: true,
          },
        },
      },
    });

    // 2. Create Default Payment Source (UPI GPay / Paytm)
    await prisma.paymentSource.create({
      data: {
        userId: user.id,
        name: occupationType === "STUDENT" ? "Paytm Student UPI" : "Google Pay UPI",
        type: "UPI",
        provider: occupationType === "STUDENT" ? "PAYTM" : "GPAY",
        isDefault: true,
      },
    });

    // 3. Create Savings Goals
    if (Array.isArray(savingsGoals) && savingsGoals.length > 0) {
      for (const goal of savingsGoals) {
        if (goal.name && goal.targetAmount) {
          await prisma.savingsGoal.create({
            data: {
              userId: user.id,
              name: goal.name,
              targetAmount: parseFloat(goal.targetAmount),
              currentAmount: parseFloat(goal.currentAmount || 0),
              category: goal.category || "OTHER",
              icon: goal.icon || "Target",
              color: goal.color || "#10B981",
              status: "IN_PROGRESS",
            },
          });
        }
      }
    }

    // 4. Create Commitments / Recurring
    if (Array.isArray(commitments)) {
      for (const com of commitments) {
        if (com.name && com.amount) {
          await prisma.recurringTransaction.create({
            data: {
              userId: user.id,
              name: com.name,
              expectedAmount: parseFloat(com.amount),
              recurrence: com.frequency || "MONTHLY",
              nextDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
    }

    // 5. Calculate Initial Budget Allocations
    const currentMonth = getCurrentMonthString();
    const discretionaryBudget = Math.max(0, incomeVal - savingsVal);

    // Fetch system categories
    const categories = await prisma.transactionCategory.findMany({
      where: { isSystemDefault: true },
    });

    const budget = await prisma.budget.create({
      data: {
        userId: user.id,
        month: currentMonth,
        totalIncome: incomeVal,
        totalAllocated: discretionaryBudget,
        savingsTarget: savingsVal,
        status: "ACTIVE",
      },
    });

    // Compute category splits
    for (const cat of categories) {
      const def = DEFAULT_CATEGORIES.find((d) => d.name === cat.name);
      let allocated = 0;

      if (budgetPreference === "MANUAL" && customAllocations[cat.id]) {
        allocated = parseFloat(customAllocations[cat.id]);
      } else if (def) {
        const pct =
          occupationType === "STUDENT"
            ? def.suggestedPercentage.student
            : def.suggestedPercentage.professional;
        allocated = Math.round((discretionaryBudget * pct) / 100);
      }

      await prisma.budgetAllocation.create({
        data: {
          budgetId: budget.id,
          categoryId: cat.id,
          allocatedAmount: allocated,
          spentAmount: 0,
          alertThreshold: 80,
        },
      });
    }

    // Welcome Notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Welcome to Fin-Lit, ${user.fullName}!`,
        message: `Your AI-powered personal financial command centre is now configured. Your monthly budget of ₹${discretionaryBudget.toLocaleString("en-IN")} is active.`,
        type: "DAILY_SUMMARY",
        priority: "HIGH",
      },
    });

    const response = NextResponse.json({
      success: true,
      userId: user.id,
      message: "Onboarding completed successfully.",
    });

    // Set active user cookie
    response.cookies.set("finlit_user_id", user.id, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
