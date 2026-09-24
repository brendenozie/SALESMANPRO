# SalesmanPro Event & Ticketing — Functionality Map

> **Authoritative Functional Map**  
> **Status:** Production Implementation & Functional Audit  
> **Target Subsystem:** Event Management, Ticketing, Orders, Check-in, Attendees, Customer Discovery & Verification

---

## 1. Complete Event & Ticketing Route Matrix

| Area | Path | UI | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Payment | Relationships | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **Events** | `/admin/{slug}/manage-events` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | `Company` → `Event` (`organizer`, `tickets`) | **Fixed & Operational** |
| **Tickets** | `/admin/{slug}/manage-tickets` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | `Event` → `EventTicket` (`purchases`, `attendees`) | **Fixed & Operational** |
| **Orders** | `/admin/{slug}/manage-event-orders` | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ (Refund/Cancel) | ✅ | `EventTicketPurchase` → `EventTicket`, `Event`, `Buyer` | **Fixed & Operational** |
| **Check-in** | `/admin/{slug}/manage-check-in` | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | — | `Event` → `EventTicketAttendee` (`checkInStatus`) | **Fixed & Operational** |
| **Attendees** | `/admin/{slug}/manage-attendees` | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | — | `EventTicketAttendee` → `ticket`, `purchase`, `event` | **Fixed & Operational** |
| **Categories** | `/admin/{slug}/categories` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | `Company` → `StoreCategory` | **Operational** |
| **Gallery** | `/admin/{slug}/gallery` | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | — | `Company` → `MediaItem` | **Operational** |
| **Customer Events** | `/site/{slug}/events` | ✅ | ✅ | ✅ | — | — | — | — | — | `Company` → `Event[]` (Active tickets & availability) | **Implemented & Operational** |
| **Event Catalog** | `/site/{slug}/events/products` | ✅ | ✅ | ✅ | — | — | — | — | — | `Company` → `Event[]` (Faceted search/filter) | **Cleaned & Operational** |
| **Event Detail** | `/site/{slug}/events/products/{id}` | ✅ | ✅ | — | — | — | — | — | — | `Event` → `EventTicket[]` (Real-time tiers & inventory) | **Enhanced & Operational** |
| **Checkout** | `/site/{slug}/events/checkout/{eventId}` | ✅ | ✅ | — | ✅ | — | — | — | ✅ | Atomic reserve, lock, `EventTicketPurchase`, `Attendee[]` | **Fixed & Operational** |
| **My Tickets** | `/site/{slug}/events/profile` | ✅ | ✅ | ✅ | — | — | — | — | — | `User` → `EventTicketAttendee[]` (Real scannable QR) | **Fixed & Operational** |
| **Ticket Modal** | Inside Customer Profile | ✅ | ✅ | — | — | — | — | — | — | Scannable QR, ticketCode, venue, seat & status | **Fixed & Operational** |
| **QR Validation** | `/api/admin/check-in/scan` | ✅ | — | — | ✅ | — | ✅ | — | — | Signed/scanned token → check-in validation | **Implemented & Operational** |
| **POS Sales** | `/admin/{slug}/company-pos` | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | In-person walk-in ticket sales & receipt | **Integrated & Operational** |

---

## 2. Architectural Boundaries & Data Flow

```text
ADMIN USER                                             CUSTOMER / CONSUMER
    │                                                           │
    ▼                                                           ▼
Create/Publish Event                                  Browse /site/{slug}/events
    │                                                           │
    ▼                                                           ▼
Configure Ticket Tiers & Allocations                  Select Tickets & Quantities
(Regular, VIP, Early Bird, etc.)                                │
    │                                                           ▼
    │                                                 Enter Attendee Details
    │                                                           │
    │                                                           ▼
    │                                                 Checkout & Authoritative Payment
    │                                                 (M-Pesa / Card / Stripe / PayPal / Free)
    │                                                           │
    │                                                           ▼
    │                                                 Idempotent Order & Ticket Issuance
    │                                                 (EventTicketPurchase + EventTicketAttendee)
    │                                                           │
    │                                                           ▼
    │                                                 Unique ticketCode + Scannable QR Generated
    │                                                           │
    │                                                           ▼
    │                                                 View in "My Tickets" (/events/profile)
    │                                                           │
    └───────────────────────┬───────────────────────────────────┘
                            │
                            ▼
              OPERATOR ENTRANCE GATE CHECK-IN
              (/admin/{slug}/manage-check-in)
                            │
                            ├── Scan Camera / Manual Ticket Code Entry
                            ├── Server-side Signature & Tenant Validation
                            ├── Duplicate Scan Guard (ALREADY CHECKED IN)
                            └── Checked In Audit Timestamp & Gate Clearance
```
