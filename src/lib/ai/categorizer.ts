// Fin-Lit Intelligent Categorization Engine
// Spec Section 4 & 7 - Comprehensive Indian Merchant Knowledge Base + Auto Categorization

export interface CategorizationResult {
  suggestedCategory: string;
  confidence: number; // 0.0 to 1.0
  isAutoDetected: boolean;
  matchPattern?: string;
  reason?: string;
}

const INDIAN_MERCHANT_MAP: Record<string, { category: string; subcategory?: string }> = {
  // Food & Dining
  swiggy: { category: "Food & Dining", subcategory: "Zomato / Swiggy" },
  zomato: { category: "Food & Dining", subcategory: "Zomato / Swiggy" },
  "chai point": { category: "Food & Dining", subcategory: "Cafes & Chai" },
  chaayos: { category: "Food & Dining", subcategory: "Cafes & Chai" },
  mcdonald: { category: "Food & Dining", subcategory: "Fast Food" },
  kfc: { category: "Food & Dining", subcategory: "Fast Food" },
  domino: { category: "Food & Dining", subcategory: "Fast Food" },
  "pizza hut": { category: "Food & Dining", subcategory: "Fast Food" },
  subway: { category: "Food & Dining", subcategory: "Fast Food" },
  starbucks: { category: "Food & Dining", subcategory: "Cafes & Chai" },
  "third wave": { category: "Food & Dining", subcategory: "Cafes & Chai" },
  haldiram: { category: "Food & Dining", subcategory: "Restaurants" },
  saravana: { category: "Food & Dining", subcategory: "Restaurants" },
  biryani: { category: "Food & Dining", subcategory: "Restaurants" },
  canteen: { category: "Food & Dining", subcategory: "Canteen" },
  mess: { category: "Food & Dining", subcategory: "Canteen" },
  dhaba: { category: "Food & Dining", subcategory: "Restaurants" },
  restaurant: { category: "Food & Dining", subcategory: "Restaurants" },
  cafe: { category: "Food & Dining", subcategory: "Cafes & Chai" },
  bakery: { category: "Food & Dining", subcategory: "Cafes & Chai" },

  // Groceries
  blinkit: { category: "Groceries", subcategory: "Zepto / Blinkit / Instamart" },
  zepto: { category: "Groceries", subcategory: "Zepto / Blinkit / Instamart" },
  instamart: { category: "Groceries", subcategory: "Zepto / Blinkit / Instamart" },
  bigbasket: { category: "Groceries", subcategory: "Supermarket" },
  bbdaily: { category: "Groceries", subcategory: "Milk & Dairy" },
  dmart: { category: "Groceries", subcategory: "Supermarket" },
  "d-mart": { category: "Groceries", subcategory: "Supermarket" },
  reliance: { category: "Groceries", subcategory: "Supermarket" },
  "nature's basket": { category: "Groceries", subcategory: "Supermarket" },
  more: { category: "Groceries", subcategory: "Supermarket" },
  kirana: { category: "Groceries", subcategory: "Kirana Store" },
  vegetable: { category: "Groceries", subcategory: "Vegetables & Fruits" },
  fruit: { category: "Groceries", subcategory: "Vegetables & Fruits" },
  dairy: { category: "Groceries", subcategory: "Milk & Dairy" },
  amul: { category: "Groceries", subcategory: "Milk & Dairy" },
  motherdairy: { category: "Groceries", subcategory: "Milk & Dairy" },
  countrydelight: { category: "Groceries", subcategory: "Milk & Dairy" },

  // Transportation
  uber: { category: "Transportation", subcategory: "Uber / Ola" },
  ola: { category: "Transportation", subcategory: "Uber / Ola" },
  rapido: { category: "Transportation", subcategory: "Auto Rickshaw" },
  "namma yatri": { category: "Transportation", subcategory: "Auto Rickshaw" },
  metro: { category: "Transportation", subcategory: "Metro / Bus Pass" },
  bmrcl: { category: "Transportation", subcategory: "Metro / Bus Pass" },
  dmrc: { category: "Transportation", subcategory: "Metro / Bus Pass" },
  irctc: { category: "Transportation", subcategory: "Train Tickets" },
  redbus: { category: "Transportation", subcategory: "Metro / Bus Pass" },
  abhibus: { category: "Transportation", subcategory: "Metro / Bus Pass" },
  "indian oil": { category: "Transportation", subcategory: "Fuel / Petrol" },
  "bharat petroleum": { category: "Transportation", subcategory: "Fuel / Petrol" },
  hpcl: { category: "Transportation", subcategory: "Fuel / Petrol" },
  shell: { category: "Transportation", subcategory: "Fuel / Petrol" },
  petrol: { category: "Transportation", subcategory: "Fuel / Petrol" },
  fuel: { category: "Transportation", subcategory: "Fuel / Petrol" },
  fastag: { category: "Transportation", subcategory: "Fuel / Petrol" },

  // Shopping & Clothing
  myntra: { category: "Shopping & Clothing", subcategory: "Clothing & Apparel" },
  amazon: { category: "Shopping & Clothing", subcategory: "Clothing & Apparel" },
  flipkart: { category: "Shopping & Clothing", subcategory: "Electronics" },
  ajio: { category: "Shopping & Clothing", subcategory: "Clothing & Apparel" },
  zara: { category: "Shopping & Clothing", subcategory: "Clothing & Apparel" },
  "h&m": { category: "Shopping & Clothing", subcategory: "Clothing & Apparel" },
  uniqlo: { category: "Shopping & Clothing", subcategory: "Clothing & Apparel" },
  nykaa: { category: "Shopping & Clothing", subcategory: "Accessories" },
  meesho: { category: "Shopping & Clothing", subcategory: "Clothing & Apparel" },
  tatacliq: { category: "Shopping & Clothing", subcategory: "Clothing & Apparel" },
  croma: { category: "Shopping & Clothing", subcategory: "Electronics" },
  "reliance digital": { category: "Shopping & Clothing", subcategory: "Electronics" },
  decathlon: { category: "Shopping & Clothing", subcategory: "Clothing & Apparel" },

  // Entertainment
  bookmyshow: { category: "Entertainment", subcategory: "Movies & Cinema" },
  pvr: { category: "Entertainment", subcategory: "Movies & Cinema" },
  inox: { category: "Entertainment", subcategory: "Movies & Cinema" },
  cinepolis: { category: "Entertainment", subcategory: "Movies & Cinema" },
  steam: { category: "Entertainment", subcategory: "Gaming" },
  playstation: { category: "Entertainment", subcategory: "Gaming" },

  // Education
  coursera: { category: "Education", subcategory: "Online Courses" },
  udemy: { category: "Education", subcategory: "Online Courses" },
  unacademy: { category: "Education", subcategory: "Online Courses" },
  "khan academy": { category: "Education", subcategory: "Online Courses" },
  bookstore: { category: "Education", subcategory: "Books & Notes" },
  stationery: { category: "Education", subcategory: "Books & Notes" },
  tuition: { category: "Education", subcategory: "Tuition & Coaching" },

  // Health & Fitness
  "cult.fit": { category: "Health & Fitness", subcategory: "Gym / Cult.fit" },
  cultfit: { category: "Health & Fitness", subcategory: "Gym / Cult.fit" },
  gym: { category: "Health & Fitness", subcategory: "Gym / Cult.fit" },
  apollo: { category: "Health & Fitness", subcategory: "Pharmacy & Medicines" },
  medplus: { category: "Health & Fitness", subcategory: "Pharmacy & Medicines" },
  "1mg": { category: "Health & Fitness", subcategory: "Pharmacy & Medicines" },
  pharmeasy: { category: "Health & Fitness", subcategory: "Pharmacy & Medicines" },
  pharmacy: { category: "Health & Fitness", subcategory: "Pharmacy & Medicines" },
  chemist: { category: "Health & Fitness", subcategory: "Pharmacy & Medicines" },
  clinic: { category: "Health & Fitness", subcategory: "Doctor Consultation" },
  hospital: { category: "Health & Fitness", subcategory: "Doctor Consultation" },

  // Personal Care
  salon: { category: "Personal Care", subcategory: "Salon & Grooming" },
  parlour: { category: "Personal Care", subcategory: "Salon & Grooming" },
  barber: { category: "Personal Care", subcategory: "Salon & Grooming" },
  enrich: { category: "Personal Care", subcategory: "Salon & Grooming" },
  "urban company": { category: "Personal Care", subcategory: "Salon & Grooming" },
  laundry: { category: "Personal Care", subcategory: "Laundry & Dry Clean" },

  // Bills & Utilities
  bescom: { category: "Bills & Utilities", subcategory: "Electricity Bill" },
  tata: { category: "Bills & Utilities", subcategory: "Electricity Bill" },
  adani: { category: "Bills & Utilities", subcategory: "Electricity Bill" },
  electricity: { category: "Bills & Utilities", subcategory: "Electricity Bill" },
  airtel: { category: "Bills & Utilities", subcategory: "Mobile Recharge" },
  jio: { category: "Bills & Utilities", subcategory: "Mobile Recharge" },
  vi: { category: "Bills & Utilities", subcategory: "Mobile Recharge" },
  vodafone: { category: "Bills & Utilities", subcategory: "Mobile Recharge" },
  broadband: { category: "Bills & Utilities", subcategory: "Wi-Fi & Broadband" },
  "act fibernet": { category: "Bills & Utilities", subcategory: "Wi-Fi & Broadband" },
  wifi: { category: "Bills & Utilities", subcategory: "Wi-Fi & Broadband" },
  cylinder: { category: "Bills & Utilities", subcategory: "LPG Gas" },
  indane: { category: "Bills & Utilities", subcategory: "LPG Gas" },
  bharatgas: { category: "Bills & Utilities", subcategory: "LPG Gas" },

  // Subscriptions
  netflix: { category: "Subscriptions", subcategory: "Streaming (Netflix/Prime)" },
  spotify: { category: "Subscriptions", subcategory: "Music (Spotify/Apple)" },
  "amazon prime": { category: "Subscriptions", subcategory: "Streaming (Netflix/Prime)" },
  hotstar: { category: "Subscriptions", subcategory: "Streaming (Netflix/Prime)" },
  sonyliv: { category: "Subscriptions", subcategory: "Streaming (Netflix/Prime)" },
  zee5: { category: "Subscriptions", subcategory: "Streaming (Netflix/Prime)" },
  youtube: { category: "Subscriptions", subcategory: "Streaming (Netflix/Prime)" },
  apple: { category: "Subscriptions", subcategory: "Software & Cloud" },
  google: { category: "Subscriptions", subcategory: "Software & Cloud" },
  chatgpt: { category: "Subscriptions", subcategory: "Software & Cloud" },
  openai: { category: "Subscriptions", subcategory: "Software & Cloud" },

  // Travel
  makemytrip: { category: "Travel", subcategory: "Flights" },
  goibibo: { category: "Travel", subcategory: "Hotels" },
  easemytrip: { category: "Travel", subcategory: "Flights" },
  cleartrip: { category: "Travel", subcategory: "Flights" },
  indigo: { category: "Travel", subcategory: "Flights" },
  "air india": { category: "Travel", subcategory: "Flights" },
  akasa: { category: "Travel", subcategory: "Flights" },
  hotel: { category: "Travel", subcategory: "Hotels" },
  resort: { category: "Travel", subcategory: "Hotels" },
  airbnb: { category: "Travel", subcategory: "Hotels" },
};

/**
 * Predicts category based on merchant name, description, and amount
 */
export function predictTransactionCategory(
  merchant: string,
  description?: string,
  amount?: number
): CategorizationResult {
  const cleanMerchant = (merchant || "").toLowerCase().trim();
  const cleanDesc = (description || "").toLowerCase().trim();
  const fullText = `${cleanMerchant} ${cleanDesc}`;

  // 1. Direct and Substring Merchant Match
  for (const [key, mapping] of Object.entries(INDIAN_MERCHANT_MAP)) {
    if (fullText.includes(key)) {
      return {
        suggestedCategory: mapping.category,
        confidence: 0.95,
        isAutoDetected: true,
        matchPattern: key,
        reason: `Recognized merchant '${merchant}' associated with ${mapping.category}`,
      };
    }
  }

  // 2. Keyword heuristic inference
  if (fullText.includes("chai") || fullText.includes("coffee") || fullText.includes("tea") || fullText.includes("food") || fullText.includes("snack") || fullText.includes("thali")) {
    return {
      suggestedCategory: "Food & Dining",
      confidence: 0.85,
      isAutoDetected: true,
      reason: "Matched food & dining keywords in transaction description",
    };
  }

  if (fullText.includes("fuel") || fullText.includes("petrol") || fullText.includes("diesel") || fullText.includes("cab") || fullText.includes("auto") || fullText.includes("toll")) {
    return {
      suggestedCategory: "Transportation",
      confidence: 0.85,
      isAutoDetected: true,
      reason: "Matched transportation/fuel keywords",
    };
  }

  if (fullText.includes("recharge") || fullText.includes("bill") || fullText.includes("power") || fullText.includes("bescom")) {
    return {
      suggestedCategory: "Bills & Utilities",
      confidence: 0.8,
      isAutoDetected: true,
      reason: "Matched utility bill keywords",
    };
  }

  if (fullText.includes("gym") || fullText.includes("med") || fullText.includes("pharma") || fullText.includes("health")) {
    return {
      suggestedCategory: "Health & Fitness",
      confidence: 0.8,
      isAutoDetected: true,
      reason: "Matched health/fitness keywords",
    };
  }

  // 3. Fallback: Miscellaneous with lower confidence
  return {
    suggestedCategory: "Miscellaneous",
    confidence: 0.4,
    isAutoDetected: false,
    reason: "New merchant, user confirmation recommended",
  };
}
