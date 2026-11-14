# PROJECT OVERVIEW: FIN-LIT
## AI-Powered Personal Financial Management & Intelligence Platform

### 1. Vision & Executive Summary

Most existing expense trackers are passive ledgers: they require manual logging, present raw bar charts, and fail to answer the critical questions an individual has about their financial future. 

**Fin-Lit** transforms personal finance into an intelligent, proactive partner. Designed specifically for India's digital payments revolution (powered by UPI, digital wallets, and mobile banking), Fin-Lit continuously interprets financial behavior, protects savings goals, forecasts month-end spending velocity, and offers clear, actionable recommendations.

### 2. Core Questions Answered by Fin-Lit

1. **How much money do I currently have?**
   - Real-time aggregation of net monthly inflow, discretionary reserves, and planned commitments.
2. **Where is my money going?**
   - Deep categorization across 12 standardized Indian spending categories with micro-spending detection (e.g. ₹120/day on tea/quick snacks).
3. **Am I spending within my budget?**
   - Spending velocity metrics comparing daily actuals against safe run-rates.
4. **Where should I reduce or increase my spending?**
   - Clear identification of surplus vs deficit categories with one-click intelligent budget reallocation.
5. **How can I save more without compromising my lifestyle?**
   - Subscription optimization, milestone tracking, and instant purchase affordability assessments.

---

### 3. Key Feature Specifications

#### A. Comprehensive Onboarding & Financial Profiling
- **Step 1: Personal Profile**: Name, age, email, mobile, currency (`₹ INR`), experience level.
- **Step 2: Dual Persona Classification**:
  - *Student*: Allowance, funding source (parents, scholarship, part-time), hostel accommodation status, canteen meals.
  - *Working Professional*: Take-home salary, bonus/freelance income, employment type, fixed commitments (rent, EMIs).
- **Step 3: Savings Target**: Percentage (e.g. 20%), fixed amount, or flexible target linked to goals (Emergency, Travel, Gadgets).
- **Step 4: Recurring Commitments**: Pre-allocates funds for rent, Wi-Fi, electricity, mobile recharges, and subscriptions.
- **Step 5: Initial Budget Allocator**: Generates customized category allocations based on occupation benchmarks (e.g. higher food/canteen ratio for students, higher utility/rent ratio for professionals).

#### B. Unified Digital Passbook (My Transactions)
- Unified ledger consolidating transactions from Google Pay, PhonePe, Paytm, BHIM, Bank Transfers, and Cash.
- **Deduplication Engine**: Generates unique idempotency keys using `(userId + date + amount + merchant + ref)` to prevent duplicate imports.
- **CSV Statement Parser**: Ingests bank and UPI statement exports with automatic column detection (Date, Narration, Debit, Credit).
- **Simulated UPI Stream**: Built-in generator creating realistic Indian merchant payments for real-time demoing.

#### C. Intelligent Budget & Reallocation Management
- **Progress Tracking**: Clear progress bars with accessibility labels (Healthy, Approaching Limit, Exceeded).
- **Spending Velocity**: `Daily Velocity = Total Spent / Days Passed`, `Projected Month-End = Spent + (Velocity * Days Remaining)`.
- **Intelligent Reallocation**: Automatically detects when Category A (e.g. Food) is in deficit while Category B (e.g. Entertainment) holds a verified surplus. Computes safe transfer amounts and requires explicit user authorization before altering allocations.

#### D. Fin-Lit AI Assistant
- Dual-mode conversational advisor grounded in deterministic database calculations.
- Capabilities:
  - Natural language queries (*"How much did I spend today?"*, *"How much did I spend on food?"*).
  - Instant purchase affordability check (*"Can I afford to purchase something worth ₹2,500?"*).
  - Interactive budget reallocation proposals with inline confirmation.
  - Safe daily spending limit calculation (*"How much can I safely spend this week?"*).

#### E. Subscriptions & Savings Goals
- Active renewal tracking for Netflix, Spotify, Amazon Prime, Cult.fit, ChatGPT, etc.
- Renewal countdowns and monthly budget impact.
- Dedicated savings goals with milestone progress bars and deposits.
