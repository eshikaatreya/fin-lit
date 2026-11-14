# API DOCUMENTATION: FIN-LIT

All endpoints return JSON responses and expect `application/json` payloads unless specified otherwise.

---

### 1. Authentication & Session

#### `GET /api/auth/me`
Retrieves the currently active authenticated user profile and list of available test personas.
- **Response**:
  ```json
  {
    "user": { "id": "...", "fullName": "Aarav Sharma", "email": "aarav.sharma@finlit.in" },
    "availableUsers": [ ... ]
  }
  ```

#### `POST /api/auth/me`
Switches the active persona for testing and sets the `finlit_user_id` session cookie.
- **Body**: `{ "userId": "..." }`

---

### 2. Dashboard

#### `GET /api/dashboard`
Aggregates high-level metrics, deterministic summaries, category breakdowns, daily spending charts, and proactive AI insights.
- **Response**:
  - `summary`: Output of `calculateFinancialSummary` (Income, Expenditure, Discretionary Pool, Velocity, Projections).
  - `categoryBreakdown`: Ranked category spending with percentages.
  - `dailySpendingChart`: Day-by-day actuals vs safe daily allowance.
  - `recentTransactions`: Latest 8 transactions.
  - `insights`: Proactive financial observations.
  - `pendingRecommendations`: Actionable budget reallocations awaiting user review.

---

### 3. Transactions & Unified Passbook

#### `GET /api/transactions`
Queries the unified transaction passbook with filters.
- **Query Parameters**:
  - `search`: Merchant, description, or reference ID filter.
  - `category`: Category name filter or `ALL`.
  - `paymentMethod`: `UPI`, `DEBIT_CARD`, `CREDIT_CARD`, `CASH`, or `ALL`.
  - `type`: `EXPENSE`, `INCOME`, or `ALL`.
  - `limit`: Number of records (default: 50).
  - `offset`: Pagination offset.

#### `POST /api/transactions`
Records a new manual transaction with AI auto-categorization and budget allocation updates.
- **Body**:
  ```json
  {
    "amount": 450,
    "type": "EXPENSE",
    "merchant": "Swiggy",
    "description": "Lunch delivery",
    "categoryId": "...",
    "paymentMethod": "UPI",
    "date": "2026-11-15"
  }
  ```

#### `POST /api/transactions/import`
Ingests a raw CSV bank or UPI statement with automatic column detection and duplicate prevention.
- **Body**: `{ "csvContent": "Date,Narration,Debit,Credit\n...", "filename": "statement.csv" }`
- **Response**: `{ "success": true, "importedCount": 12, "duplicatesCount": 2, "errors": [] }`

#### `POST /api/transactions/simulate`
Simulates a live incoming Indian UPI transaction (Swiggy, Zepto, Uber, Chai Point, etc.).

#### `DELETE /api/transactions?id=...`
Deletes a transaction and readjusts the budget allocation's spent total.

---

### 4. Budgets & Intelligent Reallocation

#### `GET /api/budgets?month=YYYY-MM`
Fetches monthly budget, allocations, category velocity, and month-end projections.

#### `POST /api/budgets`
Updates category budget allocations.

#### `GET /api/budgets/reallocate`
Analyzes category metrics and suggests optimal budget transfer from surplus donor to high-velocity deficit category.

#### `POST /api/budgets/reallocate`
Executes an approved budget reallocation.
- **Body**:
  ```json
  {
    "fromCategoryId": "...",
    "toCategoryId": "...",
    "amount": 1500,
    "reason": "Transfer from Entertainment surplus to Food & Dining",
    "recommendationId": "..."
  }
  ```

---

### 5. Fin-Lit AI Assistant

#### `POST /api/ai/chat`
Conversational endpoint grounded in verified user financial context.
- **Body**: `{ "message": "Can I afford to buy headphones for ₹3,000?" }`
- **Response**: `{ "message": { "role": "assistant", "content": "..." } }`

#### `POST /api/ai/affordability`
Evaluates an unplanned purchase amount against remaining budget and days left in the month.
- **Body**: `{ "amount": 2500 }`
- **Response**:
  ```json
  {
    "assessment": {
      "isAffordable": true,
      "verdict": "AFFORDABLE_WITH_CAUTION",
      "shortReason": "You can afford it, but it consumes 24% of your remaining budget.",
      "safeDailyBudgetRemaining": 850,
      "newDailyBudgetIfPurchased": 680
    }
  }
  ```

#### `POST /api/ai/categorize`
Real-time merchant pattern matching.
- **Body**: `{ "merchant": "Zepto", "description": "Quick grocery delivery", "amount": 420 }`
- **Response**: `{ "result": { "suggestedCategory": "Groceries", "confidence": 0.95 } }`

---

### 6. Subscriptions, Goals & Onboarding

- `GET /api/subscriptions`: Lists active recurring services, renewal countdown, and monthly cost impact.
- `POST /api/subscriptions`: Creates a tracked recurring subscription.
- `PUT /api/subscriptions`: Toggles subscription status (`ACTIVE` vs `PAUSED`).
- `GET /api/savings-goals`: Lists milestones, target amounts, and saved balances.
- `POST /api/savings-goals`: Creates a savings goal.
- `PUT /api/savings-goals`: Deposits funds into a goal.
- `POST /api/onboarding`: Submits the 5-step onboarding wizard, initializing profiles, commitments, and initial budget.
