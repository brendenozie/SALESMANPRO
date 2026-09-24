# SalesmanPro Fitness & Wellness CRUD Matrix

| Entity | Model / Collection | List / Read | Create | Update / Edit | Delete / Archive | Tenant Scoped | Authorization | Primary API Endpoints |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Gym Locations** | `Location` | Yes | Yes | Yes | Yes | Yes (`companyId`) | Admin, Staff | `/api/admin/locationsv2` |
| **Gym Equipment** | `Equipment` | Yes | Yes | Yes | Yes | Yes (`companyId`) | Admin, Staff | `/api/admin/fitness-equipment`<br>`/api/admin/fitness-equipment/[id]` |
| **Equipment Maintenance** | `EquipmentMaintenance` | Yes | Yes | Yes | No (Audit Trail) | Yes (`companyId`) | Admin, Staff | `/api/admin/fitness-equipment/maintenance` |
| **Membership Plans** | `MembershipPlan` | Yes | Yes | Yes | Yes (Archive) | Yes (`companyId`) | Admin | `/api/admin/fitness-memberships/plans`<br>`/api/admin/fitness-memberships/plans/[id]` |
| **Consumer Memberships** | `FitnessMembership` | Yes | Yes | Yes | Yes (Status change) | Yes (`companyId`) | Admin, Receptionist | `/api/admin/fitness-memberships`<br>`/api/admin/fitness-memberships/[id]` |
| **Gym Check-Ins** | `GymCheckIn` | Yes | Yes | No (Immutable Log) | No | Yes (`companyId`) | Member, Receptionist | `/api/fitness/check-in` |
| **Entitlements** | `FitnessEntitlement` | Yes | Yes | Yes | Yes (Revoke) | Yes (`companyId`) | System, Admin | `/api/fitness/entitlements/verify` |
| **Trainers & Staff** | `Educator` / `User` | Yes | Yes | Yes | Yes | Yes (`companyId`) | Admin | `/api/admin/trainers`<br>`/api/admin/trainers/[id]` |
| **Programs & Courses** | `Course` / `MarketplaceListings` | Yes | Yes | Yes | Yes | Yes (`companyId`) | Admin, Trainer | `/api/admin/fitness-curriculum`<br>`/api/admin/pos-marketplace-listings` |
| **Modules & Lessons** | `CourseModule`<br>`CourseLesson` | Yes | Yes | Yes | Yes | Yes (`companyId`) | Admin, Trainer | `/api/admin/fitness-curriculum/[id]/curriculum` |
| **Bookings & Classes** | `Booking` | Yes | Yes | Yes | Yes | Yes (`companyId`) | Admin, Member, Trainer | `/api/admin/fitness-bookings`<br>`/api/admin/fitness-bookings/[bookingId]`<br>`/api/member/appointments` |
| **Training Plans** | `FitnessTrainingPlan` | Yes | Yes | Yes | Yes | Yes (`companyId`) | Trainer, Admin | `/api/site/[slug]/me/fitness` |
| **Exercises** | `FitnessExercise` | Yes | Yes | Yes | Yes | Yes (`companyId`) | Trainer, Admin | `/server/services/fitnessService` |
| **POS Sales & Orders** | `CustomerOrder` | Yes | Yes | Yes | No (Audit Trail) | Yes (`companyId`) | Cashier, Admin | `/api/shop/serviceOrders`<br>`/api/admin/orders` |
| **Member Profiles** | `Consumer` / `User` | Yes | Yes | Yes | No | Yes (`companyId`) | Member, Admin | `/api/member/profile`<br>`/api/admin/fitness-clients` |
| **Virtual Tours** | `VirtualTour` | Yes | Yes | Yes | Yes | Yes (`companyId`) | Admin | `/api/admin/virtual-tours` |
| **Reports & Analytics** | Aggregated Views | Yes | N/A | N/A | N/A | Yes (`companyId`) | Admin, Manager | `/api/admin/fitness-report` |
| **Company Settings** | `CompanySettings` | Yes | Yes | Yes | No | Yes (`companyId`) | Admin | `/api/admin/fitness-settings` |
