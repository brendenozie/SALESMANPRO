# School Platform — CRUD & Data Integrity Failure Log

> **Failure Classification Layers:**  
> `UI_FORM` | `CLIENT_STATE` | `REQUEST_PAYLOAD` | `API_ROUTE` | `AUTHORIZATION` | `TENANT_RESOLUTION` | `VALIDATION` | `SERVICE_LOGIC` | `PRISMA_QUERY` | `DATABASE` | `CACHE` | `REVALIDATION` | `UI_REFRESH`

---

## Failure Index

## Failure Index

### [FAIL-001] Missing `companyId` on Academic Years and Terms DELETE
- **Route:** `/admin/{slug}/academic-years`
- **Entity:** `AcademicYear`, `Term`
- **Operation:** `DELETE`
- **Expected:** Deleting an academic year or term safely removes the record scoped to tenant company.
- **Actual:** API returned 400 "Company ID missing" because the client did not send `?companyId=...`.
- **Root Cause:** DELETE fetch call in `AcademicYearsClient.tsx` omitted `companyId` query param.
- **Layer:** `API_ROUTE` / `REQUEST_PAYLOAD`
- **Fix:** Appended `?companyId=${encodeURIComponent(companyId)}` in `handleDeleteYear` and `handleDeleteTerm`.
- **Test Result:** PASS

### [FAIL-002] Server Component 502 / Render Crashes via Relative `fetch`
- **Route:** `/admin/{slug}/course-materials`, `/admin/{slug}/lessons`
- **Entity:** `CourseMaterial`, `ClassSchedule`
- **Operation:** `GET` / `LIST` (SSR)
- **Expected:** Pages render with real database records for materials, timetable schedules, courses, educators, and academic levels.
- **Actual:** SSR threw `TypeError: Failed to parse URL from /api/...` in Node.js, silently swallowed by `try/catch`, rendering empty tables or mock fallbacks.
- **Root Cause:** Server components used `fetch(`${apiBaseUrl}/admin/...`)` where `apiBaseUrl` defaulted to `/api`. Node.js native fetch requires absolute URLs.
- **Layer:** `SERVICE_LOGIC` / `API_ROUTE`
- **Fix:** Replaced naked server `fetch` with `serverFetchJson` from `@/lib/api/serverFetch`, forwarding session cookies and resolving internal origin.
- **Test Result:** PASS

### [FAIL-003] Invalid UUID Validation on MongoDB ObjectIds in Departments
- **Route:** `/admin/{slug}/departments`
- **Entity:** `Department`
- **Operation:** `UPDATE`
- **Expected:** Department head educator can be assigned and updated.
- **Actual:** Zod schema validation rejected ObjectId with "Invalid uuid".
- **Root Cause:** `headId: z.string().uuid().optional()` in `app/api/admin/departments/[id]/route.ts`. MongoDB uses 24-character hexadecimal IDs.
- **Layer:** `VALIDATION`
- **Fix:** Changed validation to `z.string().optional().nullable()`.
- **Test Result:** PASS

### [FAIL-004] Double JSON Envelope Wrapping in Departments API
- **Route:** `/admin/{slug}/departments`
- **Entity:** `Department`
- **Operation:** `GET`, `UPDATE`, `DELETE`
- **Expected:** Standard response format `{ success: true, data: T }`.
- **Actual:** Handler called `formatResponse(true, { data: dept })`, creating `{ success: true, data: { data: dept } }`, breaking client consumers.
- **Root Cause:** Double nesting in route response.
- **Layer:** `API_ROUTE`
- **Fix:** Passed raw data object to `formatResponse`.
- **Test Result:** PASS

### [FAIL-005] Broken `id` Extraction in Course PATCH
- **Route:** `/admin/{slug}/courses`
- **Entity:** `Course`
- **Operation:** `UPDATE`
- **Expected:** Updating course persists changes.
- **Actual:** PATCH crashed with Prisma P2025 "Course not found" if `body.id` was not sent.
- **Root Cause:** `const { id: updatedId, ...data } = body;` where `updatedId` was `undefined` instead of falling back to `params.id`.
- **Layer:** `REQUEST_PAYLOAD` / `API_ROUTE`
- **Fix:** Implemented `const targetCourseId = updatedId || oldId;` and transactional join updates.
- **Test Result:** PASS

### [FAIL-006] Typo in Categories Fetch Options (`include: 'credentials'`)
- **Route:** `/admin/{slug}/categories`
- **Entity:** `Category`
- **Operation:** `UPDATE`, `DELETE`, `REORDER`
- **Expected:** Session cookies forwarded on mutations.
- **Actual:** Used invalid option `{ include: 'credentials' }` causing fetch warnings and potential unauthenticated rejects.
- **Root Cause:** Object key typo in `CategoryManagerClient.tsx`.
- **Layer:** `CLIENT_STATE` / `REQUEST_PAYLOAD`
- **Fix:** Changed to `credentials: 'include'` and ensured `companyId` query parameter on DELETE.
- **Test Result:** PASS

### [FAIL-007] Relative SSR Fetch and Empty State in Fee Expenses & Profit/Loss
- **Route:** `/admin/{slug}/fee-expenses`, `/admin/{slug}/fee-profit-loss`
- **Entity:** `Expense`, `FinancialLedger`
- **Operation:** `GET` / `LIST` (SSR)
- **Expected:** Server pages render authoritative financial ledger and expense metrics directly from database.
- **Actual:** Pages executed relative `fetch(/api/...)` on the server which threw `TypeError: Failed to parse URL` in Node.js, defaulting to empty arrays.
- **Root Cause:** Next.js Server Components cannot invoke relative URLs. Client components also suffered from double-wrapped JSON unwrapping bugs (`data.data`).
- **Layer:** `SERVICE_LOGIC` / `CLIENT_STATE`
- **Fix:** Refactored server components to query Prisma directly for `Expense` and `Company`, passing serializable props down to client components.
- **Test Result:** PASS

### [FAIL-008] Invalid Relation Include & Missing [id] Endpoint in Fee Structure
- **Route:** `/admin/{slug}/fee-structure`
- **Entity:** `FeeStructure`
- **Operation:** `GET`, `PUT`, `DELETE`
- **Expected:** Fee structures load with attached academic level information and allow updates and deletion.
- **Actual:** Page threw Prisma error: `Unknown field 'academicLevel' on FeeStructureInclude`. There was also no `app/api/admin/fee-structure/[id]/route.ts`.
- **Root Cause:** `academicLevel` relation was renamed or did not exist directly on `FeeStructure` in `schema.prisma`. Missing `[id]` route for updates and deletes.
- **Layer:** `PRISMA_QUERY` / `API_ROUTE`
- **Fix:** Corrected includes to `items: { include: { feeItem: true } }`, enriched items with academic level names, and created `app/api/admin/fee-structure/[id]/route.ts` with complete GET, PUT, and cascade DELETE handlers.
- **Test Result:** PASS

### [FAIL-009] Unawaited `params` and Missing GET in Fee Items [id] Route
- **Route:** `/admin/{slug}/fee-items`
- **Entity:** `FeeItem`
- **Operation:** `GET`, `PUT`, `DELETE`
- **Expected:** Fetching individual fee item or updating/deleting resolves the item ID properly.
- **Actual:** Next.js 15 runtime error accessing `params.id` synchronously, and no GET handler was defined.
- **Root Cause:** Next.js 15 requires awaiting dynamic route params (`const { id } = await params`). Missing GET handler in `app/api/admin/fee-items/[id]/route.ts`.
- **Layer:** `API_ROUTE`
- **Fix:** Added `await params` resolution and implemented GET handler returning authoritative fee item record.
- **Test Result:** PASS

### [FAIL-010] Missing GET and PUT Mutation Handlers in Expenses [id] Route
- **Route:** `/admin/{slug}/fee-expenses`
- **Entity:** `Expense`
- **Operation:** `GET`, `PUT`
- **Expected:** Individual expense records can be loaded and edited.
- **Actual:** `app/api/admin/expenses/[id]/route.ts` only implemented DELETE; GET and PUT returned 405 Method Not Allowed.
- **Root Cause:** Incomplete CRUD implementation in API route.
- **Layer:** `API_ROUTE`
- **Fix:** Implemented robust GET and PUT handlers with tenant scoping and validation against `ExpenseCategory` and `PaymentMethod` enums.
- **Test Result:** PASS

### [FAIL-011] Relative Fetch Failures in Inventory Server Components
- **Route:** `/admin/{slug}/inventory-categories`, `inventory-audits`, `inventory-maintenance-records`, `inventory-reports`, `inventory-purchase-orders`
- **Entity:** `InventoryCategory`, `InventoryAudit`, `MaintenanceRecord`, `PurchaseOrder`
- **Operation:** `GET` / `LIST` (SSR)
- **Expected:** Inventory pages render real database records for categories, stock audits, maintenance logs, purchase orders, and analytics.
- **Actual:** Server pages crashed with `TypeError: Failed to parse URL` when executing `fetch('/api/...')`.
- **Root Cause:** Relative URL calls inside Node.js Server Components.
- **Layer:** `SERVICE_LOGIC`
- **Fix:** Replaced relative fetch calls with direct Prisma queries (`prisma.category.findMany`, `prisma.inventoryAudit.findMany`, `prisma.maintenanceRecord.findMany`, `prisma.purchaseOrder.findMany`), properly serializing dates and IDs for client components.
- **Test Result:** PASS

### [FAIL-012] Hardcoded Mock Data Masking Database in Inventory Client Components
- **Route:** `/admin/{slug}/inventory-categories`, `/admin/{slug}/inventory-reports`, `/admin/{slug}/inventory-maintenance-records`, `/admin/{slug}/inventory-audits`
- **Entity:** Multiple inventory models
- **Operation:** `LIST` / `DISPLAY`
- **Expected:** UI displays authoritative database records.
- **Actual:** Client components contained hardcoded fallback objects and sample data tables, completely ignoring props from the server.
- **Root Cause:** Static placeholder data leftover from initial UI scaffolding.
- **Layer:** `CLIENT_STATE` / `UI_FORM`
- **Fix:** Refactored client components (`InventoryCategoriesClient`, `InventoryReportsClient`, `MaintenanceManagementClient`, `IssuanceManagementClient`) to accept dynamic props and compute live totals and aggregates from database rows.
- **Test Result:** PASS

### [FAIL-013] Missing Dedicated Inventory API Endpoints
- **Route:** `/api/admin/inventory-items`, `/api/admin/inventory-assets`, `/api/admin/inventory-audits`, `/api/admin/asset-tracking`
- **Entity:** `Product`, `InventoryItem`, `Asset`, `InventoryAudit`, `AssetTracking`
- **Operation:** `GET`, `POST`, `PUT`, `DELETE`
- **Expected:** Full CRUD APIs supporting inventory items, school physical assets, physical audits, and asset tracking movement.
- **Actual:** API endpoints did not exist (404 Not Found), preventing mutations from client modals.
- **Root Cause:** Missing route handlers in `app/api/admin/`.
- **Layer:** `API_ROUTE`
- **Fix:** Implemented complete route handlers with company tenant scoping, input validation, and proper enum mapping for `AssetCategory`, `AssetStatus`, `InventoryAuditStatus`, and `AssetTrackingAction`.
- **Test Result:** PASS

### [FAIL-014] Copy-Pasted Term Logic in Galleries [id] Route
- **Route:** `/admin/{slug}/gallery`
- **Entity:** `Gallery`, `GalleryItem`
- **Operation:** `GET`, `PUT`, `DELETE`
- **Expected:** Gallery albums and associated media items are updated or deleted cleanly.
- **Actual:** `app/api/admin/galleries/[id]/route.ts` executed `prisma.term.findUnique`, `prisma.term.update`, and `prisma.term.delete`, corrupting or failing on academic terms instead of photo galleries!
- **Root Cause:** Copy-paste bug from academic terms route during initial creation.
- **Layer:** `SERVICE_LOGIC` / `PRISMA_QUERY`
- **Fix:** Completely rewrote `app/api/admin/galleries/[id]/route.ts` to perform authoritative operations on `prisma.gallery` and cascade delete associated `prisma.galleryItem` records with awaited route params.
- **Test Result:** PASS

### [FAIL-015] Missing Routes for Asset Overview, Asset Tracking & Depreciation Schedules
- **Route:** `/admin/{slug}/inventory-assets-overview`, `/admin/{slug}/asset-tracking`, `/admin/{slug}/inventory-depreciation-schedules`
- **Entity:** `Asset`, `AssetTracking`
- **Operation:** `GET` / `LIST`
- **Expected:** Routes in navigation open functional views for fixed assets, asset transfers, and depreciation schedules.
- **Actual:** Navigation links returned 404 because page files were missing.
- **Root Cause:** Navigation exposed granular sub-paths that had not been scaffolded.
- **Layer:** `SERVICE_LOGIC`
- **Fix:** Created `app/admin/[slug]/inventory-assets-overview/page.tsx`, `app/admin/[slug]/asset-tracking/page.tsx`, and `app/admin/[slug]/inventory-depreciation-schedules/page.tsx`, connecting them to `AssetTrackingClient` with authoritative Prisma asset data and calculated depreciation schedules.
- **Test Result:** PASS

### [FAIL-016] Company Settings Phone Field Mismatch
- **Route:** `/admin/{slug}/settings`
- **Entity:** `Company`
- **Operation:** `UPDATE`
- **Expected:** School contact information (phone, address, email) updates persist to database.
- **Actual:** Prisma rejected update with `Unknown argument 'phoneNumber' on CompanyUpdateInput`.
- **Root Cause:** In the Prisma schema, `Company` model uses `contactPhone` rather than `phoneNumber`.
- **Layer:** `PRISMA_QUERY`
- **Fix:** Standardized settings update handlers to write to `contactPhone` field on the `Company` record.
- **Test Result:** PASS

