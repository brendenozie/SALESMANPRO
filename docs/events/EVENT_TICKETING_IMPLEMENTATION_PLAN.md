# SalesmanPro Event & Ticketing — Implementation Plan

> **Step-by-Step Production Engineering Plan**

---

## Phase 1: API & Core Domain Fixes (P0/P1)
1. **Admin Events API (`app/api/admin/events/[id]/route.ts`)**:
   - Add `PUT` export alongside `PATCH`.
   - Ensure tenant authorization and cache invalidation.
2. **Admin Events Client (`app/admin/[slug]/manage-events/AdminEventsClient.tsx`)**:
   - Re-enable `events` state, sync on `fetchEvents`, render from state.
   - Fix `organizerId` in `EventForm.tsx` to bind properly to session or selected organizer.
3. **Ticket APIs (`app/api/admin/events/[id]/tickets` and new `app/api/admin/tickets/[id]`)**:
   - Fix `{ ticketId }` extraction in `app/api/admin/events/[id]/tickets/[ticketId]/route.ts`.
   - Create `app/api/admin/tickets/[id]/route.ts` alias so both paths work seamlessly.
4. **Admin Event Orders API (`app/api/admin/event-orders/route.ts` & `[id]/status`)**:
   - Create endpoint to query and manage `prisma.eventTicketPurchase` with attendee items, payment status, refunds, and cancellations.
   - Update `app/admin/[slug]/manage-event-orders/page.tsx` and `AdminOrdersClient.tsx` to use this canonical API.
5. **Gate Check-in APIs (`app/api/admin/check-in`, `company-check-in`, `check-in-attendees`, `scan`)**:
   - Fix parameter `{ id }` in `app/api/admin/events/[id]/check-in-attendees/route.ts`.
   - Fix enum collision in `app/api/admin/check-in/route.ts` and `[registrationId]/route.ts` (use `"CHECKED_IN"` and `"PENDING"`).
   - Implement `app/api/admin/check-in/scan/route.ts` for camera/manual QR ticket code instant validation with duplicate check-in prevention.
   - Fix `initialEvents` parsing in `app/admin/[slug]/manage-check-in/page.tsx`.
   - Add QR code / ticket code scanner input in `AdminCheckinClient.tsx`.
6. **Attendees Roster API (`app/api/admin/event-attendees/route.ts`)**:
   - Implement endpoint returning `prisma.eventTicketAttendee` with ticket and order details.
   - Connect `app/admin/[slug]/manage-attendees/page.tsx` and `AdminAttendeesClient.tsx`.

## Phase 2: Checkout & Ticket Issuance (P0/P1)
1. **Checkout Route (`app/api/events/checkout/route.ts`)**:
   - Set `paymentStatus: "PAID"` immediately when `calculatedTotalAmount === 0`.
   - Generate authentic QR code Data URLs and store in `EventTicketAttendee.qrCodeUrl`.
   - Support guest and authenticated consumers.
2. **Storefront Checkout Client (`app/site/[slug]/events/checkout/[eventId]`)**:
   - Fix Next.js 15 async `params`.
   - Route to `/site/${slug}/events/profile` or order confirmation modal after purchase.
   - Display order summary and clear messages.

## Phase 3: Customer Storefront & Discovery (P1/P2)
1. **Customer Event Discovery**:
   - Create `app/site/[slug]/events/page.tsx` linking to catalog.
   - Remove fake `mockEvents` and hardcoded categories in `app/site/[slug]/events/products/page.tsx`.
   - Calculate genuine ticket tier availability.
2. **Event Detail Page (`app/site/[slug]/events/products/[id]`)**:
   - Fix metadata `bannerImage` query.
   - Include `tickets` in query.
   - Update `EventDetailClient.tsx` to display real ticket tiers, pricing, quantity selection, and route cleanly to `/site/${slug}/events/checkout/${event.id}`.
3. **Customer Portal ("My Tickets")**:
   - Fix `app/api/site/[slug]/me/events/route.ts` to return events/tickets purchased by the user (`EventTicketAttendee` & `EventTicketPurchase`).
   - Remove mock data "Alex Rivera", "Neon Nights Festival" from `app/site/[slug]/events/profile/page.tsx`.
   - Update `TicketModal.tsx` to render real, scannable QR code using `qrcode`.

## Phase 4: POS & Advanced Integrations (P2)
1. **POS Integration**:
   - Ensure `company-events-pos-sale` supports event ticketing with receipt printing and QR issuance.
2. **Update Architecture Map**:
   - Update `docs/ARCHITECTURE_MAP.md`.

## Phase 5: Verification & End-to-End Testing (P0)
1. Run automated test suite verifying:
   - Event creation, listing, updating, deleting.
   - Ticket tier creation, updating, deleting.
   - Checkout with atomic stock deduction and ticket issuance.
   - Scannable QR generation.
   - Gate scan validation and duplicate scan rejection.
   - Attendee list and order status reconciliation.
