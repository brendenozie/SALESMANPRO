/**
 * tests/social-platform.test.ts
 *
 * Unit and integration tests for SalesmanPro AI Social Media Platform:
 * 1. AES-256-GCM Token Encryption & Decryption
 * 2. Official Social Adapters & OAuth URL Generation
 * 3. Platform Character Limits & Constraints
 * 4. Registry Platform Availability
 */

import assert from "assert";
import { socialCrypto } from "../lib/social/socialCrypto";
import { socialRegistry } from "../lib/social/adapters";
import { PLATFORM_LIMITS } from "../lib/social/types";

async function runTests() {
  console.log("=================================================");
  console.log("   SalesmanPro AI Social Platform Test Suite     ");
  console.log("=================================================\n");

  // TEST 1: Token Encryption & Decryption Round-Trip
  console.log("Test 1: Hardware-Grade AES-256-GCM Token Encryption...");
  const rawToken = "EAAXx987123sampleOauthLongLivedAccessTokenForFacebookAndInstagram";
  const encrypted = socialCrypto.encryptToken(rawToken);

  assert.ok(encrypted.encrypted, "Encrypted payload should not be empty");
  assert.ok(encrypted.iv, "IV should not be empty");
  assert.ok(encrypted.tag, "Auth Tag should not be empty");
  assert.notStrictEqual(encrypted.encrypted, rawToken, "Encrypted text must differ from plaintext");

  const decrypted = socialCrypto.decryptToken(encrypted);
  assert.strictEqual(decrypted, rawToken, "Decrypted token must exactly match plaintext original");
  console.log("  ✓ AES-256-GCM round-trip verified successfully.");

  // TEST 1.1: IV Randomization (two encryptions of same text must have different IVs)
  const encrypted2 = socialCrypto.encryptToken(rawToken);
  assert.notStrictEqual(encrypted.iv, encrypted2.iv, "Subsequent encryptions must use fresh random IVs");
  console.log("  ✓ Cryptographic IV randomization verified.");

  // TEST 2: Platform Adapters Registry & OAuth URL Generation
  console.log("\nTest 2: Social Platform Adapter Registry & OAuth Generation...");
  const supportedPlatforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK", "YOUTUBE"] as const;

  for (const plat of supportedPlatforms) {
    const adapter = socialRegistry.getAdapter(plat);
    assert.ok(adapter, `Adapter for ${plat} must be registered`);
    assert.strictEqual(adapter.platform, plat, `Adapter platform must be ${plat}`);

    const oauthUrl = adapter.getOAuthUrl(
      {
        redirectUri: `https://app.salesmanpro.com/api/social/callback/${plat.toLowerCase()}`,
        state: "csrf-state-token-12345",
      },
      {
        clientId: `test-client-id-${plat.toLowerCase()}`,
      }
    );

    assert.ok(oauthUrl.startsWith("https://"), `OAuth URL for ${plat} must be HTTPS`);
    assert.ok(oauthUrl.includes("state=csrf-state-token-12345"), `OAuth URL for ${plat} must include state`);
    assert.ok(oauthUrl.includes(`test-client-id-${plat.toLowerCase()}`), `OAuth URL for ${plat} must include clientId`);
    console.log(`  ✓ ${plat} adapter registered and generated valid OAuth URL: ${oauthUrl.slice(0, 60)}...`);
  }

  // TEST 3: Platform Publishing Limits & Constraints
  console.log("\nTest 3: Platform Publishing Limits & Validation Constants...");
  assert.strictEqual(PLATFORM_LIMITS.FACEBOOK.maxCaptionLength, 63206);
  assert.strictEqual(PLATFORM_LIMITS.INSTAGRAM.maxCaptionLength, 2200);
  assert.strictEqual(PLATFORM_LIMITS.INSTAGRAM.maxHashtags, 30);
  assert.strictEqual(PLATFORM_LIMITS.TIKTOK.maxCaptionLength, 2200);
  assert.strictEqual(PLATFORM_LIMITS.YOUTUBE.maxTitleLength, 100);
  assert.strictEqual(PLATFORM_LIMITS.YOUTUBE.maxDescriptionLength, 5000);
  console.log("  ✓ All platform character and media constraints conform to official API specs.");

  // TEST 4: Registry Introspection
  console.log("\nTest 4: Registry Platform Introspection...");
  const available = socialRegistry.getAvailablePlatforms();
  assert.strictEqual(available.length, 4);
  assert.ok(available.includes("FACEBOOK"));
  assert.ok(available.includes("INSTAGRAM"));
  assert.ok(available.includes("TIKTOK"));
  assert.ok(available.includes("YOUTUBE"));
  assert.strictEqual(socialRegistry.hasAdapter("FACEBOOK"), true);
  assert.strictEqual(socialRegistry.hasAdapter("INSTAGRAM"), true);
  assert.strictEqual(socialRegistry.hasAdapter("TIKTOK"), true);
  assert.strictEqual(socialRegistry.hasAdapter("YOUTUBE"), true);
  console.log("  ✓ Registry introspection correctly identifies all 4 supported platforms.");

  console.log("\n=================================================");
  console.log("   All SalesmanPro Social Platform Tests PASSED! ");
  console.log("=================================================\n");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
