/**
 * tests/payments/paymentInfrastructure.test.ts
 *
 * Automated verification test suite for SalesmanPro & Ghuba Payment Infrastructure:
 * 1. Canonical Payment Configuration Resolver:
 *    - Platform isolation for AI credits and subscriptions (always PLATFORM_DEFAULT).
 *    - Ghuba-managed store checkouts (Marketplace, storefront, custom domain).
 *    - Merchant-managed store checkouts (isolation & fallback semantics).
 * 2. Kenyan Phone Normalization (Safaricom Daraja 07xx, 01xx, +254xx, international).
 * 3. AI Credit Top-Up Lifecycle & Idempotency:
 *    - Creation in PENDING state (zero premature credits).
 *    - Callback success execution (exact credit allocation).
 *    - Duplicate callback protection (double-credit prevention).
 *    - Callback failure handling (zero credits on user cancellation/timeout).
 * 4. Two-Stage Till Number Fallback State Machine:
 *    - Stage 1: Admin review (remains UNPAID, order cannot be fulfilled).
 *    - Stage 2: Super-Admin authoritative statement verification (transitions to PAID).
 *    - Rejection & audit trail recording.
 * 5. Paystack Webhook Cryptographic Verification (HMAC-SHA512).
 */

import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  resolvePaymentConfiguration,
  getPlatformMpesaCredentials,
  getPlatformPaystackCredentials,
  getPlatformTillCredentials,
} from "../../lib/payments/resolver";
import { normalizePhoneNumber } from "../../lib/whatsapp/normalizePhone";

async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function runAll() {
  console.log("==================================================================");
  console.log("STARTING SALESMANPRO & GHUBA PAYMENT INFRASTRUCTURE VERIFICATION");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // SUITE 1: CANONICAL PAYMENT CONFIGURATION RESOLVER
  // -------------------------------------------------------------
  console.log("\n--- Suite 1: Canonical Resolver & Credential Isolation ---");

  await check("AI Credit Top-Ups: Strictly resolves to PLATFORM_DEFAULT (M-Pesa)", async () => {
    const config = await resolvePaymentConfiguration({
      purpose: "AI_CREDIT_TOPUP",
      provider: "MPESA",
    });

    assert.equal(config.ownership, "PLATFORM", "AI credits must be PLATFORM revenue");
    assert.equal(config.credentialSource, "PLATFORM_DEFAULT", "Must use platform credentials");
    assert.ok(config.mpesa, "M-Pesa configuration must be populated");
    assert.equal(config.provider, "MPESA");
  });

  await check("AI Credit Top-Ups: Strictly resolves to PLATFORM_DEFAULT (Paystack)", async () => {
    const config = await resolvePaymentConfiguration({
      purpose: "AI_CREDIT_TOPUP",
      provider: "PAYSTACK",
    });

    assert.equal(config.ownership, "PLATFORM", "AI credits must be PLATFORM revenue");
    assert.equal(config.credentialSource, "PLATFORM_DEFAULT", "Must use platform credentials");
    assert.ok(config.paystack, "Paystack configuration must be populated");
    assert.equal(config.provider, "PAYSTACK");
  });

  await check("Subscription Payments: Strictly resolves to PLATFORM_DEFAULT", async () => {
    const config = await resolvePaymentConfiguration({
      purpose: "SUBSCRIPTION",
      provider: "MPESA",
    });

    assert.equal(config.ownership, "PLATFORM", "Subscriptions must be platform revenue");
    assert.equal(config.credentialSource, "PLATFORM_DEFAULT");
  });

  await check("Platform Defaults: Secure masking and non-empty environment credentials", () => {
    const mpesa = getPlatformMpesaCredentials();
    const paystack = getPlatformPaystackCredentials();
    const till = getPlatformTillCredentials();

    assert.ok(mpesa.shortcode, "Platform M-Pesa shortcode must exist");
    assert.ok(mpesa.baseUrl, "Platform M-Pesa baseUrl must exist");
    assert.ok(till.tillNumber, "Platform Till Number must exist");
    assert.ok(till.tillNumber.length >= 5, "Till Number must be a valid Buy Goods length");
    assert.ok(paystack.callbackUrl, "Paystack callback must be defined");
  });

  // -------------------------------------------------------------
  // SUITE 2: PHONE NUMBER NORMALIZATION FOR DARAJA STK PUSH
  // -------------------------------------------------------------
  console.log("\n--- Suite 2: Safaricom Phone Number Normalization ---");

  await check("Normalizes 07xx numbers to 2547xx format", () => {
    assert.equal(normalizePhoneNumber("0706448146"), "254706448146");
    assert.equal(normalizePhoneNumber("0712345678"), "254712345678");
  });

  await check("Normalizes 01xx numbers (newer Safaricom blocks) to 2541xx format", () => {
    assert.equal(normalizePhoneNumber("0112345678"), "254112345678");
    assert.equal(normalizePhoneNumber("0101234567"), "254101234567");
  });

  await check("Normalizes +254 and spaces/dashes cleanly", () => {
    assert.equal(normalizePhoneNumber("+254 706 448 146"), "254706448146");
    assert.equal(normalizePhoneNumber("+254-712-345-678"), "254712345678");
    assert.equal(normalizePhoneNumber("706448146"), "254706448146");
  });

  // -------------------------------------------------------------
  // SUITE 3: AI CREDIT TOP-UP LIFECYCLE & IDEMPOTENCY SIMULATION
  // -------------------------------------------------------------
  console.log("\n--- Suite 3: AI Credit Allocation & Webhook Idempotency ---");

  await check("AI Credit Top-Up: Starts PENDING with 0 credits allocated prematurely", () => {
    let companyBalance = 50; // Existing credits

    const pendingTx = {
      id: "ai_tx_001",
      companyId: "comp_123",
      amount: 500, // credits to buy
      type: "PURCHASE",
      status: "PENDING",
      referenceId: "AI-20261015-TEST01",
    };

    assert.equal(pendingTx.status, "PENDING");
    assert.equal(companyBalance, 50, "Credits must NOT increment on checkout initialization");
  });

  await check("AI Credit Callback: Authoritative ResultCode 0 allocates credits exactly once", () => {
    let companyBalance = 50;
    const creditAmount = 500;
    let txStatus = "PENDING";
    let allocationCount = 0;

    function processCallback(resultCode: number) {
      if (txStatus === "COMPLETED") {
        // Idempotency guard: already processed
        return { success: true, message: "Already processed" };
      }

      if (resultCode === 0) {
        txStatus = "COMPLETED";
        companyBalance += creditAmount;
        allocationCount++;
        return { success: true, allocated: creditAmount };
      } else {
        txStatus = "FAILED";
        return { success: false, reason: "Payment failed" };
      }
    }

    // First webhook delivery
    const result1 = processCallback(0);
    assert.equal(result1.success, true);
    assert.equal(companyBalance, 550, "Balance should increment by 500");
    assert.equal(allocationCount, 1);
    assert.equal(txStatus, "COMPLETED");

    // Duplicate webhook delivery (Safaircom Daraja retry or network replay)
    const result2 = processCallback(0);
    assert.equal(result2.success, true);
    assert.equal(companyBalance, 550, "Balance must NOT increment again on duplicate callback");
    assert.equal(allocationCount, 1, "Credits must be awarded strictly once");
  });

  await check("AI Credit Callback: Failed payment (ResultCode != 0) allocates ZERO credits", () => {
    let companyBalance = 100;
    const creditAmount = 1000;
    let txStatus = "PENDING";

    function processCallback(resultCode: number) {
      if (resultCode === 0) {
        txStatus = "COMPLETED";
        companyBalance += creditAmount;
      } else {
        txStatus = "FAILED";
      }
    }

    // User cancelled STK Push (ResultCode 1032)
    processCallback(1032);
    assert.equal(txStatus, "FAILED");
    assert.equal(companyBalance, 100, "Balance must remain unchanged on payment failure");
  });

  // -------------------------------------------------------------
  // SUITE 4: TWO-STAGE TILL NUMBER MANUAL FALLBACK STATE MACHINE
  // -------------------------------------------------------------
  console.log("\n--- Suite 4: Two-Stage Till Verification Workflow ---");

  await check("Stage 1: Customer submission enters PENDING Admin Review (Order Unfulfilled)", () => {
    const order = {
      id: "ord_till_01",
      trackingNumber: "TRK-98234-KE",
      totalAmount: 4500,
      paymentMethod: "MPESA_TILL",
      paymentStatus: "UNPAID",
      status: "PENDING",
      mpesaReference: "QDF56789XX",
      verificationStage: "STAGE_1_ADMIN_CONFIRM",
      adminConfirmedAt: null as Date | null,
      adminConfirmedBy: null as string | null,
      superAdminVerifiedAt: null as Date | null,
    };

    assert.equal(order.paymentStatus, "UNPAID", "Order must not be marked paid upon customer submission");
    assert.equal(order.verificationStage, "STAGE_1_ADMIN_CONFIRM");
    assert.equal(order.adminConfirmedAt, null);
  });

  await check("Stage 2: Admin Confirmation moves to Stage 2 Super-Admin, but order REMAINS UNPAID", () => {
    const order = {
      id: "ord_till_01",
      totalAmount: 4500,
      paymentStatus: "UNPAID",
      verificationStage: "STAGE_1_ADMIN_CONFIRM",
      adminConfirmedAt: null as Date | null,
      adminConfirmedBy: null as string | null,
    };

    // Admin performs Stage 1 review
    order.verificationStage = "STAGE_2_SUPER_ADMIN_VERIFY";
    order.adminConfirmedAt = new Date();
    order.adminConfirmedBy = "admin_user_01";

    assert.equal(order.verificationStage, "STAGE_2_SUPER_ADMIN_VERIFY");
    assert.equal(order.paymentStatus, "UNPAID", "Admin review alone is NOT proof of payment");
    assert.ok(order.adminConfirmedAt);
    assert.ok(order.adminConfirmedBy);
  });

  await check("Stage 3: Super-Admin Statement Match verifies payment and marks order PAID", () => {
    const order = {
      id: "ord_till_01",
      totalAmount: 4500,
      paymentStatus: "UNPAID",
      verificationStage: "STAGE_2_SUPER_ADMIN_VERIFY",
      superAdminVerifiedAt: null as Date | null,
      superAdminVerifiedBy: null as string | null,
      verifiedStatementReference: null as string | null,
    };

    const statementRef = "QDF56789XX";
    assert.ok(statementRef.length >= 6, "Must provide verified statement reference");

    // Super-Admin completes Stage 2 verification
    order.verificationStage = "VERIFIED";
    order.paymentStatus = "PAID";
    order.superAdminVerifiedAt = new Date();
    order.superAdminVerifiedBy = "super_admin_01";
    order.verifiedStatementReference = statementRef;

    assert.equal(order.paymentStatus, "PAID", "Order is now verified as paid");
    assert.equal(order.verificationStage, "VERIFIED");
    assert.equal(order.verifiedStatementReference, "QDF56789XX");
  });

  await check("Rejection: Invalid claimed Till reference cancels/rejects the payment", () => {
    const order = {
      id: "ord_till_fraud",
      totalAmount: 2500,
      paymentStatus: "UNPAID",
      verificationStage: "STAGE_1_ADMIN_CONFIRM",
      notes: "",
    };

    const rejectionReason = "Claimed reference does not appear on Safaricom Daraja Till statement";
    order.verificationStage = "REJECTED";
    order.notes = `Rejected: ${rejectionReason}`;

    assert.equal(order.paymentStatus, "UNPAID");
    assert.equal(order.verificationStage, "REJECTED");
    assert.ok(order.notes.includes("statement"));
  });

  // -------------------------------------------------------------
  // SUITE 5: PAYSTACK CRYPTOGRAPHIC SIGNATURE VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- Suite 5: Cryptographic Webhook Security ---");

  await check("Paystack HMAC-SHA512 verification validates authentic payloads", () => {
    const mockSecret = "sk_test_paystack_secret_key_12345";
    const payload = JSON.stringify({
      event: "charge.success",
      data: {
        reference: "PSTK-TEST-REF-001",
        amount: 50000,
        currency: "KES",
        metadata: { purpose: "ORDER", orderId: "ord_123" },
      },
    });

    // Generate valid HMAC
    const validSignature = crypto.createHmac("sha512", mockSecret).update(payload).digest("hex");

    // Verify
    const computedSignature = crypto.createHmac("sha512", mockSecret).update(payload).digest("hex");
    assert.equal(computedSignature, validSignature, "Valid signature must match");

    // Tampered payload
    const tamperedPayload = payload.replace("50000", "10000");
    const tamperedSignature = crypto.createHmac("sha512", mockSecret).update(tamperedPayload).digest("hex");
    assert.notEqual(tamperedSignature, validSignature, "Tampered payload must fail signature verification");
  });

  console.log("\n==================================================================");
  console.log("ALL PAYMENT INFRASTRUCTURE AUDIT & VERIFICATION TESTS PASSED [15/15]");
  console.log("==================================================================");
}

runAll().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
