# SalesmanPro Event & Ticketing — Failure Log & Audit Findings

> **Comprehensive Failure Log & Root Cause Analysis**

---

### Failure 1: Admin Events Update 405 Method Not Allowed
- **Location:** `app/admin/[slug]/manage-events/AdminEventsClient.tsx` vs `app/api/admin/events/[id]/route.ts`
- **Symptom:** Saving an edited event resulted in an error `HTTP error! status: 405`.
- **Root Cause:** `AdminEventsClient.tsx` executed a `PUT` request, but `app/api/admin/events/[id]/route.ts` only exported `GET`, `PATCH`, and `DELETE`.
- **Resolution:** Add `PUT` handler to `app/api/admin/events/[id]/route.ts` and sync frontend to `PATCH`/`PUT`.

### Failure 2: Admin Events State Non-Updating & Stale View
- **Location:** `app/admin/[slug]/manage-events/AdminEventsClient.tsx`
- **Symptom:** After creating, editing, or deleting an event, the table did not refresh.
- **Root Cause:** `const [events, setEvents]` state was commented out at line 69; table rendered `!allEvents || allEvents.length === 0` from initial props; `fetchEvents` did not set internal state.
- **Resolution:** Re-enable `events` state, initialize with `allEvents`, update on `fetchEvents`, and render from `events`.

### Failure 3: Hardcoded String "organizerId" Breaking Event Creation
- **Location:** `app/admin/[slug]/manage-events/EventForm.tsx`
- **Symptom:** Creating an event failed with: "Provided organizerId does not match a valid User, Staff, or Sales Agent."
- **Root Cause:** `EventForm.tsx` initialized `organizerId: "organizerId"` as a literal dummy string instead of the authentic session user ID or selected organizer.
- **Resolution:** Bind to valid selected organizer from `allOrganizers` or session user.

### Failure 4: Admin Tickets Route Parameter Mismatch & 404 on Update/Delete
- **Location:** `app/admin/[slug]/manage-tickets/AdminTicketsClient.tsx` vs `app/api/admin/events/[id]/tickets/[ticketId]/route.ts`
- **Symptom:** Saving or deleting tickets failed with 404 or record not found.
- **Root Cause:**
  1. `AdminTicketsClient.tsx` called `/api/admin/tickets/${id}` which didn't exist.
  2. Inside `app/api/admin/events/[id]/tickets/[ticketId]/route.ts`, the parameter was destructured as `const { id } = await params`, which extracted the `eventId` from the URL, not the `ticketId`! It then queried `prisma.eventTicket.findUnique({ where: { id: eventId } })` which always failed!
- **Resolution:** Correct parameter extraction to `{ ticketId }` in the nested route, and add `/api/admin/tickets/[id]` alias route so client calls succeed directly.

### Failure 5: Admin Event Orders Pointed to General Store Product Orders
- **Location:** `app/admin/[slug]/manage-event-orders/page.tsx` & `AdminOrdersClient.tsx`
- **Symptom:** Event orders page showed either general store inventory orders or failed with 404 on refresh and status mutation.
- **Root Cause:** `page.tsx` called `/api/admin/orders` (store items) instead of `EventTicketPurchase`. `AdminOrdersClient` tried to hit `/api/admin/${adminSlug}/orders/${orderId}/status` which does not exist.
- **Resolution:** Implement `/api/admin/event-orders` and `/api/admin/event-orders/[id]/status` querying `prisma.eventTicketPurchase` with attendee relationships, refund, and cancellation handling.

### Failure 6: Check-In Attendees Route Parameter Mismatch & Commented CheckIn Field
- **Location:** `app/api/admin/events/[id]/check-in-attendees/route.ts`
- **Symptom:** Gate check-in showed empty attendees list or failed.
- **Root Cause:**
  1. Route extracted `const { eventId } = await params`, but the route segment is `[id]`, causing `eventId` to be `undefined`.
  2. Line 47: `// checkedIn: reg.checkInStatus === "ATTENDED"` was commented out.
- **Resolution:** Correct parameter to `{ id: eventId }` and set `checkedIn: reg.checkInStatus === "CHECKED_IN"`.

### Failure 7: Check-In API Enum Value Collision Crashing Prisma
- **Location:** `app/api/admin/check-in/route.ts` & `app/api/admin/check-in/[registrationId]/route.ts`
- **Symptom:** Check-in toggle returned 500 error from Prisma.
- **Root Cause:** Code attempted to set `checkInStatus: "ATTENDED"`. But Prisma's `TicketCheckInStatus` enum only permits `"PENDING" | "CHECKED_IN" | "CANCELLED"`. `"ATTENDED"` belongs to `RegistrationStatus`, not `TicketCheckInStatus`.
- **Resolution:** Correct enum usage to `"CHECKED_IN"` and `"PENDING"`.

### Failure 8: Admin Check-In Page Initial Load Always Empty
- **Location:** `app/admin/[slug]/manage-check-in/page.tsx`
- **Symptom:** Dropdown in check-in was always empty on initial page render.
- **Root Cause:** Line 61 parsed `data.data?.events || []`, but `/api/admin/events` returns `{ success: true, data: [...] }` as an array. Thus `data.data?.events` was always `undefined`.
- **Resolution:** Check `Array.isArray(data.data) ? data.data : data.data?.events || []`.

### Failure 9: Admin Attendees Page 404 on Load and Toggle
- **Location:** `app/admin/[slug]/manage-attendees/page.tsx` & `AdminAttendeesClient.tsx`
- **Symptom:** Attendees table failed to load data and toggle failed.
- **Root Cause:** Called `/api/admin/event-attendees` and `/api/admin/attendees` which did not exist.
- **Resolution:** Implement `/api/admin/event-attendees` querying `prisma.eventTicketAttendee` with tenant isolation.

### Failure 10: Storefront Mock Data Masquerading as Real Data
- **Location:** `app/site/[slug]/events/products/page.tsx` & `app/site/[slug]/events/profile/page.tsx`
- **Symptom:** Real database events were replaced by "Agrotech Innovations Summit 2026", "Neon Nights Festival", and fake user "Alex Rivera".
- **Root Cause:** Fallbacks hid empty states and API errors with static mock data.
- **Resolution:** Remove fake fallbacks; render legitimate empty states and clean database-driven records.

### Failure 11: Fake SVG QR Code Instead of Scannable QR Code
- **Location:** `app/site/[slug]/events/profile/components/TicketModal.tsx`
- **Symptom:** Ticket modal showed a static Heroicon `<QrCodeIcon>` with a code comment "Using an icon here for demo".
- **Root Cause:** Real QR code generator was not implemented.
- **Resolution:** Implement authentic dynamic QR generation via `qrcode` package with unique `ticketCode`.

### Failure 12: Next.js 15 Async Params Bug in Checkout Page
- **Location:** `app/site/[slug]/events/checkout/[eventId]/page.tsx`
- **Symptom:** Next.js warning or runtime crash accessing `params.slug` without `await params`.
- **Resolution:** `const { slug, eventId } = await params;`

### Failure 13: Free Admission Left as PENDING in Checkout
- **Location:** `app/api/events/checkout/route.ts`
- **Symptom:** Free tickets remained `paymentStatus: "PENDING"` indefinitely and could not be checked in at the gate.
- **Resolution:** Mark `paymentStatus: "PAID"` immediately for zero-cost admissions.
