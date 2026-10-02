# SalesmanPro Website Builder — Architecture Audit & Forensic Analysis

## Executive Summary
This architectural audit documents the complete state of the SalesmanPro Website Builder and its 56-theme storefront ecosystem. SalesmanPro is a high-performance multi-tenant commerce and service platform built with Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma ORM, and MongoDB.

Prior to this audit, stores suffered from:
1. **404 Subpage Routing Failures:** Visiting `/shop` or standard navigation links triggered unhandled 404s due to slug mismatches against template `defaultPages` (`slug: "products"`).
2. **Silent Theme Degradation:** 16 standard business categories/variants from `utils/sitedata.ts` were missing in `ALIAS_TO_CANONICAL_ID`, causing the resolver to silently degrade valid merchant stores to `default-site@v1`.
3. **Mascot Capability Disconnection:** The SalesmanPro AI Mascot had modules for inventory, orders, finance, etc., but lacked website builder operational tools.
4. **Mobile Editor Usability:** On smaller screens (<1024px), the desktop 3-panel builder layout crowded out the canvas and prevented focused element editing.

---

## 1. End-to-End Tracing: Store to Published Storefront

The authoritative execution chain follows this lifecycle:

```
Tenant Request (Subdomain / Custom Domain / Admin Route)
   ↓
Middleware (`middleware.ts`) — Tenant Domain & Header Resolution
   ↓
Store Loader (`lib/loadStore.ts`) — Server-side Cache Fetch (`findCompanyCached`)
   ↓
Category & Variant Extraction (`raw.category`, `raw.variant`, `raw.website?.templateKey`)
   ↓
Deterministic Template Resolution (`lib/website-builder/template-registry.ts`)
   ↓
Shell & Body Resolution (`categoryHeaderFooterLayoutMap.ts` & `BodyComponentMap.tsx`)
   ↓
Configuration Compilation / Retrieval (`lib/website-builder/website-service.ts`)
   ↓
Authentic Renderer (`components/website-builder/AuthenticTemplateRenderer.tsx`)
   ↓
Interactive Studio / Live Storefront
```

### Authoritative Resolution Stages:
- **Stage 1 (Explicit Canonical Template ID):** Checks `explicitTemplateId` in `TEMPLATE_REGISTRY`.
- **Stage 2 (Explicit Tenant Variant):** Normalizes `raw.variant` and maps via `ALIAS_TO_CANONICAL_ID`.
- **Stage 3 & 4 (Legacy Identity & Normalization):** Strips version suffixes (`@v1`) and validates.
- **Stage 5 (Category + Variant Combined):** Resolves `${category}-${variant}`.
- **Stage 6 (Safe Fallback):** `default-site@v1` with non-silent development diagnostics.

---

## 2. Subpage & Navigation Resolution
Standard navigational aliases are now formally normalized:
- `shop`, `products`, `catalog`, `all-products`, `store` → `products` (or `PRODUCT_LIST` page)
- `categories`, `departments`, `collections` → `categories` (or `CATEGORY_LIST` page)
- `about`, `about-us`, `story`, `our-story` → `about` (or `ABOUT` page)
- `contact`, `contact-us`, `support` → `contact` (or `CONTACT` page)
- `services`, `services-list` → `services` (or `SERVICE_LIST` page)
- `booking`, `bookings`, `appointments`, `book` → `booking` (or `BOOKING` page)
- `courses`, `classes`, `curriculum` → `courses` (or `COURSE_LIST` page)

The subpage route handler (`app/site/[slug]/[...pageSlug]/page.tsx`) resolves these aliases dynamically and avoids hard 404s.

---

## 3. Storage, Draft & Publication Model
- **Database Schema:** `prisma.website`, `prisma.websitePage`, `prisma.websiteSection`, `prisma.websiteRevision`.
- **Drafts:** Stored in `website.draftConfig` (validated by `CompiledWebsiteConfigSchema`).
- **Live Publishing:** Atomic copy of `draftConfig` to `publishedConfig`, creation of a new `WebsiteRevision`, and selective Next.js cache revalidation (`revalidateTag`, `revalidatePath`).
- **Component Overrides:** Target identity engine (`home.[sectionId].[componentKey].[variant].[fieldKey]`) guarantees that component customization does not corrupt core catalog data.
