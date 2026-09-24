# School Platform — Path Functionality Matrix

> **Authoritative Functional & Data Integrity Audit Matrix**  
> **Target Tenant:** Mount Moriah International School (`slug: educational-online-courses`, `id: 683581bba1bdf6ca3624b530`)  
> **Status Codes:** `PASS`, `PARTIAL`, `BROKEN`, `BLOCKED`, `NOT_APPLICABLE`, `NOT_TESTED`

---

## 1. Academic Structure & Core Hierarchy

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/academic-years` | AcademicYear | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/academic-terms` | Term | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/departments` | Department | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/categories` | Category | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/academic-levels` | AcademicLevel | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/classrooms` | Classroom | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/teachers` | Educator / User | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/parents` | Parent / User | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/students` | Student / User | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/courses` | Course | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/course-materials` | CourseMaterial | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| `/admin/{slug}/lessons` | ClassSchedule | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |

---

## 2. Assignments, Exams & Grading

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/assignments` | CourseAssignment | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/exam-categories` | ExamCategory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/exams` | Exam | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/results` | ExamSubmission | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/grading-report-card` | Grade / ReportCard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |

---

## 3. Activities & Early Learning

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/activities` | Activity / Type | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/play/drawing` | Pupil Play Mode | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | N/A | PASS |
| `/admin/{slug}/play/story-time` | Pupil Play Mode | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | N/A | PASS |
| `/admin/{slug}/play/puzzle-play` | Pupil Play Mode | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | N/A | PASS |
| `/admin/{slug}/play/sing-along` | Pupil Play Mode | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | N/A | PASS |
| `/admin/{slug}/play/make-friends` | Pupil Play Mode | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | N/A | PASS |

---

## 4. Attendance, Events & Communications

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/attendance` | AttendanceRecord | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/school-events` | Event | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/schoolAnnouncements` | Announcement | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/messages` | Communication | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |

---

## 5. Library Operations

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/library-books-categories` | LibraryCategory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-books` | LibraryBook | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-members` | LibraryMember | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-issuance-records` | LibraryIssuance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-returns` | LibraryIssuance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-fines` | LibraryFine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-maintenance` | LibraryBook | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-reservations` | LibraryReservation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-suppliers-categories` | LibrarySupplierCategory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-suppliers` | LibrarySupplier | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-acquisitions` | LibraryAcquisition | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-inventory` | LibraryBook Stock | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/library-reports` | Library Metrics | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | PASS |

---

## 6. Transport Operations

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/transport-vehicles` | TransportVehicle | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/transport-routes` | TransportRoute | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/transport-drivers` | TransportDriver | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/transport-schedules` | TransportShift | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/transport-maintenance-records` | TransportMaintenance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/transport-fuel-logs` | TransportFuelLog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/transport-incidents` | TransportIncident | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/transport-reports` | Transport Metrics | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | PASS |

---

## 7. Hostel / Boarding Management

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/hostel-blocks` | HostelBlock | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/hostel-rooms` | HostelRoom | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/hostel-residents` | HostelMember | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/hostel-room-assignments` | HostelAllocation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/hostel-maintenance-requests` | HostelMaintenanceRequest | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/hostel-visitors` | HostelVisitor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/hostel-staff` | HostelStaff | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/hostel-reports` | Hostel Metrics | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | PASS |


---

## 8. Staff & Human Resources

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/staff-departments` | Department | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/staff-roles` | Role | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/staff-members` | StaffProfile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/staff-attendance` | StaffAttendanceRecord | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/staff-payroll` | StaffPayroll | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/staff-leave-management` | StaffLeave | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/staff-performance-reviews` | StaffPerformanceReview | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/staff-recruitment` | Candidate | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/staff-reports` | Staff Metrics | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | PASS |


---

## 9. Fees & Financial Operations

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/fee` | Fee Ledger | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/fee-structure` | FeeStructure | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/fee-items` | FeeItem | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/fee-invoices` | Invoice | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/fee-transactions` | PaymentTransaction | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/fee-expenses` | Expense | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/fee-profit-loss` | P&L Ledger | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | PASS |

---

## 10. Inventory & Asset Management

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/inventory-dashboard` | Stock Metrics | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/inventory-items` | InventoryItem | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/inventory-assets-overview` | Asset Overview | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/inventory-assets-list` | Asset | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/asset-tracking` | AssetTracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/inventory-categories` | InventoryCategory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/inventory-audits` | InventoryAudit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/inventory-suppliers` | Supplier | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/inventory-purchase-orders` | PurchaseOrder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/inventory-maintenance-records` | MaintenanceRecord | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/inventory-depreciation-schedules` | DepreciationSchedule | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/inventory-reports` | Inventory Reports | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | PASS |

---

## 11. Reports, Gallery & System Settings

| Path | Entity | GET | LIST | CREATE | EDIT | UPDATE | DELETE | Filters | Relations | Reports | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `/admin/{slug}/school-reports` | Summary Reports | ✅ | ✅ | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/gallery` | PhotoAlbum | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |
| `/admin/{slug}/settings` | Company Settings | ✅ | ✅ | N/A | ✅ | ✅ | N/A | ✅ | ✅ | ✅ | PASS |
