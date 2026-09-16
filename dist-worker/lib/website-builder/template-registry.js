"use strict";
/**
 * lib/website-builder/template-registry.ts
 *
 * Centralized, authoritative Template Registry for SalesmanPro.
 * Defines all 56 physically implemented templates with canonical versioned IDs,
 * explicit page mappings, capability declarations, authentic component trees,
 * and deterministic alias resolution.
 *
 * Guaranteed: Original designs are preserved in full fidelity as the authoritative asset.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplatesForCategory = exports.getTemplateForCompany = exports.getAllTemplates = exports.getTemplateById = exports.resolveCanonicalTemplate = exports.TEMPLATE_REGISTRY = exports.ALIAS_TO_CANONICAL_ID = exports.makeShell = exports.makeCoursePages = exports.makeBookingPages = exports.makeEcommercePages = exports.normalizeKey = void 0;
const ecommerce_1 = require("./registry/ecommerce");
const bookings_1 = require("./registry/bookings");
const content_1 = require("./registry/content");
const professional_1 = require("./registry/professional");
const property_1 = require("./registry/property");
const automotive_1 = require("./registry/automotive");
const education_1 = require("./registry/education");
const lifestyle_1 = require("./registry/lifestyle");
const marketplace_1 = require("./registry/marketplace");
const security_1 = require("./registry/security");
const default_1 = require("./registry/default");
const aliases_1 = require("./registry/aliases");
Object.defineProperty(exports, "ALIAS_TO_CANONICAL_ID", { enumerable: true, get: function () { return aliases_1.ALIAS_TO_CANONICAL_ID; } });
const helpers_1 = require("./registry/helpers");
Object.defineProperty(exports, "normalizeKey", { enumerable: true, get: function () { return helpers_1.normalizeKey; } });
Object.defineProperty(exports, "makeEcommercePages", { enumerable: true, get: function () { return helpers_1.makeEcommercePages; } });
Object.defineProperty(exports, "makeBookingPages", { enumerable: true, get: function () { return helpers_1.makeBookingPages; } });
Object.defineProperty(exports, "makeCoursePages", { enumerable: true, get: function () { return helpers_1.makeCoursePages; } });
Object.defineProperty(exports, "makeShell", { enumerable: true, get: function () { return helpers_1.makeShell; } });
/* =========================================================================
   CANONICAL TEMPLATE REGISTRY (ALL 56 TEMPLATES MERGED)
   ========================================================================= */
exports.TEMPLATE_REGISTRY = {
    ...ecommerce_1.ECOMMERCE_TEMPLATES,
    ...bookings_1.BOOKINGS_TEMPLATES,
    ...content_1.CONTENT_TEMPLATES,
    ...professional_1.PROFESSIONAL_TEMPLATES,
    ...property_1.PROPERTY_TEMPLATES,
    ...automotive_1.AUTOMOTIVE_TEMPLATES,
    ...education_1.EDUCATION_TEMPLATES,
    ...lifestyle_1.LIFESTYLE_TEMPLATES,
    ...marketplace_1.MARKETPLACE_TEMPLATES,
    ...security_1.SECURITY_TEMPLATES,
    ...default_1.DEFAULT_TEMPLATES,
};
// Initialize alias lookups from merged registry
(0, aliases_1.initAliases)(exports.TEMPLATE_REGISTRY);
/* =========================================================================
   DETERMINISTIC RESOLVER & HELPER FUNCTIONS
   ========================================================================= */
/**
 * Deterministically resolves a canonical TemplateDefinition from:
 * 1. Explicit tenant canonical template (direct match in registry, prioritizing specific template over generic defaults if a variant is given)
 * 2. Explicit tenant template variant
 * 3. Migrated legacy template identity
 * 4. Registry alias normalization
 * 5. Category + variant resolution
 * 6. Safe fallback to default-site@v1
 */
function resolveCanonicalTemplate(category, variant, explicitTemplateId) {
    // Stage 1: Explicit canonical template ID match (if specific)
    if (explicitTemplateId) {
        const directMatch = exports.TEMPLATE_REGISTRY[explicitTemplateId];
        if (directMatch) {
            // If it's default-site@v1 placeholder BUT the tenant has an explicit business variant, let the variant resolve
            const isPlaceholder = directMatch.id === "default-site@v1";
            const hasSpecificVariant = variant && (0, helpers_1.normalizeKey)(variant) !== "default" && (0, helpers_1.normalizeKey)(variant) !== "other";
            if (!isPlaceholder || !hasSpecificVariant) {
                return directMatch;
            }
        }
    }
    // Stage 2: Explicit tenant template variant (most specific business intent)
    if (variant && (0, helpers_1.normalizeKey)(variant) !== "default" && (0, helpers_1.normalizeKey)(variant) !== "other") {
        const normVariant = (0, helpers_1.normalizeKey)(variant);
        const resolvedId = aliases_1.ALIAS_TO_CANONICAL_ID[normVariant];
        if (resolvedId && exports.TEMPLATE_REGISTRY[resolvedId]) {
            return exports.TEMPLATE_REGISTRY[resolvedId];
        }
    }
    // Stage 3 & 4: Migrated legacy template identity & Registry alias normalization on explicitTemplateId
    if (explicitTemplateId) {
        const normExplicit = (0, helpers_1.normalizeKey)(explicitTemplateId);
        const resolvedId = aliases_1.ALIAS_TO_CANONICAL_ID[normExplicit];
        if (resolvedId && exports.TEMPLATE_REGISTRY[resolvedId]) {
            return exports.TEMPLATE_REGISTRY[resolvedId];
        }
    }
    // Stage 5: Category + variant combined resolution or category alone
    if (category && variant) {
        const combinedNorm = (0, helpers_1.normalizeKey)(`${category}-${variant}`);
        const resolvedId = aliases_1.ALIAS_TO_CANONICAL_ID[combinedNorm];
        if (resolvedId && exports.TEMPLATE_REGISTRY[resolvedId]) {
            return exports.TEMPLATE_REGISTRY[resolvedId];
        }
    }
    if (category) {
        const normCat = (0, helpers_1.normalizeKey)(category);
        const resolvedId = aliases_1.ALIAS_TO_CANONICAL_ID[normCat];
        if (resolvedId && exports.TEMPLATE_REGISTRY[resolvedId]) {
            return exports.TEMPLATE_REGISTRY[resolvedId];
        }
    }
    // If explicitTemplateId was a generic default but nothing more specific resolved, return it
    if (explicitTemplateId && exports.TEMPLATE_REGISTRY[explicitTemplateId]) {
        return exports.TEMPLATE_REGISTRY[explicitTemplateId];
    }
    // Stage 6: Safe fallback to default template with non-silent warning log
    if (process.env.NODE_ENV === "development") {
        console.warn(`[TemplateResolver] Unknown template identity (cat: '${category}', variant: '${variant}', id: '${explicitTemplateId}'). Falling back to 'default-site@v1'.`);
    }
    return exports.TEMPLATE_REGISTRY["default-site@v1"];
}
exports.resolveCanonicalTemplate = resolveCanonicalTemplate;
/**
 * Gets a template definition directly by its canonical ID
 */
function getTemplateById(id) {
    return exports.TEMPLATE_REGISTRY[id];
}
exports.getTemplateById = getTemplateById;
/**
 * Returns all 56 registered templates for admin catalog and palette selection
 */
function getAllTemplates() {
    return Object.values(exports.TEMPLATE_REGISTRY);
}
exports.getAllTemplates = getAllTemplates;
/**
 * Resolves a company's canonical template
 */
function getTemplateForCompany(company) {
    const explicitId = company?.website?.templateKey || company?.website?.templateId;
    return resolveCanonicalTemplate(company?.category, company?.variant, explicitId);
}
exports.getTemplateForCompany = getTemplateForCompany;
/**
 * Returns all templates that match a business category
 */
function getTemplatesForCategory(category) {
    const norm = (0, helpers_1.normalizeKey)(category);
    return getAllTemplates().filter((t) => {
        const tCat = (0, helpers_1.normalizeKey)(t.category);
        return (tCat === norm ||
            (norm === "ecommerce" && tCat.startsWith("ecommerce")) ||
            (norm === "real-estate" && (tCat === "realestate" || tCat === "propertymanagement")) ||
            (norm === "bookings" && tCat === "bookings"));
    });
}
exports.getTemplatesForCategory = getTemplatesForCategory;
