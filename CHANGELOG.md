# CHANGELOG: FIN-LIT

All notable changes to this project will be documented in this file.

---

## [1.0.0] - 2026-11-14

### Initial Production MVP Release

#### Architecture & Core Engine
- **Deterministic Financial Calculation Engine** (`src/lib/financial-engine/calculator.ts`): Accurate computation of income, expenses, discretionary budget, daily spending velocity, month-end projected spending, and 0-100 financial health scores.
- **Intelligent Budget Reallocation Engine** (`src/lib/financial-engine/reallocator.ts`): Imbalance detection, donor surplus identification, and safe transfer recommendations requiring user approval.
- **Affordability Engine** (`src/lib/financial-engine/affordability.ts`): Evaluates purchase amounts against discretionary balances, days left, and impact on future daily spending allowance.

#### AI & Natural Language
- **Fin-Lit AI Assistant** (`src/app/ai-assistant/page.tsx` & `src/lib/ai/assistant.ts`): Dual-mode conversational advisor supporting Gemini 1.5 Flash and local deterministic reasoning fallback.
- **Indian Merchant Categorizer** (`src/lib/ai/categorizer.ts`): Knowledge base matching over 100 Indian brands (Swiggy, Zepto, Uber, Cult.fit, Chai Point, BESCOM, etc.).
- **Proactive Insights Engine** (`src/lib/ai/insights-generator.ts`): Micro-spending detection, weekend vs weekday patterns, and subscription optimization.

#### Features & User Experience
- **5-Step Onboarding Wizard** (`src/app/onboarding/page.tsx`): Specialized question paths for Students vs Working Professionals.
- **Financial Command Centre Dashboard** (`src/app/page.tsx`): Primary overview cards, daily velocity bar chart, category distribution, recent transactions, and AI insights.
- **Unified Digital Passbook** (`src/app/transactions/page.tsx`): Consolidated feed for Google Pay, PhonePe, Paytm, BHIM, cash, and bank accounts with search, filters, live UPI simulation, and CSV statement importer with idempotency deduplication.
- **Intelligent Budget Management** (`src/app/budgets/page.tsx`): Category limits, progress bars, velocity metrics, and one-click budget reallocation.
- **Subscription Management** (`src/app/subscriptions/page.tsx`): Recurring services tracker with renewal countdowns.
- **Savings Goals** (`src/app/savings-goals/page.tsx`): Milestone tracking with progress bars and deposits.
- **Automated Test Suite** (`scripts/test-runner.mjs`): 29 automated tests verifying mathematical accuracy, reallocation logic, affordability, and deduplication.
- **Rich Seed Personas** (`scripts/seed.mjs`): Aarav Sharma (Software Engineer) and Priya Patel (College Student) with full transaction history and budget configurations.
