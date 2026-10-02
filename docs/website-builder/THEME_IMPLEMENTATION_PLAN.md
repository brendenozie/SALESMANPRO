# SalesmanPro Theme Implementation & Staging Plan

## Stage A: Discovery & Forensic Audit (Completed)
- Mapped all 56 canonical storefront templates across 11 category files.
- Verified physical layouts in `components/site/layouts/*Layout` and body components in `components/site/layouts/*Layout/body/*Site.tsx`.
- Discovered 16 unmapped variant keys in `utils/sitedata.ts`.
- Identified 404 subpage routing gap in `app/site/[slug]/[...pageSlug]/page.tsx`.

## Stage B: Authoritative Registry & Resolution Architecture (Completed)
- Consolidated all 56 canonical template definitions into `lib/website-builder/template-registry.ts`.
- Fully populated `lib/website-builder/registry/aliases.ts` with all 166 canonical alias pairs.
- Added `PAGE_SLUG_ALIASES` and `resolvePageSlugAlias` to guarantee zero 404s for common navigation endpoints (`/shop`, `/catalog`, `/booking`, `/services`, etc.).
- Verified alignment of `categoryHeaderFooterLayoutMap.ts` (0 missing shells) and `BodyComponentMap.tsx` (0 missing bodies).

## Stage C: Reference Implementations (Completed)
- **E-Commerce Vertical:** `ecommerce-default@v1`, `ecommerce-shoes@v1`, `ecommerce-agrovet@v1`.
- **Bookings & Services Vertical:** `bookings@v1`, `services@v1`, `salon-bookings@v1`, `barbershop@v1`.
- **Content & Education Vertical:** `courses@v1`, `blog@v1`, `media@v1`.
- **Property & Automotive:** `real-estate@v1`, `automotive@v1`.
- **Enterprise & SaaS:** `saas@v1`, `company-portfolio@v1`.

## Stage D: Universal Component Editing & Schema Verification (Completed)
- Implemented `SectionLiveFieldsInspector` in `WebsiteBuilderStudio.tsx` to automatically discover real DOM `data-editable-id` elements or synthesize authentic editable fields from section content and component schemas.
- Target identity scheme (`canonical-target-id.ts`) links edits directly to component overrides without altering database product records.

## Stage E: Responsive Design & Mobile Website Builder (Completed)
- Enabled mobile drawer navigation for left sidebar with hamburger toggle button and dark backdrop overlay.
- Added adaptive drawer behavior for the right element property inspector.
- Updated canvas container widths to prevent horizontal overflow on smaller screens (`w-full max-w-[768px]` and `w-full max-w-[390px]`).

## Stage F: AI Studio & Mascot Integration (Completed)
- Added `website` module and 6 website builder capabilities to `lib/ai/mascot/capabilityRegistry.ts`.
- Wired action execution handlers in `lib/ai/mascot/actionEngine.ts`.
- Connected route-aware context suggestions in `lib/ai/mascot/contextResolver.ts`.
