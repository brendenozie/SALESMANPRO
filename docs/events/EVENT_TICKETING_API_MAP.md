# SalesmanPro Event & Ticketing — API Contract Map

> **Authoritative API Endpoint Specifications**

---

## 1. Admin Event Endpoints

### `GET /api/admin/events`
- **Auth:** Session required (`withApiHandler`)
- **Tenant Scope:** Verified `companyId` (query param checked against session)
- **Query Params:** `companyId` (required), `eventType`, `eventStatus`, `search`, `page`, `limit`
- **Response:** `{ success: true, data: IEvent[] }`

### `POST /api/admin/events`
- **Auth:** Session required (`withApiHandler`)
- **Tenant Scope:** Injected `companyId`
- **Body:** `{ title, startDateTime, endDateTime, eventType, eventStatus, organizerId, audience, isPaid, price, ... }`
- **Response:** `{ success: true, data: IEvent, message: "Event created successfully" }` (201)

### `GET /api/admin/events/[id]`
- **Auth:** Session required
- **Response:** `{ success: true, data: { data: IEvent } }`

### `PATCH /api/admin/events/[id]` & `PUT /api/admin/events/[id]`
- **Auth:** Session required
- **Body:** Partial event fields
- **Response:** `{ success: true, data: { data: IEvent }, message: "Event updated successfully" }`

### `DELETE /api/admin/events/[id]`
- **Auth:** Session required
- **Rules:** Prevents hard delete if paid tickets or attendee check-ins exist; cancels or archives safely.
- **Response:** `{ success: true, data: { deletedId: string } }`

---

## 2. Admin Ticket Management Endpoints

### `GET /api/admin/events/[id]/tickets`
- **Auth:** Session required
- **Query Params:** `companyId`
- **Response:** `{ success: true, data: EventTicket[] }` (includes remaining inventory & sold counts)

### `POST /api/admin/events/[id]/tickets`
- **Auth:** Session required
- **Body:** `{ name, ticketType, price, quantityTotal, minPerOrder, maxPerOrder, salesStartDate, salesEndDate, isActive, isVisible, perks }`
- **Response:** `{ success: true, data: { data: EventTicket }, message: "Ticket created successfully" }` (201)

### `PATCH /api/admin/events/[id]/tickets/[ticketId]` & `PATCH /api/admin/tickets/[id]`
- **Auth:** Session required
- **Body:** Partial ticket fields (`price`, `quantityTotal`, `isActive`, etc.)
- **Response:** `{ success: true, data: { data: EventTicket } }`

### `DELETE /api/admin/events/[id]/tickets/[ticketId]` & `DELETE /api/admin/tickets/[id]`
- **Auth:** Session required
- **Rules:** Blocked if `purchases > 0`
- **Response:** `{ success: true, data: { deletedId: string } }`

---

## 3. Admin Event Orders Endpoints

### `GET /api/admin/event-orders`
- **Auth:** Session required
- **Tenant Scope:** Injected `companyId`
- **Query Params:** `companyId`, `eventId`, `search`, `status`, `page`, `limit`
- **Response:** `{ success: true, data: EventTicketPurchase[], total: number }`

### `PATCH /api/admin/event-orders/[id]/status`
- **Auth:** Session required
- **Body:** `{ status: "REFUNDED" | "CANCELLED" | "COMPLETED" }`
- **Rules:** If refunded or cancelled, updates associated attendee ticket statuses to `CANCELLED`.
- **Response:** `{ success: true, data: EventTicketPurchase, message: string }`

---

## 4. Admin Check-In & Gate Validation Endpoints

### `GET /api/admin/events/[id]/check-in-attendees`
- **Auth:** Session required
- **Query Params:** `search` (name, email, ticketCode)
- **Response:** Array of attendee items with `id`, `name`, `email`, `ticketType`, `ticketCode`, `checkedIn`, `checkInStatus`, `checkedInAt`

### `PUT /api/admin/check-in/[registrationId]` & `PATCH /api/admin/check-in/[registrationId]`
- **Auth:** Session required (`withApiHandler`, `requireTenant: true`)
- **Body:** `{ status: "CHECKED_IN" | "PENDING" }`
- **Response:** `{ success: true, message: string, attendee: { id, fullName, checkedIn, checkInStatus } }`

### `POST /api/admin/check-in/scan` (Unified QR Scanner / Code Validator)
- **Auth:** Session required
- **Body:** `{ ticketCode: string, eventId: string }`
- **Logic:**
  1. Locates ticket by `ticketCode` under target company.
  2. Verifies `eventId` matches.
  3. Checks payment state is `PAID`.
  4. Returns `ALREADY_CHECKED_IN` if already checked in, with timestamp.
  5. Performs atomic check-in and audit timestamp if valid.
- **Response:** `{ success: true, status: "VALID" | "ALREADY_CHECKED_IN" | "INVALID" | "WRONG_EVENT", attendee: AttendeeDTO }`

---

## 5. Admin Attendees Roster Endpoint

### `GET /api/admin/event-attendees`
- **Auth:** Session required
- **Tenant Scope:** Verified `companyId`
- **Query Params:** `companyId`, `eventId`, `search`, `status`, `page`, `limit`
- **Response:** `{ success: true, data: EventTicketAttendee[], totalItems: number }`

---

## 6. Storefront & Customer Endpoints

### `POST /api/events/checkout`
- **Auth:** Public / Optional authenticated session
- **Concurrency Guard:** `withDistributedLock("checkout:event:{eventId}")`
- **Input:** `{ eventId, buyer: { name, email, phone }, tickets: [{ ticketId, quantity, attendees }], paymentMethod, paymentData }`
- **Processing:**
  1. Atomic inventory deduction (`quantitySold`).
  2. Creates `EventTicketPurchase`.
  3. Generates unique `ticketCode` and Data URL QR for each `EventTicketAttendee`.
  4. Triggers canonical payment gateway (M-Pesa, Paystack, Stripe, PayPal, or instant Free approval).
- **Response:** `{ success: true, data: { purchases, totalAmount, authorizationUrl, ... } }`

### `GET /api/site/[slug]/me/events` & `GET /api/site/[slug]/me/tickets`
- **Auth:** Session required
- **Logic:** Retrieves all tickets and purchases owned by user (`buyerId == session.user.id || email == session.user.email`).
- **Response:** `{ items: CustomerTicketDTO[], total: number }`
