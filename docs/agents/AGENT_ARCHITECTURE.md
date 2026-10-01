# SalesmanPro — Agent Workspace Architecture & Technical Specification

> **Subsystem:** Agent / Staff Operational Workspace  
> **Route Base:** `/agents/[slug]/*`  
> **Edge Ingress:** Next.js Edge Middleware (`middleware.ts`)  
> **Feature Registry:** [`docs/architecture/feature-map.json`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/docs/architecture/feature-map.json)  
> **Resolver Engine:** [`lib/features/featureRegistry.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/lib/features/featureRegistry.ts)  
> **Security Guard:** [`lib/auth/agentGuard.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/lib/auth/agentGuard.ts)  
> **Navigation Component:** [`components/agent/AgentNav.tsx`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/components/agent/AgentNav.tsx)  
> **Last Verified:** 2026-10-01  

---

## 1. High-Level Architectural Model

The SalesmanPro Agent Workspace provides authorized operational personnel (sales agents, retail cashiers, service technicians, fitness trainers, and restaurant floor staff) with a high-speed, capability-gated operational cockpit.

```text
                    BUSINESS CAPABILITIES
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
        ADMIN              AGENT               POS
   Full Control /      Role & Category     Transaction
   Config & Billing    Operational Surface    Focus
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                  SHARED BUSINESS SERVICES
                             │
                        SHARED DATA
```

The Agent Workspace is **not a fork or duplicate** of the Admin application. It shares identical Prisma models, business services, and database rows with Admin and POS, but projects a clean, execution-oriented interface with zero configuration clutter.

---

## 2. Authentication & Staff Login Code Flow

SalesmanPro enables multi-tenant staff authentication through standard NextAuth credentials or rapid 6-digit terminal login codes.

```text
Staff Enters 6-Digit Login Code
        ↓
POST /api/agent/auth/login-code
        ↓
Query User via findUserByLoginCode (lib/auth.ts)
  - Join salesAgent { company }
  - Join staffProfile { company }
        ↓
Validate Tenant / Company Identity
        ↓
Validate Active Status (isActive == true, status != 'TERMINATED')
        ↓
Normalize Role (lib/features/featureRegistry.ts -> normalizeStaffRole)
        ↓
Resolve Category (normalizeCategory)
        ↓
Evaluate Feature Registry (getFeaturesFor)
        ↓
Determine Category POS Route (getPOSRouteForCategory)
        ↓
Determine Default Workspace Landing (getDefaultLandingForRole)
        ↓
Redirect / Handover to /agents/{slug}/[workspace]
```

### Authentication Invariants:
1. Inactive or terminated staff accounts are rejected immediately (`401/403`).
2. The user's JWT and session token retain `companyId` and `companySlug` resolved directly from their authoritative `StaffProfile` or `SalesAgent` record.
3. Legacy `/agent/[slug]` routes are intercepted in `middleware.ts` and redirected seamlessly with `307 Temporary Redirect` to canonical `/agents/[slug]`.

---

## 3. Server-Side Authorization & Security Boundaries

> **CRITICAL SECURITY RULE:** Hiding navigation links in the UI is NEVER sufficient authorization.

Every page and API endpoint in the Agent subsystem is fortified by server-side guards defined in [`lib/auth/agentGuard.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/lib/auth/agentGuard.ts).

### 3.1. Route Guard (`assertAgentRouteAccess`)
In every server-rendered page or layout in `app/agents/[slug]/...`:

```typescript
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";

export default async function AgentOrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Enforces session, company tenancy, active status, and feature permission
  const agentCtx = await assertAgentRouteAccess(slug, "orders");
  
  // Safe to render with verified agentCtx
}
```
If an agent navigates directly to a URL for which their role, company category, or permissions are insufficient (e.g., an ecommerce agent accessing `/agents/{slug}/members`), the guard automatically redirects them to `/agents/{slug}/dashboard`.

### 3.2. API Guard (`assertAgentApiAccess`)
In API route handlers:

```typescript
import { assertAgentApiAccess } from "@/lib/auth/agentGuard";

export async function GET(req: NextRequest) {
  const agentCtx = await assertAgentApiAccess(req, {
    requiredFeature: "commerce.orders",
    requiredPermission: "orders.view"
  });
  
  // Execute canonical Prisma query scoped to agentCtx.companyId
}
```

---

## 4. Category-Aware Dynamic Navigation

The sidebar and mobile navigation drawer ([`components/agent/AgentNav.tsx`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/components/agent/AgentNav.tsx)) are generated dynamically at runtime from the user's evaluated capabilities:

```text
User Identity + Role + Permissions + Company Category
                        ↓
            getFeaturesFor(category, role, permissions)
                        ↓
             Filtered List of FeatureDefinition
                        ↓
          Sidebar Nav Items + Direct POS Launcher
```

### What Agents Never See:
Unless a user possesses explicit `ADMIN` or `SUPER_ADMIN` privileges, the following systems are strictly omitted from the registry:
- **Company Settings** (`/admin/{slug}/settings`)
- **Staff Administration** (`/admin/{slug}/staff`)
- **Payroll & Compensation** (`/admin/{slug}/payroll`)
- **AI Provider & Studio Config** (`/admin/{slug}/ai`)
- **Billing & Subscriptions** (`/admin/{slug}/billing`)
- **Tenant Domain Management** (`/admin/{slug}/domains`)

---

## 5. Category-Specific POS Routing

Agents access their physical or web POS terminal via the **Launch POS** button or `/agents/{slug}/pos`. The system guarantees that staff never land on an incompatible register:

```typescript
// lib/features/featureRegistry.ts
export function getPOSRouteForCategory(categoryId: string, slug: string): string {
  const normCategory = normalizeCategory(categoryId);
  const cat = FEATURE_REGISTRY.categories.find((c) => c.id === normCategory);
  const route = cat ? cat.posRoute : "/storepos";
  return `/admin/${slug}${route}`;
}
```

- **E-Commerce & Retail** → `/admin/{slug}/storepos` (StorePOS)
- **Services & Spas** → `/admin/{slug}/service-pos` (ServicePOS)
- **Gyms & Fitness** → `/admin/{slug}/fitness-pos` (FitnessPOS)
- **Restaurants & Cafes** → `/admin/{slug}/pos` (RestaurantPOS)
- **Clinics & Healthcare** → `/admin/{slug}/health-pos` (HealthPOS)
- **Schools & Training** → `/admin/{slug}/company-pos` (CompanyPOS)

---

## 6. How to Add a New Admin Feature (Developer Guide)

When adding or modifying an Admin feature, follow this exact checklist:

### Step 1: Check Feature Impact
Ask: *Does this feature have an operational workflow for sales agents, technicians, or cashiers?*
- **If NO** (e.g. Tax Configuration, Stripe Connect Onboarding, AI Engine Keys):
  Add or verify the feature in [`docs/architecture/feature-map.json`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/docs/architecture/feature-map.json) with:
  ```json
  "adminOnly": true,
  "agentRoute": null
  ```
- **If YES** (e.g. Gift Card Redemption, Rental Vehicle Check-In):
  Proceed to Step 2.

### Step 2: Register the Feature
In [`docs/architecture/feature-map.json`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/docs/architecture/feature-map.json), declare:
```json
{
  "id": "rentals.vehicles",
  "title": "Vehicle Fleet & Check-In",
  "category": ["automotive"],
  "adminRoute": "/admin/{slug}/rentals",
  "agentRoute": "/agents/{slug}/rentals",
  "allowedRoles": ["MANAGER", "SALES_AGENT"],
  "capabilities": ["rentals.view", "rentals.checkin"],
  "allowedActions": ["view", "inspect", "checkin", "checkout"],
  "api": "/api/admin/rentals",
  "service": "lib/rentals/rentalService.ts",
  "model": "Vehicle, RentalContract",
  "pos": "StorePOS",
  "adminOnly": false,
  "status": "active"
}
```

### Step 3: Implement the Agent Route
Create `app/agents/[slug]/rentals/page.tsx` using the server-side guard:
```typescript
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";

export default async function AgentRentalsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agentCtx = await assertAgentRouteAccess(slug, "rentals");
  
  return <AgentRentalsClient companyId={agentCtx.company.id} slug={slug} />;
}
```

### Step 4: Run Drift & Matrix Verification
Run the automated verification suite to guarantee zero architectural drift:
```bash
npm run test:agent-drift
npm run test:agent-matrix
```
Both tests must pass before committing changes.
