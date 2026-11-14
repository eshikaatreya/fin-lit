# Fin-Lit 🪙
### AI-Powered Personal Financial Management & Intelligence Platform

> **"Understand your money. Control your spending. Build your financial future."**

Fin-Lit is an intelligent, scalable, production-grade personal financial management platform built specifically for the Indian market. It bridges the gap between raw expense tracking and proactive financial advisory by combining a deterministic financial analytics engine, unified digital passbook for UPI transactions, intelligent budget management, and a context-grounded AI financial assistant.

---

## 🌟 Key Product Pillars

1. **Deterministic Financial Engine**: Pure mathematical precision for balance calculations, velocity metrics, month-end spending projections, and affordability analysis. Never delegates arithmetic to an LLM.
2. **Unified Digital Passbook (My Transactions)**: Consolidated feed for Google Pay, PhonePe, Paytm, BHIM, bank accounts, and cash with real-time idempotency key deduplication.
3. **Intelligent Budget Management**: Real-time spending velocity tracking with healthy, approaching limit, and exceeded indicators.
4. **AI-Driven Budget Reallocation**: Detects category budget imbalances and proposes mathematically safe transfers from donor categories with explicit user confirmation.
5. **Fin-Lit AI Assistant**: Dual-mode conversational intelligence (Gemini 1.5 Flash + deterministic reasoning fallback) answering questions like *"Can I afford ₹2,500?"*, *"How much did I spend on food?"*, and *"How much can I safely spend this week?"*.
6. **5-Step Onboarding**: Deep financial profiling distinguishing **College Students** (allowance, canteen, hostel mess) and **Working Professionals** (salary, rent, investments, recurring commitments).
7. **Subscription Portfolio**: Tracks recurring services (Netflix, Spotify, Cult.fit, Prime, ChatGPT) with renewal alerts and optimization suggestions.
8. **Savings Goals Tracker**: Milestone-driven progress tracking for Emergency Reserves, Gadgets, Travel, and Wealth creation.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/fin-lit.git
cd fin-lit

# Install dependencies
npm install

# Push database schema & generate Prisma client
npm run db:push

# Seed realistic Indian personas (Aarav Sharma & Priya Patel)
npm run db:seed
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLite or PostgreSQL connection string | `"file:./dev.db"` |
| `GEMINI_API_KEY` | Optional: Google Gemini API Key for live LLM chat | `""` (falls back to local deterministic reasoning engine) |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Currency representation | `"INR"` |

### 4. Running Locally
```bash
# Start development server
npm run dev

# Or build and launch production server
npm run build
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Running Automated Tests
```bash
npm test
```
Executes the comprehensive automated quality assurance test suite (calculation engine, budget reallocation, affordability thresholds, merchant categorizer, statement deduplication).

---

## 👥 Seed Personas for Testing

You can seamlessly switch personas directly from the top navigation bar dropdown:

- **Aarav Sharma** (Working Professional)
  - Role: Software Engineer at Fintech Labs, Bengaluru
  - Income: ₹85,000 take-home salary + ₹8,000 freelance
  - Fixed Commitments: Rent ₹24,000, Broadband, Electricity, Cult.fit gym
  - Subscriptions: Netflix, Spotify Duo, Cult.fit, ChatGPT Plus
  - Budget status: Food & Dining approaching limit (87%), Entertainment has healthy surplus (triggering AI reallocation proposal!).
- **Priya Patel** (College Student)
  - Role: Engineering Student at Pune University
  - Income: ₹12,000 monthly allowance
  - Fixed Commitments: Hostel Mess dues ₹3,500, Jio 5G Recharge ₹299
  - Savings Goal: Goa Semester-End Trip (₹15,000 target)

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling & UI**: Tailwind CSS, Lucide Icons, Custom Sleek Components
- **ORM & Database**: Prisma ORM, SQLite (`dev.db` for zero-config local run) / PostgreSQL ready
- **Financial Engine**: Deterministic TypeScript Calculation Core (`src/lib/financial-engine/`)
- **AI & ML**: Google Gemini API client with deterministic contextual grounding and fallback

---

## 📂 Project Documentation Links

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md): Comprehensive functional specification & design principles
- [ARCHITECTURE.md](./ARCHITECTURE.md): Multi-layered technical architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md): Complete entity relationship model
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md): Complete REST endpoint documentation
- [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md): Deterministic grounding & AI reasoning specification
- [SECURITY.md](./SECURITY.md): Privacy, UPI safety, and financial security policies
- [CONTRIBUTING.md](./CONTRIBUTING.md): Developer guide & code standards
- [CHANGELOG.md](./CHANGELOG.md): Version history and milestones

---

## 📜 License

MIT License &copy; 2026 Fin-Lit Team.
