# SalesmanPro Theme Component & Target Identity Mapping

## 1. Component Architecture
Each storefront theme consists of two architectural layers:
1. **Shell Layout (`components/site/layouts/*Layout`):** Contains the navigation header, mobile menu, search drawer, announcement bar, cart drawer, footer, newsletter subscription, and legal links.
2. **Body Component (`components/site/layouts/*Layout/body/*Site.tsx`):** Renders the authentic theme presentation, hero sliders, category carousels, featured product grids, service catalogs, booking forms, reviews, and interactive widgets.

---

## 2. Canonical Target Identifier Scheme
The target identity scheme provides non-destructive, element-level editing across themes:

```
[pageSlug].[sectionId].[componentKey].[variant/itemIndex].[fieldKey]
```

### Examples:
- `home.sec-hero-1.HeroSlider.main.headline` → Homepage hero headline text
- `home.sec-hero-1.HeroSlider.main.ctaLink` → Homepage hero primary CTA destination URL
- `home.sec-products-1.ProductGrid.main.title` → Featured products section heading
- `header.main.NavigationHeader.0.storeName` → Storefront top brand name override
- `footer.main.Footer.0.copyrightText` → Storefront footer copyright notice

---

## 3. Render Binding Verification
Components using `EditableElement` or reading `mergedStoreData` automatically listen to override state:
- **Verified Render Bindings:** Overrides applied in the builder immediately update the interactive DOM.
- **Dynamic Catalog Bindings:** Product grids, category pickers, and service lists pull from the store's authoritative Prisma database records (`products`, `categories`, `services`).
- **Styles & Typography:** Theme tokens (`primaryColor`, `secondaryColor`, `headingFont`, `bodyFont`) dynamically inject CSS custom properties (`--primary-color`, `--secondary-color`) and Google Fonts link tags into the DOM head.
