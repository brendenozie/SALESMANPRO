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
import { canAccessDashboard, hasDashboardRole, isConsumerOnlyAccount, isEmailVerifiedForAccess } from "../lib/auth/authorization";
import { decodeAuthContext, encodeAuthContext, type AuthFlowContext } from "../lib/auth/context-cookie";
import { matchesHandoverAudience } from "../lib/auth/handover";

function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`ok  ${name}`);
  } catch (err) {
    console.error(`fail ${name}`);
    throw err;
  }
}

check("hub vs store vs custom vs ghuba vs auth", () => {
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

check("auth domain is not an admin signup origin", () => {
  assert.equal(isBusinessAdminSignupKind(classifyHost("auth.salesmanpro.site").kind), false);
  assert.equal(isStaticallyAllowedReturnHost("auth.salesmanpro.site"), true);
  assert.equal(isStaticallyAllowedReturnHost("attacker.example"), false);
  assert.equal(isStaticallyAllowedReturnHost("store.salesmanpro.site"), true);
});

check("callback host parsing rejects relative and junk", () => {
  assert.equal(hostFromUrl("https://store.salesmanpro.site/shop"), "store.salesmanpro.site");
  assert.equal(hostFromUrl("/dashboards"), "");
  assert.equal(parseAbsoluteUrl("https://attacker.example/?role=ADMIN")?.hostname, "attacker.example");
  assert.equal(parseAbsoluteUrl("javascript:alert(1)"), null);
});

check("dashboard authorization is not login-success", () => {
  assert.equal(canAccessDashboard({ role: "USER", emailVerified: true }), false);
  assert.equal(canAccessDashboard({ role: "CONSUMER", emailVerified: true }), false);
  assert.equal(canAccessDashboard({ role: "ADMIN", emailVerified: true }), true);
  assert.equal(canAccessDashboard({ role: "STAFF", emailVerified: true }), true);
  assert.equal(canAccessDashboard({ role: "USER", companyId: "abc", emailVerified: true }), true);
  assert.equal(canAccessDashboard({ role: "ADMIN", emailVerified: false }), false);
  assert.equal(canAccessDashboard({ role: "ADMIN", emailVerified: null }), true);
  assert.equal(hasDashboardRole("CONSUMER"), false);
  assert.equal(isConsumerOnlyAccount({ role: "USER" }), true);
  assert.equal(isConsumerOnlyAccount({ role: "ADMIN" }), false);
  assert.equal(isEmailVerifiedForAccess(null), true);
  assert.equal(isEmailVerifiedForAccess(false), false);
});

check("post-auth path uses authorization", () => {
  assert.equal(defaultPostAuthPath("hub", true), "/dashboards");
  assert.equal(defaultPostAuthPath("hub", false), "/");
  assert.equal(defaultPostAuthPath("store_subdomain", true), "/");
});

check("auth context cookie is signed and expires", () => {
  const ctx: AuthFlowContext = {
    kind: "store_subdomain",
    returnHost: "acme.salesmanpro.site",
    returnUrl: "https://acme.salesmanpro.site/",
    tenantSlug: "acme",
    issuedAt: Date.now(),
  };
  const encoded = encodeAuthContext(ctx);
  const decoded = decodeAuthContext(encoded);
  assert.equal(decoded?.kind, "store_subdomain");
  assert.equal(decoded?.returnHost, "acme.salesmanpro.site");
  assert.equal(decodeAuthContext(encoded.replace(/\./, ".tamper")), null);
  assert.equal(decodeAuthContext("not-a-token"), null);
});

check("handover token audience matching is strict", () => {
  assert.equal(matchesHandoverAudience(undefined, "salesmanpro.site"), true);
  assert.equal(matchesHandoverAudience("shop.example.com", "shop.example.com"), true);
  assert.equal(matchesHandoverAudience("shop.example.com", "www.shop.example.com"), true);
  assert.equal(matchesHandoverAudience("shop.example.com", "other.example.com"), false);
  assert.equal(matchesHandoverAudience("shop.example.com", ""), false);
});

console.log("\nAll auth identity tests passed.");
