"use strict";
/**
 * lib/auth/tenantScope.ts
 *
 * Authoritative Multi-Tenant Identity & Scope Resolution Engine.
 *
 * Enforces zero-trust tenant isolation across the SalesmanPro API platform:
 * 1. Resolves trusted tenant/company identity from verified session credentials.
 * 2. Prohibits cross-tenant data exfiltration (IDOR/BOLA).
 * 3. Verifies company ownership or staff membership server-side.
 * 4. Prevents empty-filter database leaks (where omitting companyId returned all records).
 * 5. Validates MongoDB ObjectId format to prevent Prisma P2023 database crashes.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTenantWhere = exports.resolveAuthorizedCompany = exports.isValidObjectId = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const authorization_1 = require("@/lib/auth/authorization");
/**
 * Validates whether a string is a valid 24-character hexadecimal MongoDB ObjectId.
 */
function isValidObjectId(id) {
    if (!id || typeof id !== "string")
        return false;
    return /^[0-9a-fA-F]{24}$/.test(id.trim());
}
exports.isValidObjectId = isValidObjectId;
/**
 * Resolves and strictly validates that the authenticated principal is authorized
 * to read or mutate resources under the specified or implied companyId.
 *
 * @param user The authenticated user from NextAuth session token
 * @param requestedCompanyId Optional companyId requested in query string or body
 * @param options Configuration options for tenant enforcement
 */
async function resolveAuthorizedCompany(user, requestedCompanyId, options = {
    allowPlatformSuperAdmin: true,
    requireActiveAccount: true,
}) {
    if (!user || !user.id) {
        return {
            authorized: false,
            error: "Unauthorized: Valid session required",
            status: 401,
        };
    }
    if (options.requireActiveAccount && user.isActive === false) {
        return {
            authorized: false,
            error: "Forbidden: Account is inactive",
            status: 403,
        };
    }
    const role = (0, authorization_1.normalizeRole)(user.role);
    // Platform SUPER_ADMIN has cross-tenant oversight if explicitly enabled
    if (options.allowPlatformSuperAdmin && role === "SUPER_ADMIN") {
        if (requestedCompanyId) {
            return { authorized: true, companyId: requestedCompanyId, status: 200 };
        }
        if (user.companyId) {
            return { authorized: true, companyId: user.companyId, status: 200 };
        }
        // Check if super-admin owns any company
        try {
            const owned = await prismadb_1.default.company.findFirst({
                where: { userId: user.id },
                select: { id: true },
            });
            return {
                authorized: true,
                companyId: owned?.id,
                status: 200,
            };
        }
        catch {
            return { authorized: true, companyId: undefined, status: 200 };
        }
    }
    const targetCompanyId = requestedCompanyId?.trim();
    // If user has a direct companyId on their token matching target (or target omitted)
    if (user.companyId) {
        if (!targetCompanyId || targetCompanyId === user.companyId) {
            return { authorized: true, companyId: user.companyId, status: 200 };
        }
    }
    // If targetCompanyId was specified and differs from user's primary companyId,
    // we must verify explicit company ownership or staff profile relationship in database.
    if (targetCompanyId) {
        // If targetCompanyId is malformed for MongoDB ObjectId, reject immediately without database error
        if (!isValidObjectId(targetCompanyId)) {
            return {
                authorized: false,
                error: "Invalid company tenant identifier format",
                status: 400,
            };
        }
        try {
            const company = await prismadb_1.default.company.findUnique({
                where: { id: targetCompanyId },
                select: { id: true, userId: true },
            });
            if (!company) {
                return {
                    authorized: false,
                    error: "Company tenant not found",
                    status: 404,
                };
            }
            // Check ownership
            if (company.userId && company.userId === user.id) {
                return { authorized: true, companyId: company.id, status: 200 };
            }
            // Check staff profile
            const staff = await prismadb_1.default.staffProfile.findFirst({
                where: {
                    userId: user.id,
                    companyId: targetCompanyId,
                },
                select: { id: true, companyId: true },
            });
            if (staff && staff.companyId === targetCompanyId) {
                return { authorized: true, companyId: targetCompanyId, status: 200 };
            }
            // Check general company admin access helper
            const hasAdminAccess = (0, authorization_1.canAccessCompanyAdmin)({
                user: {
                    id: user.id,
                    role: user.role,
                    companyId: user.companyId,
                    isActive: user.isActive,
                    emailVerified: user.emailVerified,
                },
                company: { id: company.id, userId: company.userId },
                staffCompanyId: staff?.companyId,
            });
            if (hasAdminAccess) {
                return { authorized: true, companyId: targetCompanyId, status: 200 };
            }
            return {
                authorized: false,
                error: "Forbidden: You do not have access to this tenant company",
                status: 403,
            };
        }
        catch (err) {
            return {
                authorized: false,
                error: "Failed to verify tenant company credentials",
                status: 500,
            };
        }
    }
    // If targetCompanyId was omitted and user token lacked companyId, resolve owned company
    try {
        const ownedCompany = await prismadb_1.default.company.findFirst({
            where: { userId: user.id },
            select: { id: true },
        });
        if (ownedCompany) {
            return { authorized: true, companyId: ownedCompany.id, status: 200 };
        }
        // Fallback: check staff profile
        const staffProfile = await prismadb_1.default.staffProfile.findFirst({
            where: { userId: user.id },
            select: { companyId: true },
        });
        if (staffProfile?.companyId) {
            return { authorized: true, companyId: staffProfile.companyId, status: 200 };
        }
    }
    catch { }
    return {
        authorized: false,
        error: "No authorized tenant company associated with this account",
        status: 403,
    };
}
exports.resolveAuthorizedCompany = resolveAuthorizedCompany;
/**
 * Builds a strict tenant-scoped Prisma WHERE clause.
 * Guarantees that query operations can NEVER execute with an empty tenant filter.
 */
function buildTenantWhere(authorizedCompanyId, filter = {}) {
    if (!authorizedCompanyId || typeof authorizedCompanyId !== "string") {
        throw new Error("SECURITY_ERROR: authorizedCompanyId is required for tenant-scoped query");
    }
    return {
        ...filter,
        companyId: authorizedCompanyId,
    };
}
exports.buildTenantWhere = buildTenantWhere;
