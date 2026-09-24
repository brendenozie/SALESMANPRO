# SalesmanPro Event & Ticketing — Business Invariants & Rules

> **Authoritative Invariants Reference**  
> **Status:** Enforced Across All APIs and Mutations

---

## 1. Core Domain Invariants

1. **Tenant Isolation**:
   - Every event, ticket tier, order, attendee, and check-in belongs strictly to one `Company`.
   - Admin operations must authenticate and verify that the target entity belongs to `context.companyId`.
   - Cross-tenant viewing, modifying, deleting, or checking in tickets is strictly prohibited.

2. **Ticket Hierarchy & Allocation**:
   - A ticket tier (`EventTicket`) belongs to exactly one `Event`.
   - An individual issued ticket (`EventTicketAttendee`) belongs to exactly one `EventTicketPurchase`, one `EventTicket`, and one `Event`.
   - `quantitySold` for an `EventTicket` can NEVER exceed `quantityTotal`.
   - Total sales across all ticket tiers cannot exceed the `Event.maxCapacity` when event-level capacity is configured.

3. **Concurrency-Safe Inventory**:
   - Ticket allocation during checkout MUST use atomic database decrements / conditional updates with distributed locking (`withDistributedLock`).
   - Two concurrent buyers attempting to purchase the last available ticket will never both succeed.

4. **Payment & Ticket State Integrity**:
   - Paid tickets require authoritative server-side payment confirmation before status becomes `PAID`.
   - Free admission tickets (`price == 0` or total amount 0) are issued immediately with `paymentStatus: "PAID"`.
   - A purchase record (`EventTicketPurchase`) must create exactly $N$ distinct `EventTicketAttendee` records matching `quantity`.
   - Each `EventTicketAttendee` must possess an immutable, globally unique `ticketCode`.

5. **Check-in Security & Gate Invariants**:
   - A ticket can only be checked in if its `checkInStatus` is `PENDING` and payment is `PAID`.
   - Scanning an already checked-in ticket must return `ALREADY CHECKED IN` with the previous `checkedInAt` timestamp.
   - A ticket issued for Event A cannot be validated or checked in for Event B (`WRONG EVENT`).
   - Check-in reversal requires authorized operator access and records an audit trail.
   - Cancelled or refunded tickets (`checkInStatus: "CANCELLED"` or `paymentStatus: "REFUNDED"`) are strictly invalid for entry.

6. **Order Idempotency**:
   - Checkout requests are protected by distributed lock and idempotency keys to prevent duplicate order generation from rapid clicks or network retries.

7. **Customer Privacy & Scope**:
   - A customer (`Consumer` / `User`) can only access their own purchased tickets, attendee records, and orders.
   - Guest checkouts are associated securely by verified email and retrieval tokens.
