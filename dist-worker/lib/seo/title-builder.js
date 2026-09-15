"use strict";
/**
 * lib/seo/title-builder.ts
 *
 * Deterministic Title Generator across Platform, Marketplace, and Stores.
 * Formats clean, click-worthy, search-intent-aligned titles under 60-65 chars.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPageTitle = exports.truncateTitle = exports.cleanText = void 0;
function cleanText(input) {
    if (!input)
        return "";
    return input
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
exports.cleanText = cleanText;
function truncateTitle(title, maxLength = 65) {
    if (title.length <= maxLength)
        return title;
    const sliced = title.slice(0, maxLength - 1);
    const lastSpace = sliced.lastIndexOf(" ");
    if (lastSpace > 35) {
        return `${sliced.slice(0, lastSpace)}…`;
    }
    return `${sliced}…`;
}
exports.truncateTitle = truncateTitle;
function buildPageTitle(ctx) {
    // 1. Explicit merchant custom SEO title override
    if (ctx.customSEO?.title) {
        return cleanText(ctx.customSEO.title);
    }
    const { siteType, pageType, tenant, entity } = ctx;
    const storeName = cleanText(tenant?.name) || "Store";
    const entityName = cleanText(entity?.name || entity?.title);
    // --------------------------------------------------------------------------
    // Surface 1: SALESMANPRO PLATFORM
    // --------------------------------------------------------------------------
    if (siteType === "SALESMANPRO") {
        switch (pageType) {
            case "HOME":
                return "SalesmanPro — Omnichannel Commerce, POS & Multi-Store Platform";
            case "PRICING":
                return "Pricing & Plans — Transparent Commerce Software | SalesmanPro";
            case "ABOUT":
                return "About Us — Empowering Modern Commerce | SalesmanPro";
            case "CAREERS":
                return "Careers at SalesmanPro — Build the Future of Commerce";
            case "CONTACT":
                return "Contact Sales & Support | SalesmanPro";
            case "BLOG":
                return entityName
                    ? `${entityName} — The Dispatch | SalesmanPro Blog`
                    : "The Dispatch — Commerce Insights & Product Updates | SalesmanPro";
            case "TERMS":
                return "Terms of Service | SalesmanPro";
            case "PRIVACY":
                return "Privacy Policy | SalesmanPro";
            default:
                return entityName ? `${entityName} | SalesmanPro` : "SalesmanPro — Commerce Engine";
        }
    }
    // --------------------------------------------------------------------------
    // Surface 2: GHUBA MARKETPLACE
    // --------------------------------------------------------------------------
    if (siteType === "GHUBA") {
        switch (pageType) {
            case "HOME":
                return "Ghuba — Super App Marketplace | Buy, Sell & Discover Verified Deals";
            case "CATEGORY":
                return entityName
                    ? `${entityName} — Buy Online on Ghuba Marketplace`
                    : "Shop by Category — Ghuba Marketplace";
            case "VEHICLE": {
                const make = cleanText(entity?.make);
                const model = cleanText(entity?.model);
                const autoTitle = make && model ? `${make} ${model}` : entityName || "Vehicle";
                return truncateTitle(`${autoTitle} — Verified Deals on Ghuba Autos`);
            }
            case "PROPERTY":
                return truncateTitle(`${entityName || "Property"} — Real Estate Listings on Ghuba`);
            case "PRODUCT":
            case "LISTING":
                return truncateTitle(entityName
                    ? `${entityName} — Buy on Ghuba Marketplace`
                    : "Product Details — Ghuba Marketplace");
            case "SELLER":
                return entityName
                    ? `${entityName} Storefront — Verified Seller on Ghuba`
                    : "Verified Seller Profile — Ghuba Marketplace";
            default:
                return entityName ? `${entityName} | Ghuba` : "Ghuba Marketplace";
        }
    }
    // --------------------------------------------------------------------------
    // Surface 3: TENANT STORE
    // --------------------------------------------------------------------------
    switch (pageType) {
        case "HOME": {
            const tagline = cleanText(tenant?.tagline);
            if (tagline && tagline.length < 35) {
                return truncateTitle(`${storeName} — ${tagline}`);
            }
            return truncateTitle(`${storeName} — Official Storefront`);
        }
        case "PRODUCT":
            return truncateTitle(entityName ? `${entityName} | ${storeName}` : `Product | ${storeName}`);
        case "CATEGORY":
            return truncateTitle(entityName ? `${entityName} Collection | ${storeName}` : `Categories | ${storeName}`);
        case "SERVICE":
            return truncateTitle(entityName ? `${entityName} — Services | ${storeName}` : `Services | ${storeName}`);
        case "BOOK":
            return truncateTitle(entityName ? `${entityName} | ${storeName}` : `Book | ${storeName}`);
        case "VEHICLE":
            return truncateTitle(entityName ? `${entityName} | ${storeName}` : `Vehicle | ${storeName}`);
        case "PROPERTY":
            return truncateTitle(entityName ? `${entityName} | ${storeName}` : `Listing | ${storeName}`);
        case "BLOG":
            return truncateTitle(entityName ? `${entityName} | ${storeName}` : `Blog | ${storeName}`);
        case "ABOUT":
            return `About Us | ${storeName}`;
        case "CONTACT":
            return `Contact Us | ${storeName}`;
        case "TERMS":
            return `Terms & Conditions | ${storeName}`;
        case "PRIVACY":
            return `Privacy Policy | ${storeName}`;
        case "CUSTOM":
            return truncateTitle(entityName ? `${entityName} | ${storeName}` : storeName);
        default:
            return truncateTitle(entityName ? `${entityName} | ${storeName}` : storeName);
    }
}
exports.buildPageTitle = buildPageTitle;
