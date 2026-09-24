# SalesmanPro — Real Estate & Property Management Invariants & Business Rules

> **Authoritative Invariants Document**  
> **System Scope:** Real Estate, Property Management, Short-Term Bookings, Long-Term Tenancies, Inquiries, Showings, Offers, Operations, and Financials  
> **Enforcement Level:** Mandatory Server-Side and Database Layer (Never Rely On UI Alone)  

---

## 1. Multi-Tenant Isolation & Ownership Invariants

1. **Company Isolation:**
   - Every property listing (`marketplaceListings`), block (`HostelBlock`), room/unit (`HostelRoom`), inquiry (`Inquiry`), showing (`Showing`), offer (`OfferContract`), booking (`Booking`), fee (`HostelFee`), maintenance request (`HostelMaintenanceRequest`), visitor (`HostelVisitor`), and staff record (`HostelStaff`) **strictly belongs to one `companyId`**.
   - Cross-tenant data leakage is forbidden. No API endpoint may ever return or mutate records belonging to Company B when queried in the context of Company A.
   - When a company slug (e.g. `/admin/real-estate/...`) is resolved, all server-side queries must resolve the authentic MongoDB ObjectId for the company (`company.id`) and scope queries by `companyId`.

2. **Consumer & Customer Isolation:**
   - A customer (`Consumer` / `User`) can only view, mutate, or access their own inquiries, showings, offers, contracts, bookings, rentals, payments, maintenance tickets, and saved properties.
   - Customer endpoints under `/api/site/{slug}/me/*` must always verify `session.user.id` and reject unauthenticated requests.

3. **Role-Based Authorization:**
   - Property administrative actions (creating listings, modifying prices, managing tenants, approving offers, resolving maintenance, adjusting fee structures) require authenticated staff/admin roles (`ADMIN`, `SUPER_ADMIN`, `PROPERTY_MANAGER`, `STAFF`, `AGENT`).
   - Ordinary consumers or unauthorized users cannot modify pricing, inventory status, booking states, or staff assignments through client-side manipulation.

---

## 2. Listing & Inventory Invariants

1. **Listing Integrity:**
   - A listing represents a marketable physical asset. Fields such as `name`, `finalPrice`, `category`, and `companyId` are required.
   - Listing market status follows a strict enum lifecycle:
     - `DRAFT` $\to$ `AVAILABLE` $\to$ `UNDER_OFFER` $\to$ `SOLD` / `RENTED` $\to$ `ARCHIVED`.
   - A listing that has active confirmed bookings, signed leases, or pending offers cannot be hard-deleted. It must be marked `ARCHIVED` or deactivated to preserve referential integrity for orders, payments, and legal agreements.

2. **Hierarchical Unit Structure:**
   - Managed properties with multiple units must maintain valid hierarchy:
     $$\text{Company} \longrightarrow \text{Property Listing} \longrightarrow \text{Block / Wing} \longrightarrow \text{Room / Space / Unit} \longrightarrow \text{Allocation / Lease}$$
   - A room or unit number must be unique within its block: `@@unique([blockId, roomNumber])`.
   - Room occupancy cannot exceed room capacity:
     $$\text{Active Allocations} \le \text{Room Capacity}$$

---

## 3. Short-Term Rental & Availability Invariants

1. **Availability Date Rules:**
   - Check-in date must strictly precede check-out date:
     $$\text{Check-In} < \text{Check-Out}$$
   - Minimum duration is 1 night.
2. **Booking Overlap Invariant (Zero Double-Booking):**
   - For a given property or unit, two confirmed bookings $(A)$ and $(B)$ cannot overlap in dates:
     $$\neg \Big( \text{Check-In}_B < \text{Check-Out}_A \;\land\; \text{Check-Out}_B > \text{Check-In}_A \Big)$$
   - **Adjacent Dates Rule:** Consecutive bookings are permitted:
     $$\text{Check-In}_B = \text{Check-Out}_A \quad \text{(Valid: Check-out morning, Check-in afternoon)}$$
   - All availability checks must be enforced atomically on the server inside a database transaction or lock before confirming a reservation.

3. **Booking State Machine:**
   $$\text{DRAFT} \longrightarrow \text{PENDING\_PAYMENT} \longrightarrow \text{CONFIRMED} \longrightarrow \text{CHECKED\_IN} \longrightarrow \text{CHECKED\_OUT} \longrightarrow \text{COMPLETED}$$
   $$\text{PENDING\_PAYMENT} \xrightarrow{\text{timeout / failed}} \text{EXPIRED / CANCELLED}$$
   $$\text{CONFIRMED} \xrightarrow{\text{refund}} \text{REFUNDED}$$

4. **Pricing Determinism:**
   - Nightly price, cleaning fees, service charges, taxes, and security deposits must be calculated on the server using canonical pricing rules.
   - Client-submitted totals must never be trusted. If the client submits a price that differs from the server-computed rate for the selected dates and unit, the server rejects the order.

---

## 4. Inquiries, Showings & Offers Invariants

1. **Inquiry Lifecycle:**
   $$\text{New} \longrightarrow \text{Read} \longrightarrow \text{Responded} \longrightarrow \text{Archived}$$
   - Every inquiry must link to a valid property listing and record contact information.
   - Replies via email or WhatsApp must log communication history.

2. **Showing Scheduling:**
   - Showing `dateTime` must be in the future when booked.
   - Status transitions:
     $$\text{Scheduled} \longrightarrow \text{Completed} \quad\text{or}\quad \text{Canceled} \quad\text{or}\quad \text{No-Show}$$
   - An assigned agent must belong to the same company.

3. **Offer & Contract Protection:**
   - An offer amount must be greater than zero.
   - Status transitions:
     $$\text{Pending} \longrightarrow \text{Accepted} \quad\text{or}\quad \text{Rejected} \quad\text{or}\quad \text{Closed}$$
   - Accepting an offer does not automatically mark a property sold until contracts and verified payments/settlements are recorded.
   - Offer history must never be silently overwritten; all updates and notes must be appendable or track timestamps.

---

## 5. Tenancy, Leases & Maintenance Invariants

1. **Tenant Allocation:**
   - A tenant allocation (`HostelAllocation`) connects a resident (`HostelMember`) to a room (`HostelRoom`).
   - A resident may be linked to an existing `Consumer` (primary for property management), `Student` (for academic hostels), or `Educator`.
   - When a tenant checks out, their allocation status changes to `COMPLETED` / `CHECKED_OUT`, releasing room capacity.

2. **Maintenance Ticket Lifecycle:**
   $$\text{PENDING} \longrightarrow \text{ASSIGNED} \longrightarrow \text{IN\_PROGRESS} \longrightarrow \text{COMPLETED} \longrightarrow \text{CLOSED}$$
   - A ticket must reference a valid unit and the reporting user ID.
   - Resolution must record `resolvedDate` to ensure accurate MTTR (Mean Time To Repair) metrics.

3. **Rent & Fee Accounting:**
   - Every fee invoice (`HostelFee`) has a unique `invoiceNumber`.
   - Partial payments update `amountPaid`. Status transitions:
     $$\text{PENDING} \longrightarrow \text{PARTIAL} \longrightarrow \text{PAID}$$
     $$\text{PENDING} \xrightarrow{\text{past due date}} \text{OVERDUE}$$
   - Financial totals must match:
     $$\text{totalAmount} = \text{rentAmount} + \text{messAmount} + \text{serviceFees}$$
