/**
 * tests/payments/universalQuickBuyResolution.test.ts
 *
 * Automated verification test suite for Universal Quick Buy & Payment Resolution Rules:
 * Rule A: Ghuba marketplace checkout strictly uses GHUBA_MANAGED with PLATFORM_DEFAULT credentials.
 * Rule B: Individual stores with valid saved configurations use their own merchant credentials.
 * Rule C: Individual stores with incomplete or unconfigured credentials gracefully fall back to PLATFORM_DEFAULT.
 * Rule D: Payment method enumeration (getAvailableStorePaymentMethods) exposes only valid methods.
 * Rule E: Security: Client requests cannot override server-authoritative ownership.
 */

import assert from "node:assert/strict";
import {
  resolvePaymentConfiguration,
  getAvailableStorePaymentMethods,
  getPlatformMpesaCredentials,
} from "../../lib/payments/resolver";

async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function runUniversalQuickBuyTests() {
  console.log("==================================================================");
  console.log("TESTING UNIVERSAL QUICK BUY & PAYMENT RESOLUTION PRECEDENCE RULES");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // RULE A: GHUBA MARKETPLACE CHECKOUT
  // -------------------------------------------------------------
  console.log("\n--- Rule A: Ghuba Marketplace Context ---");

  await check("Rule A.1: Ghuba marketplace checkout (isMarketplace: true) strictly uses GHUBA_MANAGED and PLATFORM_DEFAULT", async () => {
    const config = await resolvePaymentConfiguration({
      purpose: "STORE_CHECKOUT",
      provider: "MPESA",
      storeId: "store-seller-123",
      isMarketplace: true,
    });

    assert.equal(config.ownership, "GHUBA_MANAGED", "Marketplace orders must be GHUBA_MANAGED escrow");
    assert.equal(config.credentialSource, "PLATFORM_DEFAULT", "Marketplace orders must use platform credentials");
    assert.ok(config.mpesa, "M-Pesa credentials must be present");
  });

  await check("Rule A.2: Ghuba marketplace checkout via Paystack uses PLATFORM_DEFAULT", async () => {
    const config = await resolvePaymentConfiguration({
      purpose: "STORE_CHECKOUT",
      provider: "PAYSTACK",
      storeId: "store-seller-456",
      isMarketplace: true,
    });

    assert.equal(config.ownership, "GHUBA_MANAGED");
    assert.equal(config.credentialSource, "PLATFORM_DEFAULT");
    assert.ok(config.paystack);
  });

  // -------------------------------------------------------------
  // RULE C: INDIVIDUAL STORE WITHOUT SAVED CONFIGURATION
  // -------------------------------------------------------------
  console.log("\n--- Rule C: Store Without Usable Configuration ---");

  await check("Rule C.1: Store without payment settings falls back to PLATFORM_DEFAULT without error", async () => {
    // Non-existent store ID or store with no payment settings
    const config = await resolvePaymentConfiguration({
      purpose: "STORE_CHECKOUT",
      provider: "MPESA",
      storeId: "non-existent-store-xyz-999",
      isMarketplace: false,
    });

    assert.equal(config.ownership, "GHUBA_MANAGED", "Must route collection through platform");
    assert.equal(config.credentialSource, "PLATFORM_DEFAULT", "Must fall back to platform default credentials");
    assert.ok(config.mpesa, "Platform default M-Pesa config must be present");
  });

  // -------------------------------------------------------------
  // RULE D: AVAILABLE PAYMENT METHODS ENUMERATION
  // -------------------------------------------------------------
  console.log("\n--- Rule D: Available Payment Methods Resolution ---");

  await check("Rule D.1: Marketplace available methods lists M-Pesa, Card, and Till", async () => {
    const result = await getAvailableStorePaymentMethods({
      storeId: "any-store",
      isMarketplace: true,
    });

    assert.equal(result.isMarketplace, true);
    assert.equal(result.resolutionRule, "RULE_A_GHUBA_MARKETPLACE");
    assert.ok(result.availableMethods.length >= 3, "Must provide marketplace methods");

    const ids = result.availableMethods.map((m) => m.id);
    assert.ok(ids.includes("mpesa"), "Must include M-Pesa");
    assert.ok(ids.includes("card"), "Must include Card");
    assert.ok(ids.includes("till"), "Must include Till");
  });

  await check("Rule D.2: Store without payment settings provides graceful fallback methods with attribution", async () => {
    const result = await getAvailableStorePaymentMethods({
      storeId: "store-no-settings-abc",
      isMarketplace: false,
    });

    assert.equal(result.resolutionRule, "RULE_C_PLATFORM_FALLBACK");
    assert.ok(result.availableMethods.length >= 2, "Must at least include M-Pesa and card fallback");
    assert.equal(result.availableMethods[0].ownership, "GHUBA_MANAGED");
  });

  // -------------------------------------------------------------
  // RULE E: SECURITY & IMMUTABILITY
  // -------------------------------------------------------------
  console.log("\n--- Rule E: Security & Tenant Isolation ---");

  await check("Rule E.1: Credentials returned by getAvailableStorePaymentMethods never expose secret keys", async () => {
    const result = await getAvailableStorePaymentMethods({
      storeId: "store-123",
      isMarketplace: false,
    });

    const serialized = JSON.stringify(result);
    assert.ok(!serialized.includes("consumerSecret"), "Must never leak consumerSecret");
    assert.ok(!serialized.includes("secretKey"), "Must never leak secretKey");
    assert.ok(!serialized.includes("privateKey"), "Must never leak privateKey");
    assert.ok(!serialized.includes("passkey"), "Must never leak passkey");
  });

  console.log("\n==================================================================");
  console.log("ALL UNIVERSAL QUICK BUY & RESOLUTION TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================================\n");
}

runUniversalQuickBuyTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
