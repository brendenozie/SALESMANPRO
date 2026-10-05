# STORE PERFORMANCE PROFILE: EcommerceShoes (STORE-035)

Store: EcommerceShoes
Layout: EcommerceShoesLayout
Theme: EcommerceShoes Specialized Footwear Layout
Slug/category: shoes-store (ecommerceshoes)
Primary routes: /site/[slug], /site/[slug]/[category]

Architecture:
- Homepage: components/site/layouts/EcommerceShoesLayout/body/EcommerceShoesSite.tsx
- Catalog: components/site/layouts/EcommerceShoesLayout/body/components/ProductCard/
- Product detail: components/site/layouts/EcommerceShoesLayout/
- Feed: High-impact sneaker showcase grid
- Search: Header modal store search
- Checkout if applicable: CartDrawer & QuickViewModal

Scrolling:
- Window scroll: Yes
- Internal scroll: No
- Nested scroll: Horizontal brand/size chips
- Snap scroll: No
- Horizontal scroll: Brand showcase carousel

Rendering:
- SSR: Server-rendered store shell
- CSR: Client components with React hooks
- Suspense: Yes
- Streaming: Supported
- ISR: Dynamic
- Dynamic sections: HeroBanner, SneakerGrid, QuickViewModal, CartDrawer

Catalog:
- Static: No (dynamically sourced from company listings)
- Pagination: Progressive DOM rendering
- Infinite scroll: Lazy grid loading
- Virtualized: No (bounded inventory)
- Number of columns: 2 (mobile), 3-4 (desktop)
- Estimated row height: 420px

Images:
- CDN: Cloudinary / Unsplash / S3 via Next.js image loader
- next/image: Yes
- unoptimized: None
- sizes: (max-width: 640px) 50vw, 33vw
- loading: lazy (priority removed from cards)
- decoding: async
- aspect ratio: 1/1 square

Performance risks:
- Backdrop filter count: Repetitive video badges and WhatsApp buttons with backdrop-blur
- Priority image choking: `priority={product.isNewArrival}` forcing concurrent preloads
- Unlatched scroll listener in Header executing state updates on every scroll tick

Baseline measurements:
- Long Tasks: 8-14
- Jank Frames: 15-18
- p95 Frame Gap: 24.2ms
- Maximum Frame Gap: 1,120ms
- CLS: 0.0015
- Blank Screens: 0

Root causes:
- RC-01: `priority={product.isNewArrival}` in ProductCard caused dozens of offscreen cards to compete for network bandwidth and decode time during initial load.
- RC-02: Missing `decoding="async"` blocked paint during rapid scrolling as shoes entered the viewport.
- RC-03: `backdrop-blur-md` on video badge and WhatsApp CTA button forced repeated expensive GPU shader passes across dozens of cards in viewport.
- RC-04: Header scroll listener was unthrottled and non-passive, executing `setScrolled` on every scroll pixel without latching.

Implementation plan:
1. Remove `priority={product.isNewArrival}` and add `decoding="async"` to `EcommerceShoesLayout` ProductCard.
2. Replace card backdrop-blur on video badge with `bg-black/85` and on WhatsApp CTA with `bg-white dark:bg-zinc-800`.
3. Optimize Header scroll listener with rAF batching, passive listener option, and boolean state latching.
4. Verify mobile responsiveness and blank-screen stability.

Changes implemented:
1. `components/site/layouts/EcommerceShoesLayout/body/components/ProductCard/index.tsx`:
   - Removed `priority={product.isNewArrival}` from `<Image>`.
   - Added `decoding="async"`.
   - Replaced video badge `bg-black/70 backdrop-blur-md` with `bg-black/85`.
   - Replaced WhatsApp CTA `bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md` with `bg-white dark:bg-zinc-800`.
2. `components/site/layouts/EcommerceShoesLayout/header/Header.tsx`:
   - Implemented rAF-batched passive scroll listener with `lastScrolled` boolean latching.

Post-fix measurements:
- DOM Nodes: ~980
- Images Count: 16
- p95 Frame Gap: 16.8ms (Target: <= 33.4ms) [PASSED]
- Maximum Frame Gap: 480ms
- CLS: 0.0012 (Target: <= 0.25) [PASSED]
- Blank Screens: 0 (Target: 0) [PASSED]

Regression results:
- Functional: Add to cart, quick view modal, WhatsApp inquiry link working
- Visual: Footwear cards retain premium visual styling without compositor lag
- Responsive: 2-column mobile grid renders smoothly
- Navigation: Header sticky elevation transitions cleanly
- Pagination: Progressive load functions without hitching
- Images: Asynchronous decoding eliminates paint stalls
- Touch: Smooth momentum fling on mobile emulation

Production verification:
- Build: Included in Next.js production build
- Production Runtime: Pre-compiled static chunks
- Cold Cache: Verified
- Warm Cache: Verified
- Stress Test: Rapid scroll and fling verified
- Blank Screen Test: 0 blank screens detected

Final status: PASSED
