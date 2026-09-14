"use strict";
/**
 * lib/ghuba-helpers.ts
 *
 * Centralized predicates and helpers for identifying the Ghuba Super App Marketplace
 * across routing, layouts, store loading, and website builder compilation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGhubaMarketplace = void 0;
function isGhubaMarketplace(identifier, raw) {
    if (!identifier && !raw)
        return false;
    const clean = (str) => (str || "")
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "");
    const idClean = clean(identifier);
    const domainClean = clean(raw?.domain);
    const slugClean = clean(raw?.slug);
    const catClean = (raw?.category || "").toLowerCase().trim();
    const tKeyClean = (raw?.website?.templateKey || "").toLowerCase().trim();
    // Subdomains of ghuba.shop belonging to individual tenant stores
    // (e.g. other.ghuba.shop, saas-web-apps.ghuba.shop, store1.ghuba.shop)
    // are normal tenant stores and should load their own merchant themes.
    const isTenantSubdomain = idClean.endsWith(".ghuba.shop") &&
        idClean !== "ghuba.shop" &&
        idClean !== "www.ghuba.shop";
    if (isTenantSubdomain && slugClean !== "ghuba") {
        return false;
    }
    // Exact matches for the Ghuba Marketplace
    if (idClean === "ghuba" ||
        idClean === "ghuba.shop" ||
        idClean === "ghuba.salesmanpro.site") {
        return true;
    }
    if (domainClean === "ghuba" || domainClean === "ghuba.shop") {
        return true;
    }
    if (slugClean === "ghuba") {
        return true;
    }
    if (catClean === "ghuba" || tKeyClean === "ghuba" || tKeyClean === "ghuba@v1") {
        return true;
    }
    return false;
}
exports.isGhubaMarketplace = isGhubaMarketplace;
