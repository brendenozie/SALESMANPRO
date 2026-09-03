"use strict";
/**
 * tests/multi-server-domain-routing.test.ts
 *
 * Automated Multi-Server Domain Routing, Tenant Resolution,
 * Distributed Locking, and Cluster Safety Test Suite.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMultiServerSuite = void 0;
const assert_1 = __importDefault(require("assert"));
const resolver_1 = require("../lib/tenant/resolver");
const domain_service_1 = require("../lib/tenant/domain-service");
const distributed_lock_1 = require("../lib/lock/distributed-lock");
const requestIdentity_1 = require("../lib/requestIdentity");
const rate_limit_1 = require("../lib/rate-limit");
async function runMultiServerSuite() {
    console.log("===============================================================");
    console.log("🚀 SALESMANPRO MULTI-SERVER DOMAIN & CLUSTER SAFETY TEST SUITE");
    console.log("===============================================================\n");
    let passed = 0;
    let failed = 0;
    async function test(name, fn) {
        process.stdout.write(`⏳ Running test: ${name}... `);
        try {
            await fn();
            console.log("✅ PASSED");
            passed++;
        }
        catch (err) {
            console.log("❌ FAILED");
            console.error(`   Error: ${err.message}`);
            if (err.stack)
                console.error(err.stack);
            failed++;
        }
    }
    // ----------------------------------------------------
    // TEST 1: Hostname Normalization
    // ----------------------------------------------------
    await test("Domain: Hostname Normalization across Ports, Protocols, and WWW", () => {
        // Port stripping
        assert_1.default.strictEqual((0, resolver_1.normalizeHostname)("store.salesmanpro.site:3000"), "store.salesmanpro.site");
        assert_1.default.strictEqual((0, resolver_1.normalizeHostname)("shop.customer.com:443"), "shop.customer.com");
        // WWW stripping
        assert_1.default.strictEqual((0, resolver_1.normalizeHostname)("www.mybrand.com"), "mybrand.com");
        assert_1.default.strictEqual((0, resolver_1.normalizeHostname)("WWW.SALESMANPRO.SITE"), "salesmanpro.site");
        // Whitespace and case-insensitivity
        assert_1.default.strictEqual((0, resolver_1.normalizeHostname)("  Shop.Brand.co.ke:8080 "), "shop.brand.co.ke");
        // Edge cases
        assert_1.default.strictEqual((0, resolver_1.normalizeHostname)(null), "");
        assert_1.default.strictEqual((0, resolver_1.normalizeHostname)(""), "");
    });
    // ----------------------------------------------------
    // TEST 2: Domain Cache Key Isolation
    // ----------------------------------------------------
    await test("Domain: Cache Key Building and Isolation", () => {
        const keyA = (0, resolver_1.buildDomainCacheKey)("store-a.salesmanpro.site");
        const keyB = (0, resolver_1.buildDomainCacheKey)("store-b.salesmanpro.site");
        const keyCustom = (0, resolver_1.buildDomainCacheKey)("boutique.com");
        assert_1.default.strictEqual(keyA, "tenant:domain:store-a.salesmanpro.site");
        assert_1.default.strictEqual(keyB, "tenant:domain:store-b.salesmanpro.site");
        assert_1.default.strictEqual(keyCustom, "tenant:domain:boutique.com");
        assert_1.default.notStrictEqual(keyA, keyB, "Tenant cache keys must never collide");
    });
    // ----------------------------------------------------
    // TEST 3: Distributed Mutual Exclusion Locking
    // ----------------------------------------------------
    await test("Lock: Distributed Mutual Exclusion & Safe Release", async () => {
        const resource = `test_resource_${Date.now()}`;
        // 1. Worker 1 acquires lock
        const lock1 = await (0, distributed_lock_1.acquireLock)(resource, 60);
        (0, assert_1.default)(lock1 !== null, "Worker 1 should acquire lock");
        assert_1.default.strictEqual(lock1?.resource, resource);
        // 2. Worker 2 attempts to acquire same resource concurrently
        const lock2 = await (0, distributed_lock_1.acquireLock)(resource, 60);
        assert_1.default.strictEqual(lock2, null, "Worker 2 must be locked out while Worker 1 holds lock");
        // 3. Worker 1 extends lease
        const extended = await (0, distributed_lock_1.extendLock)(lock1, 120);
        assert_1.default.strictEqual(extended, true, "Lock lease extension should succeed");
        // 4. Worker 1 releases lock
        const released = await (0, distributed_lock_1.releaseLock)(lock1);
        assert_1.default.strictEqual(released, true, "Lock release should succeed");
        // 5. Worker 2 can now acquire lock
        const lock2After = await (0, distributed_lock_1.acquireLock)(resource, 60);
        (0, assert_1.default)(lock2After !== null, "Worker 2 should now acquire lock after Worker 1 release");
        await (0, distributed_lock_1.releaseLock)(lock2After);
    });
    // ----------------------------------------------------
    // TEST 4: Distributed Lock Helper (withDistributedLock)
    // ----------------------------------------------------
    await test("Lock: withDistributedLock wrapper execution and cleanup", async () => {
        const resource = `scoped_lock_${Date.now()}`;
        let executed = false;
        const res = await (0, distributed_lock_1.withDistributedLock)(resource, 30, async () => {
            executed = true;
            return "SUCCESS_VALUE";
        });
        assert_1.default.strictEqual(res.executed, true);
        assert_1.default.strictEqual(res.result, "SUCCESS_VALUE");
        assert_1.default.strictEqual(executed, true);
        // Lock must already be released
        const secondAcquire = await (0, distributed_lock_1.acquireLock)(resource, 30);
        (0, assert_1.default)(secondAcquire !== null, "Lock should have been automatically cleaned up");
        await (0, distributed_lock_1.releaseLock)(secondAcquire);
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
        assert_1.default.strictEqual((0, requestIdentity_1.getTrustedHost)(mockReqWithForwarded), "shop.customerbrand.com");
        assert_1.default.strictEqual((0, requestIdentity_1.getTrustedProtocol)(mockReqWithForwarded), "https");
        assert_1.default.strictEqual((0, requestIdentity_1.isSecureRequest)(mockReqWithForwarded), true);
        assert_1.default.strictEqual((0, requestIdentity_1.getClientIp)(mockReqWithForwarded), "198.51.100.45");
        // Standard direct request
        const mockDirectReq = new Request("https://mystore.salesmanpro.site/products", {
            headers: {
                host: "mystore.salesmanpro.site:443",
            },
        });
        assert_1.default.strictEqual((0, requestIdentity_1.getTrustedHost)(mockDirectReq), "mystore.salesmanpro.site");
        assert_1.default.strictEqual((0, requestIdentity_1.getTrustedProtocol)(mockDirectReq), "https");
    });
    // ----------------------------------------------------
    // TEST 6: Domain Verification Token Generation
    // ----------------------------------------------------
    await test("Domain: Verification Token Cryptographic Security", () => {
        const token1 = (0, domain_service_1.generateVerificationToken)("comp_123");
        const token2 = (0, domain_service_1.generateVerificationToken)("comp_123");
        (0, assert_1.default)(token1.startsWith("salesmanpro-verify-"), "Token must have expected prefix");
        assert_1.default.strictEqual(token1.length, "salesmanpro-verify-".length + 32, "Token must have 32 hex chars (128 bits)");
        assert_1.default.notStrictEqual(token1, token2, "Successive tokens must be cryptographically unique");
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
            const allowed = (0, rate_limit_1.rateLimit)(id, limit, windowMs);
            assert_1.default.strictEqual(allowed, true, `Request ${i + 1} should be permitted`);
        }
        // 6th request must be rejected
        const blocked = (0, rate_limit_1.rateLimit)(id, limit, windowMs);
        assert_1.default.strictEqual(blocked, false, "6th request should be rate-limited");
    });
    // ----------------------------------------------------
    // TEST 8: Domain Invalidation Safety
    // ----------------------------------------------------
    await test("Domain: Safe Cluster-wide Invalidation without Throws", async () => {
        await assert_1.default.doesNotReject(async () => {
            await (0, resolver_1.invalidateTenantDomainCache)({
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
exports.runMultiServerSuite = runMultiServerSuite;
if (require.main === module) {
    runMultiServerSuite().catch((err) => {
        console.error("Test Suite crashed:", err);
        process.exit(1);
    });
}
