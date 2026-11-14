# AI ARCHITECTURE: FIN-LIT
## Deterministic Grounding & Financial Intelligence Specification

Fin-Lit adopts a hybrid AI architecture that couples deterministic mathematical computation with probabilistic natural language understanding.

```
┌────────────────────────────────────────────────────────┐
│                   USER PROMPT                          │
│   "Can I afford to purchase a jacket for ₹3,500?"      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              DETERMINISTIC GROUNDING ENGINE            │
│   1. Extracts Intent: AFFORDABILITY_CHECK              │
│   2. Retrieves Actual Verified Metrics from DB:        │
│      - Total Remaining Budget: ₹14,200                 │
│      - Days Remaining in Month: 16                     │
│      - Current Safe Daily Pace: ₹887 / day             │
│      - Post-Purchase Daily Pace: ₹668 / day            │
│   3. Calculates Exact Mathematical Verdict:            │
│      - Verdict: AFFORDABLE_WITH_CAUTION                │
└───────────────────────────┬────────────────────────────┘
                            │ Grounded Fact Context
┌───────────────────────────▼────────────────────────────┐
│                 REASONING ENGINE                       │
│                                                        │
│   Mode A (Online / Gemini Key Present):                │
│   - Google Gemini 1.5 Flash generates empathetic,     │
│     structured advice grounded strictly in fact facts. │
│                                                        │
│   Mode B (Offline / Fallback):                         │
│   - Deterministic Rule-Based Reasoner generates        │
│     exact breakdown without external API call.         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    FINAL RESPONSE                      │
│   Natural language answer + Actionable Buttons         │
└────────────────────────────────────────────────────────┘
```

---

### Core Principles

1. **Zero Math Delegation**:
   An LLM should never be asked: *"What is my balance?"* or *"Calculate my velocity"*. All metrics are computed strictly in TypeScript using exact arithmetic before entering the AI context.
2. **Strict Grounding Boundaries**:
   The prompt provided to Gemini includes an authoritative `STRICT FINANCIAL GROUNDING` block containing the current numbers. The system prompt instructs the model to base its reasoning only on these provided numbers.
3. **Graceful Fallback**:
   The platform never crashes or displays broken states if an API key is missing or an external network is down. The deterministic reasoning engine handles all core queries natively.
4. **Indian Merchant Intelligence**:
   Merchant patterns are matched using an extensive Indian knowledge base (Swiggy, Zomato, Blinkit, Zepto, Uber, Ola, Rapido, Cult.fit, Chai Point, Chaayos, BESCOM, Indane, IRCTC, Myntra, etc.) before resorting to generic classification.
5. **Privacy By Design**:
   Private user credentials, UPI PINs, bank account numbers, and passwords are never collected or transmitted. Data sent to the LLM is strictly sanitized and confined to aggregate category numbers.
