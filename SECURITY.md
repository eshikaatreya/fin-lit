# SECURITY & DATA PRIVACY POLICY: FIN-LIT

Fin-Lit treats financial data security as a core product requirement, not an afterthought.

---

### 1. Zero-Credential Architecture
- **Never Request UPI PINs**: Fin-Lit never asks for, accepts, or stores UPI PINs, ATM PINs, OTPs, or NetBanking passwords.
- **No Direct App Scraping**: In compliance with Indian cyber regulations and RBI guidelines, Fin-Lit does not scrape mobile payment applications or bypass OS sandboxes.
- **Consented Integrations Only**: Integrations rely exclusively on legitimate user-provided statement exports (CSV) or authorized RBI-regulated Account Aggregator (AA) APIs.

---

### 2. Idempotency & Deduplication Protection
- Every transaction record maintains a deterministic unique `idempotencyKey` derived from:
  $$\text{hash}(userId + date + amount + merchant + referenceId)$$
- Duplicate statement uploads or repeated sync events are discarded safely without duplicate entries or distorted budget totals.

---

### 3. Strict User Data Isolation
- All tables enforce strict foreign key ownership tied to `userId`.
- Database queries across all API routes verify identity before returning or modifying financial records.
- Cross-user data contamination is mathematically impossible within the relational model.

---

### 4. AI & Cloud Privacy Safeguards
- Fin-Lit never trains shared foundation models directly on raw, private financial transactions.
- Data passed to the LLM layer is strictly sanitized and restricted to aggregated numbers (e.g., total spent on food, remaining balance).
- Personally identifiable information (PII) such as bank account numbers, physical addresses, or mobile numbers are stripped prior to external inference.

---

### 5. Vulnerability Reporting
For any security-related inquiries or vulnerability reports, contact the Fin-Lit security team at `security@finlit.in`.
