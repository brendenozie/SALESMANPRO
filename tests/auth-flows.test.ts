import "dotenv/config";
import assert from "node:assert/strict";
import {
  classifyHost,
  isStaticallyAllowedReturnHost,
  normalizeHost,
  parseAbsoluteUrl,
  HUB_URL,
  AUTH_HOST,
} from "../lib/auth/domain";
import {
  createHandoverToken,
  consumeHandoverToken,
  safeHandoverTarget,
  matchesHandoverAudience,
} from "../lib/auth/handover";
import {
  resolveReturnContext,
  isAllowedReturnUrl,
  encodeAuthContext,
  decodeAuthContext,
  type AuthFlowContext,
} from "../lib/auth/context";
import {
  canAccessDashboard,
  hasDashboardRole,
  isEmailVerifiedForAccess,
} from "../lib/auth/authorization";

async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`ok  ${name}`);
  } catch (err) {
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
    const { token: hubToken } = await createHandoverToken(userPayload, {
      audienceHost: "salesmanpro.site",
    });
    assert.ok(hubToken, "Hub token should be generated");

    // Must match destination audience
    assert.equal(matchesHandoverAudience("salesmanpro.site", "salesmanpro.site"), true);
    assert.equal(matchesHandoverAudience("salesmanpro.site", "www.salesmanpro.site"), true);
    assert.equal(matchesHandoverAudience("salesmanpro.site", "otherdomain.com"), false);

    // Consume token on valid host
    const consumed = await consumeHandoverToken(hubToken, "salesmanpro.site");
    assert.ok(consumed, "Token must be decodable and valid");
    assert.equal(consumed?.email, "test@salesmanpro.site");
    assert.equal(consumed?.role, "ADMIN");

    // Replay attack prevention: token should not be consumable again immediately
    const replay = await consumeHandoverToken(hubToken, "salesmanpro.site");
    assert.equal(replay, null, "Replay attack must be blocked");
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

    const { token: tenantToken } = await createHandoverToken(consumerUser, {
      audienceHost: "duka.salesmanpro.site",
    });

    // Valid on tenant
    const consumedTenant = await consumeHandoverToken(tenantToken, "duka.salesmanpro.site");
    assert.ok(consumedTenant);
    assert.equal(consumedTenant?.email, "shopper@gmail.com");

    // Invalid on wrong tenant
    const { token: tenantToken2 } = await createHandoverToken(consumerUser, {
      audienceHost: "duka.salesmanpro.site",
    });
    const consumedWrongTenant = await consumeHandoverToken(tenantToken2, "otherstore.salesmanpro.site");
    assert.equal(consumedWrongTenant, null, "Token must reject mismatched tenant audience");
  });

  // 3. Handover Target Resolution & Loop Prevention
  await check("Handover target resolution: loop prevention & unrolling", async () => {
    // Auth domain itself must NEVER be target -> defaults to /dashboards
    const targetAuth1 = await safeHandoverTarget("https://auth.salesmanpro.site");
    assert.equal(targetAuth1?.hostname, "salesmanpro.site");
    assert.equal(targetAuth1?.pathname, "/dashboards");

    const targetAuth2 = await safeHandoverTarget("https://auth.salesmanpro.site/signin");
    assert.equal(targetAuth2?.hostname, "salesmanpro.site");
    assert.equal(targetAuth2?.pathname, "/dashboards");

    // Tenant subdomain target
    const targetTenant = await safeHandoverTarget("https://mytenant.salesmanpro.site/products");
    assert.equal(targetTenant?.hostname, "mytenant.salesmanpro.site");
    assert.equal(targetTenant?.pathname, "/products");

    // Nested handover URL resolution: unwrap target
    const nestedHandover =
      "https://auth.salesmanpro.site/api/auth/handover?target=https%3A%2F%2Fstore.salesmanpro.site%2Fcart";
    const context = await resolveReturnContext(nestedHandover);
    assert.equal(context?.kind, "store_subdomain");
    assert.equal(context?.returnHost, "store.salesmanpro.site");
    assert.equal(context?.tenantSlug, "store");
  });

  // 4. Role-based Dashboard Access & Email Verification Gating
  await check("Role and email verification gating", () => {
    // Admin with verified email -> allowed
    assert.equal(canAccessDashboard({ role: "ADMIN", emailVerified: true }), true);
    // Admin with unverified email -> blocked
    assert.equal(canAccessDashboard({ role: "ADMIN", emailVerified: false }), false);
    // User role without company -> blocked from admin dashboard
    assert.equal(canAccessDashboard({ role: "USER", companyId: null, emailVerified: true }), false);
    // User with company -> allowed to store dashboard
    assert.equal(canAccessDashboard({ role: "USER", companyId: "comp-123", emailVerified: true }), true);
    // Consumer role -> always blocked from dashboard
    assert.equal(canAccessDashboard({ role: "CONSUMER", emailVerified: true }), false);
    // Staff profile -> allowed
    assert.equal(canAccessDashboard({ role: "STAFF", emailVerified: true }), true);
  });

  // 5. Auth Context Cookie Signing and Expiration
  await check("Auth context cookie signing and tamper detection", async () => {
    const ctx: AuthFlowContext = {
      kind: "hub",
      returnHost: "salesmanpro.site",
      returnUrl: "https://salesmanpro.site/dashboards",
      tenantSlug: null,
      issuedAt: Date.now(),
    };

    const cookieVal = await encodeAuthContext(ctx);
    assert.ok(typeof cookieVal === "string", "Encoded context must be a string");
    assert.ok(!cookieVal.includes("[object Promise]"), "Cookie must never contain [object Promise]");

    const decoded = await decodeAuthContext(cookieVal);
    assert.equal(decoded?.kind, "hub");
    assert.equal(decoded?.returnHost, "salesmanpro.site");

    // Tampered payload / signature
    const tampered = cookieVal.slice(0, -5) + "abcde";
    const decodedTampered = await decodeAuthContext(tampered);
    assert.equal(decodedTampered, null, "Tampered cookie must fail validation");

    // Expired context
    const expiredCtx: AuthFlowContext = {
      ...ctx,
      issuedAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    };
    const expiredCookie = await encodeAuthContext(expiredCtx);
    const decodedExpired = await decodeAuthContext(expiredCookie);
    assert.equal(decodedExpired, null, "Expired context cookie must be rejected");
  });

  console.log("\nAll SalesmanPro Auth Flow Integration Tests passed successfully!");
}

runFlowTests().catch((err) => {
  console.error("Flow tests failed:", err);
  process.exit(1);
});
