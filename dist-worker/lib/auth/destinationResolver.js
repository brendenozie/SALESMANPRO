"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDestinationFromToken = exports.resolveUserDestination = exports.countUserCompanies = exports.resolveUserCompanySlug = void 0;
// lib/auth/destinationResolver.ts
const prismadb_1 = __importDefault(require("../../server/db/prismadb"));
const authorization_1 = require("./authorization");
const telemetry_1 = require("./telemetry");
function isValidObjectId(id) {
    if (!id || typeof id !== "string")
        return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
}
/**
 * Resolves the primary company and slug for a given user ID.
 */
async function resolveUserCompanySlug(userId, providedCompanyId) {
    try {
        if (providedCompanyId && isValidObjectId(providedCompanyId)) {
            const company = await prismadb_1.default.company.findUnique({
                where: { id: providedCompanyId },
                select: { id: true, slug: true },
            });
            if (company?.slug) {
                return { companyId: company.id, slug: company.slug };
            }
        }
        if (!isValidObjectId(userId)) {
            return { companyId: providedCompanyId || null, slug: null };
        }
        // Check company owned by user
        const owned = await prismadb_1.default.company.findFirst({
            where: { userId },
            select: { id: true, slug: true },
        });
        if (owned?.slug) {
            return { companyId: owned.id, slug: owned.slug };
        }
        // Check staff profile
        const staff = await prismadb_1.default.staffProfile.findFirst({
            where: { userId },
            include: { company: { select: { id: true, slug: true } } },
        });
        if (staff?.company?.slug) {
            return { companyId: staff.company.id, slug: staff.company.slug };
        }
        // Check sales agent
        const agent = await prismadb_1.default.salesAgent.findFirst({
            where: { userId },
            include: { company: { select: { id: true, slug: true } } },
        });
        if (agent?.company?.slug) {
            return { companyId: agent.company.id, slug: agent.company.slug };
        }
        // Check educator
        const educator = await prismadb_1.default.educator.findUnique({
            where: { userId },
            include: { Company: { select: { id: true, slug: true } } },
        });
        if (educator?.Company?.slug) {
            return { companyId: educator.Company.id, slug: educator.Company.slug };
        }
        // Check student
        const student = await prismadb_1.default.student.findUnique({
            where: { userId },
            include: { Company: { select: { id: true, slug: true } } },
        });
        if (student?.Company?.slug) {
            return { companyId: student.Company.id, slug: student.Company.slug };
        }
        // Check driver
        const driver = await prismadb_1.default.transportDriver.findFirst({
            where: { userId },
            include: { company: { select: { id: true, slug: true } } },
        });
        if (driver?.company?.slug) {
            return { companyId: driver.company.id, slug: driver.company.slug };
        }
        return { companyId: null, slug: null };
    }
    catch (error) {
        console.error("[resolveUserCompanySlug] Error:", error);
        return { companyId: null, slug: null };
    }
}
exports.resolveUserCompanySlug = resolveUserCompanySlug;
/**
 * Checks how many companies the user owns or has access to.
 */
async function countUserCompanies(userId) {
    if (!isValidObjectId(userId))
        return 1;
    try {
        const ownedCount = await prismadb_1.default.company.count({
            where: { userId },
        });
        return ownedCount;
    }
    catch {
        return 1;
    }
}
exports.countUserCompanies = countUserCompanies;
/**
 * Centralized, server-validated destination resolution service.
 * Enforces role hierarchy, active status, email verification, and tenant isolation.
 */
async function resolveUserDestination(user, opts = {}) {
    const cId = opts.correlationId || (0, telemetry_1.generateCorrelationId)();
    const start = Date.now();
    if (!user || !user.id) {
        (0, telemetry_1.authLog)(cId, "destination_resolution", Date.now() - start, {
            status: "unauthenticated",
        });
        return {
            destination: "/signin",
            role: "ANONYMOUS",
            companyId: null,
            companySlug: null,
            isAuthorized: false,
            reason: "unauthenticated",
        };
    }
    // 1. Account Active Guard
    if (user.isActive === false) {
        (0, telemetry_1.authLog)(cId, "destination_resolution", Date.now() - start, {
            status: "inactive_account",
            userId: user.id,
        });
        return {
            destination: "/unauthorized?reason=inactive",
            role: (0, authorization_1.normalizeRole)(user.role),
            companyId: user.companyId || null,
            companySlug: user.companySlug || null,
            isAuthorized: false,
            reason: "account_inactive",
        };
    }
    // 2. Email Verification Guard (Only explicit false blocks)
    if (user.emailVerified === false) {
        const emailParam = encodeURIComponent(user.email || "");
        (0, telemetry_1.authLog)(cId, "destination_resolution", Date.now() - start, {
            status: "unverified_email",
            userId: user.id,
        });
        return {
            destination: `/verify-email?email=${emailParam}`,
            role: (0, authorization_1.normalizeRole)(user.role),
            companyId: user.companyId || null,
            companySlug: user.companySlug || null,
            isAuthorized: false,
            reason: "email_unverified",
        };
    }
    const role = (0, authorization_1.normalizeRole)(user.role);
    let effectiveCompanyId = user.companyId || null;
    let effectiveCompanySlug = user.companySlug || null;
    // Resolve company slug if not already provided
    if (!effectiveCompanySlug && user.id) {
        const resolved = await resolveUserCompanySlug(user.id, effectiveCompanyId);
        effectiveCompanyId = resolved.companyId || effectiveCompanyId;
        effectiveCompanySlug = resolved.slug;
    }
    const isPosClient = opts.platform === "WPF" ||
        opts.platform === "ANDROID" ||
        opts.platform === "DESKTOP" ||
        opts.preferredDestination?.includes("storepos");
    let destination = "/dashboards";
    // 3. Super Admin
    if (role === "SUPER_ADMIN") {
        destination = "/super-admin";
        if (opts.preferredDestination && opts.preferredDestination.startsWith("/super-admin")) {
            destination = opts.preferredDestination;
        }
    }
    // 4. Company / Store Admin
    else if (role === "ADMIN") {
        const ownedCount = user.id ? await countUserCompanies(user.id) : 1;
        if (ownedCount > 1) {
            destination = "/stores";
        }
        else if (effectiveCompanySlug) {
            if (opts.preferredDestination &&
                (opts.preferredDestination.startsWith(`/admin/${effectiveCompanySlug}`) ||
                    opts.preferredDestination.startsWith("/admin"))) {
                destination = opts.preferredDestination;
            }
            else {
                destination = `/admin/${effectiveCompanySlug}`;
            }
        }
        else {
            destination = "/stores";
        }
    }
    // 5. Staff / POS Operator
    else if (role === "STAFF" ||
        role === "STAFF_MEMBER" ||
        role === "CASHIER" ||
        role === "MANAGER") {
        if (effectiveCompanySlug) {
            if (isPosClient) {
                const storeQuery = opts.activeStoreId ? `?storeId=${opts.activeStoreId}` : "";
                destination = `/admin/${effectiveCompanySlug}/storepos${storeQuery}`;
            }
            else {
                destination = `/admin/${effectiveCompanySlug}`;
            }
        }
        else {
            destination = "/unauthorized?reason=no_tenant_assigned";
        }
    }
    // 6. Sales Agents
    else if (role === "AGENT" || role === "SALES_AGENT") {
        destination = "/agents";
        if (opts.preferredDestination && opts.preferredDestination.startsWith("/agents")) {
            destination = opts.preferredDestination;
        }
    }
    // 7. Drivers / Logistics
    else if (role === "RIDER") {
        destination = "/ghuba/rider/dashboard";
        if (opts.preferredDestination && opts.preferredDestination.startsWith("/ghuba/rider")) {
            destination = opts.preferredDestination;
        }
    }
    else if (role === "DRIVER" || role === "TRANSPORT_DRIVER" || role === "STORE_DRIVER" || role === "SCHOOL_DRIVER") {
        if (effectiveCompanySlug) {
            destination = `/admin/${effectiveCompanySlug}/store-transport-routes`;
        }
        else {
            destination = "/dashboards";
        }
    }
    // 8. Education Roles
    else if (role === "EDUCATOR" ||
        role === "TEACHER" ||
        role === "HEADTEACHER" ||
        role === "HEAD_TEACHER" ||
        role === "STUDENT" ||
        role === "PARENT") {
        if (effectiveCompanySlug) {
            destination = `/admin/${effectiveCompanySlug}`;
        }
        else {
            destination = "/school";
        }
    }
    // 9. Healthcare Roles
    else if (role === "DOCTOR") {
        destination = "/doctor";
    }
    else if (role === "PATIENT") {
        destination = "/patient";
    }
    // 10. Consumers / Marketplace Users
    else {
        const isGhubaOrigin = opts.originHost?.includes("ghuba") ||
            opts.preferredDestination?.includes("ghuba");
        if (isGhubaOrigin) {
            destination = "/ghuba";
        }
        else if (role === "CLIENT") {
            destination = "/clients";
        }
        else {
            destination = "/clients";
        }
    }
    // 11. Preferred Destination Sanity Check
    if (opts.preferredDestination &&
        opts.preferredDestination !== "/" &&
        opts.preferredDestination !== "/signin" &&
        opts.preferredDestination !== "/signup" &&
        opts.preferredDestination !== "/desktop-login" &&
        opts.preferredDestination !== "/dashboards") {
        // Only allow preferred destination if authorized for user's role
        const isSuperAdminRoute = opts.preferredDestination.startsWith("/super-admin");
        const isAdminRoute = opts.preferredDestination.startsWith("/admin");
        const isAgentsRoute = opts.preferredDestination.startsWith("/agents");
        const isGhubaRoute = opts.preferredDestination.startsWith("/ghuba");
        if (isSuperAdminRoute && role !== "SUPER_ADMIN" && role !== "ADMIN") {
            // Forbidden: do not override
        }
        else if (isAdminRoute) {
            if (role === "SUPER_ADMIN" ||
                role === "ADMIN" ||
                role === "STAFF" ||
                role === "STAFF_MEMBER" ||
                role === "TEACHER" ||
                role === "EDUCATOR" ||
                role === "DRIVER") {
                // If route specifies a company slug, verify tenant boundary
                const matchesSlug = effectiveCompanySlug
                    ? opts.preferredDestination.includes(`/${effectiveCompanySlug}`)
                    : false;
                if (role === "SUPER_ADMIN" || matchesSlug || !effectiveCompanySlug) {
                    destination = opts.preferredDestination;
                }
            }
        }
        else if (isAgentsRoute && (role === "AGENT" || role === "ADMIN" || role === "SUPER_ADMIN")) {
            destination = opts.preferredDestination;
        }
        else if (isGhubaRoute) {
            destination = opts.preferredDestination;
        }
    }
    (0, telemetry_1.authLog)(cId, "destination_resolution", Date.now() - start, {
        userId: user.id,
        role,
        companySlug: effectiveCompanySlug,
        destination,
        platform: opts.platform || "WEB",
    });
    return {
        destination,
        role,
        companyId: effectiveCompanyId,
        companySlug: effectiveCompanySlug,
        isAuthorized: true,
    };
}
exports.resolveUserDestination = resolveUserDestination;
/**
 * Lightweight, synchronous, Edge-compatible destination resolver from JWT session tokens.
 * Safe for use in Next.js middleware without database TCP connections.
 */
function resolveDestinationFromToken(token, opts) {
    if (token.isActive === false)
        return "/unauthorized?reason=inactive";
    if (token.emailVerified === false)
        return `/verify-email?email=${encodeURIComponent(token.email || "")}`;
    const role = (token.role || "USER").toUpperCase();
    if (role === "SUPER_ADMIN")
        return "/super-admin";
    if (role === "ADMIN") {
        if (token.companySlug)
            return `/admin/${token.companySlug}`;
        return "/stores";
    }
    if (role === "STAFF" || role === "STAFF_MEMBER" || role === "CASHIER" || role === "MANAGER") {
        if (token.companySlug) {
            if (opts?.platform === "WPF" || opts?.platform === "ANDROID") {
                return `/admin/${token.companySlug}/storepos`;
            }
            return `/admin/${token.companySlug}`;
        }
        return "/stores";
    }
    if (role === "AGENT" || role === "SALES_AGENT")
        return "/agents";
    if (role === "DRIVER" || role === "TRANSPORT_DRIVER") {
        return token.companySlug ? `/admin/${token.companySlug}/store-transport-routes` : "/dashboards";
    }
    if (["EDUCATOR", "TEACHER", "HEADTEACHER", "HEAD_TEACHER", "STUDENT", "PARENT"].includes(role)) {
        return token.companySlug ? `/admin/${token.companySlug}` : "/school";
    }
    if (role === "DOCTOR")
        return "/doctor";
    if (role === "PATIENT")
        return "/patient";
    if (role === "CLIENT" || role === "USER" || role === "CONSUMER")
        return "/clients";
    return "/dashboards";
}
exports.resolveDestinationFromToken = resolveDestinationFromToken;
