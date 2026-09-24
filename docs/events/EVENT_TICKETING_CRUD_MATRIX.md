# SalesmanPro Event & Ticketing — CRUD & Persistence Matrix

> **Verification Matrix for All Entities & Operations**

---

| Entity | List | Get/Read | Create | Edit/Update | Delete/Archive | State Persistence Verified |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Event** | `GET /api/admin/events` | `GET /api/admin/events/[id]` | `POST /api/admin/events` | `PATCH/PUT /api/admin/events/[id]` | `DELETE /api/admin/events/[id]` (Safe cascade / archive) | Verified against MongoDB `Event` |
| **EventTicket (Tiers)** | `GET /api/admin/events/[id]/tickets` | `GET /api/admin/tickets/[id]` | `POST /api/admin/events/[id]/tickets` | `PATCH /api/admin/tickets/[id]` | `DELETE /api/admin/tickets/[id]` (Blocked if purchased) | Verified against MongoDB `EventTicket` |
| **EventCategory** | `GET /api/admin/get-store-categories` | Direct from cache/DB | `POST /api/admin/categories` | `PUT /api/admin/categories/[id]` | `DELETE /api/admin/categories/[id]` | Verified against `StoreCategory` |
| **EventTicketPurchase** | `GET /api/admin/event-orders` | Via relations in Orders HQ | `POST /api/events/checkout` | `PATCH /api/admin/event-orders/[id]/status` | Controlled Refund/Cancellation | Verified against `EventTicketPurchase` |
| **EventTicketAttendee** | `GET /api/admin/event-attendees` | Search by code or ID | Auto-created on checkout | Toggle checkInStatus | Soft cancel on refund | Verified against `EventTicketAttendee` |
| **Check-in Record** | `GET /api/admin/events/[id]/check-in-attendees` | `POST /api/admin/check-in/scan` | Auto-recorded at gate | Reversible with audit log | Retained permanently in audit log | Verified with `checkedInAt` timestamp |
| **Customer My Tickets** | `GET /api/site/[slug]/me/tickets` | Interactive Modal | Checkout generation | — | — | Real-time DB lookup by consumer email/ID |
