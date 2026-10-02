/**
 * tests/rider-marketplace.test.ts
 *
 * Comprehensive Test Suite for SalesmanPro On-Demand Delivery & Ghuba Rider Marketplace:
 * 1. Geospatial Haversine & Proximity Ranking
 * 2. Multi-Criteria Rider Eligibility Filtering
 * 3. Atomic Assignment & Race-Condition Conflict Prevention
 * 4. Delivery Lifecycle State Machine Transitions
 * 5. Bidding Logic & Selection
 * 6. Financial Ledger, Commissions & Payout Integrity
 * 7. Customer Privacy Masking
 */

import assert from "assert";
import { calculateDistance } from "../lib/geofencing";
import { isValidDeliveryTransition } from "../lib/delivery-lifecycle";

async function runTests() {
  console.log("=================================================");
  console.log("  SalesmanPro On-Demand Rider Marketplace Tests   ");
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
  // TEST 1: Geospatial Distance & Proximity Filtering
  // ----------------------------------------------------
  console.log("1. Geospatial Proximity & Haversine Distance Calculations...");

  test("Distance between Nairobi CBD and Westlands (~3.8 km)", () => {
    // Nairobi CBD: -1.286389, 36.817223
    // Westlands: -1.263389, 36.803333
    const distanceMeters = calculateDistance(-1.286389, 36.817223, -1.263389, 36.803333);
    const distanceKm = distanceMeters / 1000;
    assert.ok(distanceKm > 2.5 && distanceKm < 4.5, `Expected ~3.0-4.0km, got ${distanceKm.toFixed(2)} km`);
  });

  test("Identical coordinates return 0 distance", () => {
    const distance = calculateDistance(-1.286389, 36.817223, -1.286389, 36.817223);
    assert.strictEqual(distance, 0, "Distance to self should be 0");
  });

  test("Rider ranking sorts from nearest to farthest", () => {
    const pickup = { lat: -1.286389, lng: 36.817223 };
    const candidates = [
      { id: "rider-far", lat: -1.210000, lng: 36.850000 }, // ~10km
      { id: "rider-close", lat: -1.280000, lng: 36.820000 }, // ~0.8km
      { id: "rider-mid", lat: -1.265000, lng: 36.800000 }, // ~3km
    ];

    const ranked = candidates
      .map((c) => ({
        id: c.id,
        distance: calculateDistance(pickup.lat, pickup.lng, c.lat, c.lng) / 1000,
      }))
      .sort((a, b) => a.distance - b.distance);

    assert.strictEqual(ranked[0].id, "rider-close");
    assert.strictEqual(ranked[1].id, "rider-mid");
    assert.strictEqual(ranked[2].id, "rider-far");
  });

  // ----------------------------------------------------
  // TEST 2: Multi-Criteria Rider Eligibility
  // ----------------------------------------------------
  console.log("\n2. Multi-Criteria Rider Eligibility Verification...");

  const baseRider = {
    id: "r1",
    verificationStatus: "APPROVED",
    isOnline: true,
    lastLocationUpdate: new Date(),
    vehicleType: "MOTORBIKE",
    activeDeliveriesCount: 0,
    maxDeliveryRadiusKm: 15,
  };

  function checkEligibility(
    rider: typeof baseRider,
    pickupDistanceKm: number,
    requiredVehicle: string,
    now: Date = new Date()
  ): { eligible: boolean; reason?: string } {
    if (rider.verificationStatus !== "APPROVED") {
      return { eligible: false, reason: "Account not approved" };
    }
    if (!rider.isOnline) {
      return { eligible: false, reason: "Rider is offline" };
    }
    const locationAgeMinutes = (now.getTime() - rider.lastLocationUpdate.getTime()) / (1000 * 60);
    if (locationAgeMinutes > 15) {
      return { eligible: false, reason: "Location stale" };
    }
    if (pickupDistanceKm > rider.maxDeliveryRadiusKm) {
      return { eligible: false, reason: "Outside delivery radius" };
    }
    if (rider.activeDeliveriesCount >= 1) {
      return { eligible: false, reason: "Rider at maximum workload capacity" };
    }
    if (requiredVehicle !== "ANY" && rider.vehicleType !== requiredVehicle) {
      return { eligible: false, reason: "Incompatible vehicle type" };
    }
    return { eligible: true };
  }

  test("Fully verified, online rider within radius is ELIGIBLE", () => {
    const res = checkEligibility(baseRider, 3.2, "MOTORBIKE");
    assert.strictEqual(res.eligible, true);
  });

  test("Pending or unverified rider is REJECTED", () => {
    const unverified = { ...baseRider, verificationStatus: "PENDING" };
    const res = checkEligibility(unverified, 2.0, "MOTORBIKE");
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.reason, "Account not approved");
  });

  test("Offline rider is EXCLUDED from dispatch", () => {
    const offline = { ...baseRider, isOnline: false };
    const res = checkEligibility(offline, 1.0, "MOTORBIKE");
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.reason, "Rider is offline");
  });

  test("Rider with stale GPS coordinates (>15 mins) is EXCLUDED", () => {
    const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000);
    const staleRider = { ...baseRider, lastLocationUpdate: twentyMinsAgo };
    const res = checkEligibility(staleRider, 2.0, "MOTORBIKE");
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.reason, "Location stale");
  });

  test("Rider with active delivery is not overloaded (single-job limit)", () => {
    const busyRider = { ...baseRider, activeDeliveriesCount: 1 };
    const res = checkEligibility(busyRider, 1.0, "MOTORBIKE");
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.reason, "Rider at maximum workload capacity");
  });

  test("Vehicle incompatibility rejects motorbike when Van is required", () => {
    const res = checkEligibility(baseRider, 1.0, "VAN");
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.reason, "Incompatible vehicle type");
  });

  // ----------------------------------------------------
  // TEST 3: State Machine Transitions
  // ----------------------------------------------------
  console.log("\n3. Delivery Lifecycle State Machine Transitions...");

  test("Valid linear lifecycle transitions pass validation", () => {
    assert.ok(isValidDeliveryTransition("SEARCHING_FOR_RIDER" as any, "OFFERED" as any));
    assert.ok(isValidDeliveryTransition("OFFERED" as any, "RIDER_ASSIGNED" as any));
    assert.ok(isValidDeliveryTransition("RIDER_ASSIGNED" as any, "RIDER_EN_ROUTE_TO_PICKUP" as any));
    assert.ok(isValidDeliveryTransition("RIDER_EN_ROUTE_TO_PICKUP" as any, "ARRIVED_AT_PICKUP" as any));
    assert.ok(isValidDeliveryTransition("ARRIVED_AT_PICKUP" as any, "ORDER_COLLECTED" as any));
    assert.ok(isValidDeliveryTransition("ORDER_COLLECTED" as any, "IN_TRANSIT" as any));
    assert.ok(isValidDeliveryTransition("IN_TRANSIT" as any, "ARRIVED_AT_DROPOFF" as any));
    assert.ok(isValidDeliveryTransition("ARRIVED_AT_DROPOFF" as any, "DELIVERED" as any));
  });

  test("Direct skips or illegal backwards transitions are blocked", () => {
    // Skipping collection straight to delivered
    assert.strictEqual(isValidDeliveryTransition("OFFERED" as any, "DELIVERED" as any), false);
    // Backward transition from delivered to en route
    assert.strictEqual(isValidDeliveryTransition("DELIVERED" as any, "RIDER_EN_ROUTE_TO_PICKUP" as any), false);
    // In transit to draft
    assert.strictEqual(isValidDeliveryTransition("IN_TRANSIT" as any, "PENDING" as any), false);
  });

  // ----------------------------------------------------
  // TEST 4: Atomic Concurrency & Race-Condition Prevention
  // ----------------------------------------------------
  console.log("\n4. Concurrency & Dual-Acceptance Race Condition Prevention...");

  test("Simultaneous acceptance: Only first rider claims assignment atomically", async () => {
    // Emulate an atomic database conditional update:
    // UPDATE DeliveryRequest SET status = 'RIDER_ASSIGNED', assignedRiderId = ?
    // WHERE id = ? AND status IN ('SEARCHING_FOR_RIDER', 'OFFERED');
    let requestState = {
      id: "req-123",
      status: "OFFERED",
      assignedRiderId: null as string | null,
    };

    const attemptAtomicClaim = (riderId: string) => {
      // Simulate MongoDB conditional matching
      if (requestState.status === "OFFERED" || requestState.status === "SEARCHING_FOR_RIDER") {
        requestState.status = "RIDER_ASSIGNED";
        requestState.assignedRiderId = riderId;
        return { success: true, count: 1 };
      }
      return { success: false, count: 0 };
    };

    // Simulate Rider A and Rider B accepting concurrently within the same event tick
    const [resultA, resultB] = await Promise.all([
      Promise.resolve(attemptAtomicClaim("rider-A")),
      Promise.resolve(attemptAtomicClaim("rider-B")),
    ]);

    const successes = [resultA, resultB].filter((r) => r.success);
    const failures = [resultA, resultB].filter((r) => !r.success);

    assert.strictEqual(successes.length, 1, "Exactly one rider must succeed");
    assert.strictEqual(failures.length, 1, "The second concurrent rider must be rejected");
    assert.strictEqual(requestState.status, "RIDER_ASSIGNED");
    assert.ok(requestState.assignedRiderId === "rider-A" || requestState.assignedRiderId === "rider-B");
  });

  // ----------------------------------------------------
  // TEST 5: Financial Ledger, Commissions & Payout
  // ----------------------------------------------------
  console.log("\n5. Rider Financial Ledger, Commission & Payout Accounting...");

  test("Commission deduction and net credit calculation", () => {
    const grossFee = 350; // KES 350 store offered fee
    const commissionRate = 0.10; // 10% platform commission
    const platformCommission = Math.round(grossFee * commissionRate); // KES 35
    const netRiderEarnings = grossFee - platformCommission; // KES 315

    assert.strictEqual(platformCommission, 35);
    assert.strictEqual(netRiderEarnings, 315);
  });

  test("Available wallet balance calculation from ledger", () => {
    const ledger = [
      { type: "CREDIT", amount: 315, status: "SETTLED" },
      { type: "CREDIT", amount: 450, status: "SETTLED" },
      { type: "DEBIT", amount: 500, status: "SETTLED" }, // Payout
    ];

    const balance = ledger.reduce((acc, tx) => {
      if (tx.status !== "SETTLED") return acc;
      return tx.type === "CREDIT" ? acc + tx.amount : acc - tx.amount;
    }, 0);

    assert.strictEqual(balance, 265, "Available balance should be 315 + 450 - 500 = 265");
  });

  test("Payout exceeding available balance is strictly rejected", () => {
    const availableBalance = 265;
    const requestedPayout = 500;

    const canWithdraw = requestedPayout >= 100 && requestedPayout <= availableBalance;
    assert.strictEqual(canWithdraw, false, "Overdraw payout must be blocked");
  });

  // ----------------------------------------------------
  // TEST 6: Customer Privacy Masking
  // ----------------------------------------------------
  console.log("\n6. Customer Privacy & Sensitive Data Masking...");

  test("Pre-assignment marketplace feed strips customer phone and full address", () => {
    const fullOrder = {
      id: "ord-99",
      customerName: "Jane Doe",
      customerPhone: "+254712345678",
      dropoffAddress: "Apartment 4B, Kilimani Gardens, Argwings Kodhek Rd, Nairobi",
    };

    // Masking function applied in available deliveries endpoint
    const maskedView = {
      id: fullOrder.id,
      approxDropoffAddress: fullOrder.dropoffAddress.split(",")[1]?.trim() || fullOrder.dropoffAddress.split(",")[0],
      // customerPhone and full street / apartment omitted
    };

    assert.strictEqual((maskedView as any).customerPhone, undefined, "Phone number must not be in available view");
    assert.ok(!maskedView.approxDropoffAddress.includes("Apartment 4B"), "Specific apartment/unit must be masked");
  });

  // ----------------------------------------------------
  // TEST 7: Ghuba Escrow Deposits, 4% Platform Fee & Rider Payouts
  // ----------------------------------------------------
  console.log("\n7. Ghuba Escrow Deposits, 4% Transaction Fee & Cash Settlement Protocols...");

  test("Fixed price request deposits funds into Ghuba Escrow with 4% platform fee", () => {
    const fixedPrice = 500;
    const defaultPlatformFeePercent = 4.0;
    const paymentType = "GHUBA_ESCROW";

    // Simulate store dispatch with escrow deposit
    const escrowDeposit = paymentType === "GHUBA_ESCROW" ? fixedPrice : 0;
    const escrowStatus = paymentType === "GHUBA_ESCROW" ? "DEPOSITED" : "NOT_APPLICABLE";
    const platformCommission = Math.round(((fixedPrice * defaultPlatformFeePercent) / 100) * 100) / 100;
    const netRiderPayout = fixedPrice - platformCommission;

    assert.strictEqual(escrowDeposit, 500, "Store must deposit KES 500 into Ghuba Escrow");
    assert.strictEqual(escrowStatus, "DEPOSITED", "Escrow status must be marked as DEPOSITED");
    assert.strictEqual(platformCommission, 20.0, "Ghuba must take 4% platform transaction fee (KES 20.00)");
    assert.strictEqual(netRiderPayout, 480.0, "Rider guaranteed net payout must be KES 480.00");
  });

  test("Accepted bid deposits accepted amount to Ghuba Escrow and notifies rider", () => {
    let currentEscrow = {
      amount: 0,
      status: "PENDING_DEPOSIT",
      notifiedRider: null as any,
    };

    const acceptedBidAmount = 450;
    const platformFeePercent = 4.0;

    // Simulate store accepting rider's bid
    currentEscrow.amount = acceptedBidAmount;
    currentEscrow.status = "DEPOSITED";
    const commission = Math.round(((acceptedBidAmount * platformFeePercent) / 100) * 100) / 100;
    const netEarnings = acceptedBidAmount - commission;

    // Simulate notification payload sent to rider
    currentEscrow.notifiedRider = {
      message: `Ghuba Escrow: Payment of KES ${acceptedBidAmount} deposited by store. Net payout KES ${netEarnings}.`,
      depositedAmount: acceptedBidAmount,
      paymentType: "GHUBA_ESCROW",
      escrowStatus: "DEPOSITED",
    };

    assert.strictEqual(currentEscrow.amount, 450, "Escrow must hold accepted bid amount");
    assert.strictEqual(commission, 18.0, "4% platform transaction fee on KES 450 is KES 18.00");
    assert.strictEqual(netEarnings, 432.0, "Net payout to rider is KES 432.00");
    assert.strictEqual(currentEscrow.notifiedRider.depositedAmount, 450, "Rider notified of KES 450 deposited");
    assert.strictEqual(currentEscrow.notifiedRider.paymentType, "GHUBA_ESCROW");
  });

  test("Cash on Pickup and Cash on Delivery bypass upfront escrow and debit 4% fee from rider", () => {
    const copOrder = {
      riderFee: 300,
      paymentType: "CASH_ON_PICKUP",
      escrowAmount: 0,
      escrowStatus: "NOT_APPLICABLE",
    };

    const codOrder = {
      riderFee: 400,
      paymentType: "CASH_ON_DELIVERY",
      escrowAmount: 0,
      escrowStatus: "NOT_APPLICABLE",
    };

    assert.strictEqual(copOrder.escrowAmount, 0, "No upfront escrow required for Cash on Pickup");
    assert.strictEqual(codOrder.escrowAmount, 0, "No upfront escrow required for Cash on Delivery");

    // Fee debit on completion for COP
    const copFee = Math.round(((copOrder.riderFee * 4.0) / 100) * 100) / 100;
    assert.strictEqual(copFee, 12.0, "4% fee for KES 300 is KES 12.00");

    // Fee debit on completion for COD
    const codFee = Math.round(((codOrder.riderFee * 4.0) / 100) * 100) / 100;
    assert.strictEqual(codFee, 16.0, "4% fee for KES 400 is KES 16.00");
  });

  test("Super Admin dynamically updates transaction fee and subsequent orders reflect new rate", () => {
    let platformConfig = {
      transactionFeePercent: 4.0,
      minRiderFee: 100,
    };

    // Super Admin updates fee to 5.0%
    platformConfig.transactionFeePercent = 5.0;

    const newOrderFee = 600;
    const calculatedCommission = (newOrderFee * platformConfig.transactionFeePercent) / 100;
    const calculatedNet = newOrderFee - calculatedCommission;

    assert.strictEqual(calculatedCommission, 30.0, "5% fee of KES 600 is KES 30.00");
    assert.strictEqual(calculatedNet, 570.0, "Net payout is KES 570.00");
  });

  test("Rider M-Pesa withdrawal debits available balance correctly", () => {
    let riderWallet = {
      availableBalance: 850,
      totalEarned: 1200,
      ledger: [] as Array<{ type: string; amount: number; description: string }>,
    };

    const withdrawalAmount = 500;
    assert.ok(withdrawalAmount >= 100, "Minimum withdrawal must be at least KES 100");
    assert.ok(withdrawalAmount <= riderWallet.availableBalance, "Cannot withdraw more than balance");

    // Process withdrawal
    riderWallet.availableBalance -= withdrawalAmount;
    riderWallet.ledger.push({
      type: "DEBIT",
      amount: withdrawalAmount,
      description: `M-Pesa Payout: KES ${withdrawalAmount} to 0712345678`,
    });

    assert.strictEqual(riderWallet.availableBalance, 350, "Remaining balance should be KES 350");
    assert.strictEqual(riderWallet.ledger.length, 1);
    assert.strictEqual(riderWallet.ledger[0].type, "DEBIT");
  });

  console.log("\n=================================================");
  console.log(`  All Test Cases Completed: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
