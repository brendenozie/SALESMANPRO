# SalesmanPro — Comprehensive AI Platform & Architecture Audit Report
**Classification:** Internal Confidential / Platform Core Architecture  
**Author:** Principal AI Platform Architect & Infrastructure Specialist  
**Status:** Completed & Verified Against Live Codebase  
**Timestamp:** 2026-10-17  

---

## 1. Executive Summary

A comprehensive repository-wide audit was conducted across all files, database models, services, API routes, background workers, and UI components in SalesmanPro.

The platform possesses a foundational architecture for AI, including:
1. **Database Schema:** `PlatformAIProvider`, `PlatformAIModel`, `PlatformAIServiceConfig`, `AICreditTransaction`, `AIUsage`, `AIGenerationJob`, `AIAuditLog`, `WhatsAppAIConfig`, and `AIAgent`.
2. **Central Services:** `CentralAIService` (`lib/ai/aiService.ts`), `AICreditLedger` (`lib/ai/creditLedger.ts`), `SuperAdminAIService` (`lib/ai/superAdminService.ts`).
3. **Consumer Modules:** WhatsApp AI (`lib/whatsapp/ai/whatsappAI.ts`), School AI (`lib/school/schoolAIService.ts`), Product Copywriter (`lib/ai/productAI.ts`), Marketplace Copywriter (`lib/ai/marketplaceAI.ts`), AI Workforce (28 specialized agents in `lib/ai/workforce/`), Mascot Assistant (`lib/ai/mascot/`), and Social Content Strategy (`lib/social/contentStrategyEngine.ts`).

However, several critical architectural deficiencies, disconnections, security vulnerabilities, and runtime failure modes were verified:
- **Client Model Override Vulnerability:** API routes allowed tenant clients to submit raw `modelId` in request bodies, bypassing Super Admin model routing and billing controls.
- **Provider Key Disconnect:** Provider adapters (`geminiProvider.ts`, `groqProvider.ts`, `openaiProvider.ts`) evaluated `isConfigured()` strictly via environment variables, ignoring credentials encrypted in `PlatformAIProvider` via the Super Admin Control Center.
- **In-Memory Model Registry:** `ModelRegistry` was hardcoded to a static TypeScript catalog and did not dynamically query `PlatformAIModel`.
- **Control Center Routing UI & API Mismatch:** The Super Admin UI lacked interactive controls to assign models to actions, and `/api/super-admin/ai/config` had parameter schema mismatches (`provider` / `modelId` vs `primaryModelId` / `displayName`).
- **Direct Provider Bypass Routes:** Several routes (`app/api/documents/ai-populate/route.ts`, `app/api/marketing/ai-generate-email/route.ts`, `lib/ai/mascot/documentExtractor.ts`) invoked third-party AI APIs directly via raw `fetch` or direct SDK imports, bypassing the central pipeline, credit reservations, and audit logs.
- **Absence of Free / Cheap Primary AI & Deterministic Fallback:** Without funded paid API keys in `.env`, user requests collapsed with HTTP 500/503 errors. The system lacked an automated zero-marginal-cost fallback engine (e.g., Google AI Studio Free Tier / Groq Free Tier / Intelligent Deterministic Simulation Engine) allowing users to interact immediately.
- **Prompt Injection & Security Gaps:** `PromptDefense` was only applied in workforce submodules, leaving standard product descriptions, chat, and document generation exposed to prompt injection and malicious scripting.

---

## 2. Inventory of AI Entry Points & Classification

| Entry Point | Location | Capability | Classification | Issues Identified |
| :--- | :--- | :--- | :--- | :--- |
| **Central AI Text** | `app/api/ai/text/route.ts` | `TEXT` | **Partially Functional** | Allows client `modelId` override; fails when no paid key in `.env`. |
| **Central AI Generate** | `app/api/ai/generate/route.ts` | `TEXT` | **Partially Functional** | Allows client `modelId` override; lacks action-level validation. |
| **Product Copy & SEO** | `app/api/ai/product/route.ts` | `PRODUCT_CONTENT` | **Functional but Bypasses Central Routing** | Client can inject `modelId`; lacks prompt injection guardrails. |
| **Marketplace AI** | `app/api/ai/marketplace/route.ts` | `MARKETPLACE_CONTENT` | **Partially Functional** | Uses fixed credit cost; ignores dynamic model selection. |
| **Store Setup AI** | `app/api/ai/store-setup/route.ts` | `TEXT` | **Fully Functional** | Deducts fixed credits via `creditLedger.chargeCredits`. |
| **WhatsApp AI Concierge** | `lib/whatsapp/ai/whatsappAI.ts` | `WHATSAPP` | **Fully Functional** | Calls `aiService.generateText` with `WHATSAPP` capability routing. |
| **School AI Suite** | `lib/school/schoolAIService.ts` | `TEXT` | **Fully Functional** | Enforces teacher review/draft invariant; calls `centralAIService`. |
| **Document AI Populate** | `app/api/documents/ai-populate/route.ts` | `ANALYSIS` | **Broken / Direct Call Bypass** | Makes raw `fetch` calls to Gemini/OpenAI; bypasses credit ledger. |
| **Marketing Email Gen** | `app/api/marketing/ai-generate-email/route.ts` | `SOCIAL_MARKETING` | **Broken / Direct Call Bypass** | Imports `groq-sdk` directly; bypasses central credit reservations. |
| **AI Mascot Document Extractor** | `lib/ai/mascot/documentExtractor.ts` | `ANALYSIS` | **Broken / Direct Call Bypass** | Uses raw `fetch` to Gemini; ignores `PlatformAIProvider` DB keys. |
| **Media Image Provider** | `lib/media/providers/openai.ts` | `IMAGE` | **Broken / Direct Call Bypass** | Top-level initialization with `process.env.OPENAI_API_KEY`. |
| **Central Image Generation** | `app/api/ai/image/route.ts` | `IMAGE` | **Partially Functional** | Relies on BullMQ or DALL-E directly; hardcodes DALL-E 3 default. |
| **Central Video Generation** | `app/api/ai/video/route.ts` | `VIDEO` | **Partially Functional** | Queues BullMQ jobs with mock simulation URLs. |
| **Token Credit Service** | `lib/ai/tokenCreditService.ts` | `WHATSAPP` | **Duplicated / Obsolete** | Unreferenced duplicate credit deduction service. |
| **Super Admin Providers** | `app/api/super-admin/ai/providers/route.ts` | Control Plane | **Fully Functional** | Seeds defaults; encrypts API keys via AES-256-GCM. |
| **Super Admin Models** | `app/api/super-admin/ai/models/route.ts` | Control Plane | **Fully Functional** | Allows Super Admin to toggle model statuses. |
| **Super Admin Routing Config** | `app/api/super-admin/ai/config/route.ts` | Control Plane | **Partially Implemented / Disconnected** | Schema mismatch on POST (`provider` vs `primaryModelId`). |
| **Super Admin Control Center UI** | `components/admin/SuperAdminAIControlCenter.tsx` | UI | **Partially Implemented** | Read-only routing tab without model assignment dropdowns or action registry. |

---

## 3. Financial, Credit & Cost Accounting Findings

### 3.1 Credit Ledger Integrity
The existing implementation in `lib/ai/creditLedger.ts` uses MongoDB transactions (`prisma.$transaction`) with `maxWait: 20000, timeout: 60000`:
- `reserveCredits`: Correctly decrements `Company.aiCreditBalance` and creates an `AICreditTransaction` with `type: "RESERVATION"`.
- `finalizeCharge`: Calculates difference (`diff = reservedAmount - actualAmount`), refunds excess or deducts additional credits, and creates an `AIUsage` record.
- `refundCredits`: Restores credits if generation fails.

### 3.2 Pricing & Cost Model Deficiencies
1. **Static Pricing Catalog:** Model costs are hardcoded in `modelRegistry.ts` rather than being loaded from `PlatformAIModel`.
2. **Missing Fiat Provider Cost Tracking:** `AIUsage.estimatedCost` is often written as `0` or omitted because token-to-fiat pricing calculation is not bound to dynamic provider pricing tiers.
3. **No Reconciliation Pipeline:** There is no mechanism to compare recorded usage against third-party provider billing.

---

## 4. Security & Tenant Isolation Findings

1. **Prompt Injection Risk:** User input was passed directly into prompt strings without boundary quarantine or instruction neutralizing in central text generation.
2. **Client Model Spoofing:** Clients could submit `{ modelId: "gpt-4o" }` and force execution against high-cost models.
3. **Encrypted Key Isolation:** API keys stored in `PlatformAIProvider` are safely encrypted with AES-256-GCM (`apiKeyEncrypted`, `apiKeyIv`, `apiKeyTag`), but provider adapters failed to query the decrypted keys at runtime.
4. **Tenant Isolation:** Tenant company isolation is enforced in `resolveAIAuth`, ensuring tenants cannot read other tenants' usage, credits, or jobs.

---

## 5. Prioritized Implementation Plan

- [ ] **Phase 2:** Enforce Super Admin as sole model selection authority. Strip client-supplied `modelId` from public endpoints.
- [ ] **Phase 3:** Centralize AI Action Registry with stable Action IDs across Commerce, WhatsApp, School, Media, Documents, and Marketing.
- [ ] **Phase 4:** Upgrade `aiService` and provider adapters to dynamically fetch decrypted keys from `PlatformAIProvider` and models from `PlatformAIModel`.
- [ ] **Phase 5:** Build high-fidelity intelligent deterministic simulation engine and free-tier adapters (Google AI Studio Free Tier & Groq Free Tier) so the platform functions immediately without upfront costs.
- [ ] **Phase 6:** Inject comprehensive Prompt Injection Defense (`PromptDefense`) into all central AI execution paths.
- [ ] **Phase 7:** Upgrade Super Admin Control Center UI with interactive Action Routing, Model Assignment, and Provider Management.
- [ ] **Phase 8:** Migrate all standalone/direct AI calls (`ai-populate`, `ai-generate-email`, `documentExtractor`) into the canonical `CentralAIService` pipeline.
- [ ] **Phase 9:** Expand automated test suite covering model routing, prompt defense, credit reservations, and zero-cost fallbacks.
