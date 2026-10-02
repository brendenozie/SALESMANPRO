# SalesmanPro Website Builder — Automated & Manual Test Plan

## 1. Test Scope
This test plan validates:
1. **Deterministic Theme Resolution:** All 56 canonical templates resolve accurately.
2. **Sitedata Category/Variant Alignment:** 100% of variants in `utils/sitedata.ts` map to canonical themes.
3. **Subpage Navigation & 404 Prevention:** Semantic slug alias normalization (`/shop` → `products`).
4. **Layout & Component Registries:** Alignment of `categoryHeaderFooterLayoutMap.ts` and `BodyComponentMap.tsx`.
5. **AI Mascot Operations:** Verification of website capability registry, action dispatch, and context resolution.
6. **Persistence & Publishing Lifecycle:** Draft saving, version incrementation, and cache bust.

---

## 2. Automated Test Suite Execution
- **Test File:** `scratch/test-theme-resolution-and-builder.js`
- **Runner:** `node scratch/test-theme-resolution-and-builder.js`
- **Results:**
  - `TEST 1: Canonical Template Inventory` → 56 / 56 PASS
  - `TEST 2: Shell Layout Map Alignment` → 56 / 56 PASS (0 missing)
  - `TEST 3: Body Component Map Alignment` → 56 / 56 PASS (0 missing)
  - `TEST 4: Sitedata Categories & Variants Resolution` → 30 / 30 categories, 41 variants PASS (0 unmapped)
  - `TEST 5: Page Slug Aliases (404 Prevention)` → PASS
  - `TEST 6: SalesmanPro AI Mascot Integration` → 6 capabilities, action engine handlers, and context resolver PASS
- **Total Test Cases:** 18 Passed, 0 Failed.

---

## 3. End-to-End Acceptance Scenario
`Store Creation → Category/Variant Selected → Template Resolved → Website Builder Opened → Element Selected → Text Edited → Live Canvas Updated → Draft Saved → Revision Created → Published Live → Storefront Renders Verified Output`
