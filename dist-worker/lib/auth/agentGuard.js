"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertAgentApiAccess = exports.assertAgentRouteAccess = exports.resolveAgentContext = void 0;
const auth_1 = require("@/lib/auth");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const company_fetcher_1 = require("@/lib/company-fetcher");
const featureRegistry_1 = require("@/lib/features/featureRegistry");
const navigation_1 = require("next/navigation");
/**
 * Server-side resolver for agent/staff authentication and tenancy.
 * Enforces company boundary, active employment status, and resolves permissions.
 */
async function resolveAgentContext(slug) {
    const session = await (0, auth_1.getAuthSession)();
    const sessionUser = session?.user;
    if (!sessionUser?.id) {
        return null;
    }
    const userId = sessionUser.id;
    const user = sessionUser;
    if (user.isActive === false) {
        return null;
    }
    const company = await (0, company_fetcher_1.findCompanyCached)(slug, "page");
    if (!company) {
        return null;
    }
    const isOwner = company.userId === userId;
    const isTenantAdmin = user.role === "ADMIN" && user.companyId === company.id;
    const isSuperAdmin = user.role === "SUPER_ADMIN";
    // Check StaffProfile
    const staff = await prismadb_1.default.staffProfile.findFirst({
        where: {
            userId,
            companyId: company.id,
        },
    });
    // Check SalesAgent
    const salesAgent = await prismadb_1.default.salesAgent.findFirst({
        where: {
            userId,
            companyId: company.id,
        },
    });
    // If not owner, admin, active staff, or active sales agent, deny access
    if (!isOwner && !isTenantAdmin && !isSuperAdmin) {
        if (!staff && !salesAgent) {
            return null;
        }
        if (staff && staff.employmentStatus !== "ACTIVE") {
            return null;
        }
        if (salesAgent && !salesAgent.isActive) {
            return null;
        }
    }
    const category = (0, featureRegistry_1.normalizeCategory)(company.category, company.variant);
    const role = (0, featureRegistry_1.normalizeStaffRole)({
        userRole: isOwner || isTenantAdmin ? "ADMIN" : user.role,
        posRole: staff?.posRole,
        jobTitle: staff?.jobTitle,
        isSalesAgent: Boolean(salesAgent),
    });
    const permissions = [];
    if (staff?.posPermissions && Array.isArray(staff.posPermissions)) {
        permissions.push(...staff.posPermissions);
    }
    if (isOwner || isTenantAdmin || isSuperAdmin) {
        permissions.push("all");
    }
    const features = (0, featureRegistry_1.getFeaturesFor)(category, role, permissions);
    const posRoute = (0, featureRegistry_1.getPOSRouteForCategory)(category, company.slug);
    const defaultLanding = (0, featureRegistry_1.getDefaultLandingForRole)(category, role, company.slug);
    return {
        user: {
            id: userId,
            email: user.email,
            name: user.name || staff?.jobTitle || "Agent Operator",
            role: user.role,
            image: user.image,
        },
        company: {
            id: company.id,
            name: company.name,
            slug: company.slug,
            category: company.category || "E-commerce",
            variant: company.variant,
            logoUrl: company.logoUrl,
            currency: company.currency || "KES",
        },
        category,
        role,
        jobTitle: staff?.jobTitle || (salesAgent ? "Sales Agent" : isOwner ? "Store Owner" : "Staff Member"),
        loginCode: staff?.loginCode || salesAgent?.loginCode || null,
        permissions,
        features,
        posRoute,
        defaultLanding,
        isOwnerOrAdmin: isOwner || isTenantAdmin || isSuperAdmin,
        staffProfileId: staff?.id,
        salesAgentId: salesAgent?.id,
    };
}
exports.resolveAgentContext = resolveAgentContext;
/**
 * Server Component Route Guard:
 * Asserts that the authenticated staff/agent is authorized to view the requested section.
 * Redirects to unauthorized or login if not permitted.
 */
async function assertAgentRouteAccess(slug, section = "dashboard") {
    const context = await resolveAgentContext(slug);
    if (!context) {
        (0, navigation_1.redirect)(`https://auth.salesmanpro.site/signin?callbackUrl=${encodeURIComponent(`https://salesmanpro.site/agents/${slug}/${section}`)}`);
    }
    // Check section access
    const isAllowed = (0, featureRegistry_1.isAgentPathAllowed)(`/agents/${slug}/${section}`, context.category, context.role, context.permissions);
    if (!isAllowed) {
        (0, navigation_1.redirect)(`/unauthorized?reason=insufficient_agent_permissions&feature=${encodeURIComponent(section)}`);
    }
    return context;
}
exports.assertAgentRouteAccess = assertAgentRouteAccess;
/**
 * API Route Guard:
 * Asserts that the request comes from an authorized agent/staff member for the company.
 */
async function assertAgentApiAccess(req, opts) {
    const session = await (0, auth_1.getAuthSession)();
    const sessionUser = session?.user;
    if (!sessionUser?.id) {
        return { success: false, status: 401, error: "Authentication required" };
    }
    let targetSlug = opts.slug;
    if (!targetSlug && opts.companyId) {
        const comp = await prismadb_1.default.company.findUnique({
            where: { id: opts.companyId },
            select: { slug: true },
        });
        targetSlug = comp?.slug;
    }
    if (!targetSlug) {
        return { success: false, status: 400, error: "Company context (slug or companyId) is required" };
    }
    const context = await resolveAgentContext(targetSlug);
    if (!context) {
        return { success: false, status: 403, error: "Access denied: Unauthorized agent or company mismatch" };
    }
    if (opts.requiredCapability) {
        const hasCapability = context.isOwnerOrAdmin ||
            context.permissions.includes("all") ||
            context.permissions.includes(opts.requiredCapability) ||
            context.features.some((f) => f.capabilities.includes(opts.requiredCapability));
        if (!hasCapability) {
            return {
                success: false,
                status: 403,
                error: `Access denied: Missing required capability '${opts.requiredCapability}'`,
            };
        }
    }
    return { success: true, context };
}
exports.assertAgentApiAccess = assertAgentApiAccess;
