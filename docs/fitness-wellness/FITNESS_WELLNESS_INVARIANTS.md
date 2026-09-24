# SalesmanPro Fitness & Wellness Invariants

The following architectural, security, and operational invariants must be preserved across all Fitness & Wellness modules:

---

## 1. Digital Entitlements & Video Security
* **Server-Authoritative Content Gating:** A customer cannot access private/paid courses, lesson videos, or downloadable materials without a valid `FitnessEntitlement` or `CourseEnrollment` in status `ACTIVE`/`ENROLLED`.
* **Zero Client-Side Trust:** Frontend route guards, disabled buttons, or hidden DOM elements are never treated as security barriers. The API must reject direct requests to protected lesson assets.
* **Expiration Immediacy:** Once an entitlement or membership passes its `endDate`, access is immediately revoked on subsequent server checks.
* **Free Content Separation:** Publicly configured free lessons/materials must remain accessible without exposing paid resources.

---

## 2. Gym Attendance & Check-In Integrity
* **Active Status Mandatory:** A customer cannot be checked into a physical facility if their membership is expired, cancelled, or suspended.
* **Multi-Location Geofence:** If a customer holds a `SINGLE_LOCATION` membership, check-ins at other branch locations must be rejected.
* **Immutable Attendance Log:** Check-in records (`GymCheckIn`) are permanent historical audit items; they are never updated or deleted during regular operations.

---

## 3. Scheduling & Capacity Invariants
* **Trainer Double-Booking Prevention:** A trainer (`Educator`) cannot have overlapping sessions (`startTime < existing.endTime && endTime > existing.startTime`) with active status (`CONFIRMED` or `PENDING`).
* **Client Overlap Prevention:** A customer cannot be booked into two overlapping personal training sessions or classes simultaneously.
* **Class Capacity Enforcement:** Class bookings cannot exceed configured room/class capacity. Once capacity is reached, additional booking attempts must be rejected with appropriate feedback.
* **Start Time Ordering:** `startTime` must strictly precede `endTime`.

---

## 4. Commercial & Payment Invariants
* **Payment-Before-Entitlement:** Orders created with pending payment (e.g. M-Pesa STK push pending, Stripe intent incomplete) do not activate paid course access until the authoritative payment processor confirms success.
* **Tenant Scoping on Orders:** Every `CustomerOrder`, invoice, and receipt must be tied to the verified `companyId`. Cross-tenant order leakage is strictly prohibited.
* **Traceable POS Transactions:** POS transactions record cashier name, session ID, consumer identity (or designated walk-in customer profile), and print verifiable receipts.

---

## 5. Multi-Tenant Data Isolation
* **Strict Tenant Resolution:** All administration queries and mutations must filter by `companyId`. Slug identifiers are resolved through server-side tenant lookup before querying database collections.
* **No Cache Cross-Pollination:** Redis/in-memory cache keys must be prefixed with `tenant:${companyId}` to prevent cache collisions across different gym brands.
* **No Mock Fallback Data:** Production paths must never fall back to static or mock data files (`@/constant/Data.ts`) when database queries fail; they must return authoritative errors.
