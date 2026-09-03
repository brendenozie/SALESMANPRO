"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const domain_1 = require("../lib/auth/domain");
const authorization_1 = require("../lib/auth/authorization");
const context_cookie_1 = require("../lib/auth/context-cookie");
const context_1 = require("../lib/auth/context");
const handover_1 = require("../lib/auth/handover");
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
async function runAll() {
    await check("hub vs store vs custom vs ghuba vs auth", () => {
        strict_1.default.equal((0, domain_1.classifyHost)("salesmanpro.site").kind, "hub");
        strict_1.default.equal((0, domain_1.classifyHost)("www.salesmanpro.site").kind, "hub");
        strict_1.default.equal((0, domain_1.classifyHost)("auth.salesmanpro.site").kind, "auth");
        strict_1.default.equal((0, domain_1.classifyHost)("acme.salesmanpro.site").kind, "store_subdomain");
        strict_1.default.equal((0, domain_1.classifyHost)("acme.salesmanpro.site").slug, "acme");
        strict_1.default.equal((0, domain_1.classifyHost)("example.com").kind, "custom_domain");
        strict_1.default.equal((0, domain_1.classifyHost)("ghuba.shop").kind, "ghuba");
        strict_1.default.equal((0, domain_1.classifyHost)("ghuba.salesmanpro.site").kind, "ghuba");
        strict_1.default.equal((0, domain_1.isBusinessAdminSignupKind)("hub"), true);
        strict_1.default.equal((0, domain_1.isBusinessAdminSignupKind)("store_subdomain"), false);
        strict_1.default.equal((0, domain_1.isStorefrontSignupKind)("custom_domain"), true);
        strict_1.default.equal((0, domain_1.isStorefrontSignupKind)("hub"), false);
    });
    await check("auth domain is not an allowed return host or admin signup origin", () => {
        strict_1.default.equal((0, domain_1.isBusinessAdminSignupKind)((0, domain_1.classifyHost)("auth.salesmanpro.site").kind), false);
        // auth.salesmanpro.site must NEVER be a return host (prevents self-referencing handover loops)
        strict_1.default.equal((0, domain_1.isStaticallyAllowedReturnHost)("auth.salesmanpro.site"), false);
        strict_1.default.equal((0, domain_1.isStaticallyAllowedReturnHost)("attacker.example"), false);
        strict_1.default.equal((0, domain_1.isStaticallyAllowedReturnHost)("store.salesmanpro.site"), true);
        strict_1.default.equal((0, domain_1.isStaticallyAllowedReturnHost)("salesmanpro.site"), true);
        strict_1.default.equal((0, domain_1.isStaticallyAllowedReturnHost)("ghuba.shop"), true);
    });
    await check("callback host parsing rejects relative and junk and unrolls nested encoding", () => {
        strict_1.default.equal((0, domain_1.hostFromUrl)("https://store.salesmanpro.site/shop"), "store.salesmanpro.site");
        strict_1.default.equal((0, domain_1.hostFromUrl)("/dashboards"), "");
        strict_1.default.equal((0, domain_1.parseAbsoluteUrl)("https://attacker.example/?role=ADMIN")?.hostname, "attacker.example");
        strict_1.default.equal((0, domain_1.parseAbsoluteUrl)("javascript:alert(1)"), null);
        // Test nested percent-encoding unrolling
        const doubleEncoded = "https%3A%2F%2Fstore.salesmanpro.site%2Fshop%3Fitem%3D123";
        strict_1.default.equal((0, domain_1.parseAbsoluteUrl)(doubleEncoded)?.hostname, "store.salesmanpro.site");
        const tripleEncoded = "https%253A%252F%252Ftenant.salesmanpro.site";
        strict_1.default.equal((0, domain_1.parseAbsoluteUrl)(tripleEncoded)?.hostname, "tenant.salesmanpro.site");
    });
    await check("dashboard authorization is not login-success", () => {
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "USER", emailVerified: true }), false);
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "CONSUMER", emailVerified: true }), false);
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "ADMIN", emailVerified: true }), true);
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "STAFF", emailVerified: true }), true);
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({
            role: "USER",
            companyId: "abc",
            emailVerified: true,
        }), true);
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "ADMIN", emailVerified: false }), false);
        strict_1.default.equal((0, authorization_1.canAccessDashboard)({ role: "ADMIN", emailVerified: null }), true);
        strict_1.default.equal((0, authorization_1.hasDashboardRole)("CONSUMER"), false);
        strict_1.default.equal((0, authorization_1.isConsumerOnlyAccount)({ role: "USER" }), true);
        strict_1.default.equal((0, authorization_1.isConsumerOnlyAccount)({ role: "ADMIN" }), false);
        strict_1.default.equal((0, authorization_1.isEmailVerifiedForAccess)(null), true);
        strict_1.default.equal((0, authorization_1.isEmailVerifiedForAccess)(false), false);
    });
    await check("post-auth path uses authorization", () => {
        strict_1.default.equal((0, domain_1.defaultPostAuthPath)("hub", true), "/dashboards");
        strict_1.default.equal((0, domain_1.defaultPostAuthPath)("hub", false), "/");
        strict_1.default.equal((0, domain_1.defaultPostAuthPath)("store_subdomain", true), "/");
    });
    await check("auth context cookie is signed and expires", async () => {
        const ctx = {
            kind: "store_subdomain",
            returnHost: "acme.salesmanpro.site",
            returnUrl: "https://acme.salesmanpro.site/",
            tenantSlug: "acme",
            issuedAt: Date.now(),
        };
        const encoded = await (0, context_cookie_1.encodeAuthContext)(ctx);
        const decoded = await (0, context_cookie_1.decodeAuthContext)(encoded);
        strict_1.default.equal(decoded?.kind, "store_subdomain");
        strict_1.default.equal(decoded?.returnHost, "acme.salesmanpro.site");
        strict_1.default.equal(await (0, context_cookie_1.decodeAuthContext)(encoded.replace(/\./, ".tamper")), null);
        strict_1.default.equal(await (0, context_cookie_1.decodeAuthContext)("not-a-token"), null);
    });
    await check("handover token audience matching is strict", () => {
        strict_1.default.equal((0, handover_1.matchesHandoverAudience)(undefined, "salesmanpro.site"), true);
        strict_1.default.equal((0, handover_1.matchesHandoverAudience)("shop.example.com", "shop.example.com"), true);
        strict_1.default.equal((0, handover_1.matchesHandoverAudience)("shop.example.com", "www.shop.example.com"), true);
        strict_1.default.equal((0, handover_1.matchesHandoverAudience)("shop.example.com", "other.example.com"), false);
        strict_1.default.equal((0, handover_1.matchesHandoverAudience)("shop.example.com", ""), false);
    });
    await check("handover target unwrapping and loop prevention", async () => {
        // 1. Handover URL targeting auth host must fall back to hub dashboards
        const safeTargetAuth = await (0, handover_1.safeHandoverTarget)("https://auth.salesmanpro.site");
        strict_1.default.equal(safeTargetAuth?.hostname, "salesmanpro.site");
        strict_1.default.equal(safeTargetAuth?.pathname, "/dashboards");
        // 2. Safe target for store subdomain
        const safeTargetStore = await (0, handover_1.safeHandoverTarget)("https://acme.salesmanpro.site/shop");
        strict_1.default.equal(safeTargetStore?.hostname, "acme.salesmanpro.site");
        // 3. Resolve return context unwrapping nested handover target
        const handoverCallback = "https://auth.salesmanpro.site/api/auth/handover?target=https%3A%2F%2Facme.salesmanpro.site%2F";
        const resolvedContext = await (0, context_1.resolveReturnContext)(handoverCallback);
        strict_1.default.equal(resolvedContext?.kind, "store_subdomain");
        strict_1.default.equal(resolvedContext?.returnHost, "acme.salesmanpro.site");
        strict_1.default.equal(resolvedContext?.tenantSlug, "acme");
        // 4. Resolve return context when direct on auth host defaults to hub
        const directAuthContext = await (0, context_1.resolveReturnContext)("https://auth.salesmanpro.site");
        strict_1.default.equal(directAuthContext?.kind, "hub");
        strict_1.default.equal(directAuthContext?.returnHost, "salesmanpro.site");
        strict_1.default.equal(directAuthContext?.returnUrl, "https://salesmanpro.site/dashboards");
    });
    console.log("\nAll auth identity tests passed.");
}
runAll().catch((err) => {
    console.error("Test runner failed:", err);
    process.exit(1);
});
