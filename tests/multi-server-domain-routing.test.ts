/**
 * tests/multi-server-domain-routing.test.ts
 *
 * Automated Multi-Server Domain Routing, Tenant Resolution,
 * Distributed Locking, and Cluster Safety Test Suite.
 */

import assert from "assert";
import {
  normalizeHostname,
  buildDomainCacheKey,
  resolveTenantByDomain,
  invalidateTenantDomainCache,
} from "../lib/tenant/resolver";
import {
  generateVerificationToken,
  verifyDomainOwnership,
} from "../lib/tenant/domain-service";
import {
  acquireLock,
  releaseLock,
  extendLock,
  withDistributedLock,
} from "../lib/lock/distributed-lock";
import {
  getTrustedHost,
  getTrustedProtocol,
  isSecureRequest,
  getClientIp,
} from "../lib/requestIdentity";
import { rateLimit } from "../lib/rate-limit";

async function runMultiServerSuite() {
  console.log("===============================================================");
  console.log("🚀 SALESMANPRO MULTI-SERVER DOMAIN & CLUSTER SAFETY TEST SUITE");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    process.stdout.write(`⏳ Running test: ${name}... `);
    try {
      await fn();
      console.log("✅ PASSED");
      passed++;
    } catch (err: any) {
      console.log("❌ FAILED");
      console.error(`   Error: ${err.message}`);
      if (err.stack) console.error(err.stack);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Hostname Normalization
  // ----------------------------------------------------
  await test("Domain: Hostname Normalization across Ports, Protocols, and WWW", () => {
    // Port stripping
    assert.strictEqual(normalizeHostname("store.salesmanpro.site:3000"), "store.salesmanpro.site");
    assert.strictEqual(normalizeHostname("shop.customer.com:443"), "shop.customer.com");

    // WWW stripping
    assert.strictEqual(normalizeHostname("www.mybrand.com"), "mybrand.com");
    assert.strictEqual(normalizeHostname("WWW.SALESMANPRO.SITE"), "salesmanpro.site");

    // Whitespace and case-insensitivity
    assert.strictEqual(normalizeHostname("  Shop.Brand.co.ke:8080 "), "shop.brand.co.ke");

    // Edge cases
    assert.strictEqual(normalizeHostname(null), "");
    assert.strictEqual(normalizeHostname(""), "");
  });

  // ----------------------------------------------------
  // TEST 2: Domain Cache Key Isolation
  // ----------------------------------------------------
  await test("Domain: Cache Key Building and Isolation", () => {
    const keyA = buildDomainCacheKey("store-a.salesmanpro.site");
    const keyB = buildDomainCacheKey("store-b.salesmanpro.site");
    const keyCustom = buildDomainCacheKey("boutique.com");

    assert.strictEqual(keyA, "tenant:domain:store-a.salesmanpro.site");
    assert.strictEqual(keyB, "tenant:domain:store-b.salesmanpro.site");
    assert.strictEqual(keyCustom, "tenant:domain:boutique.com");
    assert.notStrictEqual(keyA, keyB, "Tenant cache keys must never collide");
  });

  // ----------------------------------------------------
  // TEST 3: Distributed Mutual Exclusion Locking
  // ----------------------------------------------------
  await test("Lock: Distributed Mutual Exclusion & Safe Release", async () => {
    const resource = `test_resource_${Date.now()}`;

    // 1. Worker 1 acquires lock
    const lock1 = await acquireLock(resource, 60);
    assert(lock1 !== null, "Worker 1 should acquire lock");
    assert.strictEqual(lock1?.resource, resource);

    // 2. Worker 2 attempts to acquire same resource concurrently
    const lock2 = await acquireLock(resource, 60);
    assert.strictEqual(lock2, null, "Worker 2 must be locked out while Worker 1 holds lock");

    // 3. Worker 1 extends lease
    const extended = await extendLock(lock1!, 120);
    assert.strictEqual(extended, true, "Lock lease extension should succeed");

    // 4. Worker 1 releases lock
    const released = await releaseLock(lock1);
    assert.strictEqual(released, true, "Lock release should succeed");

    // 5. Worker 2 can now acquire lock
    const lock2After = await acquireLock(resource, 60);
    assert(lock2After !== null, "Worker 2 should now acquire lock after Worker 1 release");
    await releaseLock(lock2After);
  });

  // ----------------------------------------------------
  // TEST 4: Distributed Lock Helper (withDistributedLock)
  // ----------------------------------------------------
  await test("Lock: withDistributedLock wrapper execution and cleanup", async () => {
    const resource = `scoped_lock_${Date.now()}`;
    let executed = false;

    const res = await withDistributedLock(resource, 30, async () => {
      executed = true;
      return "SUCCESS_VALUE";
    });

    assert.strictEqual(res.executed, true);
    assert.strictEqual(res.result, "SUCCESS_VALUE");
    assert.strictEqual(executed, true);

    // Lock must already be released
    const secondAcquire = await acquireLock(resource, 30);
    assert(secondAcquire !== null, "Lock should have been automatically cleaned up");
    await releaseLock(secondAcquire);
  });

  // ----------------------------------------------------
  // TEST 5: Request Identity & Trusted Proxy Header Preservation
  // ----------------------------------------------------
  await test("Identity: Trusted Proxy Header Parsing & Protocol Detection", () => {
    // Mock Next.js Request with X-Forwarded-Host from Load Balancer
    const mockReqWithForwarded = new Request("http://127.0.0.1:3000/site/myshop", {
      headers: {
        "host": "127.0.0.1:3000",
        "x-forwarded-host": "shop.customerbrand.com",
        "x-forwarded-proto": "https",
        "x-forwarded-for": "198.51.100.45, 10.0.0.1",
      },
    });

    assert.strictEqual(getTrustedHost(mockReqWithForwarded), "shop.customerbrand.com");
    assert.strictEqual(getTrustedProtocol(mockReqWithForwarded), "https");
    assert.strictEqual(isSecureRequest(mockReqWithForwarded), true);
    assert.strictEqual(getClientIp(mockReqWithForwarded), "198.51.100.45");

    // Standard direct request
    const mockDirectReq = new Request("https://mystore.salesmanpro.site/products", {
      headers: {
        host: "mystore.salesmanpro.site:443",
      },
    });

    assert.strictEqual(getTrustedHost(mockDirectReq), "mystore.salesmanpro.site");
    assert.strictEqual(getTrustedProtocol(mockDirectReq), "https");
  });

  // ----------------------------------------------------
  // TEST 6: Domain Verification Token Generation
  // ----------------------------------------------------
  await test("Domain: Verification Token Cryptographic Security", () => {
    const token1 = generateVerificationToken("comp_123");
    const token2 = generateVerificationToken("comp_123");

    assert(token1.startsWith("salesmanpro-verify-"), "Token must have expected prefix");
    assert.strictEqual(token1.length, "salesmanpro-verify-".length + 32, "Token must have 32 hex chars (128 bits)");
    assert.notStrictEqual(token1, token2, "Successive tokens must be cryptographically unique");
  });

  // ----------------------------------------------------
  // TEST 7: Cluster-Safe Rate Limiter
  // ----------------------------------------------------
  await test("RateLimit: Bounded Token Bucket & Limit Enforcement", () => {
    const id = `test_client_${Date.now()}`;
    const limit = 5;
    const windowMs = 10_000;

    // First 5 requests should pass
    for (let i = 0; i < limit; i++) {
      const allowed = rateLimit(id, limit, windowMs);
      assert.strictEqual(allowed, true, `Request ${i + 1} should be permitted`);
    }

    // 6th request must be rejected
    const blocked = rateLimit(id, limit, windowMs);
    assert.strictEqual(blocked, false, "6th request should be rate-limited");
  });

  // ----------------------------------------------------
  // TEST 8: Domain Invalidation Safety
  // ----------------------------------------------------
  await test("Domain: Safe Cluster-wide Invalidation without Throws", async () => {
    await assert.doesNotReject(async () => {
      await invalidateTenantDomainCache({
        domain: "store.example.com",
        slug: "examplestore",
        companyId: "64f1a2b3c4d5e6f7a8b9c0d1",
      });
    }, "Cache invalidation must be resilient and never throw uncaught errors");
  });

  console.log("\n===============================================================");
  console.log(`🏁 MULTI-SERVER TEST SUITE COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log("===============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

if (require.main === module) {
  runMultiServerSuite().catch((err) => {
    console.error("Test Suite crashed:", err);
    process.exit(1);
  });
}

export { runMultiServerSuite };
