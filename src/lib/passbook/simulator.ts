// Fin-Lit Simulated UPI Live Transaction Generator
// Spec Section 5 - Realistic UPI transactions for demonstration and testing

import { predictTransactionCategory } from "../ai/categorizer";

const SAMPLE_UPI_MERCHANTS = [
  { merchant: "Swiggy", amountRange: [180, 750], desc: "Dinner order via UPI", app: "GPAY" },
  { merchant: "Zepto", amountRange: [220, 950], desc: "Grocery 10-min delivery", app: "PHONEPE" },
  { merchant: "Chai Point", amountRange: [60, 240], desc: "Ginger tea & banana cake", app: "PAYTM" },
  { merchant: "Uber India", amountRange: [140, 480], desc: "Auto ride to office/college", app: "GPAY" },
  { merchant: "Blinkit", amountRange: [300, 1100], desc: "Daily household essentials", app: "PHONEPE" },
  { merchant: "Zomato", amountRange: [250, 850], desc: "Lunch order delivery", app: "GPAY" },
  { merchant: "Airtel Prepaid", amountRange: [299, 719], desc: "Monthly 5G unlimited recharge", app: "PAYTM" },
  { merchant: "Third Wave Coffee", amountRange: [260, 520], desc: "Cold brew with friends", app: "BHIM" },
  { merchant: "Cult.fit", amountRange: [1200, 2400], desc: "Monthly fitness membership pass", app: "GPAY" },
  { merchant: "Myntra", amountRange: [899, 2499], desc: "Apparel purchase UPI pay", app: "PHONEPE" },
];

export function generateRandomUPITransaction(userId: string) {
  const item = SAMPLE_UPI_MERCHANTS[Math.floor(Math.random() * SAMPLE_UPI_MERCHANTS.length)];
  const amount = Math.floor(Math.random() * (item.amountRange[1] - item.amountRange[0]) + item.amountRange[0]);
  const date = new Date();

  // 12-digit Indian UTR number
  const utr = Math.floor(100000000000 + Math.random() * 900000000000);
  const ref = `UPI/${utr}/${item.merchant.toUpperCase().replace(/\s+/g, "")}`;

  const categoryPrediction = predictTransactionCategory(item.merchant, item.desc, amount);

  return {
    userId,
    amount,
    type: "EXPENSE",
    date,
    merchant: item.merchant,
    description: item.desc,
    paymentMethod: "UPI",
    referenceId: ref,
    idempotencyKey: `upi_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    status: "COMPLETED",
    aiSuggestedCategory: categoryPrediction.suggestedCategory,
    userConfirmedCategory: true,
  };
}
