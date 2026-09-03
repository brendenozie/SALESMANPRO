import "dotenv/config";
import assert from "node:assert/strict";
import {
  cacheGet,
  cacheSet,
  cacheDel,
  fetchWithCache,
  buildTenantCacheKey,
  getCacheStats,
} from "../lib/cache";
import { rateLimit, TIER_LIMITS } from "../lib/rate-limit";

async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function runPerformanceAuditTests() {
  console.log("\n==========================================");
  console.log("🚀 SALESMANPRO PERFORMANCE & CACHE AUDIT TEST SUITE");
  console.log("==========================================\n");

  // TEST 1: Cache Set & Get
  await check("Cache Basic: Set and Get retrieves stored value", async () => {
    const testKey = "audit:test:basic_key";
    const testValue = { id: "ord_123", amount: 4500, status: "PAID" };
    await cacheSet(testKey, testValue, 10);

    const retrieved = await cacheGet<typeof testValue>(testKey);
    assert.deepEqual(retrieved, testValue);
  });

  // TEST 2: Cache Expiry
  await check("Cache Basic: Respects TTL expiration", async () => {
    const testKey = "audit:test:expiring_key";
    await cacheSet(testKey, "temporary_val", 1); // 1 second TTL

    await new Promise((r) => setTimeout(r, 1200));
    const retrieved = await cacheGet(testKey);
    assert.equal(retrieved, null);
  });

  // TEST 3: Multi-tenant Key Isolation
  await check("Multi-Tenant Isolation: Keys with different parameters or tenants are segregated", async () => {
    const tenant1Key = buildTenantCacheKey("company_A", "orders", { page: 1, limit: 10, status: "PENDING" });
    const tenant2Key = buildTenantCacheKey("company_B", "orders", { page: 1, limit: 10, status: "PENDING" });
    const page2Key = buildTenantCacheKey("company_A", "orders", { page: 2, limit: 10, status: "PENDING" });
    console.log("tenant1Key:", tenant1Key);
    console.log("page2Key:", page2Key);

    assert.ok(tenant1Key !== tenant2Key, "Different tenants must produce distinct cache keys");
    assert.ok(tenant1Key !== page2Key, "Different pagination pages must produce distinct cache keys");
    assert.ok(tenant1Key.includes("company_A"));
    assert.ok(tenant2Key.includes("company_B"));
    assert.ok(page2Key.includes('"page":2'));



    await cacheSet(tenant1Key, { orders: ["Tenant A Order 1"] }, 60);
    await cacheSet(tenant2Key, { orders: ["Tenant B Order 1"] }, 60);

    const dataA = await cacheGet<any>(tenant1Key);
    const dataB = await cacheGet<any>(tenant2Key);

    assert.deepEqual(dataA.orders, ["Tenant A Order 1"]);
    assert.deepEqual(dataB.orders, ["Tenant B Order 1"]);
  });

  // TEST 4: Singleflight Cache Stampede Protection
  await check("Cache Stampede: 30 concurrent requests execute fetcher exactly ONCE", async () => {
    const stampedeKey = "audit:test:stampede_protection";
    let fetcherInvocationCount = 0;

    const expensiveDataFetcher = async () => {
      fetcherInvocationCount++;
      // Simulate 100ms expensive DB query
      await new Promise((r) => setTimeout(r, 100));
      return { heavyData: "computed_payload", timestamp: Date.now() };
    };

    // Fire 30 concurrent requests simultaneously for the same missing key
    const promises = Array.from({ length: 30 }, () =>
      fetchWithCache(stampedeKey, expensiveDataFetcher, { ttlSeconds: 30 })
    );

    const results = await Promise.all(promises);

    assert.equal(
      fetcherInvocationCount,
      1,
      `Fetcher should be invoked exactly 1 time under stampede, but was invoked ${fetcherInvocationCount} times`
    );

    // All 30 callers should receive the exact same valid payload
    for (const res of results) {
      assert.equal(res.heavyData, "computed_payload");
    }
  });

  // TEST 5: Wildcard Non-blocking Deletion
  await check("Cache Invalidation: Pattern deletion clears only targeted tenant keys", async () => {
    const tA_p1 = buildTenantCacheKey("tenant_clear_A", "products", { page: 1 });
    const tA_p2 = buildTenantCacheKey("tenant_clear_A", "products", { page: 2 });
    const tB_p1 = buildTenantCacheKey("tenant_clear_B", "products", { page: 1 });

    await cacheSet(tA_p1, "prodA1", 60);
    await cacheSet(tA_p2, "prodA2", 60);
    await cacheSet(tB_p1, "prodB1", 60);

    // Delete all tenant A products
    await cacheDel("tenant:tenant_clear_A:products:*");

    assert.equal(await cacheGet(tA_p1), null, "Tenant A page 1 should be invalidated");
    assert.equal(await cacheGet(tA_p2), null, "Tenant A page 2 should be invalidated");
    assert.equal(await cacheGet(tB_p1), "prodB1", "Tenant B data must remain untouched");
  });

  // TEST 6: Rate Limiting & Tiers
  await check("Rate Limiting: Enforces limits per window and separates tiers", async () => {
    const testIp = "192.168.1.99";

    // Test auth tier limit (20 req / 60s)
    const authLimit = TIER_LIMITS.auth;
    assert.equal(authLimit.limit, 20);

    let allowedCount = 0;
    let blocked = false;

    // Send 25 rapid requests under auth tier
    for (let i = 0; i < 25; i++) {
      const isAllowed = rateLimit(`auth:${testIp}`, authLimit.limit, authLimit.windowMs);
      if (isAllowed) {
        allowedCount++;
      } else {
        blocked = true;
      }
    }

    assert.equal(allowedCount, 20, "Should allow exactly 20 requests for auth tier");
    assert.equal(blocked, true, "21st request should be rejected with 429");

    // Standard tier should still have its own isolated budget (120 req/min)
    const stdAllowed = rateLimit(`standard:${testIp}`, TIER_LIMITS.standard.limit, TIER_LIMITS.standard.windowMs);
    assert.equal(stdAllowed, true, "Standard tier must not be blocked by exhausted auth tier");
  });


  // TEST 7: Benchmark Latency Improvement
  await check("Benchmark: Cached response speedup vs cold computation", async () => {
    const benchKey = "audit:test:benchmark_key";

    // Cold run with simulated 50ms DB lookup
    const coldStart = performance.now();
    await fetchWithCache(
      benchKey,
      async () => {
        await new Promise((r) => setTimeout(r, 50));
        return { data: [1, 2, 3, 4, 5] };
      },
      { ttlSeconds: 60 }
    );
    const coldDuration = performance.now() - coldStart;

    // Warm run (from cache)
    const warmStart = performance.now();
    await fetchWithCache(
      benchKey,
      async () => {
        await new Promise((r) => setTimeout(r, 50));
        return { data: [1, 2, 3, 4, 5] };
      },
      { ttlSeconds: 60 }
    );
    const warmDuration = performance.now() - warmStart;

    console.log(`       Cold execution: ${coldDuration.toFixed(2)}ms`);
    console.log(`       Warm execution: ${warmDuration.toFixed(2)}ms`);
    console.log(`       Speedup factor: ${(coldDuration / Math.max(warmDuration, 0.01)).toFixed(1)}x faster`);

    assert(warmDuration < coldDuration, "Cached response should be significantly faster than cold response");
  });

  console.log("\nCache Stats:", getCacheStats());
  console.log("\n==========================================");
  console.log("✅ ALL AUDIT & PERFORMANCE TESTS PASSED");
  console.log("==========================================\n");
  process.exit(0);
}

runPerformanceAuditTests().catch((err) => {
  console.error("\n❌ TEST SUITE RUNNER ERROR:", err);
  process.exit(1);
});
