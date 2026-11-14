# CONTRIBUTING TO FIN-LIT

Thank you for your interest in contributing to Fin-Lit!

---

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/fin-lit.git
   cd fin-lit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Database initialization**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Run the test suite**:
   ```bash
   npm test
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

---

### Code Standards

- **TypeScript Strictness**: Always use explicit TypeScript types for data structures, financial calculations, and API contracts.
- **Deterministic Math**: Core financial logic must reside in `src/lib/financial-engine/` and be 100% deterministic with unit test coverage.
- **Indian Financial Conventions**: Use `₹` / INR formatting with Indian numbering separators (Lakhs and Crores).
- **Zero Hallucination AI**: Any AI interactions must be grounded in verified numbers from the deterministic calculator.
- **PR Verification**: Ensure `npm test` and `npm run build` both succeed with zero errors before opening a pull request.
