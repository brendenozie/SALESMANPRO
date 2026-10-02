# SalesmanPro AI Website Builder Integration

## 1. Architectural Architecture
The Website Builder integrates with the SalesmanPro AI engine via:
1. **Studio AI Assistant Modal (`AIAssistantModal.tsx`):** Connected to `/api/website-builder/[slug]/ai` using Google GenAI / Gemini hosted models via `@ai-sdk/google`.
2. **Schema-Constrained AI Output:** AI modifications are validated against `CompiledWebsiteConfigSchema` before being applied to working state.
3. **Credit Accounting:** AI requests debit tenant credit ledgers via `creditLedger.ts` based on token usage.
4. **Tenant Safety:** AI operations can only modify draft configurations for the authenticated tenant's company ID; they cannot modify arbitrary database tables or production storefronts without explicit approval.

---

## 2. Supported AI Operations
- **Theme Color & Typography Suggestions:** Suggests cohesive, HSL-tailored color palettes and Google Font combinations matching the store category.
- **Section Copy Generation:** Generates marketing headlines, sublines, and call-to-action button copy aligned with the business vertical.
- **SEO Title & Meta Description:** Synthesizes high-conversion meta tags based on products and store offerings.
- **New Section Formulation:** Constructs schema-compliant `PageSection` JSON ready to be prepended or appended to any page.
