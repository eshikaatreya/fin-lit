# TECHNICAL ARCHITECTURE: FIN-LIT

Fin-Lit adopts a clean, layered architecture separating user interface presentation, deterministic financial logic, and artificial intelligence reasoning.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│   Next.js 14 App Router, React 18, Tailwind CSS, Lucide Icons         │
│   Dashboard, Passbook, Budgets, Fin-Lit AI, Subscriptions, Goals       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
┌───────────────────────────────────▼────────────────────────────────────┐
│                           API GATEWAY / ROUTERS                        │
│   /api/dashboard, /api/transactions, /api/budgets, /api/ai/chat        │
│   /api/subscriptions, /api/savings-goals, /api/onboarding              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         │                                                     │
┌────────▼─────────────────────────┐         ┌────────────────▼─────────┐
│ DETERMINISTIC FINANCIAL ENGINE   │         │       AI REASONING       │
│ - calculator.ts (Pace, Velocity) │         │ - categorizer.ts (Merch) │
│ - reallocator.ts (Transfer Math) │         │ - assistant.ts (Gemini)  │
│ - affordability.ts (Afford Eval) │         │ - insights-generator.ts  │
└────────────────┬─────────────────┘         └────────────────┬─────────┘
                 │                                            │
                 └──────────────────────────┬─────────────────┘
                                            │
┌───────────────────────────────────────────▼────────────────────────────┐
│                             DATA ACCESS                                │
│   Prisma ORM (5.22.0)                                                  │
│   SQLite (`dev.db` for local zero-config) / PostgreSQL Production      │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Layer 1: Presentation & Design System
- Built with **Next.js 14 App Router** and **Tailwind CSS**.
- Theme tokens:
  - Primary Background: Deep Navy (`#0B132B`, `#070D1F`)
  - Accent Primary: Emerald Green (`#10B981`)
  - Accent Secondary: Soft Mint (`#6EE7B7`)
  - Dark and Light mode support with CSS variables.
- Component modularity: Each major user action (e.g., adding transactions, approving budget reallocations, running affordability checks) is encapsulated in typed reusable components.

### Layer 2: Deterministic Financial Engine (`src/lib/financial-engine/`)
Per Specification Section 16, **financial calculations must be deterministic and never delegated to an LLM**.
- `calculator.ts`: Computes total inflow, expenditure, discretionary pool, daily spending velocity, projected month-end spend, and financial health score (0-100).
- `reallocator.ts`: Evaluates category variances, identifies safe donor candidates with verified surpluses, and computes safe transfer proposals.
- `affordability.ts`: Evaluates potential purchases against remaining budget, days left, and post-purchase daily spending allowances.

### Layer 3: AI Intelligence Engine (`src/lib/ai/`)
- `categorizer.ts`: Pattern-matches over 100 Indian merchants (Swiggy, Zepto, Uber, Cult.fit, Chai Point, BESCOM, etc.) and infers category with confidence scores.
- `assistant.ts`: Dual-mode conversational advisor. If `GEMINI_API_KEY` is present, queries Gemini 1.5 Flash grounded strictly with calculated financial facts. If unset, utilizes built-in deterministic reasoning logic with zero downtime.
- `insights-generator.ts`: Periodically inspects transaction patterns to surface micro-spending trends, weekend spending spikes, and subscription optimizations.

### Layer 4: Data Layer
- **Prisma ORM** provides type-safe database queries.
- SQLite (`dev.db`) is configured for zero-dependency local setup.
- Schema is designed for seamless switching to PostgreSQL in production environments with no code changes.
