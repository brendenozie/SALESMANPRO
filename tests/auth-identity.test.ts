import assert from "node:assert/strict";
import {
  classifyHost,
  defaultPostAuthPath,
  hostFromUrl,
  isBusinessAdminSignupKind,
  isStaticallyAllowedReturnHost,
  isStorefrontSignupKind,
  normalizeHost,
  parseAbsoluteUrl,
} from "../lib/auth/domain";
import {
  canAccessDashboard,
  hasDashboardRole,
  isConsumerOnlyAccount,
  isEmailVerifiedForAccess,
} from "../lib/auth/authorization";
import {
  decodeAuthContext,
  encodeAuthContext,
  type AuthFlowContext,
} from "../lib/auth/context-cookie";
import {
  resolveReturnContext,
} from "../lib/auth/context";
import {
  matchesHandoverAudience,
  safeHandoverTarget,
} from "../lib/auth/handover";

async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`ok  ${name}`);
  } catch (err) {
    console.error(`fail ${name}`);
    throw err;
  }
}

async function runAll() {
  await check("hub vs store vs custom vs ghuba vs auth", () => {
    assert.equal(classifyHost("salesmanpro.site").kind, "hub");
    assert.equal(classifyHost("www.salesmanpro.site").kind, "hub");
    assert.equal(classifyHost("auth.salesmanpro.site").kind, "auth");
    assert.equal(classifyHost("acme.salesmanpro.site").kind, "store_subdomain");
    assert.equal(classifyHost("acme.salesmanpro.site").slug, "acme");
    assert.equal(classifyHost("example.com").kind, "custom_domain");
    assert.equal(classifyHost("ghuba.shop").kind, "ghuba");
    assert.equal(classifyHost("ghuba.salesmanpro.site").kind, "ghuba");
    assert.equal(isBusinessAdminSignupKind("hub"), true);
    assert.equal(isBusinessAdminSignupKind("store_subdomain"), false);
    assert.equal(isStorefrontSignupKind("custom_domain"), true);
    assert.equal(isStorefrontSignupKind("hub"), false);
  });

  await check("auth domain is not an allowed return host or admin signup origin", () => {
    assert.equal(
      isBusinessAdminSignupKind(classifyHost("auth.salesmanpro.site").kind),
      false,
    );
    // auth.salesmanpro.site must NEVER be a return host (prevents self-referencing handover loops)
    assert.equal(isStaticallyAllowedReturnHost("auth.salesmanpro.site"), false);
    assert.equal(isStaticallyAllowedReturnHost("attacker.example"), false);
    assert.equal(isStaticallyAllowedReturnHost("store.salesmanpro.site"), true);
    assert.equal(isStaticallyAllowedReturnHost("salesmanpro.site"), true);
    assert.equal(isStaticallyAllowedReturnHost("ghuba.shop"), true);
  });

  await check("callback host parsing rejects relative and junk and unrolls nested encoding", () => {
    assert.equal(
      hostFromUrl("https://store.salesmanpro.site/shop"),
      "store.salesmanpro.site",
    );
    assert.equal(hostFromUrl("/dashboards"), "");
    assert.equal(
      parseAbsoluteUrl("https://attacker.example/?role=ADMIN")?.hostname,
      "attacker.example",
    );
    assert.equal(parseAbsoluteUrl("javascript:alert(1)"), null);

    // Test nested percent-encoding unrolling
    const doubleEncoded =
      "https%3A%2F%2Fstore.salesmanpro.site%2Fshop%3Fitem%3D123";
    assert.equal(
      parseAbsoluteUrl(doubleEncoded)?.hostname,
      "store.salesmanpro.site",
    );
    const tripleEncoded =
      "https%253A%252F%252Ftenant.salesmanpro.site";
    assert.equal(
      parseAbsoluteUrl(tripleEncoded)?.hostname,
      "tenant.salesmanpro.site",
    );
  });

  await check("dashboard authorization is not login-success", () => {
    assert.equal(
      canAccessDashboard({ role: "USER", emailVerified: true }),
      false,
    );
    assert.equal(
      canAccessDashboard({ role: "CONSUMER", emailVerified: true }),
      false,
    );
    assert.equal(
      canAccessDashboard({ role: "ADMIN", emailVerified: true }),
      true,
    );
    assert.equal(
      canAccessDashboard({ role: "STAFF", emailVerified: true }),
      true,
    );
    assert.equal(
      canAccessDashboard({
        role: "USER",
        companyId: "abc",
        emailVerified: true,
      }),
      true,
    );
    assert.equal(
      canAccessDashboard({ role: "ADMIN", emailVerified: false }),
      false,
    );
    assert.equal(
      canAccessDashboard({ role: "ADMIN", emailVerified: null }),
      true,
    );
    assert.equal(hasDashboardRole("CONSUMER"), false);
    assert.equal(isConsumerOnlyAccount({ role: "USER" }), true);
    assert.equal(isConsumerOnlyAccount({ role: "ADMIN" }), false);
    assert.equal(isEmailVerifiedForAccess(null), true);
    assert.equal(isEmailVerifiedForAccess(false), false);
  });

  await check("post-auth path uses authorization", () => {
    assert.equal(defaultPostAuthPath("hub", true), "/dashboards");
    assert.equal(defaultPostAuthPath("hub", false), "/");
    assert.equal(defaultPostAuthPath("store_subdomain", true), "/");
  });

  await check("auth context cookie is signed and expires", async () => {
    const ctx: AuthFlowContext = {
      kind: "store_subdomain",
      returnHost: "acme.salesmanpro.site",
      returnUrl: "https://acme.salesmanpro.site/",
      tenantSlug: "acme",
      issuedAt: Date.now(),
    };
    const encoded = await encodeAuthContext(ctx);
    const decoded = await decodeAuthContext(encoded);
    assert.equal(decoded?.kind, "store_subdomain");
    assert.equal(decoded?.returnHost, "acme.salesmanpro.site");
    assert.equal(await decodeAuthContext(encoded.replace(/\./, ".tamper")), null);
    assert.equal(await decodeAuthContext("not-a-token"), null);
  });

  await check("handover token audience matching is strict", () => {
    assert.equal(matchesHandoverAudience(undefined, "salesmanpro.site"), true);
    assert.equal(
      matchesHandoverAudience("shop.example.com", "shop.example.com"),
      true,
    );
    assert.equal(
      matchesHandoverAudience("shop.example.com", "www.shop.example.com"),
      true,
    );
    assert.equal(
      matchesHandoverAudience("shop.example.com", "other.example.com"),
      false,
    );
    assert.equal(matchesHandoverAudience("shop.example.com", ""), false);
  });

  await check("handover target unwrapping and loop prevention", async () => {
    // 1. Handover URL targeting auth host must fall back to hub dashboards
    const safeTargetAuth = await safeHandoverTarget("https://auth.salesmanpro.site");
    assert.equal(safeTargetAuth?.hostname, "salesmanpro.site");
    assert.equal(safeTargetAuth?.pathname, "/dashboards");

    // 2. Safe target for store subdomain
    const safeTargetStore = await safeHandoverTarget("https://acme.salesmanpro.site/shop");
    assert.equal(safeTargetStore?.hostname, "acme.salesmanpro.site");

    // 3. Resolve return context unwrapping nested handover target
    const handoverCallback =
      "https://auth.salesmanpro.site/api/auth/handover?target=https%3A%2F%2Facme.salesmanpro.site%2F";
    const resolvedContext = await resolveReturnContext(handoverCallback);
    assert.equal(resolvedContext?.kind, "store_subdomain");
    assert.equal(resolvedContext?.returnHost, "acme.salesmanpro.site");
    assert.equal(resolvedContext?.tenantSlug, "acme");

    // 4. Resolve return context when direct on auth host defaults to hub
    const directAuthContext = await resolveReturnContext("https://auth.salesmanpro.site");
    assert.equal(directAuthContext?.kind, "hub");
    assert.equal(directAuthContext?.returnHost, "salesmanpro.site");
    assert.equal(directAuthContext?.returnUrl, "https://salesmanpro.site/dashboards");
  });

  console.log("\nAll auth identity tests passed.");
}

runAll().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
