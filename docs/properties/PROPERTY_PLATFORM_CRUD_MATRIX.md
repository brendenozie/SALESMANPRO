# SalesmanPro — Property Management Platform CRUD Matrix

> **Verification Matrix:** Real Estate & Property Management Entities  
> **Requirement:** Every exposed management entity must support full lifecycle operations without silent production fallbacks to mock data.

| Entity | Model in Prisma | Primary Admin Path | API Route | CREATE | READ (LIST) | READ (DETAIL) | UPDATE (EDIT) | DELETE / ARCHIVE | Verification Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Properties** | `marketplaceListings` | `/admin/{slug}/properties` | `/api/admin/my-market-place`, `/api/admin/post-market-list` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Categories** | `StoreCategory` / `ProductCategory` | `/admin/{slug}/categories` | `/api/admin/categories` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Locations** | `CompanyLocation` / `Location` | `/admin/{slug}/locations` | `/api/admin/locationsv2` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Agents** | `SalesAgent` / `User` | `/admin/{slug}/properties-agents` | `/api/admin/sales-agents` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Clients / Consumers** | `Consumer` / `User` | `/admin/{slug}/consumers` | `/api/admin/consumers` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Leads** | `Lead` | `/admin/{slug}/salesleads` | `/api/admin/leads` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Inquiries** | `Inquiry` | `/admin/{slug}/properties-inquiries` | `/api/admin/inquiries` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Showings** | `Showing` | `/admin/{slug}/properties-showings` | `/api/admin/showings` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Offers & Contracts**| `OfferContract` | `/admin/{slug}/properties-offers` | `/api/admin/offers` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Blocks (Wings)** | `HostelBlock` | `/admin/{slug}/property-blocks` | `/api/admin/property/blocks` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Rooms (Units)** | `HostelRoom` | `/admin/{slug}/property-rooms` | `/api/admin/property/rooms` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Residents** | `HostelMember` | `/admin/{slug}/property-residents` | `/api/admin/property/residents` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Room Allocations** | `HostelAllocation` | `/admin/{slug}/property-room-assignments` | `/api/admin/property/room-assignments`, `/api/admin/property/allocate` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Maintenance** | `HostelMaintenanceRequest`| `/admin/{slug}/property-maintenance-requests` | `/api/admin/property/maintenance` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Visitors** | `HostelVisitor` | `/admin/{slug}/property-visitors` | `/api/admin/property/visitors` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Fee Management** | `HostelFee` | `/admin/{slug}/property-fee-management`| `/api/admin/property/fees` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Property Staff** | `HostelStaff` | `/admin/{slug}/property-staff` | `/api/admin/property/staff` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Virtual Tours** | `Content` (VIDEO) | `/admin/{slug}/properties-virtual-tours` | `/api/admin/virtual-tours` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Promotions** | `Promotion` | `/admin/{slug}/properties-promotions` | `/api/admin/promotions` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Testimonials** | `Testimonial` | `/admin/{slug}/properties-testimonials` | `/api/admin/testimonials` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **FAQs** | `FAQ` | `/admin/{slug}/properties-faqs` | `/api/admin/faqs` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Media Assets** | `MediaAsset` / `Photo` | `/admin/{slug}/properties-media` | `/api/admin/ai-media-library` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
| **Reports** | Analytics Services | `/admin/{slug}/properties-reports` & `/property-reports` | `/api/admin/property/analytics` | N/A | ✅ | ✅ | N/A | N/A | Derived Real Data |
| **Saved Properties** | `Wishlist` / `WishlistItem` | Storefront Profile | `/api/me/wishlist` | ✅ | ✅ | ✅ | N/A | ✅ | Verified Live DB |
| **Short-Term Bookings**| `Booking` | Storefront & Admin | `/api/properties/:id/book` | ✅ | ✅ | ✅ | ✅ | ✅ | Verified Live DB |
