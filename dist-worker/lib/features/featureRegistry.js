"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAgentPathAllowed = exports.getDefaultLandingForRole = exports.getPOSRouteForCategory = exports.getFeaturesFor = exports.normalizeStaffRole = exports.normalizeCategory = exports.FEATURE_REGISTRY = void 0;
const feature_map_json_1 = __importDefault(require("@/docs/architecture/feature-map.json"));
exports.FEATURE_REGISTRY = feature_map_json_1.default;
/**
 * Normalizes any freeform company category string or variant into a canonical CategoryDefinition ID.
 */
function normalizeCategory(category, variant) {
    if (!category && !variant)
        return "ecommerce";
    const raw = `${category || ""} ${variant || ""}`.trim().toLowerCase();
    for (const cat of exports.FEATURE_REGISTRY.categories) {
        if (cat.id === raw)
            return cat.id;
        for (const alias of cat.aliases) {
            if (raw.includes(alias.toLowerCase())) {
                return cat.id;
            }
        }
    }
    // Fallback pattern matching
    if (raw.includes("food") || raw.includes("cafe") || raw.includes("dine") || raw.includes("bake") || raw.includes("bar")) {
        return "restaurant";
    }
    if (raw.includes("gym") || raw.includes("fit") || raw.includes("wellness") || raw.includes("train")) {
        return "fitness";
    }
    if (raw.includes("service") || raw.includes("salon") || raw.includes("spa") || raw.includes("clean") || raw.includes("consult")) {
        return "services";
    }
    if (raw.includes("auto") || raw.includes("motor") || raw.includes("car") || raw.includes("vehicle")) {
        return "automotive";
    }
    if (raw.includes("health") || raw.includes("clinic") || raw.includes("doctor") || raw.includes("medic")) {
        return "healthcare";
    }
    if (raw.includes("school") || raw.includes("educat") || raw.includes("teach") || raw.includes("learn")) {
        return "education";
    }
    return "ecommerce";
}
exports.normalizeCategory = normalizeCategory;
/**
 * Normalizes staff identity and posRole into standard platform staff roles.
 */
function normalizeStaffRole(opts) {
    const { userRole, posRole, jobTitle, isSalesAgent } = opts;
    const userRoleUpper = (userRole || "").toUpperCase();
    const posRoleUpper = (posRole || "").toUpperCase();
    const titleUpper = (jobTitle || "").toUpperCase();
    if (userRoleUpper === "SUPER_ADMIN")
        return "SUPER_ADMIN";
    if (userRoleUpper === "ADMIN" || titleUpper.includes("OWNER") || titleUpper.includes("DIRECTOR")) {
        return "ADMIN";
    }
    if (userRoleUpper === "MANAGER" ||
        posRoleUpper === "MANAGER" ||
        titleUpper.includes("MANAGER") ||
        titleUpper.includes("SUPERVISOR")) {
        return "MANAGER";
    }
    if (posRoleUpper === "CASHIER" || titleUpper.includes("CASHIER") || titleUpper.includes("TELLER")) {
        return "CASHIER";
    }
    if (isSalesAgent ||
        userRoleUpper === "AGENT" ||
        posRoleUpper === "SALES_AGENT" ||
        titleUpper.includes("SALES") ||
        titleUpper.includes("AGENT")) {
        return "SALES_AGENT";
    }
    if (posRoleUpper === "SERVICE_AGENT" ||
        titleUpper.includes("TECHNICIAN") ||
        titleUpper.includes("THERAPIST") ||
        titleUpper.includes("BARBER") ||
        titleUpper.includes("STYLIST") ||
        titleUpper.includes("SPECIALIST")) {
        return "SERVICE_AGENT";
    }
    if (posRoleUpper === "FITNESS_STAFF" ||
        titleUpper.includes("TRAINER") ||
        titleUpper.includes("COACH") ||
        titleUpper.includes("INSTRUCTOR")) {
        return "FITNESS_STAFF";
    }
    if (titleUpper.includes("INVENTORY") ||
        titleUpper.includes("WAREHOUSE") ||
        titleUpper.includes("STOREKEEPER") ||
        titleUpper.includes("STOCK")) {
        return "INVENTORY_STAFF";
    }
    return "STAFF";
}
exports.normalizeStaffRole = normalizeStaffRole;
/**
 * Returns all active features available for a given company category, staff role, and permissions.
 */
function getFeaturesFor(categoryId, roleId, userPermissions = []) {
    const normCategory = normalizeCategory(categoryId);
    const normRole = roleId.toUpperCase();
    return exports.FEATURE_REGISTRY.features.filter((f) => {
        // If admin-only, block from agent workspace unless admin
        if (f.adminOnly && normRole !== "ADMIN" && normRole !== "SUPER_ADMIN") {
            return false;
        }
        // Category check: supports "all" or specific category ID
        const supportsCategory = f.category.includes("all") || f.category.includes(normCategory);
        if (!supportsCategory)
            return false;
        // Role check: Admin and SuperAdmin have all features
        if (normRole === "ADMIN" || normRole === "SUPER_ADMIN")
            return true;
        // Check if role is explicitly in allowedRoles
        const hasRole = f.allowedRoles.includes(normRole);
        if (hasRole)
            return true;
        // Optional check: explicit capabilities permission grant
        if (userPermissions && userPermissions.length > 0) {
            const hasCap = f.capabilities.some((cap) => userPermissions.includes(cap));
            if (hasCap)
                return true;
        }
        return false;
    });
}
exports.getFeaturesFor = getFeaturesFor;
/**
 * Resolves the category's dedicated POS route.
 */
function getPOSRouteForCategory(categoryId, slug) {
    const normCategory = normalizeCategory(categoryId);
    const cat = exports.FEATURE_REGISTRY.categories.find((c) => c.id === normCategory);
    const route = cat ? cat.posRoute : "/storepos";
    return `/admin/${slug}${route}`;
}
exports.getPOSRouteForCategory = getPOSRouteForCategory;
/**
 * Resolves the appropriate default landing page for a staff member.
 */
function getDefaultLandingForRole(categoryId, roleId, slug) {
    const normRole = roleId.toUpperCase();
    const normCategory = normalizeCategory(categoryId);
    if (normRole === "CASHIER") {
        // Cashier goes directly to Agent POS or dedicated POS
        return `/agents/${slug}/pos`;
    }
    if (normRole === "SALES_AGENT") {
        return `/agents/${slug}/sales`;
    }
    if (normRole === "SERVICE_AGENT") {
        return `/agents/${slug}/bookings`;
    }
    if (normRole === "FITNESS_STAFF") {
        return `/agents/${slug}/members`;
    }
    if (normRole === "INVENTORY_STAFF") {
        return `/agents/${slug}/inventory`;
    }
    // Category fallback
    const cat = exports.FEATURE_REGISTRY.categories.find((c) => c.id === normCategory);
    if (cat && cat.defaultAgentWorkspace) {
        return `/agents/${slug}${cat.defaultAgentWorkspace}`;
    }
    return `/agents/${slug}/dashboard`;
}
exports.getDefaultLandingForRole = getDefaultLandingForRole;
/**
 * Verifies if an agent URL path is authorized for the given category, role, and permissions.
 */
function isAgentPathAllowed(pathname, categoryId, roleId, userPermissions = []) {
    const normRole = roleId.toUpperCase();
    if (normRole === "ADMIN" || normRole === "SUPER_ADMIN")
        return true;
    // Clean pathname to extract the sub-action
    // e.g. /agents/my-store/orders -> orders
    const parts = pathname.split("/").filter(Boolean);
    // Expecting ['agents', 'slug', 'section', ...]
    const section = parts[2] || "dashboard";
    const allowedFeatures = getFeaturesFor(categoryId, normRole, userPermissions);
    return allowedFeatures.some((f) => {
        if (!f.agentRoute)
            return false;
        const fParts = f.agentRoute.split("/").filter(Boolean);
        const fSection = fParts[2] || "dashboard";
        return fSection === section;
    });
}
exports.isAgentPathAllowed = isAgentPathAllowed;
