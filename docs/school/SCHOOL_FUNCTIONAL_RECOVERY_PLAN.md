# School Platform — Full Functional Recovery Plan

## 1. Executive Summary & Current Failures
The SalesmanPro School Platform has extensive implemented models, Prisma schemas, Next.js routes, and UI components. However, widespread runtime failures make the platform non-functional:
1. **Critical 404 / HTML-to-JSON crashes**: Frontend calls `/api/admin/terms?companyId=...` which returns a 404 HTML page (`<!DOCTYPE ...`), causing `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.
2. **Server Component 502 / Render Crashes**: Server Components throughout `app/admin/[slug]/*` execute `fetch(`${apiBaseUrl}/admin/...`)` where `apiBaseUrl` defaults to `/api` (or is set to `/api` in `.env`). In Node.js server environments, relative URLs in `fetch()` throw `TypeError: Failed to parse URL from /api/...`, triggering Next.js 502 Server Component errors or silently catching and discarding all real database records.
3. **Missing API Handlers for Mutations**: Endpoints like `PATCH /api/admin/academic-levels/[id]`, `DELETE /api/admin/academic-levels/[id]`, `PATCH /api/admin/parents/[id]`, and `DELETE /api/admin/parents/[id]` do not exist, returning 404 HTML upon edit/delete attempts.
4. **Endpoint URL Mismatches**: Sub-routes such as `assignments/[assignmentId]/submissions` call `/admin/assignments/${id}` instead of `/admin/course-assignments/${id}`. Exam submission routes call `/api/exams/...` and `/api/exam-submissions/...` instead of `/api/admin/exams` and `/api/admin/exam-submissions`.
5. **Contract Envelope Inconsistencies**: `departments/route.ts` double-wraps `{ data: response }` inside `formatResponse`, producing `{ success: true, data: { data: [...] } }`. `AcademicLevelsClient.tsx` expects an array directly from `res.json()`, causing `data.sort is not a function`.
6. **Admin vs Child UI Collision**: Admin menus under "Early Learning & Play" direct school administrators to toddler-facing games (`/admin/[slug]/play/drawing`, etc.) containing sample data and mock IDs (`YOUR_PLAYGROUP_ACADEMIC_LEVEL_ID`), while no admin activity management workspace exists despite full Prisma models (`ActivityType`, `Activity`, `ActivityAssignment`, `ActivityAttempt`).

---

## 2. Inventory & Audit Matrix of School Subsystems

| Feature / Domain | Frontend Route | Client Component | Authoritative API | API Status | DB Model | CRUD State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Academic Years** | `/admin/[slug]/academic-years` | `AcademicYearsClient.tsx` | `/api/admin/academic-years` | Exists; needs safe server fetch | `AcademicYear` | GET/POST/PUT/DELETE |
| **Academic Terms** | `/admin/[slug]/academic-terms` | `TermsManagerClient.tsx` | `/api/admin/academic-terms` | `/api/admin/terms` was 404; needs alias & route alignment | `Term` | GET/POST/PUT/DELETE |
| **Academic Levels** | `/admin/[slug]/academic-levels` | `AcademicLevelsClient.tsx` | `/api/admin/academic-levels` | List/Create exist; `[id]` route missing for PATCH/DELETE | `AcademicLevel` | PATCH/DELETE was broken |
| **Classrooms** | `/admin/[slug]/classrooms` | `ClassroomsClient.tsx` | `/api/admin/classrooms` | Exists; needs safe server fetch | `Classroom` | GET/POST/PUT/DELETE |
| **Educators/Teachers**| `/admin/[slug]/teachers` | `TeachersClient.tsx` | `/api/admin/educators` | Exists; server fetch was failing | `Educator`, `User` | GET/POST/PATCH/DELETE |
| **Students** | `/admin/[slug]/students` | `StudentsClient.tsx` | `/api/admin/students` | Exists; server fetch was failing; null guard needed | `Student`, `User` | GET/POST/PUT/DELETE |
| **Parents** | `/admin/[slug]/parents` | `ParentsClient.tsx` | `/api/admin/parents` | List/Create exist; `[id]` route missing for PATCH/DELETE | `Parent`, `User` | PATCH/DELETE was broken |
| **Courses** | `/admin/[slug]/courses` | `CoursesClient.tsx` | `/api/admin/courses` | Exists; server fetch was failing | `Course` | GET/POST/PUT/DELETE |
| **Assignments** | `/admin/[slug]/assignments` | `AdminAssignmentsOverviewPage.tsx` | `/api/admin/course-assignments` | Exists; sub-routes called `/admin/assignments` | `CourseAssignment` | GET/POST/DELETE |
| **Exams** | `/admin/[slug]/exams` | `AdminExamsOverviewPage.tsx` | `/api/admin/exams` | Exists; submissions called `/api/exams` | `Exam` | GET/POST/PUT/DELETE |
| **Grades** | `/admin/[slug]/grading-report-card` | `GradingReportsClient.tsx` | `/api/admin/report-card/bulk` | Exists; SSR works via direct Prisma | `Grade`, `ReportCard` | Bulk generation / View |
| **Attendance** | `/admin/[slug]/attendance` | `AttendanceClient.tsx` | `/api/admin/attendance` | Exists | `Attendance` | GET/POST |
| **Departments** | `/admin/[slug]/departments` | `DepartmentsClient.tsx` | `/api/admin/departments` | Response envelope double-nesting fixed | `Department` | GET/POST |
| **Activities (Admin)**| `/admin/[slug]/activities` | `AdminActivitiesClient.tsx` | `/api/admin/activities` | Missing `[id]` & `activity-types` routes | `Activity`, `ActivityType` | Need full Admin CRUD |
| **Activity Assign** | `/admin/[slug]/activities/assign` | `AssignActivityModal.tsx` | `/api/admin/activity-assignments` | Exists | `ActivityAssignment` | POST/DELETE |
| **Activity Results**| `/admin/[slug]/activities/results`| `ActivityResultsDrawer.tsx` | `/api/admin/activity-attempts` | Exists | `ActivityAttempt` | GET |
| **Pupil Play** | `/admin/[slug]/play/*` | Child game components | `/api/student/courses` | Role-restricted to PUPIL/STUDENT | `Activity` / `Course` | Interactive |

---

## 3. Shared Root Causes & Architectural Fixes

### A. Universal Server Fetch Helper (`lib/api/serverFetch.ts`)
Instead of `const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"` causing `fetch("/api/...")` failures on Node, create a robust server fetch utility:
- Automatically resolves the current origin via Next.js `headers()` (host, x-forwarded-proto).
- Forwards incoming session cookies.
- Implements fallback error handling that returns `{ ok: false, data: null }` rather than crashing Server Components.

### B. Universal Client Safe-Fetch Helper (`lib/api/clientFetch.ts`)
Instead of naked `const data = await res.json()`, create `clientFetchJson<T>`:
- Checks HTTP status and `Content-Type` before parsing.
- If response is HTML (404/500), creates a clean structured error without throwing `Unexpected token '<'`.
- Automatically unwraps standard `{ success: true, data: T }` envelopes while safely tolerating raw arrays or legacy `{ data: { data: T } }` payloads.

### C. Missing API Routes & Aliases
1. Create `/api/admin/terms/route.ts` and `/api/admin/terms/[id]/route.ts` as canonical forwarding handlers to `/api/admin/academic-terms`.
2. Create `/api/admin/academic-levels/[id]/route.ts` implementing `PATCH` and `DELETE`.
3. Create `/api/admin/parents/[id]/route.ts` implementing `PATCH` and `DELETE`.
4. Create `/api/admin/activity-types/route.ts` implementing `GET` and `POST` (with auto-seeding for default types: Drawing, Story Time, Puzzle Play, Sing Along, Make Friends).
5. Create `/api/admin/activities/[id]/route.ts` implementing `PATCH` and `DELETE`.
6. Create `/api/admin/assignments/route.ts` and `[id]/route.ts` as aliases to `/api/admin/course-assignments`.

### D. Activity Architecture Separation (Admin vs Child)
1. **Admin Workspace**: Build `app/admin/[slug]/activities/page.tsx` and `AdminActivitiesClient.tsx`:
   - Categorized activity management (Drawing, Story Time, Puzzle Play, Sing Along, Make Friends).
   - CRUD actions: Create, Edit, Publish/Unpublish, Delete.
   - Assignment modal: Assign activity to Classrooms or Students (`ActivityAssignment`).
   - Results & Attempts view: See student submissions, completion statuses, and scores (`ActivityAttempt`).
2. **Menu Alignment**: Update `constant/CATEGORY_MENUS.ts` so Admin menu `"Early Learning & Play"` / `"Activities"` routes to `/admin/${adminSlug}/activities`.
3. **Child Workspace**: Maintain `/admin/[slug]/play/*` for Student/Pupil roles, connected to real assigned activities instead of hardcoded sample data.

---

## 4. Phased Execution Roadmap

### Phase 1: Stop Crashes & Establish Client/Server Invariants
- Deploy `lib/api/serverFetch.ts` and `lib/api/clientFetch.ts`.
- Fix `/api/admin/terms` 404 by adding the alias route and aligning `TermsManagerClient.tsx` to `/api/admin/academic-terms`.
- Fix `app/admin/[slug]/page.tsx` and Server Components in school pages to use `serverFetch`.

### Phase 2: Complete Missing CRUD API Endpoints
- Implement `app/api/admin/academic-levels/[id]/route.ts` (PATCH, DELETE).
- Implement `app/api/admin/parents/[id]/route.ts` (PATCH, DELETE).
- Implement `app/api/admin/activity-types/route.ts` (GET, POST with default seeder).
- Implement `app/api/admin/activities/[id]/route.ts` (PATCH, DELETE).
- Implement `/api/admin/assignments` alias to `course-assignments`.
- Reconcile `departments/route.ts` response format.

### Phase 3: Repair School Management Frontend Pages
- Reconnect `academic-terms`, `academic-years`, `academic-levels`, `classrooms`, `teachers`, `students`, `parents`, `courses`, `assignments`, and `exams` to consume authoritative data without crashing.
- Remove fake fallback data overwrites in components where real database queries exist.

### Phase 4: Build Admin Activity Management Experience
- Construct `app/admin/[slug]/activities/page.tsx` and `AdminActivitiesClient.tsx`.
- Connect activity assignment and attempt review workflows.
- Update `CATEGORY_MENUS.ts` navigation links.

### Phase 5: Verification & Full Regression
- Verify end-to-end flows: Academic Setup -> Classrooms -> Teachers -> Students -> Courses -> Assignments -> Grading -> Activities.
- Ensure all mutations persist across page reloads.
- Produce `docs/school/SCHOOL_FUNCTIONAL_RECOVERY_REPORT.md`.
