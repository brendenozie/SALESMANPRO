# SalesmanPro Fitness & Wellness API Map

## 1. Gym Operations & Inventory
* `GET /api/admin/locationsv2?companyId=:idOrSlug`
  * Resolves company by ObjectId or slug. Returns gym locations, rooms, capacity, and linked facilities.
* `POST /api/admin/locationsv2`
  * Creates or updates a physical gym location under the verified tenant.
* `GET /api/admin/fitness-equipment?companyId=:idOrSlug&locationId=:locId`
  * Lists gym equipment inventory, filtered optionally by location.
* `POST /api/admin/fitness-equipment`
  * Registers new gym equipment (name, model, category, serial number, condition, status, location).
* `GET /api/admin/fitness-equipment/:id`
  * Fetches detailed equipment records including maintenance history.
* `PUT /api/admin/fitness-equipment/:id`
  * Updates equipment condition, status, assigned area, or next maintenance due date.
* `DELETE /api/admin/fitness-equipment/:id`
  * Deletes or archives equipment record.
* `POST /api/admin/fitness-equipment/maintenance`
  * Logs maintenance performed, costs, vendor details, and updates the equipment's condition and last service date.

## 2. Memberships & Attendance
* `GET /api/admin/fitness-memberships/plans?companyId=:idOrSlug`
  * Fetches all membership plans and pricing tiers for the company.
* `POST /api/admin/fitness-memberships/plans`
  * Creates a new membership plan (interval, price, location access, class access, digital course access).
* `GET /api/admin/fitness-memberships/plans/:id`
  * Retrieves a single membership plan.
* `PUT /api/admin/fitness-memberships/plans/:id`
  * Updates plan terms, pricing, or access flags.
* `GET /api/admin/fitness-memberships?companyId=:idOrSlug&status=:status`
  * Lists consumer memberships across the company, filtered by status (`ACTIVE`, `EXPIRED`, `CANCELLED`).
* `POST /api/admin/fitness-memberships`
  * Grants or registers a membership to a customer.
* `GET /api/admin/fitness-memberships/:id`
  * Fetches membership details, renewal history, and linked consumer.
* `PUT /api/admin/fitness-memberships/:id`
  * Modifies status (e.g. suspension, cancellation) or updates membership expiration.
* `POST /api/fitness/check-in`
  * Authoritative check-in endpoint. Accepts `{ consumerId, locationId, companyId, method }`. Validates active membership and location rights before recording `GymCheckIn`.

## 3. Digital Training & Entitlements
* `GET /api/fitness/entitlements/verify?consumerId=:id&courseId=:courseId&companyId=:comp`
  * Server-authoritative check verifying if the consumer has paid/membership rights to view course videos, lesson content, and downloadable training materials.
* `GET /api/admin/fitness-curriculum/:id/curriculum`
  * Resolves course modules, lessons, and curriculum structure for gym digital courses.
* `GET /api/member/my-courses?companyId=:comp`
  * Returns user's enrolled digital courses and active training programs.

## 4. Scheduling & Bookings
* `GET /api/admin/fitness-bookings?companyId=:idOrSlug`
  * Lists scheduled group classes, personal training appointments, and facility bookings.
* `POST /api/admin/fitness-bookings`
  * Creates booking. Automatically enforces trainer double-booking prevention and client conflict prevention.
* `PUT /api/admin/fitness-bookings/:bookingId`
  * Updates booking status, schedule time, assigned room, or trainer. Validates conflicts on schedule changes.
* `DELETE /api/admin/fitness-bookings/:bookingId`
  * Deletes a scheduled booking and invalidates tenant caches.
* `GET /api/member/appointments?companyId=:comp`
  * Retrieves customer-facing appointments and class bookings.

## 5. POS & Commercial Operations
* `POST /api/shop/serviceOrders`
  * Unified checkout and order placement for gym memberships, class passes, personal training, and merchandise. Integrates with `centralizedCreateOrder` and payment processors.
* `GET /api/member/invoices`
  * Retrieves past orders, receipts, and invoices for the logged-in customer.

## 6. Staff & Trainers
* `GET /api/admin/trainers?companyId=:idOrSlug`
  * Returns staff and trainers under the tenant.
* `GET /api/admin/fitness-clients?companyId=:idOrSlug`
  * Returns registered gym clients, members, and walk-in consumers.

## 7. Reports & Dashboard
* `GET /api/admin/fitness-report?companyId=:idOrSlug`
  * Aggregates real metrics: total members, active memberships, check-ins, total revenue, booking counts, and equipment status directly from Prisma collections.
