"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeHandoverTarget = exports.consumeHandoverToken = exports.matchesHandoverAudience = exports.createHandoverToken = void 0;
const crypto_1 = require("crypto");
const jwt_1 = require("next-auth/jwt");
const cache_1 = require("../cache");
const context_1 = require("./context");
const domain_1 = require("./domain");
const HANDOVER_MAX_AGE = 300; // 5 minutes for mobile deep links and app switching
const PURPOSE = "cross-domain-handover";
function handoverSecret() {
    return (process.env.NEXTAUTH_SECRET ||
        process.env.AUTH_SECRET ||
        "default-salesmanpro-handover-secret-32-chars-min");
}
async function createHandoverToken(user, options) {
    const jti = (0, crypto_1.randomUUID)();
    const audienceHost = (0, domain_1.normalizeHost)(options?.audienceHost || "");
    const token = await (0, jwt_1.encode)({
        token: {
            id: user.id,
            sub: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            emailVerified: user.emailVerified,
            companyId: user.companyId,
            hasTenantAccess: user.hasTenantAccess,
            purpose: PURPOSE,
            jti,
            aud: audienceHost || undefined,
        },
        secret: handoverSecret(),
        maxAge: HANDOVER_MAX_AGE,
    });
    return { token, jti };
}
exports.createHandoverToken = createHandoverToken;
function matchesHandoverAudience(tokenAudience, expectedHost) {
    if (!tokenAudience)
        return true;
    const normalizedAud = (0, domain_1.normalizeHost)(tokenAudience);
    const expected = (0, domain_1.normalizeHost)(expectedHost || "");
    // 1. Exact match between token audience and consuming host
    if (expected && normalizedAud === expected)
        return true;
    // 2. Native client applications (Android and Desktop apps) exchanging tokens at API endpoints
    if (normalizedAud === "site.salesmanpro.android" ||
        normalizedAud === "salesmanpro.android" ||
        normalizedAud === "site.salesmanpro.desktop" ||
        normalizedAud === "salesmanpro.desktop") {
        return true;
    }
    return false;
}
exports.matchesHandoverAudience = matchesHandoverAudience;
async function consumeHandoverToken(raw, expectedHost) {
    const decoded = await (0, jwt_1.decode)({
        token: raw,
        secret: handoverSecret(),
    });
    if (!decoded || !decoded.email || !decoded.id)
        return null;
    const purpose = decoded.purpose;
    const jti = decoded.jti;
    const audience = decoded.aud;
    if (purpose !== PURPOSE)
        return null;
    if (!jti)
        return null;
    if (!matchesHandoverAudience(audience, expectedHost))
        return null;
    const replayKey = `handover:jti:${jti}`;
    const used = await (0, cache_1.cacheGet)(replayKey);
    if (used)
        return null;
    await (0, cache_1.cacheSet)(replayKey, true, HANDOVER_MAX_AGE + 30);
    return decoded;
}
exports.consumeHandoverToken = consumeHandoverToken;
async function safeHandoverTarget(rawTarget) {
    const fallback = new URL(`${domain_1.HUB_URL}/dashboards`);
    let candidate = rawTarget ? (0, domain_1.parseAbsoluteUrl)(rawTarget) : fallback;
    if (!candidate)
        return null;
    // Prevent self-referencing handover loops to the auth domain
    if ((0, domain_1.normalizeHost)(candidate.hostname) === "auth.salesmanpro.site") {
        candidate = fallback;
    }
    const allowed = await (0, context_1.isAllowedReturnUrl)(candidate.toString());
    if (!allowed)
        return null;
    return candidate;
}
exports.safeHandoverTarget = safeHandoverTarget;
