"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const strict_1 = __importDefault(require("node:assert/strict"));
const handover_1 = require("../lib/auth/handover");
const context_1 = require("../lib/auth/context");
const authorization_1 = require("../lib/auth/authorization");
async function check(name, fn) {
    try {
        await fn();
        console.log(`ok  ${name}`);
    }
    catch (err) {
        console.error(`fail ${name}`);
        throw err;
    }
}
async function runFlowTests() {
    console.log("Starting SalesmanPro Auth Flow Integration Tests...\n");
    // 1. Handover Token Flow: Creation, Audience Matching, and Consumption
    await check("Handover token: create, audience match, and single-use consumption", async () => {
        const userPayload = {
            id: "test-user-123",
            email: "test@salesmanpro.site",
            name: "Test Admin",
            role: "ADMIN",
            emailVerified: true,
            companyId: null,
            hasTenantAccess: true,
        };
        // Main Hub Handover
        const { token: hubToken } = await (0, handover_1.createHandoverToken)(userPayload, {
            audienceHost: "salesmanpro.site",
        });
        strict_1.default.ok(hubToken, "Hub token should be generated");
        // Must match destination audience
        strict_1.default.equal((0, handover_1.matchesHandoverAudience)("salesmanpro.site", "salesmanpro.site"), true);
        strict_1.default.equal((0, handover_1.matchesHandoverAudience)("salesmanpro.site", "www.salesmanpro.site"), true);
        strict_1.default.equal((0, handover_1.matchesHandoverAudience)("salesmanpro.site", "otherdomain.com"), false);
        // Consume token on valid host
        const consumed = await (0, handover_1.consumeHandoverToken)(hubToken, "salesmanpro.site");
        strict_1.default.ok(consumed, "Token must be decodable and valid");
        strict_1.default.equal(consumed?.email, "test@salesmanpro.site");
        strict_1.default.equal(consumed?.role, "ADMIN");
        // Replay attack prevention: token should not be consumable again immediately
        const replay = await (0, handover_1.consumeHandoverToken)(hubToken, "salesmanpro.site");
        strict_1.default.equal(replay, null, "Replay attack must be blocked");
    });
    // 2. Tenant Handover Token Flow
    await check("Tenant handover token: audience matching and isolation", async () => {
        const consumerUser = {
            id: "consumer-456",
            email: "shopper@gmail.com",
            name: "Shopper",
            role: "USER",
            emailVerified: true,
            companyId: "company-abc",
            hasTenantAccess: false,
        };
        const { token: tenantToken } = await (0, handover_1.createHandoverToken)(consumerUser, {
            audienceHost: "duka.salesmanpro.site",
        });
        // Valid on tenant
        const consumedTenant = await (0, handover_1.consumeHandoverToken)(tenantToken, "duka.salesmanpro.site");
        strict_1.default.ok(consumedTenant);
        strict_1.default.equal(consumedTenant?.email, "shopper@gmail.com");
        // Invalid on wrong tenant
        const { token: tenantToken2 } = await (0, handover_1.createHandoverToken)(consumerUser, {
            audienceHost: "duka.salesmanpro.site",
        });
        const consumedWrongTenant = await (0, handover_1.consumeHandoverToken)(tenantToken2, "otherstore.salesmanpro.site");
        strict_1.default.equal(consumedWrongTenant, null, "Token must reject mismatched tenant audience");
    });
    // 3. Handover Target Resolution & Loop Prevention
    await check("Handover target resolution: loop prevention & unrolling", async () => {
        // Auth domain itself must NEVER be target -> defaults to /dashboards
        const targetAuth1 = await (0, handover_1.safeHandoverTarget)("https://auth.salesmanpro.site");
        strict_1.default.equal(targetAuth1?.hostname, "salesmanpro.site");
        strict_1.default.equal(targetAuth1?.pathname, "/dashboards");
        const targetAuth2 = await (0, handover_1.safeHandoverTarget)("https://auth.salesmanpro.site/signin");
        strict_1.default.equal(targetAuth2?.hostname, "salesmanpro.site");
        strict_1.default.equal(targetAuth2?.pathname, "/dashboards");
        // Tenant subdomain target
        const targetTenant = await (0, handover_1.safeHandoverTarget)("https://mytenant.salesmanpro.site/products");
        strict_1.default.equal(targetTenant?.hostname, "mytenant.salesmanpro.site");
        strict_1.default.equal(targetTenant?.pathname, "/products");
        // Nested handover URL resolution: unwrap target
        const nestedHandover = "https://auth.salesmanpro.site/api/auth/handover?target=https%3A%2F%2Fstore.salesmanpro.site%2Fcart";
        const context = await (0, context_1.resolveReturnContext)(nestedHandover);
        strict_1.default.equal(context?.kind, "store_subdomain");
        strict_1.default.equal(context?.returnHost, "store.salesmanpro.site");
        strict_1.default.equal(context?.tenantSlug, "store");
    });
    // 4. Role-based Dashboard Access & Email Verification Gating
    await check("Role and email verification gating", () => {
        // Admin with verified email -> allowed
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "ADMIN", emailVerified: true }), true);
        // Admin with unverified email -> blocked
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "ADMIN", emailVerified: false }), false);
        // User role without company -> blocked from admin dashboard
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "USER", companyId: null, emailVerified: true }), false);
        // User with company -> allowed to store dashboard
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "USER", companyId: "comp-123", emailVerified: true }), true);
        // Consumer role -> always blocked from dashboard
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "CONSUMER", emailVerified: true }), false);
        // Staff profile -> allowed
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "STAFF", emailVerified: true }), true);
    });
    // 5. Auth Context Cookie Signing and Expiration
    await check("Auth context cookie signing and tamper detection", async () => {
        const ctx = {
            kind: "hub",
            returnHost: "salesmanpro.site",
            returnUrl: "https://salesmanpro.site/dashboards",
            tenantSlug: null,
            issuedAt: Date.now(),
        };
        const cookieVal = await (0, context_1.encodeAuthContext)(ctx);
        strict_1.default.ok(typeof cookieVal === "string", "Encoded context must be a string");
        strict_1.default.ok(!cookieVal.includes("[object Promise]"), "Cookie must never contain [object Promise]");
        const decoded = await (0, context_1.decodeAuthContext)(cookieVal);
        strict_1.default.equal(decoded?.kind, "hub");
        strict_1.default.equal(decoded?.returnHost, "salesmanpro.site");
        // Tampered payload / signature
        const tampered = cookieVal.slice(0, -5) + "abcde";
        const decodedTampered = await (0, context_1.decodeAuthContext)(tampered);
        strict_1.default.equal(decodedTampered, null, "Tampered cookie must fail validation");
        // Expired context
        const expiredCtx = {
            ...ctx,
            issuedAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        };
        const expiredCookie = await (0, context_1.encodeAuthContext)(expiredCtx);
        const decodedExpired = await (0, context_1.decodeAuthContext)(expiredCookie);
        strict_1.default.equal(decodedExpired, null, "Expired context cookie must be rejected");
    });
    console.log("\nAll SalesmanPro Auth Flow Integration Tests passed successfully!");
}
runFlowTests().catch((err) => {
    console.error("Flow tests failed:", err);
    process.exit(1);
});
