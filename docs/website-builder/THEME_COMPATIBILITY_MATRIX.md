# SalesmanPro Theme Compatibility & Capability Matrix

## 1. Architectural Capability Matrix
Every canonical template declares its authentic capabilities in `lib/website-builder/registry/*.ts`.

| Capability Flag | Description | Supported Templates |
|-----------------|-------------|---------------------|
| `HERO_SLIDER` | Multi-slide dynamic banner with headline & CTA | All E-commerce, Lifestyle, Automotive, Booking |
| `PRODUCT_GRID` | Catalog-driven product listing with filters | All E-commerce, Marketplace, Lifestyle |
| `BOOKING_WIDGET` | Appointment scheduling & calendar integration | `bookings@v1`, `barbershop@v1`, `salon-bookings@v1`, `drycleaning@v1`, `services@v1` |
| `COURSE_LIST` | Curriculums, instructor profiles & enrollments | `courses@v1`, `courses-2@v1`, `courses-3@v1` |
| `PROPERTY_LISTINGS` | Real estate cards, filters, and agent inquiry | `real-estate@v1`, `property-management@v1` |
| `VEHICLE_CATALOG` | Auto specifications, mileage, pricing & test drive | `automotive@v1`, `automotive-2@v1` |
| `RESTAURANT_MENU` | Categorized food & beverage items with order CTA | `restaurant@v1` |
| `ARTICLE_FEED` | Editorial blog articles, categories & author bio | `blog@v1`, `media@v1` |
| `EVENT_TICKETING` | Event dates, venue maps, and ticket purchasing | `events@v1` |
| `DIRECTORY_LISTINGS`| Local business categories, phone & directions | `directory@v1` |
| `DONATION_CAMPAIGN` | Non-profit charity goals & donation widgets | `nonprofit@v1` |
| `PORTFOLIO_PROJECTS`| Showcase case studies, gallery & resume/CV | `portfolio@v1`, `company-portfolio@v1`, `company-portfolio-light@v1`, `public-speaking@v1` |
| `SECURITY_SERVICES` | Security systems, consulting & incident response | `security@v1`, `security-2@v1` |
| `LOGISTICS_TRACKING`| Delivery rates, tracking & courier forms | `delivery@v1` |
| `SAAS_PRICING` | Cloud feature tables, tiers & trial registration | `saas@v1` |
| `GHUBA_ECOSYSTEM` | Global multi-tenant marketplace catalog & routing | `ghuba@v1` |

---

## 2. Backward Compatibility Guarantees
1. **Zero Data Loss:** Migrating an existing store between themes preserves store-wide brand values (store name, description, phone, email, logo, social links, products, categories).
2. **Safe Fallback:** If an unrecognized theme key is queried, the resolver warns in development and gracefully renders `default-site@v1` without throwing a 404 or white screen.
3. **Draft Separation:** Changes in the Website Builder are isolated to `website.draftConfig` until the merchant explicitly hits "Publish Live".
