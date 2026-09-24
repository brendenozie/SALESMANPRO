# SalesmanPro — Real Estate & Property Management API Contract Map

> **Authoritative API Specification**  
> **Target Subsystem:** Properties, Units, Inquiries, Showings, Offers, Bookings, Tenancies, Maintenance, Visitors, Fees, Reports, and Customer Interactions  
> **Last Updated:** 2026-09-24  

---

## 1. Property Listings & Inventory APIs

### 1.1 `GET /api/admin/my-market-place`
- **Method:** `GET`
- **Auth / Role:** Admin / Staff session
- **Tenant Scope:** Scoped by `companyId` query param (validated against session or resolved tenant context)
- **Input Query Params:** `companyId` (string, required), `page` (number, default 1), `limit` (number, default 12), `type` (optional string), `category` (optional string), `search` (optional string)
- **Database Operation:** `prisma.marketplaceListings.findMany({ where: { companyId, category: ... }, include: { productCategory: true } })`
- **Response Format:** `{ success: true, data: { results: [...], meta: { total, page, limit, totalPages } } }`
- **Error States:** 400 (Missing companyId, invalid pagination), 500 (DB failure)

### 1.2 `GET /api/admin/my-market-place/:id`
- **Method:** `GET`
- **Auth / Role:** Admin / Staff / Public Storefront
- **Tenant Scope:** Scoped by listing `id` and verified against company
- **Database Operation:** `prisma.marketplaceListings.findUnique({ where: { id }, include: { productCategory: true, company: true, HostelBlock: true } })`
- **Response Format:** `{ success: true, data: listing }`
- **Error States:** 404 (Not Found), 500 (DB Error)

### 1.3 `POST /api/admin/post-market-list`
- **Method:** `POST`
- **Auth / Role:** Admin / Staff
- **Tenant Scope:** Explicit `companyId` from session context
- **Input Body:** Full property listing payload (`name`, `description`, `finalPrice`, `sellingPrice`, `currency`, `category: "property"`, `type`, `locationName`, `bedrooms`, `bathrooms`, `area`, `amenities`, `images`, `status`)
- **Database Operation:** `prisma.marketplaceListings.create` or `prisma.marketplaceListings.update` if `id` is present
- **Cache Invalidation:** Invalidates `tenant:${companyId}:*` and related listing caches
- **Response Format:** `{ success: true, data: listing, message: "Listing saved successfully" }`

### 1.4 `DELETE /api/admin/my-market-place/:id`
- **Method:** `DELETE`
- **Auth / Role:** Admin / Staff
- **Tenant Scope:** Scoped to verified `companyId`
- **Database Operation:** Archives or safely deletes listing if no active bookings/leases exist
- **Response Format:** `{ success: true, message: "Listing removed successfully" }`

---

## 2. Inquiries & CRM APIs

### 2.1 `GET /api/admin/inquiries`
- **Method:** `GET`
- **Auth / Role:** Admin / Staff
- **Tenant Scope:** `companyId` (resolves company slug to ObjectId if needed)
- **Input Query Params:** `companyId` (required), `status` (optional: New, Read, Responded, Archived)
- **Database Operation:** `prisma.inquiry.findMany({ where: { companyId, status }, orderBy: { receivedAt: "desc" } })`
- **Response Format:** `{ success: true, data: { results: [...] } }`

### 2.2 `POST /api/admin/inquiries`
- **Method:** `POST`
- **Auth / Role:** Public customer / Consumer session (optional)
- **Tenant Scope:** Scoped to `companyId` of property
- **Input Body:** `{ companyId, propertyId, propertyName, clientName, clientEmail, clientPhone, message, consumerId }`
- **Database Operation:** `prisma.inquiry.create`
- **Response Format:** `{ success: true, data: newInquiry }`

### 2.3 `PATCH /api/admin/inquiries/:inquiryId/status`
- **Method:** `PATCH`
- **Auth / Role:** Admin / Staff
- **Input Body:** `{ status: "New" | "Read" | "Responded" | "Archived" }`
- **Database Operation:** `prisma.inquiry.update({ where: { id: inquiryId }, data: { status } })`

### 2.4 `POST /api/admin/inquiries/:inquiryId/reply`
- **Method:** `POST`
- **Auth / Role:** Admin / Staff
- **Input Body:** `{ message: string, channel: "EMAIL" | "WHATSAPP" | "BOTH" }`
- **Database Operation:** Updates inquiry status to `Responded` and dispatches email/WhatsApp notification via canonical messaging engine

### 2.5 `DELETE /api/admin/inquiries/:inquiryId`
- **Method:** `DELETE`
- **Auth / Role:** Admin
- **Database Operation:** `prisma.inquiry.delete({ where: { id: inquiryId } })`

---

## 3. Showings (Appointments) APIs

### 3.1 `GET /api/admin/showings`
- **Method:** `GET`
- **Auth / Role:** Admin / Staff / Agent
- **Tenant Scope:** `companyId`
- **Database Operation:** `prisma.showing.findMany({ where: { companyId }, orderBy: { dateTime: "desc" } })`

### 3.2 `POST /api/admin/showings`
- **Method:** `POST`
- **Auth / Role:** Customer or Admin
- **Input Body:** `{ companyId, propertyId, propertyName, clientId, clientName, agentId, agentName, dateTime, notes }`
- **Validation:** Future date verification, non-empty client and property
- **Database Operation:** `prisma.showing.create`

### 3.3 `PATCH /api/admin/showings/:showingId`
- **Method:** `PATCH`
- **Input Body:** Status or date update (`status: "Scheduled" | "Completed" | "Canceled"`, `notes`, `agentId`)
- **Database Operation:** `prisma.showing.update`

### 3.4 `DELETE /api/admin/showings/:showingId`
- **Method:** `DELETE`
- **Database Operation:** `prisma.showing.delete`

---

## 4. Offers & Contracts APIs

### 4.1 `GET /api/admin/offers`
- **Method:** `GET`
- **Tenant Scope:** `companyId`
- **Database Operation:** `prisma.offerContract.findMany({ where: { companyId }, include: { property: true, client: true, agent: true } })`

### 4.2 `POST /api/admin/offers`
- **Method:** `POST`
- **Input Body:** `{ companyId, propertyId, propertyName, clientId, clientName, agentId, agentName, offerAmount, offerDate, notes, contractUrl }`
- **Database Operation:** `prisma.offerContract.create`

### 4.3 `PATCH /api/admin/offers/:offerId`
- **Method:** `PATCH`
- **Input Body:** `{ status: "Pending" | "Accepted" | "Rejected" | "Closed", closureDate, notes, offerAmount }`
- **Database Operation:** `prisma.offerContract.update`

### 4.4 `DELETE /api/admin/offers/:offerId`
- **Method:** `DELETE`
- **Database Operation:** `prisma.offerContract.delete`

---

## 5. Short-Term Booking & Availability Engine APIs

### 5.1 `GET /api/properties/:id/availability`
- **Method:** `GET`
- **Auth / Role:** Public Storefront
- **Input Query Params:** `month` (optional), `year` (optional), `checkIn` (optional), `checkOut` (optional)
- **Database Operation:** Queries `prisma.booking.findMany` for active/confirmed reservations overlapping requested date range
- **Response Format:** `{ success: true, isAvailable: boolean, bookedRanges: [{ start, end }], pricing: { nightly, cleaningFee, serviceFee, taxes, total } }`

### 5.2 `POST /api/properties/:id/book`
- **Method:** `POST`
- **Auth / Role:** Authenticated Customer session
- **Input Body:** `{ checkIn: string, checkOut: string, guests: number, unitId?: string, clientName: string, clientEmail: string, clientPhone: string }`
- **Validation:**
  1. Check-in $\ge$ today, Check-out $>$ Check-in.
  2. Transactional overlap check: verifies no overlapping `CONFIRMED` or active `PENDING` booking exists for this property/unit.
  3. Server-side price calculation (nightly rate $\times$ nights $+$ cleaning fee $+$ taxes).
- **Database Operation:** Creates `prisma.booking` with status `PENDING` and links customer order/payment.
- **Response Format:** `{ success: true, bookingId, paymentUrl, orderId, totalPrice }`

---

## 6. Property Management Operations APIs (Blocks, Rooms, Residents, Maintenance, Fees, Staff)

### 6.1 `GET /api/admin/property/blocks` & `POST /api/admin/property/blocks` & `DELETE`
- Manages wings/blocks with room counts, total capacity, and active occupancy aggregation.

### 6.2 `GET /api/admin/property/rooms` & `POST /api/admin/property/rooms`
- Supports filtering by `blockId` or all rooms under `companyId`. Returns capacity, occupancy status (`Available`, `Partial`, `Full`), and active maintenance flags.

### 6.3 `GET /api/admin/property/rooms/:id` & `PATCH /api/admin/property/rooms/:id` & `DELETE`
- Fetches detailed unit dossier including resident allocations, active tickets, and monthly rental pricing. Updates room number, capacity, and rent per month.

### 6.4 `GET /api/admin/property/residents` & `POST /api/admin/property/residents`
- Lists in-house residents and allocates new tenants linked to `Consumer`, `Student`, or `Educator`.

### 6.5 `GET /api/admin/property/room-assignments` & `POST /api/admin/property/allocate`
- Manages unassigned clients/students and provides atomic capacity-checked allocation.

### 6.6 `GET /api/admin/property/maintenance` & `POST /api/admin/property/maintenance/new` & `PATCH /api/admin/property/maintenance/:id`
- Full maintenance ticket lifecycle: creation, staff assignment, status progression (`PENDING` $\to$ `IN_PROGRESS` $\to$ `COMPLETED`), and resolution notes.

### 6.7 `GET /api/admin/property/visitors` & `POST /api/admin/property/visitors/checkin` & `PATCH /api/admin/property/visitors`
- Visitor logging, tenant linkage, active check-in, and check-out timestamps.

### 6.8 `GET /api/admin/property/fees` & `POST /api/admin/property/fees` & `POST /api/admin/property/fees/:id/pay`
- Property billing, rent invoicing, due date tracking, and payment recording.

### 6.9 `GET /api/admin/property/staff` & `POST /api/admin/property/staff` & `PATCH /api/admin/property/staff/:id` & `DELETE`
- Staff roster, role assignment (`PROPERTY_MANAGER`, `CARETAKER`, `SECURITY`, `WARDEN`), duty shift, and badge management.

### 6.10 `GET /api/admin/property/analytics`
- Aggregated metrics: Occupancy rate %, MTTR (hours), 7-day visitor volume, total rental revenue, and per-block capacity breakdown.

---

## 7. Customer Profile & Interactions APIs

### 7.1 `GET /api/me/wishlist` & `POST /api/me/wishlist` & `DELETE /api/me/wishlist`
- Manages user's saved properties in `prisma.wishlist` and `WishlistItem`.

### 7.2 `GET /api/site/:slug/me/properties-dashboard`
- Unified customer dashboard endpoint returning authenticated customer's:
  - Saved properties (`Wishlist`)
  - Submitted inquiries (`Inquiry`)
  - Scheduled showings (`Showing`)
  - Active offers (`OfferContract`)
  - Confirmed and upcoming bookings (`Booking`)
  - Active leases / room allocations (`HostelAllocation`)
  - Submitted maintenance requests (`HostelMaintenanceRequest`)
  - Rent fee invoices and payment history (`HostelFee`)
