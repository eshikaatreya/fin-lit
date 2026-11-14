# AI ARCHITECTURE: FIN-LIT
## The 5-Layer Financial Intelligence Engine

The heart of Fin-Lit is its **5-Layer Intelligence Architecture**, designed to transform raw financial transactions into continuous, personalized, and actionable guidance without ever hallucinating financial facts.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: FINANCIAL DATA                         │
│            Transactions · Income · Budgets · Subscriptions             │
│   - Unified Digital Passbook (UPI GPay, PhonePe, Paytm, BHIM, Bank)   │
│   - Statement Importer with Idempotency Key Deduplication             │
│   - Relational Data Isolation (Prisma ORM & SQLite / PostgreSQL)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Normalized Financial Inflow/Outflow
┌───────────────────────────────────▼────────────────────────────────────┐
│                  LAYER 2: FINANCIAL ANALYTICS ENGINE                   │
│   Calculations · Categorization · Forecasting · Pattern Detection      │
│   - Deterministic Financial Math: Income, Outflow, Discretionary Pool  │
│   - Spending Velocity: Daily run-rate ($₹/day) & Projected Month-End  │
│   - Indian Merchant Knowledge Base (100+ Brands Categorization)       │
│   - Category Surplus / Deficit & Mathematical Rebalance Formulation    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Authoritative Metrics & Verified Facts
┌───────────────────────────────────▼────────────────────────────────────┐
│                 LAYER 3: PERSONALIZED AI INTELLIGENCE                  │
│       User Context · Behavioural Patterns · Financial Reasoning        │
│   - Persona Contextualization (Student vs. Working Professional)       │
│   - Micro-Spending Detection (~₹120/day on tea/snacks accumulation)    │
│   - Weekend vs. Weekday Outing Spikes (+65% surge identification)      │
│   - Grounded Dual-Mode AI Advisor (Gemini 1.5 Flash + Local Fallback)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Synthesized Guidance & Decision Points
┌───────────────────────────────────▼────────────────────────────────────┐
│                 LAYER 4: ACTIONABLE RECOMMENDATIONS                    │
│      Budget Alerts · Savings Suggestions · Spending Adjustments        │
│   - Predictive Budget Warnings (50%, 75%, 90%, 100% Thresholds)        │
│   - Intelligent Budget Reallocation Proposals (Donor → Recipient)      │
│   - Purchase Affordability Evaluations ("Can I afford ₹2,500?")        │
│   - Explicit User Authorization Gateway (Never moves funds silently)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ User Decision & Preference Signals
┌───────────────────────────────────▼────────────────────────────────────┐
│                  LAYER 5: USER FEEDBACK & LEARNING                     │
│    Accepted Suggestions · Rejected Suggestions · Preference Updates     │
│   - Logs UserFeedback records (Thumbs Up / Thumbs Down / Approvals)   │
│   - Remembers manual category corrections for future auto-tagging      │
│   - Adapts future recommendation thresholds based on accepted patterns │
└────────────────────────────────────────────────────────────────────────┘
A continuous closed feedback loop improves personalization over time.
```

---

### Layer-by-Layer Technical Specification

#### Layer 1: Financial Data (`src/lib/passbook/`, `prisma/schema.prisma`)
- Captures raw transaction streams from Google Pay, PhonePe, Paytm, BHIM, NetBanking, and manual cash entries.
- **Deduplication Engine**: Uses SHA-256 idempotency hashing (`userId + date + amount + merchant + ref`) to ensure duplicate CSV uploads or webhook syncs never corrupt ledgers.

#### Layer 2: Financial Analytics Engine (`src/lib/financial-engine/`)
- Pure TypeScript, 100% deterministic calculation core.
- Calculates:
  - Total Monthly Inflow & Expenditure
  - Discretionary Budget: $\text{Income} - \text{Savings Target} - \text{Fixed Obligations}$
  - Spending Velocity: $\text{Daily Velocity} = \frac{\text{Spent}}{\text{Days Elapsed}}$
  - Projected Month-End: $\text{Spent} + (\text{Velocity} \times \text{Days Remaining})$
  - Category Surplus / Deficit variance
  - 0–100 Financial Health Score

#### Layer 3: Personalized AI Intelligence (`src/lib/ai/`)
- Couples user identity (College Student allowance vs Working Professional salary) with historical spending behavior.
- Injects strict deterministic numbers into the AI prompt to prevent mathematical hallucinations.
- Operates in **Dual-Mode**:
  - *Online*: Queries Gemini 1.5 Flash for natural, empathetic Indian conversational phrasing.
  - *Offline / Fallback*: Uses local deterministic reasoning rules with 0% downtime.

#### Layer 4: Actionable Recommendations (`src/app/budgets/reallocate/`, `src/lib/financial-engine/affordability.ts`)
- Translates analytical metrics into concrete decisions:
  - *Affordability Verdict*: Evaluates impact on remaining safe daily allowance.
  - *Budget Reallocation*: Proposes transfer from donor category (e.g. Entertainment with surplus) to deficit category (e.g. Food & Dining) with buffer preservation.
  - *Explicit User Authorization*: Per security principles, no budget reallocation executes without user click confirmation.

#### Layer 5: User Feedback & Learning (`src/app/api/recommendations/feedback/`)
- Every recommendation presents user choices (*Approve*, *Decline*, *Feedback*).
- Accepted and rejected actions are recorded in the `UserFeedback` table.
- Future suggestion thresholds adapt dynamically based on user engagement history.

