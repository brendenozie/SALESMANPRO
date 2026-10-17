# SalesmanPro — Centralized AI Action Catalog

Every AI activity across SalesmanPro has a permanent, stable `actionId`. Super Admin can reassign models, fallback chains, and credit pricing for any action from the Control Center without code deployment.

---

## Complete Action Registry Inventory

| Action ID | Display Name | Domain | Capability | Primary Model | Fallback Model | Credits | Zero-Cost Fallback | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `PRODUCT_DESCRIPTION` | eCommerce Product Copywriter | COMMERCE | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 3 | Supported | Fully Functional |
| `PRODUCT_SEO` | Search Engine Metadata Generator | COMMERCE | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 2 | Supported | Fully Functional |
| `PRODUCT_ATTRIBUTES` | Catalog Specs & Sizing Extractor | COMMERCE | TEXT | `llama-3.1-8b-instant` | `salesmanpro-deterministic-v1` | 2 | Supported | Fully Functional |
| `PRODUCT_IMAGE` | Studio Commercial Photography | MEDIA | IMAGE | `dall-e-3` | `salesmanpro-deterministic-v1` | 15 | Fallback Copy | Fully Functional |
| `COMMERCE_CATALOG_SYNC` | Catalog Moderation & Multi-Vendor Sync | COMMERCE | TEXT | `llama-3.1-8b-instant` | `salesmanpro-deterministic-v1` | 3 | Supported | Fully Functional |
| `WHATSAPP_INQUIRY` | Conversational Commerce Concierge | WHATSAPP | TEXT | `llama-3.1-8b-instant` | `salesmanpro-deterministic-v1` | 1 | Supported | Fully Functional |
| `WHATSAPP_INTENT_CLASSIFY` | Customer Message Intent Router | WHATSAPP | TEXT | `llama-3.1-8b-instant` | `salesmanpro-deterministic-v1` | 1 | Supported | Fully Functional |
| `WHATSAPP_ORDER_ASSIST` | Cart & Checkout Assistant | WHATSAPP | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 2 | Supported | Fully Functional |
| `SCHOOL_LESSON_PLAN` | Curriculum & Lesson Architect | SCHOOL | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 5 | Supported | Fully Functional |
| `SCHOOL_ASSIGNMENT` | Academic Homework & Rubrics | SCHOOL | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 4 | Supported | Fully Functional |
| `SCHOOL_QUIZ` | Interactive Assessment Generator | SCHOOL | TEXT | `llama-3.1-8b-instant` | `salesmanpro-deterministic-v1` | 3 | Supported | Fully Functional |
| `DOCUMENT_POPULATE` | Invoice & Quotation Synthesizer | DOCUMENTS | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 3 | Supported | Fully Functional |
| `DOCUMENT_EXTRACT` | Commercial Receipt OCR Extractor | DOCUMENTS | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 4 | Supported | Fully Functional |
| `MARKETING_EMAIL` | High-Converting Email Copywriter | MARKETING | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 4 | Supported | Fully Functional |
| `MARKETING_CAMPAIGN` | Promotional Campaign Strategy | MARKETING | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 5 | Supported | Fully Functional |
| `SOCIAL_POST_GEN` | Multi-Platform Social Media Copy | MARKETING | TEXT | `llama-3.1-8b-instant` | `salesmanpro-deterministic-v1` | 2 | Supported | Fully Functional |
| `MEDIA_BANNER_GEN` | Promotional Graphic Banner Generator | MEDIA | IMAGE | `dall-e-3` | `salesmanpro-deterministic-v1` | 15 | Fallback Copy | Fully Functional |
| `WORKFORCE_TASK` | Autonomous Multi-Step Staff Agent | PLATFORM | AGENT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 10 | Supported | Fully Functional |
| `BUSINESS_REPORT` | Executive Operations & Revenue Analyst | BUSINESS | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 5 | Supported | Fully Functional |
| `GENERAL_TEXT` | General AI Assistant & Copywriter | PLATFORM | TEXT | `gemini-1.5-flash` | `salesmanpro-deterministic-v1` | 2 | Supported | Fully Functional |

---

## Action Profiles & Technical Specifications

### 1. `PRODUCT_DESCRIPTION`
- **Entry Points:** `POST /api/ai/product` (`action: "DESCRIPTION"`), Product Form AI Copilot, Bulk Merchandising Jobs.
- **Input:** Product title, category, brand, comma-separated key features, target audience, tone.
- **Required Output:** Strictly valid JSON matching `{ title, tagline, shortDescription, longDescription, bulletPoints, suggestedTags }`.
- **Quality Criteria:** Catchy e-commerce title, at least 4 bullet points with emojis, zero hallucinated technical claims.
- **Zero-Cost Engine Capability:** `DeterministicProvider.generateProductDescription()` generates structured JSON containing title, tagline, descriptions, bullet points, and tags without external API keys.

### 2. `WHATSAPP_INQUIRY`
- **Entry Points:** `lib/whatsapp/ai/whatsappAI.ts` (`handleIncomingWhatsAppMessage`), Meta Webhook queue worker.
- **Input:** Incoming message, customer context, store catalog preview, recent message history.
- **Required Output:** Friendly, localized conversational response, suggested follow-up quick-reply chips.
- **Quality Criteria:** Factual pricing and stock information verified against database catalog before formulating response.
- **Zero-Cost Engine Capability:** `DeterministicProvider.generateWhatsAppReply()` provides greeting, intent routing, and store catalog pointers.

### 3. `DOCUMENT_POPULATE`
- **Entry Points:** `POST /api/documents/ai-populate`, Invoice Creation Screen, Quotation Generator.
- **Input:** Unstructured prompt or voice note (e.g., *"Invoice for ABC Ltd, 5 solar batteries at 45000 and 1 inverter for 80000, 30 days terms"*).
- **Required Output:** Strictly valid JSON matching `{ customerName, customerEmail, customerPhone, dueDate, terms, notes, items: [{ description, quantity, unitPrice, taxRate, discount }] }`.
- **Quality Criteria:** Line items correctly parsed with numerical prices and quantity.
- **Zero-Cost Engine Capability:** `DeterministicProvider.generateDocumentDetails()` extracts regex entities and line items.

### 4. `SCHOOL_LESSON_PLAN`
- **Entry Points:** `SchoolAIService.generateLessonPlan()`, Educator Dashboard.
- **Input:** Grade level, subject, topic, duration (minutes), core objectives.
- **Required Output:** Strictly valid JSON matching `{ title, subject, gradeLevel, duration, objectives, introduction, mainContent: [{ section, content, duration, teacherActivity, studentActivity }], assessment, homework, materials, teacherNotes }`.
- **Quality Criteria:** Pedagogically sound timing allocation matching total duration.
- **Zero-Cost Engine Capability:** `DeterministicProvider.generateLessonPlan()` outputs complete curriculum-aligned structure.

---

## Runtime Policy Resolution Flow

1. Caller invokes `aiService.generateText(params, context)`.
2. `aiService` inspects `context.actionId`.
3. If database table `PlatformAIServiceConfig` has an active record for `actionId`, DB policy overrides registry default.
4. If no DB record exists, fallback to `ActionRegistry.getAction(actionId)`.
5. Primary model is attempted; on connection or key failure, fallback model is attempted; on secondary failure, zero-cost deterministic engine executes.
6. Credits are finalized against the action's configured `creditCost`.
