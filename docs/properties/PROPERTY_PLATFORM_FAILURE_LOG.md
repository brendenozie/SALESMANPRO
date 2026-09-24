# SalesmanPro — Property Platform Failure & Gap Log

> **Forensic Audit Log:** Real Estate & Property Management Subsystems  
> **Date:** 2026-09-24  
> **Severity Levels:** P0 (Critical/Data Leakage/Integrity), P1 (Missing Core Lifecycle), P2 (Customer Experience), P3 (Operations Gap)

---

## Identified Architectural Failures & Disconnections

### 1. [P0] Hardcoded Mock Data in Customer Profile (`profile/page.tsx`)
- **Location:** `app/site/[slug]/realestate/profile/page.tsx` & `app/site/[slug]/propertymanagement/profile/page.tsx`
- **Issue:** Uses `setTimeout(resolve, 800)` and hardcodes `user_123` ("Sarah Jenkins") and dummy properties with Unsplash images.
- **Impact:** Real logged-in customers cannot see their real saved properties, inquiries, showings, bookings, leases, maintenance tickets, or payment history.
- **Resolution:** Replaced with live database fetching from `/api/site/{slug}/me/properties-dashboard` and connected to actual customer profile and relations.

### 2. [P0] Mock Data Fallback in Admin Listings & CRM Pages
- **Locations:**
  - `app/admin/[slug]/properties/page.tsx` (`generateMockProperties`)
  - `app/admin/[slug]/properties-showings/page.tsx` (`generateSampleShowings`, `generateSampleProperties`, etc.)
  - `app/admin/[slug]/properties-offers/page.tsx` (`generateSampleOffers`, etc.)
  - `app/admin/[slug]/properties-inquiries/page.tsx` (`generateSampleInquiries`)
  - `app/admin/[slug]/properties-agents/page.tsx` (`generateSampleAgents`)
- **Issue:** When database returns an empty array for a company, the code fell back to hardcoded sample data (`PROP001`, `shw_001`, `ofr_001`, `INQ001`, `AGT001`).
- **Impact:** Clicking Edit/Delete/Status on sample items targeted non-existent database IDs, causing errors or confusion. Production looked "working" while failing silently.
- **Resolution:** Removed sample mock data fallbacks and ensured clean empty states with real CRUD action capabilities.

### 3. [P0] Missing `DELETE /api/admin/my-market-place/:id`
- **Location:** `app/api/admin/my-market-place/`
- **Issue:** Only `bulk-create` and `route.ts` existed in `my-market-place`. No `[id]/route.ts` existed.
- **Impact:** In `PropertyClientPage.tsx`, clicking "Remove listing" triggered `DELETE ${apiBaseUrl}/admin/my-market-place/${id}`, which resulted in a `404 Not Found`. Property deletion failed.
- **Resolution:** Implemented `app/api/admin/my-market-place/[id]/route.ts` with `GET`, `PUT/PATCH`, and `DELETE`.

### 4. [P0] Company Identifier Disconnection in Inquiries & Showings APIs
- **Locations:** `app/admin/[slug]/properties-inquiries/page.tsx`, `app/admin/[slug]/properties-showings/page.tsx`
- **Issue:** Client and server fetch calls passed `companyId=${slug}` (the string slug e.g. "real-estate") rather than the MongoDB ObjectId `company.id`.
- **Impact:** In MongoDB Prisma, querying `inquiry.findMany({ where: { companyId: "real-estate" } })` returned 0 results because inquiries store the 24-character hexadecimal ObjectId.
- **Resolution:** Normalized company identification to resolve `company.id` from slug when needed or accept both slug and ObjectId safely.

### 5. [P0] FAQ Route Param Bug (`[showingId]` folder)
- **Location:** `app/api/admin/faqs/[showingId]/route.ts`
- **Issue:** The route was located inside a folder named `[showingId]`, but line 22 read `const faqId = params.id;`.
- **Impact:** `params.id` was always `undefined`, causing all single FAQ GET/PUT/DELETE operations to fail with `Missing FAQ ID`.
- **Resolution:** Renamed parameter handling or folder to correctly extract the identifier.

### 6. [P1] Missing Short-Term Booking & Overlap Protection Engine
- **Location:** Storefront listing details & backend
- **Issue:** Customers had no UI or API to select dates, calculate multi-night pricing with cleaning/taxes, check date availability, and place a booking.
- **Impact:** Short-term rental (Airbnb-style) was completely impossible.
- **Resolution:** Created canonical booking & availability engine with strict overlap protection.

### 7. [P1] Missing Admin Routes in Navigation
- **Locations:**
  - `/admin/{slug}/properties-media` (Missing)
  - `/admin/{slug}/properties-testimonials` (Missing)
  - `/admin/{slug}/properties-faqs` (Missing)
  - `/admin/{slug}/properties-settings` (Missing)
  - `/admin/{slug}/properties-virtual-tours` (Missing)
  - `/admin/{slug}/properties-promotions` (Missing)
  - `/admin/{slug}/properties-reports` (Missing)
- **Issue:** Links existed in `CATEGORY_MENUS.ts` for Property Management & Real Estate, but pages did not exist, leading to 404s.
- **Resolution:** Created all missing admin pages backed by canonical services.

### 8. [P1] Property Unit Allocation Disconnected from Consumers
- **Locations:** `app/api/admin/property/allocate/route.ts`, `app/api/admin/property/room-assignments/route.ts`
- **Issue:** `allocate` enforced `const hasExactlyOneRecipient = (!!studentId !== !!educatorId)` and rejected any `consumerId`.
- **Impact:** Commercial tenants (`Consumer`) could not be assigned to units/rooms in the property management dashboard.
- **Resolution:** Updated allocation logic to support `consumerId` alongside existing educational profiles.

### 9. [P1] Maintenance Ticket Updating Missing
- **Location:** `app/api/admin/property/maintenance/`
- **Issue:** No `[id]` handler existed to assign staff, update ticket status, or record resolution.
- **Resolution:** Created `app/api/admin/property/maintenance/[id]/route.ts` supporting full status updates and staff assignment.

### 10. [P2] Wishlist Save Button Lacked Handlers
- **Locations:** `app/site/[slug]/realestate/listings/[id]/PropertyDetailsClient.tsx`
- **Issue:** The "Save" button had no `onClick` handler and `app/api/me/wishlist/route.ts` had no `POST`/`DELETE` methods.
- **Resolution:** Implemented `POST` and `DELETE` on wishlist API and connected interactive bookmarking.
