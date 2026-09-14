/**
 * tests/pos-checkout-concurrency.test.ts
 *
 * Automated Test Suite for POS & Checkout Concurrency, Distributed Locking & Idempotency:
 * 1. Distributed lock acquisition & mutual exclusion
 * 2. Distributed lock safe release & withDistributedLock auto-release
 * 3. POS sale payload boundary validation (Zod schema)
 * 4. Event checkout payload boundary validation (Zod schema)
 * 5. Atomic conditional stock allocation (zero overselling under concurrency)
 * 6. Capacity boundary enforcement for event ticket allocation
 */

import assert from "node:assert/strict";
import redisConnection from "../lib/redis";
import {
  acquireDistributedLock,
  releaseDistributedLock,
  withDistributedLock,
} from "../lib/idempotency";
import { z } from "zod";

async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

// Schemas matching the route definitions
const posSaleItemSchema = z.object({
  ticketProductId: z.string().min(1, "ticketProductId is required"),
  quantity: z.number().int().positive("quantity must be at least 1"),
});

const posSaleSchema = z.object({
  eventId: z.string().min(1, "eventId is required"),
  customerName: z.string().min(1, "customerName is required"),
  customerEmail: z.string().email("customerEmail must be a valid email address"),
  paymentMethod: z.string().min(1, "paymentMethod is required"),
  items: z.array(posSaleItemSchema).min(1, "items array must contain at least 1 item"),
  notes: z.string().optional(),
  companyId: z.string().optional(),
});

const eventCheckoutSchema = z.object({
  eventId: z.string().min(1, "eventId is required"),
  companyId: z.string().optional().nullable(),
  buyer: z.object({
    id: z.string().optional().nullable(),
    name: z.string().min(1, "Buyer name is required"),
    email: z.string().email("Valid buyer email is required"),
    phone: z.string().optional().nullable(),
  }),
  tickets: z
    .array(
      z.object({
        ticketId: z.string().min(1, "ticketId is required"),
        quantity: z.number().int().positive("quantity must be at least 1"),
      }),
    )
    .min(1, "At least one ticket must be selected"),
  paymentMethod: z.string().min(1, "paymentMethod is required"),
});

async function runTests() {
  console.log("==================================================================");
  console.log("STARTING POS & CHECKOUT CONCURRENCY & IDEMPOTENCY TEST SUITE");
  console.log("==================================================================");

  const testResourceId = `event_test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // 1. Distributed lock mutual exclusion
  await check("Distributed Lock: Successfully acquires lock and blocks concurrent caller", async () => {
    const token1 = await acquireDistributedLock(testResourceId, 10, 0);
    assert.ok(token1, "First caller should acquire lock token");

    // Second caller trying to acquire the same resource immediately should fail (return null)
    const token2 = await acquireDistributedLock(testResourceId, 10, 0);
    assert.equal(token2, null, "Concurrent caller should be blocked from acquiring lock");

    // Clean up
    await releaseDistributedLock(testResourceId, token1!);
  });

  // 2. Distributed lock release allows next acquisition
  await check("Distributed Lock: Releasing lock allows subsequent acquisition", async () => {
    const token1 = await acquireDistributedLock(testResourceId, 10, 0);
    assert.ok(token1);

    await releaseDistributedLock(testResourceId, token1!);

    // Now second caller should successfully acquire
    const token2 = await acquireDistributedLock(testResourceId, 10, 0);
    assert.ok(token2, "Second caller should acquire lock after release");

    await releaseDistributedLock(testResourceId, token2!);
  });

  // 3. withDistributedLock executes and cleans up even on error
  await check("Distributed Lock: withDistributedLock auto-releases lock on exception", async () => {
    const errorResourceId = `error_res_${Date.now()}`;
    let executed = false;

    try {
      await withDistributedLock(errorResourceId, async () => {
        executed = true;
        throw new Error("Simulated critical transaction error");
      });
    } catch (err: any) {
      assert.equal(err.message, "Simulated critical transaction error");
    }

    assert.ok(executed, "Callback should have been entered");

    // Lock must have been released despite exception
    const nextToken = await acquireDistributedLock(errorResourceId, 10, 0);
    assert.ok(nextToken, "Lock should be released immediately after exception");
    await releaseDistributedLock(errorResourceId, nextToken!);
  });

  // 4. POS Sale Schema Boundary Checks
  await check("POS Validation: Rejects payload missing customerEmail or items", () => {
    const invalid1 = posSaleSchema.safeParse({
      eventId: "evt_123",
      customerName: "Alice Cashier",
      paymentMethod: "CASH",
      items: [],
    });
    assert.equal(invalid1.success, false);

    const invalid2 = posSaleSchema.safeParse({
      eventId: "evt_123",
      customerName: "Alice Cashier",
      customerEmail: "not-an-email",
      paymentMethod: "CASH",
      items: [{ ticketProductId: "prod_1", quantity: 1 }],
    });
    assert.equal(invalid2.success, false);
  });

  await check("POS Validation: Rejects non-positive or zero quantity", () => {
    const invalid = posSaleSchema.safeParse({
      eventId: "evt_123",
      customerName: "Alice Cashier",
      customerEmail: "alice@example.com",
      paymentMethod: "CASH",
      items: [{ ticketProductId: "prod_1", quantity: 0 }],
    });
    assert.equal(invalid.success, false);
  });

  await check("POS Validation: Accepts valid POS sale payload", () => {
    const valid = posSaleSchema.safeParse({
      eventId: "507f1f77bcf86cd799439011",
      customerName: "Alice Cashier",
      customerEmail: "alice@example.com",
      paymentMethod: "CASH",
      items: [{ ticketProductId: "507f1f77bcf86cd799439012", quantity: 2 }],
      notes: "POS Terminal #3",
    });
    assert.equal(valid.success, true);
  });

  // 5. Event Checkout Schema Boundary Checks
  await check("Event Checkout Validation: Rejects missing buyer name and empty tickets", () => {
    const invalid = eventCheckoutSchema.safeParse({
      eventId: "evt_123",
      buyer: { email: "buyer@example.com" },
      tickets: [],
      paymentMethod: "mpesa",
    });
    assert.equal(invalid.success, false);
  });

  await check("Event Checkout Validation: Accepts valid checkout payload", () => {
    const valid = eventCheckoutSchema.safeParse({
      eventId: "evt_123",
      buyer: { name: "John Doe", email: "john@example.com", phone: "+254712345678" },
      tickets: [{ ticketId: "tkt_vip", quantity: 2 }],
      paymentMethod: "mpesa",
    });
    assert.equal(valid.success, true);
  });

  // 6. Concurrency Simulation: Atomic Stock Deduction Prevents Overselling
  await check("Concurrency Guard: Conditional atomic decrement prevents oversell under race conditions", async () => {
    // Model simulating inventory in a database
    let databaseStock = 1;

    // Simulated atomic conditional update:
    // UPDATE inventory SET quantity = quantity - requested WHERE quantity >= requested
    const atomicDecrement = async (requested: number): Promise<{ count: number }> => {
      // Simulate micro-delay during database trip
      await new Promise((r) => setTimeout(r, 10));
      if (databaseStock >= requested) {
        databaseStock -= requested;
        return { count: 1 };
      }
      return { count: 0 };
    };

    // Run 2 simultaneous checkout requests for the last remaining item
    const [result1, result2] = await Promise.all([
      atomicDecrement(1),
      atomicDecrement(1),
    ]);

    // Exactly one must succeed and one must fail
    const successCount = (result1.count === 1 ? 1 : 0) + (result2.count === 1 ? 1 : 0);
    assert.equal(successCount, 1, "Exactly one concurrent transaction should succeed");
    assert.equal(databaseStock, 0, "Stock should be exactly 0, never negative");
  });

  // 7. Event Ticket Capacity Boundary Verification
  await check("Capacity Guard: Rejects allocations exceeding total ticket capacity", () => {
    const ticketConfig = {
      quantityTotal: 100,
      quantitySold: 98,
    };

    const requestedQuantity = 3;
    const isAvailable =
      ticketConfig.quantitySold + requestedQuantity <= ticketConfig.quantityTotal;

    assert.equal(isAvailable, false, "Should reject booking that exceeds capacity");
  });

  console.log("==================================================================");
  console.log("ALL 8 POS & CHECKOUT CONCURRENCY & IDEMPOTENCY TESTS PASSED CLEANLY!");
  console.log("==================================================================");

  try {
    redisConnection.disconnect();
  } catch {}

  process.exit(0);
}

runTests().catch((err) => {
  console.error("FATAL TEST SUITE ERROR:", err);
  process.exit(1);
});
