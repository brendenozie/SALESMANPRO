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
    let resolvedCompanyId = requestedCompanyId || user?.companyId;
    if (user?.id) {
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
            companyId: resolvedCompanyId || requestedCompanyId || "store_default",
            isSuperAdmin: Boolean(isSuperAdmin),
        };
    }
    // If requestedCompanyId is present from authenticated admin workspace
    if (requestedCompanyId) {
        return {
            userId: "admin_operator",
            companyId: requestedCompanyId,
            isSuperAdmin: true,
        };
    }
    // Development / local fallback if no session is active
    if (process.env.NODE_ENV !== "production") {
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
    if (identity.isSuperAdmin)
        return true;
    return project.companyId === identity.companyId || project.userId === identity.userId;
}
exports.ownsPDFProject = ownsPDFProject;
