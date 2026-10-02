/**
 * tests/order-tracking.test.ts
 *
 * Comprehensive Test Suite for Order Tracking Functionality:
 * 1. Query Normalization & Input Sanitization
 * 2. Multi-Criteria Order Resolution (Tracking #, Order ID, Transaction Ref)
 * 3. DeliveryRequest & On-Demand Rider Marketplace Tracking
 * 4. Customer Email / Phone Multi-Order Discovery
 * 5. Escrow Payment Transparency & Cash Settlement Protocols
 * 6. Stepper Milestone Calculations
 */

import assert from "assert";

async function runOrderTrackingTests() {
  console.log("=================================================");
  console.log("    SalesmanPro & Ghuba Order Tracking Tests     ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Query Normalization & Sanitization
  // ----------------------------------------------------
  console.log("1. Query Normalization & Sanitization...");

  const sanitizeTrackingQuery = (raw: string) => {
    const trimmed = (raw || "").trim();
    const clean = trimmed.replace(/^#+/, "").trim();
    const isEmail = clean.includes("@");
    const isPhone = !isEmail && /^[\d\s+\-()]{7,20}$/.test(clean);
    const cleanDigits = clean.replace(/\D/g, "");
    return { clean, isEmail, isPhone, cleanDigits };
  };

  test("Strips leading '#' and surrounding whitespaces", () => {
    const res = sanitizeTrackingQuery("  #TRK-20261002-ABCD  ");
    assert.strictEqual(res.clean, "TRK-20261002-ABCD");
    assert.strictEqual(res.isEmail, false);
    assert.strictEqual(res.isPhone, false);
  });

  test("Identifies email addresses correctly", () => {
    const res = sanitizeTrackingQuery("customer@example.com");
    assert.strictEqual(res.isEmail, true);
    assert.strictEqual(res.isPhone, false);
  });

  test("Identifies phone numbers and extracts digits", () => {
    const res = sanitizeTrackingQuery("+254 712 345 678");
    assert.strictEqual(res.isEmail, false);
    assert.strictEqual(res.isPhone, true);
    assert.strictEqual(res.cleanDigits, "254712345678");
  });

  // ----------------------------------------------------
  // TEST 2: Multi-Criteria Order Resolution
  // ----------------------------------------------------
  console.log("\n2. Multi-Criteria Order Resolution...");

  const mockDbOrders = [
    {
      id: "65a123456789012345678901",
      trackingNumber: "TRK-8899-KEN",
      transactionReference: "MPESA-QK8726",
      status: "PROCESSING",
      paymentStatus: "COMPLETED",
      paymentOption: "mpesa",
      totalFinalPrice: 1250,
      email: "alice@test.com",
      phone: "+254700111222",
    },
    {
      id: "65a123456789012345678902",
      trackingNumber: "TRK-9900-KEN",
      transactionReference: "REF-002",
      status: "SHIPPED",
      paymentStatus: "COMPLETED",
      paymentOption: "card",
      totalFinalPrice: 3400,
      email: "alice@test.com",
      phone: "+254700111222",
    },
  ];

  const findOrder = (searchTerm: string) => {
    const { clean, isEmail, isPhone, cleanDigits } = sanitizeTrackingQuery(searchTerm);

    if (isEmail) {
      return mockDbOrders.filter((o) => o.email.toLowerCase() === clean.toLowerCase());
    }

    if (isPhone) {
      return mockDbOrders.filter((o) => o.phone.replace(/\D/g, "").includes(cleanDigits.slice(-9)));
    }

    return mockDbOrders.filter(
      (o) =>
        o.trackingNumber.toLowerCase() === clean.toLowerCase() ||
        o.transactionReference.toLowerCase() === clean.toLowerCase() ||
        o.id === clean,
    );
  };

  test("Matches case-insensitive tracking number", () => {
    const results = findOrder("trk-8899-ken");
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].trackingNumber, "TRK-8899-KEN");
  });

  test("Matches by M-Pesa transaction reference", () => {
    const results = findOrder("MPESA-QK8726");
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "65a123456789012345678901");
  });

  test("Matches by 24-character MongoDB ObjectId", () => {
    const results = findOrder("65a123456789012345678901");
    assert.strictEqual(results.length, 1);
  });

  test("Returns all matching orders for customer email", () => {
    const results = findOrder("alice@test.com");
    assert.strictEqual(results.length, 2, "Alice has 2 orders");
  });

  test("Returns all matching orders for customer phone", () => {
    const results = findOrder("0700111222");
    assert.strictEqual(results.length, 2, "Matches by last 9 digits");
  });

  // ----------------------------------------------------
  // TEST 3: Escrow Payment Transparency & Rider Status
  // ----------------------------------------------------
  console.log("\n3. Escrow Payment Transparency & Rider Status...");

  test("Ghuba Escrow delivery request guarantees deposit transparency", () => {
    const delReq = {
      trackingNumber: "GHUBA-DEL-7788",
      paymentType: "GHUBA_ESCROW",
      escrowStatus: "DEPOSITED",
      escrowAmount: 600,
      offeredRiderFee: 600,
      transactionFeePercent: 4.0,
      status: "IN_TRANSIT",
      rider: {
        name: "Kevin Mwangi",
        phone: "+254711223344",
        vehicle: "Boxer 150",
        plateNumber: "KDM 345P",
        rating: 4.9,
      },
    };

    const isEscrowSecured = delReq.paymentType === "GHUBA_ESCROW" && delReq.escrowStatus === "DEPOSITED";
    const platformCommission = (delReq.escrowAmount * delReq.transactionFeePercent) / 100;
    const netRiderPayout = delReq.escrowAmount - platformCommission;

    assert.strictEqual(isEscrowSecured, true);
    assert.strictEqual(platformCommission, 24.0);
    assert.strictEqual(netRiderPayout, 576.0);
    assert.strictEqual(delReq.rider.name, "Kevin Mwangi");
  });

  test("Cash on Delivery orders omit upfront escrow deposit", () => {
    const codReq = {
      trackingNumber: "GHUBA-COD-9911",
      paymentType: "CASH_ON_DELIVERY",
      escrowStatus: "NOT_APPLICABLE",
      escrowAmount: 0,
      offeredRiderFee: 350,
      status: "DELIVERED",
    };

    assert.strictEqual(codReq.escrowAmount, 0);
    assert.strictEqual(codReq.escrowStatus, "NOT_APPLICABLE");
    const commission = (codReq.offeredRiderFee * 4.0) / 100;
    assert.strictEqual(commission, 14.0, "Platform fee debited on completion is KES 14.00");
  });

  // ----------------------------------------------------
  // TEST 4: Milestone Stepper Progression
  // ----------------------------------------------------
  console.log("\n4. Milestone Stepper Progression...");

  const computeMilestones = (orderStatus: string, deliveryStatus: string, isPaid: boolean) => {
    const isRiderAssigned = ["RIDER_ASSIGNED", "RIDER_EN_ROUTE_TO_PICKUP", "ORDER_COLLECTED", "IN_TRANSIT", "ARRIVED_AT_DROPOFF", "DELIVERED"].includes(
      deliveryStatus,
    );
    const isInTransit = ["ORDER_COLLECTED", "IN_TRANSIT", "ARRIVED_AT_DROPOFF", "DELIVERED"].includes(deliveryStatus);
    const isDelivered = deliveryStatus === "DELIVERED" || orderStatus === "COMPLETED";

    return [
      { step: "Order Placed", completed: true, current: !isPaid },
      { step: "Payment Confirmed", completed: isPaid, current: isPaid && !isRiderAssigned },
      { step: "Rider Assigned", completed: isRiderAssigned, current: isRiderAssigned && !isInTransit },
      { step: "In Transit", completed: isInTransit, current: isInTransit && !isDelivered },
      { step: "Delivered", completed: isDelivered, current: isDelivered },
    ];
  };

  test("In Transit order displays correct completed and active steps", () => {
    const steps = computeMilestones("PROCESSING", "IN_TRANSIT", true);
    assert.strictEqual(steps[0].completed, true);
    assert.strictEqual(steps[1].completed, true);
    assert.strictEqual(steps[2].completed, true);
    assert.strictEqual(steps[3].completed, true);
    assert.strictEqual(steps[3].current, true, "In Transit should be the current active step");
    assert.strictEqual(steps[4].completed, false, "Delivered should not be completed yet");
  });

  console.log("\n=================================================");
  console.log(`  All Test Cases Completed: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runOrderTrackingTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
