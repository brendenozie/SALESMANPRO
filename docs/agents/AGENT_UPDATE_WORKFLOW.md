# SalesmanPro — Agent Workspace Fast Update & Synchronization Workflow

> **Purpose:** Standard Operating Procedure for Engineers & Autonomous AI Agents  
> **Target:** Synchronizing Admin Feature Modifications with Agent Workspaces without Full-Codebase Rescanning  
> **Source of Truth:** [`docs/architecture/feature-map.json`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/docs/architecture/feature-map.json)  
> **Verification Commands:** `npm run test:agent-drift` & `npm run test:agent-matrix`  

---

## 1. Context Compression Principle for AI Agents

**DO NOT RESCAN THE REPOSITORY.**

Whenever you are asked to review, modify, or add features affecting staff, agents, POS, or admin pages, follow this navigation chain directly:

```text
1. Read docs/ARCHITECTURE_MAP.md (Section 18: Feature-to-Code Index)
2. Read docs/agents/AGENT_ARCHITECTURE.md
3. Read docs/architecture/feature-map.json
4. Identify Changed Admin Feature ID
5. Inspect Only Affected Implementation
6. Update Feature Registry if Required
7. Run Verification Test Suite
```

---

## 2. The 12-Step Feature Impact Workflow

When an Admin page or business service changes, execute the following steps in sequence:

```text
ADMIN FEATURE CHANGED
        ↓
[1] Identify Feature ID
        ↓
[2] Look up in feature-map.json
        ↓
[3] Is "adminOnly" === true?
    ├── YES → STOP. Document: "Agent Support: NOT APPLICABLE". No UI changes needed.
    └── NO  → Proceed to Step 4.
        ↓
[4] Check Supported Categories (e.g. ecommerce, services, fitness, restaurant)
        ↓
[5] Check Allowed Roles (e.g. SALES_AGENT, SERVICE_AGENT, CASHIER, STAFF)
        ↓
[6] Check Associated POS Dependency (e.g. StorePOS, ServicePOS, FitnessPOS)
        ↓
[7] Check Existing Agent Route (/agents/{slug}/[section])
    ├── Route Missing → Create app/agents/[slug]/[section]/page.tsx
    └── Route Exists  → Inspect and update existing operational component
        ↓
[8] Check Shared API & Service (Reuse canonical service; NEVER duplicate business logic)
        ↓
[9] Enforce Server-Side Guard in page layout (assertAgentRouteAccess)
        ↓
[10] Verify Dynamic Navigation in AgentNav.tsx (Auto-generated from feature registry)
        ↓
[11] Run Automated Test Suite:
     npm run test:agent-drift
     npm run test:agent-matrix
        ↓
[12] Record Change in docs/architecture/ADMIN_AGENT_FEATURE_MAP.md
```

---

## 3. Change Impact Record Template

When opening a Pull Request or completing a task involving agent-facing features, attach this Change Impact Record:

```markdown
### Agent Feature Impact Record
- **Feature ID:** `commerce.orders`
- **Admin Route:** `/admin/{slug}/orders`
- **Agent Route:** `/agents/{slug}/orders`
- **Affected Categories:** `["ecommerce", "retail", "automotive", "restaurant"]`
- **Allowed Roles:** `["MANAGER", "SALES_AGENT", "CASHIER", "STAFF"]`
- **Capabilities & Permissions:** `["orders.view", "orders.create", "orders.update"]`
- **Associated POS:** `StorePOS` (`/admin/{slug}/storepos`)
- **API Endpoint:** `/api/admin/orders`
- **Canonical Business Service:** `lib/orders/centralizedCreateOrder.ts`
- **Prisma Data Models:** `CustomerOrder`, `OrderItem`, `PaymentTransaction`
- **Agent UI Component:** `app/agents/[slug]/orders/AgentOrdersClient.tsx`
- **Verification Tests Executed:** `npm run test:agent-drift`, `npm run test:agent-matrix`
```

---

## 4. Common Antipatterns (Strictly Forbidden)

| Antipattern | Why It Fails | Correct Solution |
| :--- | :--- | :--- |
| **Copying Admin Pages into Agent Area** | Bloats Agent UI with settings, tax configs, and financial reconciliations. | Build a focused operational client component that handles only daily tasks. |
| **Duplicate Business Services** | Creating `AgentOrderService` causes checkout discrepancies and inventory desync. | Always import canonical services from `lib/orders/`, `lib/payments/`, etc. |
| **Client-Only Permission Hiding** | Users can type the URL directly in the browser address bar. | Enforce server-side guard `assertAgentRouteAccess(slug, section)` on every route. |
| **Hardcoding POS URLs** | Directing a salon technician or gym trainer to `StorePOS` breaks checkout. | Call `getPOSRouteForCategory(category, slug)` to resolve the correct terminal dynamically. |
| **Hardcoding Mock ObjectIds** | Using static IDs like `"63f7c9e2..."` breaks multi-tenant database isolation. | Resolve `companyId` and `agentId` strictly from the authenticated NextAuth session context. |
