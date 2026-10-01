# SalesmanPro — Canonical Admin-to-Agent Feature & Capability Map

> **Authoritative System Architecture Map: Feature Registry & Capability Mapping**  
> **Registry Version:** 1.0.0  
> **Machine-Readable Source:** [`docs/architecture/feature-map.json`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/docs/architecture/feature-map.json)  
> **Resolver Engine:** [`lib/features/featureRegistry.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/lib/features/featureRegistry.ts)  
> **Server-Side Route Guard:** [`lib/auth/agentGuard.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/lib/auth/agentGuard.ts)  
> **Last Verified:** 2026-10-01  

---

## 1. Executive Purpose

In SalesmanPro, the Admin UI continues to evolve rapidly across multi-tenant e-commerce, restaurants, fitness clubs, salons/clinics, and automotive dealerships. The **Agent Workspace** (`/app/agents/[slug]`) gives operational sales staff, service technicians, and cashiers a focused, capability-gated operational surface.

**The Core Architectural Principle:**
The Agent application is **NOT** a miniature copy of the Admin interface.
- **Admin**: Full business management, configuration, financial ledgers, payroll, system settings, AI model selection, security, and staff administration.
- **Agent**: Daily operational execution — sales, orders, customer checkout, bookings, class check-ins, table status, tasks, communications, and category-specific POS transactions.

This document and [`docs/architecture/feature-map.json`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/docs/architecture/feature-map.json) serve as the **permanent context compression layer** so that future engineers and autonomous coding agents never need to rescan the codebase to determine feature boundaries, roles, or POS routing.

---

## 2. Category × Role × Feature Matrix

| Feature ID | Feature Name | Categories | Allowed Staff Roles | Agent Route | Admin Route | Associated POS |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `commerce.dashboard` | Operational Dashboard | All | All Roles | `/agents/{slug}/dashboard` | `/admin/{slug}/dashboard` | N/A |
| `commerce.orders` | Orders & Fulfillment | Ecommerce, Retail, Automotive, Restaurant | `MANAGER`, `SALES_AGENT`, `CASHIER`, `STAFF` | `/agents/{slug}/orders` | `/admin/{slug}/orders` | StorePOS, RestaurantPOS |
| `commerce.customers` | Customers & Contacts | All | `MANAGER`, `SALES_AGENT`, `SERVICE_AGENT`, `STAFF` | `/agents/{slug}/customers` | `/admin/{slug}/customers` | StorePOS, ServicePOS, FitnessPOS |
| `commerce.sales` | Sales & Register History | Ecommerce, Retail, Automotive, Restaurant | `MANAGER`, `SALES_AGENT`, `CASHIER` | `/agents/{slug}/sales` | `/admin/{slug}/sales` | StorePOS |
| `commerce.inventory` | Stock & Inventory Levels | Ecommerce, Retail, Automotive | `MANAGER`, `SALES_AGENT`, `INVENTORY_STAFF` | `/agents/{slug}/inventory` | `/admin/{slug}/inventory` | StorePOS |
| `commerce.catalog` | Product Catalog & Pricing | Ecommerce, Retail, Automotive | `MANAGER`, `SALES_AGENT`, `CASHIER`, `STAFF` | `/agents/{slug}/catalog` | `/admin/{slug}/products` | StorePOS |
| `commerce.targets` | Sales Targets & Quotas | Ecommerce, Services, Automotive | `MANAGER`, `SALES_AGENT` | `/agents/{slug}/targets` | `/admin/{slug}/targets` | N/A |
| `commerce.productRequests` | Requisitions & Restock | Ecommerce, Retail, Automotive | `MANAGER`, `SALES_AGENT`, `INVENTORY_STAFF` | `/agents/{slug}/product-requests` | `/admin/{slug}/requisitions` | N/A |
| `operations.pos` | Point of Sale Shift Entry | All Categories | `MANAGER`, `SALES_AGENT`, `CASHIER`, `SERVICE_AGENT`, `FITNESS_STAFF`, `STAFF` | `/agents/{slug}/pos` | `/admin/{slug}/storepos` | Category-Specific POS |
| `services.bookings` | Bookings & Appointments | Services, Healthcare, Fitness | `MANAGER`, `SERVICE_AGENT`, `FITNESS_STAFF`, `STAFF` | `/agents/{slug}/bookings` | `/admin/{slug}/bookings` | ServicePOS |
| `fitness.members` | Gym Members & Attendance | Fitness & Wellness | `MANAGER`, `FITNESS_STAFF`, `STAFF` | `/agents/{slug}/members` | `/admin/{slug}/gym-members` | FitnessPOS |
| `restaurant.tables` | Tables & Floor Management | Restaurant & Hospitality | `MANAGER`, `STAFF` | `/agents/{slug}/tables` | `/admin/{slug}/tables` | RestaurantPOS |
| `operations.tasks` | Assigned Tasks & Workflows | All | `MANAGER`, `SALES_AGENT`, `SERVICE_AGENT`, `FITNESS_STAFF`, `STAFF` | `/agents/{slug}/tasks` | `/admin/{slug}/tasks` | N/A |
| `communication.messages` | Messages & WhatsApp Client | All | `MANAGER`, `SALES_AGENT`, `SERVICE_AGENT`, `STAFF` | `/agents/{slug}/messages` | `/admin/{slug}/whatsapp` | N/A |
| `staff.profile` | Staff Profile & Credentials | All | All Roles | `/agents/{slug}/profile` | `/admin/{slug}/profile` | N/A |
| **`admin.companySettings`** | Company Settings | All | **Admin Only** | **BLOCKED** | `/admin/{slug}/settings` | N/A |
| **`admin.staffManagement`** | Staff & Role Management | All | **Admin Only** | **BLOCKED** | `/admin/{slug}/staff` | N/A |
| **`admin.payroll`** | Payroll & Compensation | All | **Admin Only** | **BLOCKED** | `/admin/{slug}/payroll` | N/A |
| **`admin.aiConfig`** | AI Provider & Studio Config | All | **Admin Only** | **BLOCKED** | `/admin/{slug}/ai` | N/A |
| **`admin.billing`** | Subscription & Billing | All | **Admin Only** | **BLOCKED** | `/admin/{slug}/billing` | N/A |

---

## 3. Canonical Business Category & POS Resolution

SalesmanPro supports multiple business archetypes. When an agent logs in or opens their POS launcher, the system resolves the category dynamically using [`lib/features/featureRegistry.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/lib/features/featureRegistry.ts):

```text
Company.category
      ↓
normalizeCategory()
      ↓
Category Record in feature-map.json
      ↓
posRoute + defaultAgentWorkspace
```

### Supported Categories & Mappings

1. **E-Commerce & Retail** (`ecommerce`)
   - **Aliases**: `retail`, `fashion shop`, `hardware shop`, `groceries store`, `electronics`, `pets store`, `agrovet store`
   - **Default POS**: `StorePOS`
   - **POS URL**: `/admin/{slug}/storepos`
   - **Default Landing**: `/agents/{slug}/dashboard` (or role-specific)

2. **Services & Appointments** (`services`)
   - **Aliases**: `professional services`, `salon`, `spa`, `repair`, `consulting`, `cleaning`
   - **Default POS**: `ServicePOS`
   - **POS URL**: `/admin/{slug}/service-pos`
   - **Default Landing**: `/agents/{slug}/bookings`

3. **Fitness & Wellness** (`fitness`)
   - **Aliases**: `gym`, `fitness & gym`, `wellness`, `yoga`, `sports club`
   - **Default POS**: `FitnessPOS`
   - **POS URL**: `/admin/{slug}/fitness-pos`
   - **Default Landing**: `/agents/{slug}/members`

4. **Restaurant & Hospitality** (`restaurant`)
   - **Aliases**: `cafe`, `food & beverage`, `bar`, `bakery`, `fast food`, `hotel`
   - **Default POS**: `RestaurantPOS`
   - **POS URL**: `/admin/{slug}/pos`
   - **Default Landing**: `/agents/{slug}/tables`

5. **Automotive & Vehicles** (`automotive`)
   - **Aliases**: `car dealership`, `auto parts`, `garage`
   - **Default POS**: `StorePOS`
   - **POS URL**: `/admin/{slug}/storepos`
   - **Default Landing**: `/agents/{slug}/dashboard`

6. **Healthcare & Clinics** (`healthcare`)
   - **Aliases**: `clinic`, `pharmacy`, `dental`, `medical`
   - **Default POS**: `HealthPOS`
   - **POS URL**: `/admin/{slug}/health-pos`
   - **Default Landing**: `/agents/{slug}/customers`

7. **Education & Schools** (`education`)
   - **Aliases**: `school`, `academy`, `training`, `university`
   - **Default POS**: `CompanyPOS`
   - **POS URL**: `/admin/{slug}/company-pos`
   - **Default Landing**: `/agents/{slug}/dashboard`

---

## 4. Role-Based Landing Page Matrix

When an agent authenticates via their 6-digit login code or session, they are redirected automatically to their dedicated landing workspace based on their canonical operational role:

| Canonical Role | Target Landing Workspace | Focus / Primary Activity |
| :--- | :--- | :--- |
| `CASHIER` | `/agents/{slug}/pos` | Immediate shift launch & barcode scanning |
| `SALES_AGENT` | `/agents/{slug}/dashboard` | Personal metrics, recent orders, quick actions |
| `SERVICE_AGENT` | `/agents/{slug}/bookings` | Today's appointment agenda & customer check-ins |
| `FITNESS_STAFF` | `/agents/{slug}/members` | Active member check-ins, passes, class attendance |
| `INVENTORY_STAFF` | `/agents/{slug}/inventory` | Stock counters, low-stock warnings, requisitions |
| `STAFF` | Category Default Workspace | Tables (Restaurant), Bookings (Services), Dashboard |
| `MANAGER` | `/agents/{slug}/dashboard` | Store-wide operational feed & approval workflows |

---

## 5. Architectural Invariants (Must Never Violate)

1. **Never Duplicate Business Logic**:
   - Order creation must call `createOrderCentralized` from [`lib/orders/centralizedCreateOrder.ts`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/lib/orders/centralizedCreateOrder.ts).
   - Customer lookups must use canonical `/api/pos/customers` or `prisma.customer`.
   - Never create `AgentOrderService` or `AdminOrderService`.

2. **Hiding Navigation Is NOT Authorization**:
   - Every page under `/app/agents/[slug]/*` executes `await assertAgentRouteAccess(slug, section)` in its server component layout.
   - Every API under `/api/agent/*` executes `await assertAgentApiAccess(req, opts)` verifying session, tenancy, and role capabilities.
   - Direct URL tampering (e.g. entering `/agents/{slug}/members` on an ecommerce company) throws an unauthorized redirect to `/agents/{slug}/dashboard`.

3. **Admin-Only Features Are Inviolable**:
   - Features tagged with `"adminOnly": true` (`admin.companySettings`, `admin.staffManagement`, `admin.payroll`, `admin.aiConfig`, `admin.billing`) are strictly omitted from the Agent capability graph.
   - Any manual agent route mapping for these features will fail the automated drift detection test (`npm run test:agent-drift`).

4. **Single Source of Truth**:
   - Any modifications to routes, categories, or role permissions must be updated in [`docs/architecture/feature-map.json`](file:///c:/Users/Brenden/Desktop/SalesForce/SalesMan/docs/architecture/feature-map.json) first.
