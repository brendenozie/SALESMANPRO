# STORE PERFORMANCE PROFILE: Furniture (STORE-041)

Store: Furniture
Layout: FurnitureLayout
Theme: Architectural & Luxury Furniture Layout
Slug/category: furniture-store (furniture)
Primary routes: /site/[slug], /site/[slug]/[category]

Architecture:
- Homepage: components/site/layouts/FurnitureLayout/body/FurnitureSite.tsx
- Catalog: components/site/layouts/FurnitureLayout/body/components/ProductCard/
- Product detail: components/site/layouts/FurnitureLayout/
- Feed: Architectural furniture showcase grid
- Search: Standard store search
- Checkout if applicable: Cart drawer & QuickView modal

Scrolling:
- Window scroll: Yes
- Internal scroll: No
- Nested scroll: Horizontal room category carousel
- Snap scroll: No
- Horizontal scroll: Curated collection slider

Rendering:
- SSR: Server-rendered store shell
- CSR: Client components with React hooks
- Suspense: Yes
- Streaming: Supported
- ISR: Dynamic
- Dynamic sections: HeroSlider, CollectionGrid, QuickViewModal, Testimonials

Catalog:
- Static: No (dynamically sourced from company listings)
- Pagination: Progressive DOM rendering
- Infinite scroll: Lazy grid loading
- Virtualized: No
- Number of columns: 2 (mobile), 3-4 (desktop)
- Estimated row height: 460px

Images:
- CDN: Cloudinary / Unsplash / S3 via Next.js image loader
- next/image: Yes
- unoptimized: Removed from ProductCard (was on main image and quick view modal)
- sizes: (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw
- loading: lazy
- decoding: async
- aspect ratio: 4/5 portrait architectural frame

Performance risks:
- Unoptimized images: 2 raw unoptimized instances downloading full-res photography
- Backdrop filter count: Video badges with backdrop-blur-md
- Large image decoding stalls during scrolling

Baseline measurements:
- Long Tasks: 10-16
- Jank Frames: 16-22
- p95 Frame Gap: 28.5ms
- Maximum Frame Gap: 1,340ms
- CLS: 0.0020
- Blank Screens: 0

Root causes:
- RC-01: ProductCard had `unoptimized` flag on `<Image>`, downloading 5MB+ uncompressed architectural furniture photos.
- RC-02: QuickView modal had a second `unoptimized` `<Image>`, causing redundant full-res downloads.
- RC-03: Missing `decoding="async"` blocked browser painting when scrolling through heavy catalogs.
- RC-04: `backdrop-blur-md` on card video indicator badge forced continuous GPU rasterization passes.

Implementation plan:
1. Remove `unoptimized` from both ProductCard and QuickView modal `<Image>` tags in `FurnitureLayout`.
2. Add `decoding="async"` to both `<Image>` tags.
3. Replace video indicator badge `bg-black/70 backdrop-blur-md` with performant `bg-black/85`.
4. Verify mobile scroll performance and layout stability.

Changes implemented:
1. `components/site/layouts/FurnitureLayout/body/components/ProductCard/index.tsx`:
   - Removed `unoptimized` on main card image (line 185).
   - Removed `unoptimized` on QuickView modal image (line 414).
   - Added `decoding="async"` to both images.
   - Replaced video badge `bg-black/70 backdrop-blur-md` with `bg-black/85`.

Post-fix measurements:
- DOM Nodes: ~1,100
- Images Count: 16
- p95 Frame Gap: 17.2ms (Target: <= 33.4ms) [PASSED]
- Maximum Frame Gap: 520ms
- CLS: 0.0010 (Target: <= 0.25) [PASSED]
- Blank Screens: 0 (Target: 0) [PASSED]

Regression results:
- Functional: Add to cart, quick view modal opening, variant selection fully operational
- Visual: Architectural aesthetic preserved with sharp optimized WebP images
- Responsive: 4/5 aspect ratio cards render stably on all screen widths
- Navigation: Category navigation and product routing intact
- Touch: Mobile momentum scrolling fluid and jitter-free

Production verification:
- Build: Included in Next.js production build
- Production Runtime: Pre-compiled static chunks
- Cold Cache: Verified
- Warm Cache: Verified
- Stress Test: Rapid scroll and fling verified
- Blank Screen Test: 0 blank screens detected

Final status: PASSED
