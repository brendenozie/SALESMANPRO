"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyLoginContext = exports.provisionSignupRelationships = exports.initialRoleForSignup = exports.ensureConsumerForCompany = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const domain_1 = require("./domain");
async function findTenantCompany(ctx) {
    const host = ctx.returnHost;
    const slug = ctx.tenantSlug;
    const classified = (0, domain_1.classifyHost)(host);
    return prismadb_1.default.company.findFirst({
        where: {
            OR: [
                { domain: host },
                { domain: `www.${host}` },
                ...(slug ? [{ slug }, { domain: slug }] : []),
                ...(classified.kind === "ghuba" ? [{ slug: "ghuba" }, { domain: "ghuba.shop" }] : []),
            ],
        },
        select: { id: true, slug: true, domain: true, userId: true },
    });
}
/**
 * Link a consumer row without changing User.role.
 * Existing consumer/company links are left intact (one consumer profile per user in current schema).
 */
async function ensureConsumerForCompany(userId, companyId) {
    const existing = await prismadb_1.default.consumer.findUnique({
        where: { userId },
        select: { id: true, companyId: true },
    });
    if (!existing) {
        await prismadb_1.default.consumer.create({
            data: { userId, companyId },
        });
        return true;
    }
    if (!existing.companyId) {
        await prismadb_1.default.consumer.update({
            where: { userId },
            data: { companyId },
        });
        return false;
    }
    return false;
}
exports.ensureConsumerForCompany = ensureConsumerForCompany;
async function initialRoleForSignup(ctx) {
    if ((0, domain_1.isBusinessAdminSignupKind)(ctx.kind))
        return "ADMIN";
    return "USER";
}
exports.initialRoleForSignup = initialRoleForSignup;
async function provisionSignupRelationships(userId, ctx, options) {
    const isNew = options?.isNewUser !== false;
    let role = "USER";
    if (isNew && (0, domain_1.isBusinessAdminSignupKind)(ctx.kind)) {
        role = "ADMIN";
        await prismadb_1.default.user.update({
            where: { id: userId },
            data: { role: "ADMIN" },
        });
    }
    else if (isNew) {
        role = "USER";
    }
    let companyId = null;
    let consumerCreated = false;
    if ((0, domain_1.isStorefrontSignupKind)(ctx.kind)) {
        const company = await findTenantCompany(ctx);
        if (company) {
            companyId = company.id;
            consumerCreated = await ensureConsumerForCompany(userId, company.id);
        }
    }
    return { role: isNew ? role : (options?.existingRole || "USER"), companyId, consumerCreated };
}
exports.provisionSignupRelationships = provisionSignupRelationships;
/**
 * Existing identities keep their established account role.
 * Store/Ghuba logins may still attach a consumer relationship.
 */
async function applyLoginContext(userId, ctx) {
    if (!ctx || !(0, domain_1.isStorefrontSignupKind)(ctx.kind))
        return;
    const company = await findTenantCompany(ctx);
    if (company) {
        await ensureConsumerForCompany(userId, company.id);
    }
}
exports.applyLoginContext = applyLoginContext;
