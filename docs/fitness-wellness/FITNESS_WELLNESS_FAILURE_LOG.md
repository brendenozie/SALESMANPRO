# SalesmanPro Fitness & Wellness Failure Log

This document records the architectural defects, disconnected flows, and bugs discovered during the comprehensive platform audit, along with the precise resolutions implemented.

---

### Issue 1: Hardcoded Mock Data in Reports & Admin Dashboard
* **Symptom:** Opening `/admin/${adminSlug}/fitness-reports` or `/admin/${adminSlug}/fitness-dashboard` displayed fake charts and mock data sourced from `@/constant/Data.ts` (`getReportsData`, `getDashboardData`).
* **Root Cause:** Placeholder mockup functions were never wired to real database queries.
* **Resolution:** Replaced all mock calls with `getFitnessReportData(company.id)` and `getFitnessDashboardMetrics(company.id)` in `server/services/fitnessService.ts`, aggregating live data from `Consumer`, `FitnessMembership`, `GymCheckIn`, `Booking`, and `CustomerOrder`.

### Issue 2: Legacy School Curriculum Leak in Fitness Dashboard
* **Symptom:** The lower section of `/admin/${adminSlug}/fitness-dashboard` rendered a component titled "Grade 7 Mathematics - Term 1" with student grades and exam scores.
* **Root Cause:** A copy-pasted component `TeachersStudentListPage.tsx` from the School module was left active in the fitness view.
* **Resolution:** Replaced the legacy school component with `FitnessOperationsMonitor`, displaying real-time gym check-ins, member status, and facility utilization.

### Issue 3: Disconnected Next.js Route Parameters in Curriculum & Reports
* **Symptom:**
  * `/api/admin/fitness-curriculum/[id]/curriculum/route.ts` returned 500 when accessing `params.courseId`.
  * `/api/admin/fitness-report/route.ts` failed when attempting to read `context.params.adminSlug`.
* **Root Cause:** In Next.js App Router, dynamic folder `[id]` yields `params.id`, not `params.courseId`. Similarly, routes without folder parameters cannot read dynamic params from context.
* **Resolution:** Normalized parameter resolution in `fitness-curriculum` to accept either `params?.id` or `params?.courseId`, and updated `fitness-report` to read `companyId` / `slug` from query search parameters.

### Issue 4: ObjectId Casting Crashes in Location Resolution
* **Symptom:** Calls to `/api/admin/locationsv2?companyId=fitness-gym` crashed with MongoDB ObjectId casting errors.
* **Root Cause:** The endpoint passed `companyId` directly into `prisma.company.findUnique({ where: { id: companyId } })`, which threw an unhandled exception when a slug was passed.
* **Resolution:** Updated `locationsv2` GET and POST to check whether the identifier matches an ObjectId format; if not, it queries by `slug: identifier`.

### Issue 5: Cache Poisoning on Virtual Tours and Trainers
* **Symptom:** Navigating to `/admin/${adminSlug}/fitness-virtual-tours` or `/admin/${adminSlug}/fitness-trainers` after saving resulted in empty or broken lists.
* **Root Cause:** Handlers performed `findUnique({ select: { id: true } })` to verify company existence and mistakenly cached that `{ id: true }` object as the complete list of trainers/tours.
* **Resolution:** Removed premature cache sets and ensured caches only store full formatted entity arrays.

### Issue 6: Unprotected Digital Training Materials & Video Content
* **Symptom:** On the storefront course detail page (`/site/${slug}/fitness/products/[id]`), downloadable lesson files were accessible directly without membership or purchase verification.
* **Root Cause:** Download links had no server entitlement gate.
* **Resolution:** Implemented server-side entitlement check (`verifyEntitlement`) in `FitnessWellnessView.tsx`. Download buttons are locked with visual feedback for unentitled users, and "Start Training" prompts enrollment via `CourseCheckoutView`.

### Issue 7: Fake Settings Persistence in Fitness Settings
* **Symptom:** Clicking "Save Settings" on `/admin/${adminSlug}/fitness-settings` displayed a simulated `setTimeout` alert without writing to the database.
* **Root Cause:** `SettingsClient.tsx` had a frontend-only mock state with no PUT fetch handler.
* **Resolution:** Created `app/api/admin/fitness-settings/route.ts` and connected `SettingsClient.tsx` to persist notification toggles, booking windows, and gym policies to `companySettings` and `company` records.

### Issue 8: Missing Booking Conflict & Double-Booking Prevention
* **Symptom:** Booking creation and edits in `/admin/${adminSlug}/fitness-bookings` allowed overlapping trainer sessions and client double-bookings.
* **Root Cause:** The booking API did not check for overlapping active bookings.
* **Resolution:** Added server-side conflict detection in `app/api/admin/fitness-bookings/route.ts` and `[bookingId]/route.ts`. Overlapping sessions for trainers or clients return HTTP 409 Conflict.

### Issue 9: Storefront Profile Dummy Cards
* **Symptom:** The member dashboard (`/site/${slug}/fitness/profile`) showed dummy "Push Day" workout cards and "28-Day Marathon Prep" mock programs.
* **Root Cause:** Views were using hardcoded placeholder data.
* **Resolution:** Updated `page.tsx`, `DashboardView.tsx`, `ProgramsView.tsx`, `WorkoutsView.tsx`, and `MessagesView.tsx` to consume real user fitness data (`items`, `memberships`, `checkIns`, `trainingPlans`, `bookings`) with authentic empty states and direct action links.
