# SalesmanPro Fitness & Wellness Functionality Map

## Overview
The SalesmanPro Fitness & Wellness platform is a complete operating system designed for fitness businesses, gyms, wellness studios, personal trainers, coaches, receptionists, members, and digital course consumers. Built natively on SalesmanPro's shared multi-tenant foundations, it bridges **Physical Gym Operations** with **Digital Training, Online Courses, Memberships, POS, and Scheduling**.

---

## 1. Domain Architecture & Relationships

```text
                             FITNESS BUSINESS (Company)
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
         LOCATIONS & FACILITIES      STAFF / TRAINERS        COMMERCE & POS
                 │                       │                       │
             FACILITIES               PROGRAMS             MEMBERSHIPS (Plans)
               ROOMS                  CLASSES              COURSE SALES
             EQUIPMENT               SCHEDULES             PRODUCTS & SERVICES
            MAINTENANCE              WORKOUTS              PAYMENTS & ORDERS
                 │                       │                       │
                 └───────────────────────┼───────────────────────┘
                                         │
                                 MEMBERS & CONSUMERS
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
            MEMBERSHIPS              BOOKINGS                TRAINING
                 │                       │                       │
          CHECK-INS & ACCESS      CAPACITY CHECKS         COURSES & MODULES
          LOCATION PERMITS        TRAINER AVAILABILITY    LESSONS & VIDEOS
                 │                       │                EXERCISES & PLANS
                 │                       │                PROGRESS & ENTITLEMENTS
                 └───────────────────────┼───────────────────────┘
                                         │
                                 CUSTOMER DASHBOARD
                                         │
                      ┌──────────────────┼──────────────────┐
                      │                  │                  │
                   PROFILE           ATTENDANCE         MESSAGES
                  PURCHASES           BOOKINGS          PROGRESS
```

---

## 2. Platform Subsystems

### A. Gym Operations & Facility Management
* **Locations (`Location`):** Multi-location support for gym branches. Each location tracks address, operating hours, capacity, and linked facilities.
* **Facilities & Rooms:** Studio rooms, weight rooms, cardio zones, yoga studios, personal training areas, saunas, and locker rooms.
* **Equipment & Inventory (`Equipment`):**
  * Tracking brand, model, serial number, location, room, condition (`NEW`, `EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `DAMAGED`), and operational status (`AVAILABLE`, `IN_USE`, `MAINTENANCE`, `OUT_OF_SERVICE`, `RETIRED`).
  * Maintenance scheduling: Next maintenance due date, last service date, notes.
* **Maintenance Logs (`EquipmentMaintenance`):**
  * Historical log of maintenance performed, technicians/vendors, cost, date, next maintenance recommendation, and status.

### B. Staff & Trainer Management
* **Trainers & Instructors (`Educator` linked to `User`):**
  * Profiles with bio, certifications, specialties, and experience.
  * Direct assignment to programs, classes, personal training bookings, and client training plans.
  * Trainer availability management and schedule conflict prevention.

### C. Fitness Programs & Classes
* **Programs (`Course` / `MarketplaceListings`):**
  * Weight loss, strength training, HIIT, yoga, pilates, endurance, mobility.
  * Structured as digital courses, physical programs, or blended memberships.
* **Classes & Scheduling (`Booking` / `Class`):**
  * Assigned trainer, location room, scheduled start/end times.
  * Server-enforced capacity limits.
  * Booking rules: prevents overbooking, trainer double-booking, and client double-booking.

### D. Digital Training & Video Learning
* **Curriculum Structure:**
  * Course → Modules (`CourseModule`) → Lessons (`CourseLesson`).
  * Attached protected video streams, resource attachments, workout splits, and exercises (`FitnessExercise`).
* **Content Access Control:**
  * Free content: accessible publicly or with standard registered account.
  * Paid/Private content: strictly gated by server-side verification (`verifyEntitlement`).
  * Entitlement sources: direct course purchase (`CourseEnrollment` / `FitnessEntitlement`), active all-access gym membership, or trainer/admin manual grant.
  * Immediate revocation upon expiration.

### E. Memberships & Attendance
* **Membership Plans (`MembershipPlan`):**
  * Configurable tiers (e.g. Bronze, Silver, Gold, VIP, All-Digital, All-Access).
  * Billing intervals (`MONTHLY`, `QUARTERLY`, `BIANNUAL`, `ANNUAL`, `LIFETIME`).
  * Location permissions (`ALL_LOCATIONS`, `SINGLE_LOCATION`, `NONE`).
  * Class inclusion rules and digital course access flags.
* **Active Memberships (`FitnessMembership`):**
  * Linked to `Consumer` and `Company`.
  * Start and end dates with status (`ACTIVE`, `EXPIRED`, `CANCELLED`, `SUSPENDED`).
* **Gym Check-Ins (`GymCheckIn`):**
  * Automated attendance recording via POS, receptionist desk, or member scan.
  * Real-time verification: checks active membership status, location permissions, and date validity before confirming admission.

### F. POS & Commercial Operations
* **Fitness POS (`/admin/${slug}/fitness-pos`):**
  * Unified cashier terminal selling memberships, classes, digital courses, drinks, and merchandise.
  * Customer selection or rapid walk-in guest creation.
  * Thermal receipt printing (browser popup and native desktop bridge).
  * Direct order persistence via `centralizedCreateOrder` and automatic entitlement activation.

### G. Customer Portal & Dashboard
* **Public Storefront (`/site/${slug}/fitness`):**
  * High-converting hero presentation, featured courses, classes, virtual tours, and trainers.
* **Customer Dashboard (`/site/${slug}/fitness/profile`):**
  * Authoritative stats: Active memberships, verified gym check-ins, enrolled courses, and upcoming bookings.
  * Interactive tabs:
    * Dashboard: Top metrics, recent check-ins, active membership status.
    * Workouts: Assigned training plans and daily exercise routines.
    * Programs: Enrolled digital courses with real curriculum progress bars.
    * Messages: Direct communication channel with assigned coaches and gym staff.
    * Settings: Profile configuration and notifications.

### H. Analytics & Executive Reporting
* **Reports Dashboard (`/admin/${slug}/fitness-reports`):**
  * Real-time revenue aggregation, active vs expiring memberships, attendance trends, class utilization, and trainer performance.
  * Zero mock/fallback data: directly queries MongoDB via Prisma models.
