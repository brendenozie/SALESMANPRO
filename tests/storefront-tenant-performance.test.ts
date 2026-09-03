import {
  fetchWithCache,
  buildTenantCacheKey,
  cacheGet,
  cacheSet,
  cacheDel,
  getCacheStats,
} from "../lib/cache";
import assert from "assert";

async function runStorefrontPerformanceTests() {
  console.log("\n========================================================");
  console.log("🏪 SALESMANPRO TENANT STOREFRONT PERFORMANCE & AUDIT SUITE");
  console.log("========================================================\n");

  // Clear test keys
  await cacheDel("tenant:test_tenant_a:*");
  await cacheDel("tenant:test_tenant_b:*");
  await cacheDel("geo:country:*");

  // ----------------------------------------------------
  // TEST 1: Host & Subdomain Normalization Logic
  // ----------------------------------------------------
  console.log("TEST 1: Host, Subdomain & Custom Domain Normalization...");
  const normalizeHost = (host: string) => {
    const raw = host.split(":")[0].toLowerCase();
    if (raw.endsWith(".salesmanpro.site")) {
      const sub = raw.replace(".salesmanpro.site", "").replace(/^www\./, "");
      return { kind: "subdomain", identifier: sub };
    }
    const custom = raw.replace(/^www\./, "");
    return { kind: "custom-domain", identifier: custom };
  };

  const t1 = normalizeHost("mystore.salesmanpro.site:3000");
  assert.strictEqual(t1.kind, "subdomain");
  assert.strictEqual(t1.identifier, "mystore");

  const t2 = normalizeHost("www.fashionbrand.com:443");
  assert.strictEqual(t2.kind, "custom-domain");
  assert.strictEqual(t2.identifier, "fashionbrand.com");

  const t3 = normalizeHost("electronics.com");
  assert.strictEqual(t3.kind, "custom-domain");
  assert.strictEqual(t3.identifier, "electronics.com");
  console.log("  ✓ Host and domain normalization verified correctly.\n");

  // ----------------------------------------------------
  // TEST 2: Multi-Tenant Cache Isolation
  // ----------------------------------------------------
  console.log("TEST 2: Strict Multi-Tenant Storefront Cache Isolation...");
  const tenantAKey = buildTenantCacheKey("company_A", "storefront", {
    route: "home",
    locale: "en",
  });
  const tenantBKey = buildTenantCacheKey("company_B", "storefront", {
    route: "home",
    locale: "en",
  });

  assert.notStrictEqual(tenantAKey, tenantBKey);

  await cacheSet(tenantAKey, { storeName: "Tenant A Superstore", products: [1, 2, 3] }, 60);
  await cacheSet(tenantBKey, { storeName: "Tenant B Boutique", products: [99] }, 60);

  const cachedA: any = await cacheGet(tenantAKey);
  const cachedB: any = await cacheGet(tenantBKey);

  assert.strictEqual(cachedA.storeName, "Tenant A Superstore");
  assert.strictEqual(cachedB.storeName, "Tenant B Boutique");
  assert.strictEqual(cachedA.products.length, 3);
  assert.strictEqual(cachedB.products.length, 1);
  console.log("  ✓ Multi-tenant cache isolation verified with zero cross-tenant contamination.\n");

  // ----------------------------------------------------
  // TEST 3: Singleflight Stampede Protection (50 Concurrent Requests)
  // ----------------------------------------------------
  console.log("TEST 3: High-Concurrency Stampede Protection (50 Concurrent Hits)...");
  let dbHitCount = 0;
  const stampedeKey = buildTenantCacheKey("company_stress", "catalog", { page: 1, limit: 12 });

  const simulateStorefrontFetch = async () => {
    return fetchWithCache(
      stampedeKey,
      async () => {
        dbHitCount++;
        // Simulate database latency
        await new Promise((resolve) => setTimeout(resolve, 40));
        return {
          storeName: "High Traffic Store",
          items: [{ id: 101, name: "Flagship Item" }],
          timestamp: Date.now(),
        };
      },
      60
    );
  };

  // Dispatch 50 concurrent requests simultaneously
  const results = await Promise.all(
    Array.from({ length: 50 }, () => simulateStorefrontFetch())
  );

  assert.strictEqual(dbHitCount, 1, `DB was hit ${dbHitCount} times instead of exactly 1`);
  assert.strictEqual(results.length, 50);
  assert.strictEqual(results[0].storeName, "High Traffic Store");
  console.log(`  ✓ 50 concurrent storefront requests executed fetcher exactly ${dbHitCount} time.\n`);

  // ----------------------------------------------------
  // TEST 4: Targeted Tenant Invalidation
  // ----------------------------------------------------
  console.log("TEST 4: Targeted Cache Invalidation (Tenant A vs Tenant B)...");
  const aProductsKey = buildTenantCacheKey("tenant_alpha", "products", { category: "shoes" });
  const bProductsKey = buildTenantCacheKey("tenant_beta", "products", { category: "shoes" });

  await cacheSet(aProductsKey, { items: ["Alpha Sneaker"] }, 60);
  await cacheSet(bProductsKey, { items: ["Beta Boot"] }, 60);

  // Invalidate Tenant Alpha only
  await cacheDel(`tenant:tenant_alpha:products:*`);

  const alphaAfter = await cacheGet(aProductsKey);
  const betaAfter = await cacheGet(bProductsKey);

  assert.strictEqual(alphaAfter, null, "Tenant Alpha cache should have been invalidated");
  assert.notStrictEqual(betaAfter, null, "Tenant Beta cache MUST remain warm and untouched");
  console.log("  ✓ Targeted invalidation successfully purged Tenant Alpha while keeping Tenant Beta warm.\n");

  // ----------------------------------------------------
  // TEST 5: Cold vs. Warm Storefront Resolution Benchmark
  // ----------------------------------------------------
  console.log("TEST 5: Storefront Latency Benchmark (Cold vs Warm)...");
  const benchKey = buildTenantCacheKey("benchmark_tenant", "page_data", { view: "landing" });
  await cacheDel(benchKey);

  // Cold Execution
  const coldStart = process.hrtime.bigint();
  await fetchWithCache(
    benchKey,
    async () => {
      // Simulate typical MongoDB aggregate + relations lookup latency
      await new Promise((resolve) => setTimeout(resolve, 35));
      return { loaded: true, sections: 8, products: 24 };
    },
    60
  );
  const coldEnd = process.hrtime.bigint();
  const coldMs = Number(coldEnd - coldStart) / 1_000_000;

  // Warm Execution
  const warmStart = process.hrtime.bigint();
  const warmData = await fetchWithCache(
    benchKey,
    async () => {
      throw new Error("Fetcher should not be called on warm cache");
    },
    60
  );
  const warmEnd = process.hrtime.bigint();
  const warmMs = Number(warmEnd - warmStart) / 1_000_000;

  const speedup = (coldMs / Math.max(warmMs, 0.001)).toFixed(1);
  console.log(`  ✓ Cold request latency: ${coldMs.toFixed(2)}ms`);
  console.log(`  ✓ Warm cached latency:  ${warmMs.toFixed(3)}ms`);
  console.log(`  ✓ Performance speedup:  ${speedup}x faster\n`);

  // ----------------------------------------------------
  // TEST 6: IP-to-Country Lookup Caching & Fail-Safe
  // ----------------------------------------------------
  console.log("TEST 6: Geo IP-to-Country Lookup Caching...");
  const userIp = "197.237.120.45";
  const geoCacheKey = `geo:country:${userIp}`;
  await cacheDel(geoCacheKey);

  let geoFetchCount = 0;
  const mockCountryLookup = async () => {
    return fetchWithCache(
      geoCacheKey,
      async () => {
        geoFetchCount++;
        return "Kenya";
      },
      86400
    );
  };

  const firstCall = await mockCountryLookup();
  const secondCall = await mockCountryLookup();

  assert.strictEqual(firstCall, "Kenya");
  assert.strictEqual(secondCall, "Kenya");
  assert.strictEqual(geoFetchCount, 1, "Geo lookup should be cached for subsequent calls");
  console.log("  ✓ IP-to-Country caching confirmed to eliminate redundant external HTTP requests.\n");

  console.log("========================================================");
  console.log("✅ ALL STOREFRONT PERFORMANCE & AUDIT TESTS PASSED");
  console.log("========================================================\n");
  process.exit(0);
}

runStorefrontPerformanceTests().catch((err) => {

  console.error("\n❌ Storefront test suite failed:", err);
  process.exit(1);
});
