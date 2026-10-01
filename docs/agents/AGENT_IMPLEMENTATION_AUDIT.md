# SalesmanPro — Agent Workspace Implementation & Architectural Audit

> **Audit Type:** Full Subsystem Review, Architectural Hardening & Admin-Agent Synchronization  
> **Conducted By:** Product Architect + Senior Full-Stack Engineering Agent  
> **Date:** 2026-10-01  
> **Status:** Completed & Verified  

---

## 1. Executive Summary

A comprehensive architectural audit and refactoring of the SalesmanPro staff and sales agent operational experience was conducted. Previously, the agent application suffered from:
1. **Route Drift & Inconsistent Prefixes:** Code was split between legacy `/app/agent/[slug]` and middleware expectations for `/agents/[slug]`.
2. **Hardcoded Mock Identifiers:** Legacy screens referenced ancient, static Mongo ObjectIds (`63f7c9e2d91b1b2a5e80b016`) instead of resolving authenticated session tenancy.
3. **Authentication Disconnect:** The 6-digit staff login code flow failed to eagerly load company relations for `salesAgent` and `staffProfile`, leaving session tokens without `companyId`.
4. **Missing Category & POS Awareness:** POS links were hardcoded, routing service and fitness personnel to standard retail store registers.
5. **No Centralized Feature Mapping:** When new Admin features were added, there was no persistent registry to determine whether agent support was needed, resulting in manual guesswork and rescanning.

All identified deficiencies have been architecturally resolved, implemented, and verified via automated test suites.

---

## 2. Inventory of Agent Routes

### Canonical Active Routes (`/app/agents/[slug]/*`)

| Route Path | Description | Access Control / Gated Capabilities | Category Scope |
| :--- | :--- | :--- | :--- |
| `/agents/{slug}/dashboard` | Real-time operational cockpit & KPI bento | Authenticated Staff / All Roles | All Categories |
| `/agents/{slug}/pos` | Shift status & category-specific POS launcher | `pos.access`, `pos.open_session` | All Categories |
| `/agents/{slug}/orders` | Scoped orders list, fulfillment & status inspector | `orders.view`, `orders.create` | Ecommerce, Retail, Automotive, Restaurant |
| `/agents/{slug}/customers` | Customer lookup, contact card & rapid checkout | `customers.view`, `customers.create` | All Categories |
| `/agents/{slug}/sales` | Personal shift register history & receipts | `sales.view` | Ecommerce, Retail, Automotive, Restaurant |
| `/agents/{slug}/inventory` | Stock level counters, low-stock warnings | `inventory.view`, `inventory.adjust` | Ecommerce, Retail, Automotive |
| `/agents/{slug}/catalog` | Product catalog, pricing variants & shareable links | `catalog.view` | Ecommerce, Retail, Automotive |
| `/agents/{slug}/targets` | Sales quota progress & commission tier tracker | `targets.view` | Ecommerce, Services, Automotive |
| `/agents/{slug}/product-requests` | Restock requisitions & stock requests | `requisitions.create` | Ecommerce, Retail, Automotive |
| `/agents/{slug}/bookings` | Service appointments, calendar & technician queue | `bookings.view`, `bookings.create` | Services, Healthcare, Fitness |
| `/agents/{slug}/members` | Gym member check-ins, passes & class rosters | `members.view`, `members.checkin` | Fitness & Wellness |
| `/agents/{slug}/tables` | Restaurant floor plan, table status & open tabs | `tables.view`, `tables.update` | Restaurant & Hospitality |
| `/agents/{slug}/tasks` | Operational shift checklist & task completion | `tasks.view`, `tasks.update` | All Categories |
| `/agents/{slug}/messages` | Direct customer messaging & WhatsApp client | `messages.view`, `messages.send` | All Categories |
| `/agents/{slug}/profile` | Staff identity, permissions, login code & shift logs | Authenticated Staff / All Roles | All Categories |

---

## 3. Discovered Vulnerabilities & Implemented Fixes

### 3.1. Authentication: Eager Company Loading for Login Codes
- **Issue:** In [`lib/auth.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/lib/auth.ts), `findUserByLoginCode` fetched `salesAgent` and `staffProfile` records but did NOT include their related `company`. The NextAuth `school-code-login` provider and JWT callback were unable to resolve `companyId` and `companySlug`, causing subsequent agent dashboard queries to fail.
- **Fix:** 
  1. Updated `findUserByLoginCode` in `lib/auth.ts` to include `{ company: true }` on both relations.
  2. Enhanced `jwt` callback in `lib/auth.ts` to fallback-resolve active `StaffProfile` or `SalesAgent` if `token.companyId` is absent.
  3. Created dedicated authentication API [`app/api/agent/auth/login-code/route.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/app/api/agent/auth/login-code/route.ts) that verifies login codes, active employment status, normalizes roles, and returns the exact category workspace landing URL and POS route.

### 3.2. Middleware Unification & Route Redirection
- **Issue:** `middleware.ts` previously checked `OPERATOR_PREFIXES` with `"/agents"` but the legacy filesystem had `app/agent/[slug]`.
- **Fix:**
  1. Standardized all canonical agent pages in `app/agents/[slug]/*`.
  2. Updated `middleware.ts` `OPERATOR_PREFIXES` to include both `"/agents"` and `"/agent"`.
  3. Added an automatic rewrite/redirect in `middleware.ts` from legacy `/agent/...` to `/agents/...`.

### 3.3. Elimination of Static Mock ObjectIds
- **Issue:** Multiple legacy pages had hardcoded IDs like:
  ```typescript
  const salesAgentId = "63f7c9e2d91b1b2a5e80b016";
  const sellerId = "63f7c9e2d91b1b2a5e80b007";
  ```
- **Fix:** Rewrote all agent routes in `app/agents/[slug]/*` to resolve the current user from session and scope all Prisma queries strictly by `companyId: agentCtx.company.id`. Added an automated drift check in `tests/agent-drift-detection.test.ts` to ensure no hardcoded Mongo ObjectIds ever return to `app/agents`.

### 3.4. API Hardening: `/api/agent/dashboard`
- **Issue:** The dashboard API previously returned a `400 Bad Request` unless `salesAgentId` was explicitly provided in the query string, which broke when general staff members or cashiers opened the dashboard.
- **Fix:** Updated [`app/api/agent/dashboard/route.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/app/api/agent/dashboard/route.ts) to automatically resolve the authenticated staff member's company and agent record from session, returning scoped metrics, target progress, and recent orders without mandatory query params.

### 3.5. Security: Server-Side Authorization Guards
- **Issue:** Navigation was merely hidden on the client side, allowing staff to bypass restrictions by typing URL paths directly.
- **Fix:** Created [`lib/auth/agentGuard.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/lib/auth/agentGuard.ts):
  - `resolveAgentContext(slug)` validates session, tenant tenancy, active employment (`isActive`), and permissions.
  - `assertAgentRouteAccess(slug, section)` blocks unauthorized routes at the server component layer.
  - `assertAgentApiAccess(req, opts)` guards backend API endpoints.

---

## 4. Admin Features Intentionally Excluded from Agent Area

The following Admin features have been explicitly audited and designated as **Admin-Only (`adminOnly: true`)** in `docs/architecture/feature-map.json`:

| Feature ID | Admin Route | Reason for Intentional Agent Exclusion |
| :--- | :--- | :--- |
| `admin.companySettings` | `/admin/{slug}/settings` | Business legal details, tax settings, bank payouts, and domain branding are strictly ownership/executive concerns. |
| `admin.staffManagement` | `/admin/{slug}/staff` | Creating staff accounts, setting salaries, and modifying role permissions requires business administrative authority. |
| `admin.payroll` | `/admin/{slug}/payroll` | Staff must never view company-wide compensation ledgers or peer salaries. |
| `admin.aiConfig` | `/admin/{slug}/ai` | Configuring API keys, AI model selection, prompt tuning, and AI cost ceilings belongs exclusively to platform administrators. |
| `admin.billing` | `/admin/{slug}/billing` | SaaS subscription plans, credit card details, invoices, and billing lifecycle are strictly executive functions. |

---

## 5. Verification & Test Execution Summary

Two independent automated test suites were developed and executed to guarantee that the system operates without regressions:

1. **Agent Architecture Drift Detection Suite (`npm run test:agent-drift`)**:
   - `[PASS]` Feature Registry has valid categories and features.
   - `[PASS]` All agent-enabled features have corresponding route files in `app/agents/[slug]`.
   - `[PASS]` Admin-only features are strictly marked inapplicable with no agent routes.
   - `[PASS]` POS correctly resolves to category-specific registers without hardcoding.
   - `[PASS]` Category normalizer handles variations and synonyms accurately.
   - `[PASS]` Default landing workspaces correctly align with staff roles.
   - `[PASS]` `isAgentPathAllowed` strictly allows authorized paths and blocks unauthorized paths.
   - `[PASS]` No hardcoded ancient ObjectIds exist in `app/agents`.

2. **Agent Feature Matrix & Workflow Test Suite (`npm run test:agent-matrix`)**:
   - `[PASS]` Scenario 1: Ecommerce Sales Agent (Orders, Products, Customers, StorePOS).
   - `[PASS]` Scenario 2: Service Staff (Bookings, Customers, ServicePOS, default landing `/bookings`).
   - `[PASS]` Scenario 3: Fitness Staff (Members, Check-ins, FitnessPOS, default landing `/members`).
   - `[PASS]` Scenario 4: Cashier Terminal (Immediate `/pos` landing, settings access strictly blocked).
   - `[PASS]` Scenario 5: Restaurant Staff (Tables, Orders, RestaurantPOS `/pos`).
   - `[PASS]` Scenario 6: Strict Role & Security Boundary Checks (Unauthorized URLs rejected).
