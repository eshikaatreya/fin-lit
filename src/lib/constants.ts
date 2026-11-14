// Fin-Lit Constants & Formatter Utilities

export interface CategoryDefinition {
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
  suggestedPercentage: {
    student: number;
    professional: number;
  };
}

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  {
    name: "Food & Dining",
    icon: "Utensils",
    color: "#F97316", // Orange
    subcategories: ["Restaurants", "Zomato / Swiggy", "Canteen", "Cafes & Chai", "Fast Food"],
    suggestedPercentage: { student: 30, professional: 15 },
  },
  {
    name: "Groceries",
    icon: "ShoppingCart",
    color: "#10B981", // Emerald
    subcategories: ["Supermarket", "Zepto / Blinkit / Instamart", "Vegetables & Fruits", "Milk & Dairy", "Kirana Store"],
    suggestedPercentage: { student: 10, professional: 12 },
  },
  {
    name: "Transportation",
    icon: "Car",
    color: "#3B82F6", // Blue
    subcategories: ["Uber / Ola", "Metro / Bus Pass", "Fuel / Petrol", "Auto Rickshaw", "Train Tickets"],
    suggestedPercentage: { student: 10, professional: 8 },
  },
  {
    name: "Shopping & Clothing",
    icon: "ShoppingBag",
    color: "#EC4899", // Pink
    subcategories: ["Clothing & Apparel", "Footwear", "Electronics", "Accessories", "Home Goods"],
    suggestedPercentage: { student: 10, professional: 10 },
  },
  {
    name: "Entertainment",
    icon: "Film",
    color: "#8B5CF6", // Purple
    subcategories: ["Movies & Cinema", "Events & Concerts", "Gaming", "Outings with Friends"],
    suggestedPercentage: { student: 10, professional: 6 },
  },
  {
    name: "Education",
    icon: "GraduationCap",
    color: "#06B6D4", // Cyan
    subcategories: ["Books & Notes", "Online Courses", "Tuition & Coaching", "Exams & Certifications"],
    suggestedPercentage: { student: 10, professional: 4 },
  },
  {
    name: "Health & Fitness",
    icon: "HeartPulse",
    color: "#EF4444", // Red
    subcategories: ["Gym / Cult.fit", "Pharmacy & Medicines", "Doctor Consultation", "Supplements"],
    suggestedPercentage: { student: 5, professional: 6 },
  },
  {
    name: "Personal Care",
    icon: "Sparkles",
    color: "#F59E0B", // Amber
    subcategories: ["Salon & Grooming", "Skincare & Cosmetics", "Laundry & Dry Clean"],
    suggestedPercentage: { student: 5, professional: 4 },
  },
  {
    name: "Bills & Utilities",
    icon: "Zap",
    color: "#6366F1", // Indigo
    subcategories: ["Electricity Bill", "Mobile Recharge", "Wi-Fi & Broadband", "LPG Gas", "Water Bill"],
    suggestedPercentage: { student: 5, professional: 12 },
  },
  {
    name: "Subscriptions",
    icon: "CalendarCheck",
    color: "#14B8A6", // Teal
    subcategories: ["Streaming (Netflix/Prime)", "Music (Spotify/Apple)", "Software & Cloud", "Memberships"],
    suggestedPercentage: { student: 5, professional: 5 },
  },
  {
    name: "Travel",
    icon: "Plane",
    color: "#0EA5E9", // Sky
    subcategories: ["Flights", "Hotels", "Vacations", "Weekend Getaways"],
    suggestedPercentage: { student: 0, professional: 5 },
  },
  {
    name: "Miscellaneous",
    icon: "MoreHorizontal",
    color: "#64748B", // Slate
    subcategories: ["ATM Cash Withdrawal", "Uncategorized", "Gifts", "Charity"],
    suggestedPercentage: { student: 0, professional: 3 },
  },
];

export const UPI_PROVIDERS = [
  { id: "GPAY", name: "Google Pay", icon: "GooglePay", color: "#4285F4" },
  { id: "PHONEPE", name: "PhonePe", icon: "PhonePe", color: "#5F259F" },
  { id: "PAYTM", name: "Paytm", icon: "Paytm", color: "#00B9F1" },
  { id: "BHIM", name: "BHIM UPI", icon: "BHIM", color: "#007A3D" },
  { id: "HDFC", name: "HDFC Bank NetBanking", icon: "Bank", color: "#004C8F" },
  { id: "SBI", name: "SBI Yono", icon: "Bank", color: "#280071" },
  { id: "ICICI", name: "iMobile ICICI", icon: "Bank", color: "#B3211E" },
  { id: "CASH", name: "Cash in Hand", icon: "Cash", color: "#10B981" },
  { id: "OTHER", name: "Other Method", icon: "CreditCard", color: "#64748B" },
];

export const PAYMENT_METHODS = [
  { id: "UPI", name: "UPI (Unified Payments Interface)" },
  { id: "DEBIT_CARD", name: "Debit Card" },
  { id: "CREDIT_CARD", name: "Credit Card" },
  { id: "NET_BANKING", name: "Net Banking" },
  { id: "CASH", name: "Cash" },
  { id: "BANK_TRANSFER", name: "Bank Transfer (NEFT/IMPS/RTGS)" },
];

// Indian Rupee Currency Formatter (supports lakhs & crores format, e.g., ₹1,25,000)
export function formatINR(amount: number | null | undefined, showDecimals: boolean = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0";
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = "";
  if (showDecimals) {
    formatted = absAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formatted = Math.round(absAmount).toLocaleString("en-IN");
  }

  return `${isNegative ? "-₹" : "₹"}${formatted}`;
}

// Format compact INR (e.g., ₹12.5k, ₹1.4L, ₹2.1Cr)
export function formatCompactINR(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  if (abs >= 10000000) {
    return `${isNegative ? "-₹" : "₹"}${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${isNegative ? "-₹" : "₹"}${(abs / 100000).toFixed(1)} L`;
  }
  if (abs >= 1000) {
    return `${isNegative ? "-₹" : "₹"}${(abs / 1000).toFixed(1)}k`;
  }
  return `${isNegative ? "-₹" : "₹"}${Math.round(abs)}`;
}

// Get current financial month string (e.g., "2026-11")
export function getCurrentMonthString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatMonthName(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
