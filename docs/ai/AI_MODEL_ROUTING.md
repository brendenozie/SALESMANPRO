# SalesmanPro — Dynamic Model Routing & Super Admin Control Plane

## 1. Authoritative Routing Engine Architecture

Model resolution in SalesmanPro is **100% server-side and data-driven**. No client application, mobile app, tenant dashboard, or webhook payload can dictate which model executes.

```text
Request (with actionId: "PRODUCT_DESCRIPTION")
                       │
                       ▼
       aiService.resolveActionPolicy("PRODUCT_DESCRIPTION")
                       │
                       ├─► 1. Query Database: PlatformAIServiceConfig
                       │      where serviceKey = "PRODUCT_DESCRIPTION"
                       │
                       └─► 2. If no DB record exists:
                              ActionRegistry.getAction("PRODUCT_DESCRIPTION")
                                       │
                                       ▼
                       Resolved Policy:
                       - Primary Model: gemini-2.0-flash
                       - Fallback Model: llama-3.3-70b-versatile
                       - Zero-Cost Fallback: salesmanpro-deterministic-v1
                       - Credit Cost: 2 credits
                                       │
                                       ▼
                       Execute Multi-Tier Resilient Chain:
                       Try Primary ──(fail)──► Try Fallback ──(fail)──► Try Deterministic
```

---

## 2. Supported Provider Adapters

| Provider Enum | Adapter Class | Credential Storage | Health Check Endpoint | Supported Models |
| :--- | :--- | :--- | :--- | :--- |
| `CUSTOM` | `DeterministicAIProvider` | None (Local execution) | Always Healthy | `salesmanpro-deterministic-v1` |
| `GEMINI` | `CentralGeminiProvider` | Encrypted AES-256 DB / `GOOGLE_GENAI_API_KEY` | `GET /v1beta/models` | `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro` |
| `GROQ` | `CentralGroqProvider` | Encrypted AES-256 DB / `GROQ_API_KEY` | `GET /openai/v1/models` | `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768` |
| `OPENAI` | `CentralOpenAIProvider` | Encrypted AES-256 DB / `OPENAI_API_KEY` | `GET /v1/models` | `gpt-4o-mini`, `gpt-4o`, `dall-e-3`, `dall-e-2` |

---

## 3. Dynamic Model Reassignment Without Code Deploy

Super Admin can change model assignments instantly from the UI at `/admin/ai` (Tab: "Capability & Service Routing"):

1. **Select Business Action:** Filter by Domain (`COMMERCE`, `WHATSAPP`, `SCHOOL`, `DOCUMENTS`, `MARKETING`, `MEDIA`).
2. **Choose Primary Model:** Select any registered model or `salesmanpro-deterministic-v1`.
3. **Choose Fallback Model:** Select any fallback model.
4. **Adjust Credit Cost:** Modify credits charged per call.
5. **Toggle Active / Disabled:** Instantly turn features on or off.
6. **Save Policy:** Issues `POST /api/super-admin/ai/config` which upserts `PlatformAIServiceConfig` in Prisma.

Subsequent user requests immediately read the new policy with **zero application downtime or rebuilds**.

---

## 4. Multi-Tier Resilient Fallback Mechanics

When a primary model fails due to:
- Expired / suspended API key
- Rate limit (HTTP 429)
- Provider network timeout
- Malformed provider response

The execution engine:
1. Logs a non-fatal warning: `[AI_PROVIDER_WARN] Provider <X> execution error: ...`
2. Dispatches to the authorized Fallback Model.
3. If the fallback model also fails or has no key, dispatches to `salesmanpro-deterministic-v1`.
4. Successfully completes the user's action with valid structured data.
5. Records the fallback incident in `PlatformAIAuditLog` for Super Admin review.
