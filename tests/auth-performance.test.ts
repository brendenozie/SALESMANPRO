import "dotenv/config";
import assert from "node:assert/strict";
import {
  generateCorrelationId,
  maskEmail,
  sanitizeLogDetails,
  createAuthTimer,
} from "../lib/auth/telemetry";
import {
  createHandoverToken,
  consumeHandoverToken,
  safeHandoverTarget,
  matchesHandoverAudience,
} from "../lib/auth/handover";
import {
  isAllowedReturnUrl,
  resolveReturnContext,
} from "../lib/auth/context";
import {
  canAccessDashboard,
  hasDashboardRole,
  isEmailVerifiedForAccess,
} from "../lib/auth/authorization";
import { encode, decode } from "next-auth/jwt";

async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`ok  ${name}`);
  } catch (err) {
    console.error(`fail ${name}`);
    throw err;
  }
}

async function runAuthPerformanceTests() {
  console.log("Starting SalesmanPro Auth Performance & Latency Audit Tests...\n");

  // 1. Structured Telemetry & Masking Verification
  await check("Telemetry: safe masking of emails and strip sensitive tokens", () => {
    assert.equal(maskEmail("john.doe@company.com"), "j***e@company.com");
    assert.equal(maskEmail("admin@salesmanpro.site"), "a***n@salesmanpro.site");
    assert.equal(maskEmail("a@b.com"), "a***@b.com");

    const sensitiveInput = {
      email: "user@example.com",
      password: "secret-password-123",
      token: "jwt-handover-token-xyz",
      auth_token: "secret-auth-token",
      refresh_token: "refresh-token-xyz",
      secret: "super-secret-key",
      code: "oauth-authorization-code",
      cookieHeader: "next-auth.session-token=12345",
      stage: "oauth_callback_received",
      elapsedMs: 142,
    };

    const sanitized = sanitizeLogDetails(sensitiveInput);

    assert.equal(sanitized.email, "u***r@example.com");
    assert.equal(sanitized.password, undefined, "Password must be stripped");
    assert.equal(sanitized.token, undefined, "Token must be stripped");
    assert.equal(sanitized.auth_token, undefined, "Auth token must be stripped");
    assert.equal(sanitized.refresh_token, undefined, "Refresh token must be stripped");
    assert.equal(sanitized.secret, undefined, "Secret must be stripped");
    assert.equal(sanitized.code, undefined, "OAuth code must be stripped");
    assert.equal(sanitized.cookieHeader, undefined, "Cookie header must be stripped");
    assert.equal(sanitized.stage, "oauth_callback_received");
    assert.equal(sanitized.elapsedMs, 142);

    const timer = createAuthTimer();
    assert.ok(timer.correlationId, "Timer should generate correlation ID");
    const duration = timer.mark("test_stage", { action: "benchmark" });
    assert.ok(duration >= 0, "Duration must be non-negative");
  });

  // 2. Handover Token Lifecycle & Server-Side Session Encoding
  await check("Handover Token: creation, audience matching, and server-side JWT session creation", async () => {
    const userPayload = {
      id: "usr-perf-123",
      email: "operator@salesmanpro.site",
      name: "Performance Admin",
      role: "ADMIN",
      emailVerified: true,
      companyId: null,
      hasTenantAccess: true,
    };

    const { token } = await createHandoverToken(userPayload, {
      audienceHost: "salesmanpro.site",
    });
    assert.ok(token, "Token must be created");

    // Audience validation
    assert.equal(matchesHandoverAudience("salesmanpro.site", "salesmanpro.site"), true);
    assert.equal(matchesHandoverAudience("salesmanpro.site", "www.salesmanpro.site"), true);
    assert.equal(matchesHandoverAudience("salesmanpro.site", "attacker.com"), false);

    // Consume token on target domain
    const decoded = await consumeHandoverToken(token, "salesmanpro.site");
    assert.ok(decoded);
    assert.equal(decoded.id, "usr-perf-123");
    assert.equal(decoded.email, "operator@salesmanpro.site");

    // Test session token encoding using NextAuth JWT
    const secret = process.env.NEXTAUTH_SECRET || "default-salesmanpro-auth-secret-32-chars-min";
    const sessionToken = await encode({
      token: {
        id: decoded.id,
        sub: String(decoded.id),
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        emailVerified: decoded.emailVerified,
        hasTenantAccess: decoded.hasTenantAccess,
      },
      secret,
      maxAge: 30 * 24 * 60 * 60,
    });

    assert.ok(typeof sessionToken === "string", "Session token must be encoded string");

    // Decode session token and verify fields
    const decodedSession = await decode({
      token: sessionToken,
      secret,
    });

    assert.equal(decodedSession?.id, "usr-perf-123");
    assert.equal(decodedSession?.email, "operator@salesmanpro.site");
    assert.equal(decodedSession?.role, "ADMIN");
    assert.equal(decodedSession?.hasTenantAccess, true);
  });

  // 3. Replay Protection
  await check("Handover Token: single-use replay prevention", async () => {
    const userPayload = {
      id: "usr-replay-999",
      email: "shopper@gmail.com",
      name: "Shopper",
      role: "USER",
    };

    const { token } = await createHandoverToken(userPayload, {
      audienceHost: "store.salesmanpro.site",
    });

    // First consumption succeeds
    const firstUse = await consumeHandoverToken(token, "store.salesmanpro.site");
    assert.ok(firstUse);

    // Second consumption blocked
    const replayAttempt = await consumeHandoverToken(token, "store.salesmanpro.site");
    assert.equal(replayAttempt, null, "Replay attack must be blocked by single-use token JTI cache");
  });

  // 4. Safe Target Resolution and Anti-Looping
  await check("Safe Handover Target: self-referential loop prevention", async () => {
    // Auth host target must be resolved to platform dashboards to prevent loops
    const target1 = await safeHandoverTarget("https://auth.salesmanpro.site/signin");
    assert.equal(target1?.hostname, "salesmanpro.site");
    assert.equal(target1?.pathname, "/dashboards");

    const target2 = await safeHandoverTarget("https://auth.salesmanpro.site/api/auth/handover?target=https%3A%2F%2Fghuba.shop%2Fprofile");
    assert.equal(target2?.hostname, "ghuba.shop");
    assert.equal(target2?.pathname, "/profile");
  });

  // 5. Caching of Return URL and Domain Validation
  await check("Performance Caching: isAllowedReturnUrl for static and custom hosts", async () => {
    // Static platform hosts should resolve immediately without database lookups
    const startStatic = Date.now();
    const isStaticAllowed = await isAllowedReturnUrl("https://salesmanpro.site/dashboards");
    const durationStatic = Date.now() - startStatic;
    assert.equal(isStaticAllowed, true);
    assert.ok(durationStatic < 15, `Static check must be sub-15ms, took ${durationStatic}ms`);

    const isGhubaAllowed = await isAllowedReturnUrl("https://ghuba.shop/feed");
    assert.equal(isGhubaAllowed, true);

    const isTenantAllowed = await isAllowedReturnUrl("https://freshbakery.salesmanpro.site/cart");
    assert.equal(isTenantAllowed, true);

    // Invalid domain
    const isBadDomainAllowed = await isAllowedReturnUrl("https://malicious-phishing-site.com");
    assert.equal(isBadDomainAllowed, false);
  });

  // 6. Role Authorization & Business Rules Integrity
  await check("Authorization: preserves exact role-based dashboard access rules", () => {
    // ADMIN has dashboard access
    assert.equal(canAccessDashboard({ role: "ADMIN", emailVerified: true, isActive: true }), true);
    // Unverified admin blocked
    assert.equal(canAccessDashboard({ role: "ADMIN", emailVerified: false, isActive: true }), false);
    // Inactive admin blocked
    assert.equal(canAccessDashboard({ role: "ADMIN", emailVerified: true, isActive: false }), false);
    // USER without company or tenant access blocked from merchant dashboard
    assert.equal(canAccessDashboard({ role: "USER", companyId: null, hasTenantAccess: false }), false);
    // USER with companyId granted dashboard access
    assert.equal(canAccessDashboard({ role: "USER", companyId: "cmp-456", emailVerified: true, isActive: true }), true);
    // CONSUMER role blocked from dashboard
    assert.equal(canAccessDashboard({ role: "CONSUMER", emailVerified: true, isActive: true }), false);
    // STAFF granted dashboard access
    assert.equal(canAccessDashboard({ role: "STAFF", emailVerified: true, isActive: true }), true);
  });

  console.log("\nAll SalesmanPro Auth Performance & Latency Tests passed successfully!");
}

runAuthPerformanceTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
