// Fin-Lit Database Seeder - Creates Realistic Indian Financial Personas
// Run with: node scripts/seed.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", icon: "Utensils", color: "#F97316" },
  { name: "Groceries", icon: "ShoppingCart", color: "#10B981" },
  { name: "Transportation", icon: "Car", color: "#3B82F6" },
  { name: "Shopping & Clothing", icon: "ShoppingBag", color: "#EC4899" },
  { name: "Entertainment", icon: "Film", color: "#8B5CF6" },
  { name: "Education", icon: "GraduationCap", color: "#06B6D4" },
  { name: "Health & Fitness", icon: "HeartPulse", color: "#EF4444" },
  { name: "Personal Care", icon: "Sparkles", color: "#F59E0B" },
  { name: "Bills & Utilities", icon: "Zap", color: "#6366F1" },
  { name: "Subscriptions", icon: "CalendarCheck", color: "#14B8A6" },
  { name: "Travel", icon: "Plane", color: "#0EA5E9" },
  { name: "Miscellaneous", icon: "MoreHorizontal", color: "#64748B" },
];

async function main() {
  console.log("🌱 Starting Fin-Lit database seeding...");

  // Clear existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userFeedback.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.aIInsight.deleteMany();
  await prisma.budgetTransfer.deleteMany();
  await prisma.budgetAllocation.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.paymentSource.deleteMany();
  await prisma.incomeSource.deleteMany();
  await prisma.financialProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.transactionCategory.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create System Categories
  const categoryMap = new Map();
  for (const cat of DEFAULT_CATEGORIES) {
    const created = await prisma.transactionCategory.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: "EXPENSE",
        isSystemDefault: true,
      },
    });
    categoryMap.set(cat.name, created.id);
  }
  console.log(`✅ Seeded ${categoryMap.size} system categories.`);

  const currentMonth = "2026-11";
  const now = new Date();

  // 2. Persona 1: Aarav Sharma (Working Professional)
  const aarav = await prisma.user.create({
    data: {
      email: "aarav.sharma@finlit.in",
      fullName: "Aarav Sharma",
      age: 27,
      mobileNumber: "+91 98765 43210",
      currency: "INR",
      financialExperience: "INTERMEDIATE",
      userProfile: {
        create: {
          occupationType: "WORKING_PROFESSIONAL",
          monthlyIncome: 85000,
          additionalIncome: 8000, // Freelance tech consulting
          salaryFrequency: "MONTHLY",
          detailsJson: JSON.stringify({
            profession: "Software Engineer",
            industry: "Technology",
            company: "Fintech Labs Bengaluru",
            employmentType: "Full-Time",
            fixedCommitments: ["Rent ₹24,000", "Broadband ₹1,050", "Electricity ₹1,800"],
          }),
        },
      },
      financialProfile: {
        create: {
          monthlySavingsTarget: 22000,
          savingsTargetType: "PERCENTAGE",
          savingsPercentage: 25,
          financialHealthScore: 82,
          riskTolerance: "MODERATE",
          aiConsentGiven: true,
        },
      },
    },
  });

  // Aarav's Payment Sources
  const gpayAarav = await prisma.paymentSource.create({
    data: {
      userId: aarav.id,
      name: "Google Pay (HDFC Salary)",
      type: "UPI",
      provider: "GPAY",
      lastFour: "4821",
      isDefault: true,
    },
  });

  const phonepeAarav = await prisma.paymentSource.create({
    data: {
      userId: aarav.id,
      name: "PhonePe (ICICI Bank)",
      type: "UPI",
      provider: "PHONEPE",
      lastFour: "9012",
      isDefault: false,
    },
  });

  // Aarav's Savings Goals
  await prisma.savingsGoal.createMany({
    data: [
      {
        userId: aarav.id,
        name: "Emergency Reserve (6 Months)",
        targetAmount: 250000,
        currentAmount: 180000,
        category: "EMERGENCY",
        icon: "ShieldCheck",
        color: "#10B981",
        status: "IN_PROGRESS",
      },
      {
        userId: aarav.id,
        name: "MacBook Pro M3 Max",
        targetAmount: 190000,
        currentAmount: 125000,
        category: "GADGETS",
        icon: "Laptop",
        color: "#3B82F6",
        status: "IN_PROGRESS",
      },
      {
        userId: aarav.id,
        name: "Japan Vacation Fund",
        targetAmount: 200000,
        currentAmount: 65000,
        category: "TRAVEL",
        icon: "Plane",
        color: "#8B5CF6",
        status: "IN_PROGRESS",
      },
    ],
  });

  // Aarav's Subscriptions
  await prisma.subscription.createMany({
    data: [
      {
        userId: aarav.id,
        name: "Netflix Premium (4K)",
        amount: 649,
        billingCycle: "MONTHLY",
        nextBillingDate: new Date("2026-11-28"),
        paymentMethod: "UPI",
        categoryId: categoryMap.get("Subscriptions"),
        status: "ACTIVE",
      },
      {
        userId: aarav.id,
        name: "Spotify Premium Duo",
        amount: 149,
        billingCycle: "MONTHLY",
        nextBillingDate: new Date("2026-11-22"),
        paymentMethod: "UPI",
        categoryId: categoryMap.get("Subscriptions"),
        status: "ACTIVE",
      },
      {
        userId: aarav.id,
        name: "Cult.fit Elite Pass",
        amount: 1750,
        billingCycle: "MONTHLY",
        nextBillingDate: new Date("2026-11-30"),
        paymentMethod: "UPI",
        categoryId: categoryMap.get("Health & Fitness"),
        status: "ACTIVE",
      },
      {
        userId: aarav.id,
        name: "ChatGPT Plus (OpenAI)",
        amount: 1999,
        billingCycle: "MONTHLY",
        nextBillingDate: new Date("2026-11-19"),
        paymentMethod: "CREDIT_CARD",
        categoryId: categoryMap.get("Subscriptions"),
        status: "ACTIVE",
      },
    ],
  });

  // Aarav's Budget for 2026-11
  const aaravBudget = await prisma.budget.create({
    data: {
      userId: aarav.id,
      month: currentMonth,
      totalIncome: 85000,
      totalAllocated: 63000,
      totalSpent: 36240,
      savingsTarget: 22000,
      status: "ACTIVE",
    },
  });

  const aaravAllocations = [
    { cat: "Food & Dining", allocated: 12000, spent: 10450 },
    { cat: "Groceries", allocated: 9000, spent: 5800 },
    { cat: "Transportation", allocated: 6000, spent: 3400 },
    { cat: "Shopping & Clothing", allocated: 8000, spent: 4800 },
    { cat: "Entertainment", allocated: 5000, spent: 1200 }, // Healthy surplus for reallocation!
    { cat: "Education", allocated: 3000, spent: 990 },
    { cat: "Health & Fitness", allocated: 4000, spent: 2600 },
    { cat: "Personal Care", allocated: 3000, spent: 1400 },
    { cat: "Bills & Utilities", allocated: 7000, spent: 4200 },
    { cat: "Subscriptions", allocated: 4000, spent: 1400 },
    { cat: "Travel", allocated: 2000, spent: 0 },
  ];

  for (const item of aaravAllocations) {
    const catId = categoryMap.get(item.cat);
    if (catId) {
      await prisma.budgetAllocation.create({
        data: {
          budgetId: aaravBudget.id,
          categoryId: catId,
          allocatedAmount: item.allocated,
          spentAmount: item.spent,
          alertThreshold: 80,
        },
      });
    }
  }

  // Aarav's Transactions
  const aaravTransactions = [
    { merchant: "Hiranandani Rent", amount: 24000, cat: "Bills & Utilities", type: "EXPENSE", desc: "Monthly Apartment Rent Koramangala", date: "2026-11-01" },
    { merchant: "Tech Consulting Client", amount: 8000, cat: "Miscellaneous", type: "INCOME", desc: "Freelance API audit invoice payment", date: "2026-11-03" },
    { merchant: "Swiggy Gourmet", amount: 890, cat: "Food & Dining", type: "EXPENSE", desc: "Weekend dinner with friends", date: "2026-11-04" },
    { merchant: "Zepto Quick Delivery", amount: 640, cat: "Groceries", type: "EXPENSE", desc: "Almond milk, coffee beans, bread", date: "2026-11-05" },
    { merchant: "Uber Premier", amount: 480, cat: "Transportation", type: "EXPENSE", desc: "Ride from Koramangala to Indiranagar", date: "2026-11-06" },
    { merchant: "Third Wave Coffee", amount: 320, cat: "Food & Dining", type: "EXPENSE", desc: "Pour-over and croissant", date: "2026-11-07" },
    { merchant: "Blinkit", amount: 1240, cat: "Groceries", type: "EXPENSE", desc: "Weekly organic vegetables and fruit basket", date: "2026-11-08" },
    { merchant: "Amazon India", amount: 2499, cat: "Shopping & Clothing", type: "EXPENSE", desc: "Ergonomic laptop vertical stand", date: "2026-11-09" },
    { merchant: "Cult.fit Bengaluru", amount: 1750, cat: "Health & Fitness", type: "EXPENSE", desc: "Elite membership auto-debit", date: "2026-11-10" },
    { merchant: "Zomato", amount: 560, cat: "Food & Dining", type: "EXPENSE", desc: "Lunch salad bowl delivery", date: "2026-11-11" },
    { merchant: "ACT Fibernet", amount: 1050, cat: "Bills & Utilities", type: "EXPENSE", desc: "Gigabit fiber broadband bill", date: "2026-11-12" },
    { merchant: "Airtel 5G Unlimited", amount: 699, cat: "Bills & Utilities", type: "EXPENSE", desc: "Postpaid mobile recharge", date: "2026-11-13" },
    { merchant: "Chai Point", amount: 180, cat: "Food & Dining", type: "EXPENSE", desc: "Irani chai and Bun Maska", date: "2026-11-14" },
    { merchant: "Myntra", amount: 2300, cat: "Shopping & Clothing", type: "EXPENSE", desc: "Formal linen work shirts", date: "2026-11-14" },
  ];

  for (const tx of aaravTransactions) {
    const catId = categoryMap.get(tx.cat) || categoryMap.get("Miscellaneous");
    await prisma.transaction.create({
      data: {
        userId: aarav.id,
        amount: tx.amount,
        type: tx.type,
        date: new Date(tx.date),
        merchant: tx.merchant,
        description: tx.desc,
        categoryId: catId,
        paymentMethod: "UPI",
        paymentSourceId: gpayAarav.id,
        referenceId: `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/CR`,
        status: "COMPLETED",
        aiSuggestedCategory: tx.cat,
        userConfirmedCategory: true,
      },
    });
  }

  // Aarav's AI Recommendations & Insights
  await prisma.aIRecommendation.create({
    data: {
      userId: aarav.id,
      type: "BUDGET_REALLOCATION",
      title: "Reallocate ₹1,500 from Entertainment to Food & Dining",
      description: "You have utilized 87% of your Food & Dining allocation with 16 days remaining in the month. Meanwhile, Entertainment has ₹3,800 in unutilized budget. Transferring ₹1,500 ensures smooth dining without exceeding your monthly budget limit.",
      actionPayload: JSON.stringify({
        fromCategory: "Entertainment",
        toCategory: "Food & Dining",
        amount: 1500,
        daysRemaining: 16,
      }),
      status: "PENDING",
    },
  });

  await prisma.aIInsight.createMany({
    data: [
      {
        userId: aarav.id,
        title: "Food & Dining Approaching Limit",
        summary: "You have used 87% of your Food & Dining budget with 16 days remaining.",
        detailedExplanation: "At your current spending velocity of ₹746/day on food, you are projected to exceed your allocation by ₹2,400. Reallocating from your Entertainment surplus will keep your budget healthy.",
        category: "BUDGET",
        impactLevel: "WARNING",
      },
      {
        userId: aarav.id,
        title: "Weekend Spending Spike",
        summary: "Weekend dining out is 65% higher than weekdays.",
        detailedExplanation: "Over the last two weekends, Saturday and Sunday spending averaged ₹1,450/day compared to ₹420/day on weekdays.",
        category: "PATTERN",
        impactLevel: "INFO",
      },
      {
        userId: aarav.id,
        title: "Strong Savings Momentum",
        summary: "You are on track to save ₹22,000 this month (25.8% savings rate).",
        detailedExplanation: "Your automated transfers to your Emergency Fund are on schedule, maintaining your Tier-1 financial health score.",
        category: "SAVINGS",
        impactLevel: "OPPORTUNITY",
      },
    ],
  });

  // Aarav's Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: aarav.id,
        title: "Budget Alert: Food & Dining at 87%",
        message: "You have ₹1,550 remaining in Food & Dining for the next 16 days.",
        type: "BUDGET_ALERT",
        priority: "HIGH",
      },
      {
        userId: aarav.id,
        title: "Subscription Renewal Notice",
        message: "ChatGPT Plus (₹1,999) is due in 5 days on Nov 19.",
        type: "SUBSCRIPTION_RENEWAL",
        priority: "MEDIUM",
      },
      {
        userId: aarav.id,
        title: "Daily Spending Summary",
        message: "Today's spending: ₹2,480. You remain comfortably on track with your monthly goals.",
        type: "DAILY_SUMMARY",
        priority: "LOW",
      },
    ],
  });

  console.log(`✅ Seeded Persona 1: Aarav Sharma (Software Engineer)`);

  // 3. Persona 2: Priya Patel (College Student)
  const priya = await prisma.user.create({
    data: {
      email: "priya.patel@finlit.in",
      fullName: "Priya Patel",
      age: 20,
      mobileNumber: "+91 91234 56789",
      currency: "INR",
      financialExperience: "BEGINNER",
      userProfile: {
        create: {
          occupationType: "STUDENT",
          monthlyIncome: 12000, // Monthly allowance from parents
          additionalIncome: 1500, // Part-time campus tutoring
          salaryFrequency: "MONTHLY",
          detailsJson: JSON.stringify({
            college: "Pune University (Engineering)",
            allowanceSource: "Parents & Part-Time Tutoring",
            receivedFrequency: "Monthly",
            accommodationFoodCovered: "Hostel room covered, food is partly mess / partly self",
            fixedCommitments: ["Mess Dues ₹3,500", "Jio Recharge ₹299"],
          }),
        },
      },
      financialProfile: {
        create: {
          monthlySavingsTarget: 2000,
          savingsTargetType: "FIXED",
          savingsPercentage: 16.6,
          financialHealthScore: 78,
          riskTolerance: "CONSERVATIVE",
          aiConsentGiven: true,
        },
      },
    },
  });

  const paytmPriya = await prisma.paymentSource.create({
    data: {
      userId: priya.id,
      name: "Paytm UPI (SBI Student Account)",
      type: "UPI",
      provider: "PAYTM",
      lastFour: "1104",
      isDefault: true,
    },
  });

  await prisma.savingsGoal.create({
    data: {
      userId: priya.id,
      name: "Goa Semester-End Trip",
      targetAmount: 15000,
      currentAmount: 8500,
      category: "TRAVEL",
      icon: "Palmtree",
      color: "#0EA5E9",
      status: "IN_PROGRESS",
    },
  });

  await prisma.subscription.create({
    data: {
      userId: priya.id,
      name: "Spotify Premium Student",
      amount: 59,
      billingCycle: "MONTHLY",
      nextBillingDate: new Date("2026-11-25"),
      paymentMethod: "UPI",
      categoryId: categoryMap.get("Subscriptions"),
      status: "ACTIVE",
    },
  });

  const priyaBudget = await prisma.budget.create({
    data: {
      userId: priya.id,
      month: currentMonth,
      totalIncome: 12000,
      totalAllocated: 10000,
      totalSpent: 5480,
      savingsTarget: 2000,
      status: "ACTIVE",
    },
  });

  const priyaAllocations = [
    { cat: "Food & Dining", allocated: 3500, spent: 2150 },
    { cat: "Groceries", allocated: 1200, spent: 680 },
    { cat: "Transportation", allocated: 1000, spent: 480 },
    { cat: "Shopping & Clothing", allocated: 1200, spent: 550 },
    { cat: "Entertainment", allocated: 1000, spent: 400 },
    { cat: "Education", allocated: 1200, spent: 750 },
    { cat: "Health & Fitness", allocated: 400, spent: 150 },
    { cat: "Bills & Utilities", allocated: 500, spent: 320 },
  ];

  for (const item of priyaAllocations) {
    const catId = categoryMap.get(item.cat);
    if (catId) {
      await prisma.budgetAllocation.create({
        data: {
          budgetId: priyaBudget.id,
          categoryId: catId,
          allocatedAmount: item.allocated,
          spentAmount: item.spent,
          alertThreshold: 80,
        },
      });
    }
  }

  const priyaTransactions = [
    { merchant: "Campus Canteen", amount: 140, cat: "Food & Dining", desc: "Thali lunch with classmates", date: "2026-11-03" },
    { merchant: "College Bookstore", amount: 450, cat: "Education", desc: "Data Structures & Algorithms reference textbook", date: "2026-11-05" },
    { merchant: "Pune Metro", amount: 60, cat: "Transportation", desc: "Return ticket to FC Road", date: "2026-11-06" },
    { merchant: "CCD & Chai Stall", amount: 90, cat: "Food & Dining", desc: "Evening masala chai and samosa", date: "2026-11-08" },
    { merchant: "Jio Prepaid 5G", amount: 299, cat: "Bills & Utilities", desc: "Monthly 1.5GB/day recharge", date: "2026-11-10" },
    { merchant: "Zomato", amount: 280, cat: "Food & Dining", desc: "Late night study session roll delivery", date: "2026-11-12" },
  ];

  for (const tx of priyaTransactions) {
    const catId = categoryMap.get(tx.cat) || categoryMap.get("Miscellaneous");
    await prisma.transaction.create({
      data: {
        userId: priya.id,
        amount: tx.amount,
        type: "EXPENSE",
        date: new Date(tx.date),
        merchant: tx.merchant,
        description: tx.desc,
        categoryId: catId,
        paymentMethod: "UPI",
        paymentSourceId: paytmPriya.id,
        referenceId: `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/CR`,
        status: "COMPLETED",
        aiSuggestedCategory: tx.cat,
        userConfirmedCategory: true,
      },
    });
  }

  console.log(`✅ Seeded Persona 2: Priya Patel (College Student)`);
  console.log("🚀 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
