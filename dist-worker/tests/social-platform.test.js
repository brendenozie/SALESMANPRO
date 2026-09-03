"use strict";
/**
 * tests/social-platform.test.ts
 *
 * Unit and integration tests for SalesmanPro AI Social Media Platform:
 * 1. AES-256-GCM Token Encryption & Decryption
 * 2. Official Social Adapters & OAuth URL Generation
 * 3. Platform Character Limits & Constraints
 * 4. Registry Platform Availability
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const socialCrypto_1 = require("../lib/social/socialCrypto");
const adapters_1 = require("../lib/social/adapters");
const types_1 = require("../lib/social/types");
async function runTests() {
    console.log("=================================================");
    console.log("   SalesmanPro AI Social Platform Test Suite     ");
    console.log("=================================================\n");
    // TEST 1: Token Encryption & Decryption Round-Trip
    console.log("Test 1: Hardware-Grade AES-256-GCM Token Encryption...");
    const rawToken = "EAAXx987123sampleOauthLongLivedAccessTokenForFacebookAndInstagram";
    const encrypted = socialCrypto_1.socialCrypto.encryptToken(rawToken);
    assert_1.default.ok(encrypted.encrypted, "Encrypted payload should not be empty");
    assert_1.default.ok(encrypted.iv, "IV should not be empty");
    assert_1.default.ok(encrypted.tag, "Auth Tag should not be empty");
    assert_1.default.notStrictEqual(encrypted.encrypted, rawToken, "Encrypted text must differ from plaintext");
    const decrypted = socialCrypto_1.socialCrypto.decryptToken(encrypted);
    assert_1.default.strictEqual(decrypted, rawToken, "Decrypted token must exactly match plaintext original");
    console.log("  ✓ AES-256-GCM round-trip verified successfully.");
    // TEST 1.1: IV Randomization (two encryptions of same text must have different IVs)
    const encrypted2 = socialCrypto_1.socialCrypto.encryptToken(rawToken);
    assert_1.default.notStrictEqual(encrypted.iv, encrypted2.iv, "Subsequent encryptions must use fresh random IVs");
    console.log("  ✓ Cryptographic IV randomization verified.");
    // TEST 2: Platform Adapters Registry & OAuth URL Generation
    console.log("\nTest 2: Social Platform Adapter Registry & OAuth Generation...");
    const supportedPlatforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK", "YOUTUBE"];
    for (const plat of supportedPlatforms) {
        const adapter = adapters_1.socialRegistry.getAdapter(plat);
        assert_1.default.ok(adapter, `Adapter for ${plat} must be registered`);
        assert_1.default.strictEqual(adapter.platform, plat, `Adapter platform must be ${plat}`);
        const oauthUrl = adapter.getOAuthUrl({
            redirectUri: `https://app.salesmanpro.com/api/social/callback/${plat.toLowerCase()}`,
            state: "csrf-state-token-12345",
        }, {
            clientId: `test-client-id-${plat.toLowerCase()}`,
        });
        assert_1.default.ok(oauthUrl.startsWith("https://"), `OAuth URL for ${plat} must be HTTPS`);
        assert_1.default.ok(oauthUrl.includes("state=csrf-state-token-12345"), `OAuth URL for ${plat} must include state`);
        assert_1.default.ok(oauthUrl.includes(`test-client-id-${plat.toLowerCase()}`), `OAuth URL for ${plat} must include clientId`);
        console.log(`  ✓ ${plat} adapter registered and generated valid OAuth URL: ${oauthUrl.slice(0, 60)}...`);
    }
    // TEST 3: Platform Publishing Limits & Constraints
    console.log("\nTest 3: Platform Publishing Limits & Validation Constants...");
    assert_1.default.strictEqual(types_1.PLATFORM_LIMITS.FACEBOOK.maxCaptionLength, 63206);
    assert_1.default.strictEqual(types_1.PLATFORM_LIMITS.INSTAGRAM.maxCaptionLength, 2200);
    assert_1.default.strictEqual(types_1.PLATFORM_LIMITS.INSTAGRAM.maxHashtags, 30);
    assert_1.default.strictEqual(types_1.PLATFORM_LIMITS.TIKTOK.maxCaptionLength, 2200);
    assert_1.default.strictEqual(types_1.PLATFORM_LIMITS.YOUTUBE.maxTitleLength, 100);
    assert_1.default.strictEqual(types_1.PLATFORM_LIMITS.YOUTUBE.maxDescriptionLength, 5000);
    console.log("  ✓ All platform character and media constraints conform to official API specs.");
    // TEST 4: Registry Introspection
    console.log("\nTest 4: Registry Platform Introspection...");
    const available = adapters_1.socialRegistry.getAvailablePlatforms();
    assert_1.default.strictEqual(available.length, 4);
    assert_1.default.ok(available.includes("FACEBOOK"));
    assert_1.default.ok(available.includes("INSTAGRAM"));
    assert_1.default.ok(available.includes("TIKTOK"));
    assert_1.default.ok(available.includes("YOUTUBE"));
    assert_1.default.strictEqual(adapters_1.socialRegistry.hasAdapter("FACEBOOK"), true);
    assert_1.default.strictEqual(adapters_1.socialRegistry.hasAdapter("INSTAGRAM"), true);
    assert_1.default.strictEqual(adapters_1.socialRegistry.hasAdapter("TIKTOK"), true);
    assert_1.default.strictEqual(adapters_1.socialRegistry.hasAdapter("YOUTUBE"), true);
    console.log("  ✓ Registry introspection correctly identifies all 4 supported platforms.");
    console.log("\n=================================================");
    console.log("   All SalesmanPro Social Platform Tests PASSED! ");
    console.log("=================================================\n");
}
runTests().catch((err) => {
    console.error("Test failure:", err);
    process.exit(1);
});
