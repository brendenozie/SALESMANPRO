# SalesmanPro Theme Category & Variant Mapping Matrix

## Overview
This document records the authoritative mapping rules connecting store creation categories (`utils/sitedata.ts`), legacy database identifiers, normalized tenant variants, and canonical theme definitions (`lib/website-builder/registry/aliases.ts`).

## 1. Store Category & Variant Resolution Table

| Business Category (sitedata.ts) | Variant Name | Normalized Lookup Key | Canonical Theme ID | Resolved Shell |
|---------------------------------|--------------|-----------------------|--------------------|----------------|
| `E-commerce` | Modern Shop (v1) | `modern-shop-v1` | `ecommerce-default@v1` | `EcommerceLayout` |
| `E-commerce` | Digital Goods Store (v2) | `digital-goods-store-v2` | `ecommerce-default@v1` | `EcommerceLayout` |
| `E-commerce` | Artisan Marketplace (v3) | `artisan-marketplace-v3` | `marketplace@v1` | `MarketplaceLayout` |
| `Furniture Store` | Furniture Shop | `furniture-shop` | `furniture@v1` | `FurnitureLayout` |
| `Bike Store` | Bike Store | `bike-store` | `ecommerce-bike@v1` | `EcommerceBikeLayout` |
| `Motorcycle Store` | Motorcycle Store | `motorcycle-store` | `ecommerce-motorcycle@v1` | `EcommerceMotorCycleLayout` |
| `Barbershop` | Barbershop | `barbershop` | `barbershop@v1` | `BarbershopBookingsLayout` |
| `Fashion Boutique` | Fashion Shop | `fashion-shop` | `fashion@v1` | `FashionLayout` |
| `Consultant & Coach` | Executive Coach (v1) | `executive-coach-v1` | `consultancy@v1` | `ConsultancyLayout` |
| `Consultant & Coach` | Wellness Retreat (v2) | `wellness-retreat-v2` | `consultancy@v1` | `ConsultancyLayout` |
| `Public Speaking` | Standard Speaker Site | `standard-speaker-site` | `public-speaking@v1` | `PublicSpeakingLayout` |
| `Shoes Store` | Shoes Store Classic | `shoes-store-classic` | `ecommerce-shoes@v1` | `EcommerceShoesLayout` |
| `Service Provider` | Agency Portfolio | `agency-portfolio` | `services@v1` | `ServicesLayout` |
| `Booking & Appointments` | Scheduler Hub | `scheduler-hub` | `bookings@v1` | `BookingsLayout` |
| `Portfolio & Personal Branding` | Creative CV | `creative-cv` | `portfolio@v1` | `PortfolioLayout` |
| `Blog & Content` | Modern Magazine | `modern-magazine` | `blog@v1` | `BlogLayout` |
| `Nonprofit & Community` | Charity Connect | `charity-connect` | `nonprofit@v1` | `NonprofitLayout` |
| `Healthcare & Clinics` | Clinic Pro | `clinic-pro` | `healthcare@v1` | `HealthcareLayout` |
| `Media & Entertainment` | Film Studio | `film-studio` | `media@v1` | `MediaLayout` |
| `Finance & Legal` | Financial Advisor | `financial-advisor` | `finance@v1` | `FinanceLayout` |
| `Automotive` | Car Dealership | `car-dealership` | `automotive@v1` | `AutomotiveLayout` |
| `Travel & Tourism` | Travel Agency | `travel-agency` | `travel@v1` | `TravelLayout` |
| `Fitness & Wellness` | Gym & Fitness | `gym-fitness` | `fitness@v1` | `FitnessLayout` |
| `Directory & Listings` | Business Directory | `business-directory` | `directory@v1` | `DirectoryLayout` |
| `Educational & Online Courses` | Online Learning | `online-learning` | `courses@v1` | `CoursesLayout` |
| `Restaurant & Food Delivery` | Food Delivery | `food-delivery` | `restaurant@v1` | `RestaurantLayout` |
| `Event & Ticketing` | Event Booking | `event-booking` | `events@v1` | `EventsLayout` |
| `Real Estate` | Property Listings | `property-listings` | `real-estate@v1` | `RealEstateLayout` |
| `Property Management` | Property Management | `property-management` | `property-management@v1` | `PropertyManagementLayout` |
| `SaaS & Web Apps` | App Landing Page | `app-landing-page` | `saas@v1` | `SaaSLayout` |
| `Marketplace` | Product Marketplace | `product-marketplace` | `marketplace@v1` | `MarketplaceLayout` |
| `Security Services` | Security Services | `security-services` | `security@v1` | `SecurityLayout` |
| `Security Services` | Security Consulting | `security-consulting` | `security-2@v1` | `Security2Layout` |
| `Security Services` | Cybersecurity Firm | `cybersecurity-firm` | `security@v1` | `SecurityLayout` |
| `Security Services` | Home Security | `home-security` | `security@v1` | `SecurityLayout` |
| `Security Services` | Event Security | `event-security` | `security@v1` | `SecurityLayout` |
| `Security Services` | Surveillance Systems | `surveillance-systems` | `security@v1` | `SecurityLayout` |
| `Security Services` | Access Control | `access-control` | `security@v1` | `SecurityLayout` |
| `Security Services` | Security Training | `security-training` | `security@v1` | `SecurityLayout` |
| `Security Services` | Alarm Systems | `alarm-systems` | `security@v1` | `SecurityLayout` |
| `Delivery & Logistics` | Delivery & Logistics | `delivery-logistics` | `delivery@v1` | `DeliveryLayout` |
| `Other` | General Purpose Site | `general-purpose-site` | `default-site@v1` | `DefaultLayout` |

---

## 2. Specialized E-Commerce Sub-Vertical Mappings
Direct category/variant mappings for all dedicated product verticals:
- `agrovet-store` → `ecommerce-agrovet@v1`
- `meat-store`, `modern-meat-store` → `ecommerce-meat@v1`
- `hardware-store` → `ecommerce-hardware@v1`
- `gaming-store` → `ecommerce-gaming@v1`
- `watch-store` → `ecommerce-watch@v1`
- `flowers-store` → `ecommerce-flowers@v1`
- `groceries-store` → `ecommerce-groceries@v1`
- `earphones-store`, `electronics-store` → `ecommerce-earphones@v1`
- `glasses-store` → `ecommerce-glasses@v1`
- `honey-store` → `ecommerce-honey@v1`
- `peanuts-store` → `ecommerce-peanuts@v1`
- `baby-store` → `ecommerce-baby@v1`
- `cake-store` → `ecommerce-cake@v1`
- `pets-store` → `ecommerce-pets@v1`
- `book-store` → `ecommerce-book@v1`
- `accessories-store` → `ecommerce-accessories@v1`
- `salon-bookings`, `salon`, `spa` → `salon-bookings@v1`
- `drycleaning` → `drycleaning@v1`
- `company-portfolio` → `company-portfolio@v1`
- `company-portfolio-light` → `company-portfolio-light@v1`
- `ghuba` → `ghuba@v1`
