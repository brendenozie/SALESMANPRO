"use strict";
/**
 * lib/ai/authHelper.ts
 *
 * Secure Authentication and Tenant Isolation Helper for AI APIs.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.resolveAIAuth = void 0;
const next_auth_1 = require("next-auth");
const auth_1 = require("@/lib/auth");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const types_1 = require("./types");
async function resolveAIAuth(req) {
    const session = (await (0, next_auth_1.getServerSession)(auth_1.authOptions));
    if (!session?.user?.email) {
        throw new types_1.AIPlatformError("UNAUTHORIZED", "Authentication required to access AI services", 401);
    }
    const user = await prismadb_1.default.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            email: true,
            role: true,
            companyId: true,
            company: {
                select: { id: true, name: true, deletedAt: true },
            },
        },
    });
    if (!user) {
        throw new types_1.AIPlatformError("UNAUTHORIZED", "User record not found", 401);
    }
    // Allow explicit companyId from query/header if user has access or is Admin/Owner
    let targetCompanyId = user.companyId || user.company?.id;
    if (req) {
        const url = new URL(req.url);
        const requestedCompanyId = url.searchParams.get("companyId") || req.headers.get("x-company-id");
        if (requestedCompanyId && requestedCompanyId !== targetCompanyId) {
            // Verify user owns or belongs to requested company
            const company = await prismadb_1.default.company.findFirst({
                where: {
                    id: requestedCompanyId,
                    deletedAt: null,
                    OR: [
                        { userId: user.id },
                        { id: user.companyId || "" },
                    ],
                },
                select: { id: true, name: true },
            });
            if (company || user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
                targetCompanyId = requestedCompanyId;
            }
        }
    }
    if (!targetCompanyId) {
        // Attempt to find any active company owned by user
        const ownedCompany = await prismadb_1.default.company.findFirst({
            where: { userId: user.id, deletedAt: null },
            select: { id: true, name: true },
        });
        if (ownedCompany) {
            targetCompanyId = ownedCompany.id;
        }
        else {
            throw new types_1.AIPlatformError("TENANT_NOT_FOUND", "No active company tenant associated with this account. Please create or join a store to use AI features.", 403);
        }
    }
    const company = await prismadb_1.default.company.findUnique({
        where: { id: targetCompanyId },
        select: { id: true, name: true },
    });
    return {
        userId: user.id,
        userEmail: user.email,
        companyId: targetCompanyId,
        companyName: company?.name || "Store",
        role: user.role || "USER",
    };
}
exports.resolveAIAuth = resolveAIAuth;
async function requireSuperAdmin(req) {
    const session = (await (0, next_auth_1.getServerSession)(auth_1.authOptions));
    if (!session?.user?.email) {
        throw new types_1.AIPlatformError("UNAUTHORIZED", "Authentication required", 401);
    }
    const user = await prismadb_1.default.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true, name: true, role: true },
    });
    if (!user) {
        throw new types_1.AIPlatformError("UNAUTHORIZED", "User record not found", 401);
    }
    // Super Admin security enforcement
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
        throw new types_1.AIPlatformError("UNAUTHORIZED", "Super Admin privileges required to access this AI control center", 403);
    }
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    };
}
exports.requireSuperAdmin = requireSuperAdmin;
