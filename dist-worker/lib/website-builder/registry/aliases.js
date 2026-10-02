"use strict";
/**
 * lib/website-builder/registry/aliases.ts
 * Canonical alias map and auto-registration logic.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAliases = exports.resolvePageSlugAlias = exports.PAGE_SLUG_ALIASES = exports.ALIAS_TO_CANONICAL_ID = void 0;
const helpers_1 = require("./helpers");
exports.ALIAS_TO_CANONICAL_ID = {
    // Shoes
    "shoes-store": "ecommerce-shoes@v1",
    "shoes-store-classic": "ecommerce-shoes@v1",
    "shoes": "ecommerce-shoes@v1",
    "shoesstore": "ecommerce-shoes@v1",
    "ecommerceshoes": "ecommerce-shoes@v1",
    // Gaming
    "gaming-store": "ecommerce-gaming@v1",
    "gaming": "ecommerce-gaming@v1",
    "gamingecommerce": "ecommerce-gaming@v1",
    // Agrovet
    "agrovet-store": "ecommerce-agrovet@v1",
    "agrovet": "ecommerce-agrovet@v1",
    "agrovetecommerce": "ecommerce-agrovet@v1",
    // Meat
    "modern-meat-store": "ecommerce-meat@v1",
    "meat-store": "ecommerce-meat@v1",
    "meat": "ecommerce-meat@v1",
    "meatecommerce": "ecommerce-meat@v1",
    // Hardware
    "hardware-store": "ecommerce-hardware@v1",
    "hardware": "ecommerce-hardware@v1",
    "hardwareecommerce": "ecommerce-hardware@v1",
    // Watches
    "watch-store": "ecommerce-watch@v1",
    "watch": "ecommerce-watch@v1",
    "watchecommerce": "ecommerce-watch@v1",
    // Flowers
    "flowers-store": "ecommerce-flowers@v1",
    "flowers": "ecommerce-flowers@v1",
    "flowersecommerce": "ecommerce-flowers@v1",
    // Honey
    "honey-store": "ecommerce-honey@v1",
    "honey": "ecommerce-honey@v1",
    "honeyecommerce": "ecommerce-honey@v1",
    // Peanuts
    "peanuts-store": "ecommerce-peanuts@v1",
    "peanuts": "ecommerce-peanuts@v1",
    "peanutecommerce": "ecommerce-peanuts@v1",
    // Baby
    "baby-store": "ecommerce-baby@v1",
    "baby": "ecommerce-baby@v1",
    "babyecommerce": "ecommerce-baby@v1",
    // Cake
    "cake-store": "ecommerce-cake@v1",
    "cake": "ecommerce-cake@v1",
    "cakeecommerce": "ecommerce-cake@v1",
    // Pets
    "pets-store": "ecommerce-pets@v1",
    "pets": "ecommerce-pets@v1",
    "petsecommerce": "ecommerce-pets@v1",
    // Groceries
    "groceries-store": "ecommerce-groceries@v1",
    "groceries": "ecommerce-groceries@v1",
    "groceriesecommerce": "ecommerce-groceries@v1",
    // Bike
    "bike-store": "ecommerce-bike@v1",
    "bike": "ecommerce-bike@v1",
    "bikeecommerce": "ecommerce-bike@v1",
    // Motorcycle
    "motorcycle-store": "ecommerce-motorcycle@v1",
    "motorcycle": "ecommerce-motorcycle@v1",
    "motorcycleecommerce": "ecommerce-motorcycle@v1",
    // Book
    "book-store": "ecommerce-book@v1",
    "book": "ecommerce-book@v1",
    "bookecommerce": "ecommerce-book@v1",
    // Accessories
    "accessories-store": "ecommerce-accessories@v1",
    "accessories": "ecommerce-accessories@v1",
    // Electronics & Earphones
    "electronics-store": "ecommerce-earphones@v1",
    "electronics": "ecommerce-earphones@v1",
    "earphones-store": "ecommerce-earphones@v1",
    "earphones": "ecommerce-earphones@v1",
    "glasses-store": "ecommerce-glasses@v1",
    "glasses": "ecommerce-glasses@v1",
    // Fashion & Furniture
    "fashion": "fashion@v1",
    "fashion-shop": "fashion@v1",
    "fashion-boutique": "fashion@v1",
    "modern-fashion-store": "fashion@v1",
    "furniture": "furniture@v1",
    "furniture-shop": "furniture@v1",
    "furniture-store": "furniture@v1",
    "modern-furniture-store": "furniture@v1",
    // Courses
    "courses": "courses@v1",
    "educational": "courses@v1",
    "educational-online-courses": "courses@v1",
    "online-learning": "courses@v1",
    "courses-layout-2": "courses-2@v1",
    "courses-2": "courses-2@v1",
    "courses-layout-3": "courses-3@v1",
    "courses-3": "courses-3@v1",
    // Automotive
    "automotive": "automotive@v1",
    "car-dealership": "automotive@v1",
    "car-dealership-2": "automotive-2@v1",
    "automotive-2": "automotive-2@v1",
    // Security
    "security": "security@v1",
    "security-services": "security@v1",
    "security-consulting": "security-2@v1",
    "security-2": "security-2@v1",
    "cybersecurity-firm": "security@v1",
    "home-security": "security@v1",
    "event-security": "security@v1",
    "surveillance-systems": "security@v1",
    "access-control": "security@v1",
    "security-training": "security@v1",
    "alarm-systems": "security@v1",
    // Consultancy & Speaking
    "consultancy": "consultancy@v1",
    "consultant-coach": "consultancy@v1",
    "consultant-coach-v1": "consultancy@v1",
    "executive-coach-v1": "consultancy@v1",
    "wellness-retreat-v2": "consultancy@v1",
    "public-speaking": "public-speaking@v1",
    "standard-speaker-site": "public-speaking@v1",
    // Services & Bookings
    "services": "services@v1",
    "service-provider": "services@v1",
    "agency-portfolio": "services@v1",
    "bookings": "bookings@v1",
    "booking-appointments": "bookings@v1",
    "scheduler-hub": "bookings@v1",
    "barbershop-store": "barbershop@v1",
    "barbershop": "barbershop@v1",
    "drycleaning": "drycleaning@v1",
    "salon-bookings": "salon-bookings@v1",
    "salon": "salon-bookings@v1",
    "spa": "salon-bookings@v1",
    // Real estate
    "real-estate": "real-estate@v1",
    "property-listings": "real-estate@v1",
    "property-management": "property-management@v1",
    "property-manager": "property-management@v1",
    // Media, Blog, Content & Events
    "blog": "blog@v1",
    "blog-content": "blog@v1",
    "modern-magazine": "blog@v1",
    "media": "media@v1",
    "media-entertainment": "media@v1",
    "film-studio": "media@v1",
    "nonprofit": "nonprofit@v1",
    "nonprofit-community": "nonprofit@v1",
    "charity-connect": "nonprofit@v1",
    "events": "events@v1",
    "event": "events@v1",
    "event-booking": "events@v1",
    "event-ticketing": "events@v1",
    "directory": "directory@v1",
    "directory-listings": "directory@v1",
    "business-directory": "directory@v1",
    // Finance, Healthcare, Fitness, Travel
    "finance": "finance@v1",
    "finance-legal": "finance@v1",
    "financial-advisor": "finance@v1",
    "healthcare": "healthcare@v1",
    "healthcare-clinics": "healthcare@v1",
    "clinic-pro": "healthcare@v1",
    "fitness": "fitness@v1",
    "fitness-wellness": "fitness@v1",
    "gym-fitness": "fitness@v1",
    "travel": "travel@v1",
    "travel-tourism": "travel@v1",
    "travel-agency": "travel@v1",
    // Portfolio, SaaS, Logistics, Marketplace, Restaurant
    "portfolio": "portfolio@v1",
    "portfolio-personal-branding": "portfolio@v1",
    "creative-cv": "portfolio@v1",
    "company-portfolio": "company-portfolio@v1",
    "company-portfolio-light": "company-portfolio-light@v1",
    "saas": "saas@v1",
    "saas-web-apps": "saas@v1",
    "app-landing-page": "saas@v1",
    "delivery": "delivery@v1",
    "delivery-service": "delivery@v1",
    "delivery-logistics": "delivery@v1",
    "restaurant": "restaurant@v1",
    "restaurant-food-delivery": "restaurant@v1",
    "food-delivery": "restaurant@v1",
    "marketplace": "marketplace@v1",
    "product-marketplace": "marketplace@v1",
    "artisan-marketplace-v3": "marketplace@v1",
    "ghuba": "ghuba@v1",
    // E-commerce fallbacks & missing variants
    "ecommerce": "ecommerce-default@v1",
    "e-commerce": "ecommerce-default@v1",
    "modern-shop-v1": "ecommerce-default@v1",
    "digital-goods-store-v2": "ecommerce-default@v1",
    "default": "default-site@v1",
    "general-purpose-site": "default-site@v1",
    "other": "default-site@v1",
};
exports.PAGE_SLUG_ALIASES = {
    shop: "products",
    catalog: "products",
    "all-products": "products",
    store: "products",
    items: "products",
    departments: "categories",
    collections: "categories",
    "about-us": "about",
    "our-story": "about",
    story: "about",
    "contact-us": "contact",
    "get-in-touch": "contact",
    support: "contact",
    appointments: "booking",
    book: "booking",
    "book-appointment": "booking",
    scheduler: "booking",
    classes: "courses",
    curriculum: "courses",
    programs: "courses",
};
function resolvePageSlugAlias(slug) {
    const norm = (0, helpers_1.normalizeKey)(slug);
    return exports.PAGE_SLUG_ALIASES[norm] || slug;
}
exports.resolvePageSlugAlias = resolvePageSlugAlias;
function initAliases(registry) {
    for (const template of Object.values(registry)) {
        if (!template || !template.id) {
            console.error("TEMPLATE WITHOUT ID:", template);
            continue;
        }
        const normId = (0, helpers_1.normalizeKey)(template.id);
        exports.ALIAS_TO_CANONICAL_ID[normId] = template.id;
        const strippedId = (0, helpers_1.normalizeKey)(template.id.replace(/@v\d+$/, ""));
        exports.ALIAS_TO_CANONICAL_ID[strippedId] = template.id;
        if (template.name) {
            exports.ALIAS_TO_CANONICAL_ID[(0, helpers_1.normalizeKey)(template.name)] = template.id;
        }
    }
}
exports.initAliases = initAliases;
