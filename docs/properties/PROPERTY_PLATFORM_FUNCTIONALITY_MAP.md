# SalesmanPro — Real Estate & Property Management Platform Functionality Map

> **Document Status:** Active & Authoritative  
> **Platform Version:** 2.0.0 (Unified Real Estate & Property Management Operating System)  
> **Last Verified:** 2026-09-24  

---

## 1. Executive Overview

SalesmanPro delivers a unified **Real Estate listing + short-term rental + long-term tenancy + property management operating system**.

The platform is designed around 4 primary property operation models:
1. **Property Sales**: Listing $\to$ Discovery $\to$ Inquiry $\to$ Showing $\to$ Offer $\to$ Contract $\to$ Payment $\to$ Acquisition.
2. **Short-Term Rentals (Airbnb-style)**: Listing/Unit $\to$ Calendar Availability $\to$ Date Range Selection $\to$ Multi-night + Cleaning/Service Fee Pricing Engine $\to$ Temporary Hold $\to$ Payment Processing $\to$ Confirmed Booking $\to$ Overlap Protection $\to$ Guest Stay $\to$ Checkout.
3. **Long-Term Rentals / Leases**: Listing/Unit $\to$ Application/Inquiry $\to$ Showing $\to$ Lease Agreement $\to$ Tenant Assignment $\to$ Rent Schedule $\to$ Rent Collection $\to$ Maintenance $\to$ Tenant Portal.
4. **Managed Property Operations**: Property $\to$ Blocks $\to$ Units/Rooms $\to$ Tenants/Residents $\to$ Staff/Security $\to$ Maintenance Workflows $\to$ Visitor Registrations $\to$ Fee Schedules $\to$ Operational Reports.

---

## 2. Complete Route & Functionality Matrix

| Area | Admin / Public Route | UI Component | GET | LIST | CREATE | EDIT | UPDATE | DELETE / ARCHIVE | Underlying Relations | Payments / Financials | Production Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| **Properties (Listings)** | `/admin/{slug}/properties` | `PropertyClientPage.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Archive) | `Company`, `Location`, `StoreCategory`, `HostelBlock`, `OfferContract` | Sale / Rent Price, Currency, PricingTiers | Fully Functional CRUD |
| **Property Categories** | `/admin/{slug}/categories` | `CategoriesClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `Company`, `StoreCategory`, `ProductCategory` | N/A | Fully Functional CRUD |
| **Locations** | `/admin/{slug}/locations` | `LocationsClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `CompanyLocation`, `Location` | N/A | Fully Functional CRUD |
| **Agents** | `/admin/{slug}/properties-agents` | `AgentsClientPage.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `SalesAgent`, `User`, `Company` | Commissions, Performance | Fully Functional CRUD |
| **Consumers / Clients** | `/admin/{slug}/consumers` | `ConsumersClientPage.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `Consumer`, `User`, `Company`, `HostelMember` | Total Spent, Orders, Balance | Fully Functional CRUD |
| **Sales Leads** | `/admin/{slug}/salesleads` | `SalesLeadsClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `Lead`, `Company`, `SalesAgent` | Budget Min/Max, Estimated Value | Fully Functional CRUD |
| **Inquiries (CRM)** | `/admin/{slug}/properties-inquiries` | `InquiriesClientPage.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `Inquiry`, `marketplaceListings`, `Consumer`, `User` | N/A | Fully Functional CRUD |
| **Showings (Appointments)** | `/admin/{slug}/properties-showings` | `ShowingsClientPage.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `Showing`, `marketplaceListings`, `Consumer`, `User` | N/A | Fully Functional CRUD |
| **Offers & Contracts** | `/admin/{slug}/properties-offers` | `OffersClientPage.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `OfferContract`, `marketplaceListings`, `Consumer`, `User` | Offer Amount, Earnest Deposit | Fully Functional CRUD |
| **Property Blocks (Wings)** | `/admin/{slug}/property-blocks` | `HostelBlocksClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `HostelBlock`, `Company`, `marketplaceListings`, `HostelRoom` | Capacity / Occupancy Metrics | Fully Functional CRUD |
| **Property Rooms (Units)** | `/admin/{slug}/property-rooms` | `HostelRoomsClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `HostelRoom`, `HostelBlock`, `HostelAllocation`, `HostelFee` | RentPerMonth, Monthly Mess, Deposit | Fully Functional CRUD |
| **Residents / Tenants** | `/admin/{slug}/property-residents` | `HostelResidentsClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `HostelMember`, `Consumer`, `Student`, `Educator`, `Company` | Account Balance, Arrears | Fully Functional CRUD |
| **Room Assignments** | `/admin/{slug}/property-room-assignments` | `RoomAssignmentsClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `HostelAllocation`, `HostelRoom`, `HostelMember` | Active Rent Ledger | Fully Functional CRUD |
| **Maintenance Requests** | `/admin/{slug}/property-maintenance-requests` | `MaintenanceClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `HostelMaintenanceRequest`, `HostelRoom`, `User` | Estimated / Actual Repair Cost | Fully Functional CRUD |
| **Property Visitors** | `/admin/{slug}/property-visitors` | `HostelVisitorsClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `HostelVisitor`, `HostelMember`, `Company` | N/A | Fully Functional CRUD |
| **Fee Management** | `/admin/{slug}/property-fee-management` | `FeeManagementClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `HostelFee`, `HostelMember`, `HostelRoom`, `Payment` | Invoicing, Rent, Arrears, Online Pay | Fully Functional CRUD |
| **Property Staff** | `/admin/{slug}/property-staff` | `HostelStaffClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `HostelStaff`, `User`, `Company` | Shift, Duties, Badges | Fully Functional CRUD |
| **Property Reports (PM)** | `/admin/{slug}/property-reports` | `HostelReportsClient.tsx` | ✅ | ✅ | N/A | N/A | N/A | N/A | `HostelRoom`, `HostelFee`, `HostelAllocation` | Revenue, Occupancy, MTTR | Real DB Analytics |
| **Properties Reports (RE)** | `/admin/{slug}/properties-reports` | `PropertyReportsClient.tsx` | ✅ | ✅ | N/A | N/A | N/A | N/A | `marketplaceListings`, `Inquiry`, `Showing`, `OfferContract` | Deal Pipeline, Conversion, Sales Volume | Real DB Analytics |
| **Media Library** | `/admin/{slug}/properties-media` | `PropertyMediaClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `MediaAsset`, `Photo`, `Company` | AI Credit Accounting | Fully Functional CRUD |
| **Virtual Tours** | `/admin/{slug}/properties-virtual-tours` | `PropertyVirtualToursClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `Content` (VIDEO), `Company`, `marketplaceListings` | N/A | Fully Functional CRUD |
| **Promotions & Deals** | `/admin/{slug}/properties-promotions` | `PropertyPromotionsClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `Promotion`, `Company`, `marketplaceListings` | Discount, Price Overrides | Fully Functional CRUD |
| **Testimonials** | `/admin/{slug}/properties-testimonials` | `PropertyTestimonialsClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `Testimonial`, `Company` | N/A | Fully Functional CRUD |
| **FAQs** | `/admin/{slug}/properties-faqs` | `PropertyFaqsClient.tsx` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `FAQ`, `Company` | N/A | Fully Functional CRUD |
| **Property Settings** | `/admin/{slug}/properties-settings` | `PropertySettingsClient.tsx` | ✅ | ✅ | N/A | ✅ | ✅ | N/A | `CompanySettings`, `Company` | Default Currency, Showing Auto-Confirm | Fully Functional CRUD |
| **Payments Dashboard** | `/admin/{slug}/companyPaymentsDashboard` | `CompanyPaymentsDashboard.tsx` | ✅ | ✅ | N/A | N/A | N/A | N/A | `Payment`, `Transaction`, `Company` | Gateway Settlements, Receipts | Authoritative Payment Sync |

---

## 3. Customer-Facing Property Storefronts Matrix

| Customer Flow | Public Route | Backing Component | Real-Time DB Actions | Auth / Tenant Protection |
| :--- | :--- | :--- | :--- | :--- |
| **Real Estate Home / Discovery** | `/site/{slug}/realestate` or `/site/{slug}` | `RealEstateSite` / `ListingsClient.tsx` | Fetches active listings, categories, locations with server-side filters | Multi-tenant scoped by company slug |
| **Property Management Discovery** | `/site/{slug}/propertymanagement` | `PropertyManagementSite` / `ListingsClient.tsx` | Fetches active managed listings, units, floor plans | Multi-tenant scoped by company slug |
| **Property Detail & Gallery** | `/site/{slug}/realestate/listings/[id]` | `PropertyDetailsClient.tsx` | Full listing dossier, Bento gallery, video tour, unit configurations | Real DB query with SEO metadata |
| **Short-Term Stay Booking** | `/site/{slug}/realestate/listings/[id]` & `/checkout` | `BookingDatePickerModal.tsx` & Booking Engine | Date range picker, overlap validation, nightly calculation, holding lock, checkout initiation | Transactional overlap protection |
| **Showing Request** | `/site/{slug}/realestate/listings/[id]` | `PropertyDetailsClient.tsx` modal | Submits `Showing` appointment linked to `companyId`, `propertyId`, `clientId` | Customer session auto-link |
| **Inquiry Submission** | `/site/{slug}/realestate/listings/[id]` | `PropertyDetailsClient.tsx` modal | Submits `Inquiry` with contact details, budget, and desired timeline | Auto-links to Consumer profile |
| **Offer Submission** | `/site/{slug}/realestate/listings/[id]` | `OfferModal.tsx` | Creates formal `OfferContract` with amount, conditions, and earnest deposit terms | Persisted in database |
| **Save / Bookmark Property** | Property Cards & Detail pages | `WishlistToggleButton.tsx` | Persists to `prisma.wishlist` and `WishlistItem` | Authenticated user session |
| **Customer Property Dashboard** | `/site/{slug}/realestate/profile` & `/propertymanagement/profile` | `RealEstateDashboardClient.tsx` | Real DB counts & lists: Saved Homes, Inquiries, Showings, Offers, Active Stays, Leases, Maintenance, Rent Payments | Replaces all mock data with real DB records |
| **Tenant Maintenance Submission** | Customer Dashboard `Maintenance` tab | `TenantMaintenanceModal.tsx` | Submits `HostelMaintenanceRequest` linked to unit and logged-in user | Scoped to active tenancy |
| **Tenant Rent Payment** | Customer Dashboard `Payments` tab | `TenantPaymentModal.tsx` | Pays outstanding invoice via canonical payment gateway | Validated on server |
