# SalesmanPro — Real Estate & Property Management Platform Implementation Plan

## Executive Summary
This document outlines the systematic, phased engineering plan to transform SalesmanPro's Real Estate and Property Management modules into a unified, production-ready property operating system. All implementations reuse canonical platforms (`marketplaceListings`, `Consumer`, `Booking`, `HostelBlock/Room/Member/Allocation/MaintenanceRequest/Visitor/Fee`, `Payment`, `Wishlist`).

---

## Phase Breakdown

### Phase 1: Canonical Data Access & Missing API Endpoints (P0/P1)
**Goal:** Eliminate 404s and establish complete CRUD contracts for all property entities.
1. **Property Listing Mutation Endpoint:**
   - File: `app/api/admin/my-market-place/[id]/route.ts`
   - Implement: `GET`, `PATCH/PUT`, `DELETE` (safe archive when active bookings/tenants exist).
2. **Inquiry & CRM Fixes:**
   - File: `app/api/admin/inquiries/route.ts` & `[inquiryId]/route.ts`
   - Resolve company by slug or ObjectId; add `DELETE` and `PATCH` for status updates.
3. **Property Maintenance Resolution:**
   - File: `app/api/admin/property/maintenance/[id]/route.ts`
   - Implement `PATCH` (status transitions: `PENDING` $\to$ `IN_PROGRESS` $\to$ `COMPLETED`, resolution notes, cost, assigned staff).
4. **Room Management Mutations:**
   - File: `app/api/admin/property/rooms/[id]/route.ts`
   - Add `PATCH` and `DELETE` (with room occupancy guard).
5. **Commercial Tenant Allocation:**
   - File: `app/api/admin/property/allocate/route.ts` and `room-assignments/route.ts`
   - Enable `consumerId` allocation alongside educational roles.
6. **Customer Wishlist Persistence:**
   - File: `app/api/me/wishlist/route.ts`
   - Implement `POST` (add to saved properties) and `DELETE` (remove bookmark).

---

### Phase 2: Short-Term Rental & Availability Engine (P1)
**Goal:** Prevent double-bookings with transactional server-side date validation and pricing engine.
1. **Availability & Pricing Endpoint:**
   - File: `app/api/properties/[id]/availability/route.ts`
   - Returns date ranges booked, nightly rate, cleaning fee, taxes, deposit, and total quote.
2. **Transactional Booking Endpoint:**
   - File: `app/api/properties/[id]/book/route.ts`
   - Enforces overlap check: $(CheckIn_{new} < CheckOut_{existing}) \land (CheckOut_{new} > CheckIn_{existing})$.
   - Creates `Booking` record with `PENDING` status.
3. **Storefront Booking & Offering UI:**
   - Files: `app/site/[slug]/realestate/listings/[id]/PropertyDetailsClient.tsx` and `app/site/[slug]/propertymanagement/listings/[id]/PropertyDetailsClient.tsx`
   - Interactive date picker with disabled booked dates.
   - Price breakdown (nights $\times$ rate + cleaning fee + service fee).
   - "Book Stay" checkout flow.
   - "Save Property" bookmark toggle connected to `/api/me/wishlist`.
   - "Make an Offer" modal connected to `/api/admin/offers`.

---

### Phase 3: Unified Customer Property Dashboard (P2)
**Goal:** Empower consumers to view and manage their full property lifecycle.
1. **Aggregated Property Customer API:**
   - File: `app/api/site/[slug]/me/properties-dashboard/route.ts`
   - Queries real data for authenticated user: Saved properties (`Wishlist`), inquiries (`Inquiry`), showings (`Showing`), offers (`OfferContract`), bookings (`Booking`), tenancies (`HostelAllocation`), maintenance requests (`HostelMaintenanceRequest`), and invoices (`HostelFee`).
2. **Customer Profile Implementation:**
   - Files: `app/site/[slug]/realestate/profile/page.tsx` and `app/site/[slug]/propertymanagement/profile/page.tsx`
   - Replace static mock data with real live data, interactive status pills, and direct actions (e.g. submit maintenance ticket, view lease, pay rent).

---

### Phase 4: Admin Management Pages & Fallback Cleanup (P2/P3)
**Goal:** Provide full administrative control over all property operations without mock traps.
1. **Clean Silent Fallbacks in Existing Admin Pages:**
   - `app/admin/[slug]/properties/page.tsx`
   - `app/admin/[slug]/properties-showings/page.tsx`
   - `app/admin/[slug]/properties-offers/page.tsx`
   - `app/admin/[slug]/properties-inquiries/page.tsx`
   - `app/admin/[slug]/properties-agents/page.tsx`
   - Ensure `company.id` (ObjectId) is passed consistently instead of raw slug strings.
2. **Implement Missing Admin Pages:**
   - `app/admin/[slug]/properties-media/page.tsx`
   - `app/admin/[slug]/properties-testimonials/page.tsx`
   - `app/admin/[slug]/properties-faqs/page.tsx`
   - `app/admin/[slug]/properties-settings/page.tsx`
   - `app/admin/[slug]/properties-virtual-tours/page.tsx`
   - `app/admin/[slug]/properties-promotions/page.tsx`
   - `app/admin/[slug]/properties-reports/page.tsx`

---

### Phase 5: Verification & End-to-End QA (P0/P1)
**Goal:** Validate all 10 core property scenarios with automated verification script.
- Discovery, Inquiries, Showings, Short-term booking, Overlap rejection, Long-term tenancy, Maintenance resolution, Customer dashboard, Tenant isolation, and CRUD operations.
