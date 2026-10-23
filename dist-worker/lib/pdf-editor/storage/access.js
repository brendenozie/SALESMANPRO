"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownsPDFProject = exports.getPDFSessionIdentity = void 0;
const auth_1 = require("@/lib/auth");
const next_auth_1 = require("next-auth");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function getPDFSessionIdentity(requestedCompanyId) {
    let session = null;
    try {
        session = await (0, auth_1.getAuthSession)();
    }
    catch {
        try {
            session = await (0, next_auth_1.getServerSession)(auth_1.authOptions);
        }
        catch { }
    }
    let user = session?.user;
    if (!user?.id && user?.email) {
        try {
            const u = await prismadb_1.default.user.findUnique({
                where: { email: user.email.toLowerCase().trim() },
                select: { id: true, companyId: true, role: true },
            });
            if (u) {
                user = { ...user, id: u.id, companyId: u.companyId || user.companyId, role: u.role || user.role };
            }
        }
        catch { }
    }
    const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
    if (user?.id) {
        let resolvedCompanyId;
        if (requestedCompanyId) {
            if (isSuperAdmin || requestedCompanyId === user.companyId) {
                resolvedCompanyId = requestedCompanyId;
            }
            else {
                // Regular users may only act inside a company they own or belong to.
                try {
                    const member = await prismadb_1.default.company.findFirst({
                        where: { id: requestedCompanyId, userId: user.id },
                        select: { id: true },
                    });
                    if (member?.id)
                        resolvedCompanyId = member.id;
                }
                catch { }
            }
        }
        if (!resolvedCompanyId)
            resolvedCompanyId = user.companyId || undefined;
        if (!resolvedCompanyId) {
            try {
                const owned = await prismadb_1.default.company.findFirst({
                    where: { userId: user.id },
                    select: { id: true },
                });
                if (owned?.id)
                    resolvedCompanyId = owned.id;
            }
            catch { }
        }
        return {
            userId: user.id,
            companyId: resolvedCompanyId || "store_default",
            isSuperAdmin: Boolean(isSuperAdmin),
        };
    }
    // Development / local fallback only. A client-supplied companyId is never
    // accepted as proof of identity outside development.
    if (process.env.NODE_ENV === "development") {
        return {
            userId: "dev_user",
            companyId: requestedCompanyId || "store_default",
            isSuperAdmin: true,
        };
    }
    return null;
}
exports.getPDFSessionIdentity = getPDFSessionIdentity;
function ownsPDFProject(project, identity) {
    if (project.isSuperAdminOnly && !identity.isSuperAdmin)
        return false;
    if (identity.isSuperAdmin)
        return true;
    return project.companyId === identity.companyId && project.userId === identity.userId;
}
exports.ownsPDFProject = ownsPDFProject;
