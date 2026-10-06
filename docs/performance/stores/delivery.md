# STORE PERFORMANCE PROFILE: Delivery (STORE-013)

Store: Delivery
Layout: DeliveryLayout
Theme: Delivery Specialized Archetype Layout
Slug/category: delivery
Status Category: STANDBY ARCHETYPE (Platform Hardened)
Primary routes: /site/[slug], /site/[slug]/[category]

Architecture:
- Homepage: components/site/layouts/DeliveryLayout/body/DeliverySite.tsx
- Catalog: components/site/layouts/DeliveryLayout/body/
- Product detail: components/site/layouts/DeliveryLayout/
- Feed: Standard DOM Grid / List
- Search: Standard store search
- Checkout if applicable: Cart drawer & checkout flow

Scrolling:
- Window scroll: Yes
- Internal scroll: No
- Nested scroll: Horizontal chips
- Snap scroll: No
- Horizontal scroll: Carousel / Pill selectors

Rendering:
- SSR: Server-rendered store shell
- CSR: Client components with React hooks
- Suspense: Yes
- Streaming: Supported
- ISR: Dynamic
- Dynamic sections: Hero, catalog, features, testimonials

Catalog:
- Static: Configurable
- Pagination: Standard / Infinite
- Infinite scroll: Supported
- Virtualized: No
- Number of columns: 1-2 (mobile), 3-4 (desktop)
- Estimated row height: ~360px

Images:
- CDN: Cloudinary / Unsplash / S3 via Next.js <Image />
- next/image: Yes
- unoptimized: 0 instances (all removed during platform hardening)
- sizes: Responsive
- loading: lazy
- decoding: async (platform enforced)
- aspect ratio: Explicit container aspect-ratio

Performance risks:
- Backdrop filter count: 17 instances (hardened)
- Unoptimized images: 0 instances (AST validated)
- Scroll event listeners: 1 instances (rAF throttled)
- Framer Motion occurrences: 285 instances (optimized)
- Potential layout collapse: 0 (stabilized)

Platform Hardening Applied:
1. AST Image Hardening: Removed unoptimized attributes and custom loaders across layout components.
2. Asynchronous Decoding: Added decoding="async" to all Next.js <Image /> components.
3. SSR Restoration: Converted dynamic client-only imports to direct static imports.
4. Scroll Stabilization: Replaced unthrottled window scroll listeners with passive rAF listeners.
5. Container Stability: Enforced explicit width/height or aspect ratios to eliminate layout shift (CLS).

Production verification:
- Build: Passes next build standalone with zero TypeScript errors
- Production Runtime: Pre-compiled static chunks included in standalone production bundle
- Layout Architecture: Fully audited and hardened against mobile bottlenecks

Final status:
**AUDIT_COMPLETE (STANDBY ARCHETYPE)**
