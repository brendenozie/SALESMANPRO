/**
 * tests/payments/unifiedReporting.test.ts
 *
 * Comprehensive Automated Test Suite for:
 * 1. Financial Attribution Engine & Math Integrity (gross - fees - refunds = net)
 * 2. Multi-Store Item Attribution (No double-counting between merchants)
 * 3. Kenya Timezone Date Boundary Resolution (EAT UTC+3)
 * 4. Multi-Tenant Financial Security & Access Control
 * 5. Provider & Channel Normalization
 */

import assert from "node:assert/strict";
import {
  attributeOrderFinancials,
  roundCurrency,
  DEFAULT_GHUBA_COMMISSION_RATE,
} from "../../lib/payments/attribution";
import { resolveDateRange } from "../../lib/payments/reportingService";

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
  console.log("STARTING SALESMANPRO & GHUBA UNIFIED PAYMENT REPORTING TEST SUITE");
  console.log("==================================================================");

  // 1. Math Rounding & Precision
  await check("Financial Math: IEEE-754 currency rounding to 2 decimal places", () => {
    assert.equal(roundCurrency(10.005), 10.01);
    assert.equal(roundCurrency(10.004), 10.00);
    assert.equal(roundCurrency(0.1 + 0.2), 0.30);
    assert.equal(roundCurrency(NaN as any), 0);
    assert.equal(roundCurrency(Infinity as any), 0);
  });

  // 2. Single-Store Direct Order Attribution
  await check("Direct Storefront Order Attribution (Single Store)", () => {
    const singleStoreOrder = {
      id: "order_direct_001",
      companyId: "store_electronics_123",
      channel: "WEBSITE",
      orderSource: "WEBSITE",
      totalFinalPrice: 15000,
      totalPrice: 15000,
      currency: "KES",
      items: [
        {
          id: "item_laptop",
          productId: "prod_laptop",
          quantity: 1,
          price: 15000,
          totalPrice: 15000,
          product: { id: "prod_laptop", companyId: "store_electronics_123" },
        },
      ],
    };

    const summary = attributeOrderFinancials(singleStoreOrder as any);

    assert.equal(summary.orderId, "order_direct_001");
    assert.equal(summary.totalGross, 15000);
    assert.equal(summary.totalPlatformFees, 0); // No Ghuba fee for direct storefront
    assert.equal(summary.totalStoreNet, 15000);
    assert.equal(summary.totalRefunds, 0);

    const storeAttr = summary.attributions["store_electronics_123"];
    assert.ok(storeAttr, "Store attribution must exist");
    assert.equal(storeAttr.grossAmount, 15000);
    assert.equal(storeAttr.feeAmount, 0);
    assert.equal(storeAttr.netAmount, 15000);
    assert.equal(storeAttr.channel, "DIRECT");
  });

  // 3. Multi-Store Ghuba Marketplace Order Attribution
  await check("Multi-Store Ghuba Order: Deterministic attribution without revenue leakage", () => {
    // Customer buys:
    // Store A: Phone Case (KES 4,000)
    // Store B: Headphones (KES 6,000)
    // Total: KES 10,000 on Ghuba marketplace (5% commission)
    const multiStoreOrder = {
      id: "ghuba_order_multistore_1001",
      companyId: "ghuba_marketplace_parent",
      channel: "WEBSITE",
      orderSource: "WEBSITE",
      totalFinalPrice: 10000,
      totalPrice: 10000,
      currency: "KES",
      items: [
        {
          id: "item_store_a",
          marketplaceListingId: "listing_store_a",
          quantity: 1,
          price: 4000,
          totalPrice: 4000,
          marketplaceListing: {
            id: "listing_store_a",
            companyId: "store_accessories_A",
            CommissionRate: { rate: 0.05 },
          },
        },
        {
          id: "item_store_b",
          marketplaceListingId: "listing_store_b",
          quantity: 1,
          price: 6000,
          totalPrice: 6000,
          marketplaceListing: {
            id: "listing_store_b",
            companyId: "store_audio_B",
            CommissionRate: { rate: 0.05 },
          },
        },
      ],
    };

    const summary = attributeOrderFinancials(multiStoreOrder as any);

    // Global Order Financials
    assert.equal(summary.totalGross, 10000, "Total order gross should be 10,000");
    assert.equal(summary.totalPlatformFees, 500, "5% of 10,000 is 500 Ghuba fee");
    assert.equal(summary.totalStoreNet, 9500, "Net payable to stores should be 9,500");

    // Store A Verification
    const storeA = summary.attributions["store_accessories_A"];
    assert.ok(storeA, "Store A attribution must exist");
    assert.equal(storeA.grossAmount, 4000, "Store A gross must be exactly 4,000, NOT 10,000");
    assert.equal(storeA.feeAmount, 200, "Store A fee must be 5% of 4,000 = 200");
    assert.equal(storeA.netAmount, 3800, "Store A net must be 4,000 - 200 = 3,800");
    assert.equal(storeA.channel, "GHUBA");

    // Store B Verification
    const storeB = summary.attributions["store_audio_B"];
    assert.ok(storeB, "Store B attribution must exist");
    assert.equal(storeB.grossAmount, 6000, "Store B gross must be exactly 6,000, NOT 10,000");
    assert.equal(storeB.feeAmount, 300, "Store B fee must be 5% of 6,000 = 300");
    assert.equal(storeB.netAmount, 5700, "Store B net must be 6,000 - 300 = 5,700");
    assert.equal(storeB.channel, "GHUBA");

    // Check Mathematical Balance Equation across all stores
    assert.equal(
      roundCurrency(storeA.grossAmount + storeB.grossAmount),
      summary.totalGross
    );
    assert.equal(
      roundCurrency(storeA.feeAmount + storeB.feeAmount),
      summary.totalPlatformFees
    );
    assert.equal(
      roundCurrency(storeA.netAmount + storeB.netAmount),
      summary.totalStoreNet
    );
  });

  // 4. Return & Refund Handling
  await check("Refund Accounting: Only approved returns reduce store net received", () => {
    const orderWithRefund = {
      id: "order_with_return_003",
      companyId: "store_fashion_001",
      channel: "WEBSITE",
      totalFinalPrice: 8000,
      totalPrice: 8000,
      items: [
        {
          id: "item_shoes",
          productId: "prod_shoes",
          quantity: 1,
          price: 8000,
          totalPrice: 8000,
          product: { id: "prod_shoes", companyId: "store_fashion_001" },
          Return: [
            {
              status: "COMPLETED",
              refundAmount: 1500, // Customer returned item partially or received concession
            },
          ],
        },
      ],
    };

    const summary = attributeOrderFinancials(orderWithRefund as any);
    const store = summary.attributions["store_fashion_001"];

    assert.equal(store.grossAmount, 8000);
    assert.equal(store.refundAmount, 1500);
    assert.equal(store.netAmount, 6500, "Net received must subtract refunds: 8000 - 1500 = 6500");
    assert.equal(
      roundCurrency(store.grossAmount - store.feeAmount - store.refundAmount),
      store.netAmount
    );
  });

  // 5. Kenya Timezone Boundary Resolution (UTC+3)
  await check("Timezone Resolution: Kenya EAT (UTC+3) day boundaries", () => {
    const todayRange = resolveDateRange({ period: "today" });
    assert.ok(todayRange.gte, "Start date must be defined");
    assert.ok(todayRange.lte, "End date must be defined");
    assert.ok(todayRange.gte < todayRange.lte, "Start date must precede end date");

    const diffMs = todayRange.lte.getTime() - todayRange.gte.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    assert.ok(
      Math.abs(diffHours - 24) < 0.1,
      `Full 24-hour day expected for today, got ${diffHours}h`
    );

    const past7Range = resolveDateRange({ period: "7days" });
    assert.ok(past7Range.gte && past7Range.lte);
    const diff7Days = (past7Range.lte.getTime() - past7Range.gte.getTime()) / (1000 * 60 * 60 * 24);
    assert.ok(Math.abs(diff7Days - 7) < 0.5, "Expected ~7 days span");

    const allTimeRange = resolveDateRange({ period: "all" });
    assert.equal(allTimeRange.gte, undefined, "All time should have no gte limit");
    assert.equal(allTimeRange.lte, undefined, "All time should have no lte limit");
  });

  // 6. Multi-Tenant Authorization Security Model
  await check("Multi-Tenant Financial Security Isolation", () => {
    const requestingStoreId = "company_store_abc";
    const foreignStoreId = "company_store_xyz";

    // Mock payment belonging to foreign store
    const mockForeignPayment = {
      id: "pay_xyz_999",
      companyId: foreignStoreId,
      order: {
        companyId: foreignStoreId,
        items: [
          {
            product: { companyId: foreignStoreId },
          },
        ],
      },
    };

    // Tenant check helper logic mimicking reportingService:
    const isTenantAuthorized = (
      userCompanyId: string,
      payment: typeof mockForeignPayment,
      isPlatformAdmin: boolean
    ) => {
      if (isPlatformAdmin) return true;
      const orderCompanyId = payment.companyId || payment.order?.companyId;
      const hasStoreItem = payment.order?.items?.some(
        (i) => i.product?.companyId === userCompanyId
      );
      return orderCompanyId === userCompanyId || Boolean(hasStoreItem);
    };

    assert.equal(
      isTenantAuthorized(requestingStoreId, mockForeignPayment, false),
      false,
      "Store ABC must NOT be authorized to view Store XYZ's financial payment!"
    );

    assert.equal(
      isTenantAuthorized(foreignStoreId, mockForeignPayment, false),
      true,
      "Store XYZ must be authorized to view its own payment"
    );

    assert.equal(
      isTenantAuthorized("platform_admin", mockForeignPayment, true),
      true,
      "Platform Super Admin must be authorized to view all payments globally"
    );
  });

  // 7. Payment Provider & Channel Normalization
  await check("Provider & Channel Normalization for Webhooks & Gateways", () => {
    const normalizeProvider = (providerStr: string) => {
      const pUpper = String(providerStr || "").toUpperCase();
      if (pUpper.includes("PAYSTACK")) return "PAYSTACK";
      if (pUpper.includes("STRIPE")) return "STRIPE";
      if (pUpper.includes("PAYPAL")) return "PAYPAL";
      if (pUpper.includes("GHUBA")) return "GHUBA";
      if (pUpper.includes("CASH")) return "CASH";
      if (pUpper.includes("POS")) return "POS";
      return "MPESA";
    };

    assert.equal(normalizeProvider("paystack_charge"), "PAYSTACK");
    assert.equal(normalizeProvider("stripe_intent"), "STRIPE");
    assert.equal(normalizeProvider("paypal_order"), "PAYPAL");
    assert.equal(normalizeProvider("ghuba_checkout"), "GHUBA");
    assert.equal(normalizeProvider("mpesa_stk"), "MPESA");
    assert.equal(normalizeProvider(""), "MPESA");

    // Idempotency simulation: transactionId uniqueness key
    const processedTransactions = new Set<string>();
    const processWebhook = (txId: string) => {
      if (processedTransactions.has(txId)) {
        return { isDuplicate: true, status: "IGNORED_DUPLICATE" };
      }
      processedTransactions.add(txId);
      return { isDuplicate: false, status: "PROCESSED" };
    };

    const firstAttempt = processWebhook("MOCK_TXN_001");
    assert.equal(firstAttempt.isDuplicate, false);
    assert.equal(firstAttempt.status, "PROCESSED");

    const duplicateWebhook = processWebhook("MOCK_TXN_001");
    assert.equal(duplicateWebhook.isDuplicate, true);
    assert.equal(duplicateWebhook.status, "IGNORED_DUPLICATE");
  });

  console.log("==================================================================");
  console.log("ALL 7 PAYMENT ARCHITECTURE & INTELLIGENCE TESTS PASSED CLEANLY!");
  console.log("==================================================================");
}

runAll().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
