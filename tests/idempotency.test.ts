/**
 * tests/idempotency.test.ts
 *
 * Automated Test Suite for Platform Idempotency & Replay Protection:
 * 1. Lock acquisition on first request
 * 2. In-flight collision detection (prevent duplicate concurrent executions)
 * 3. Saved response replay with identical payload
 * 4. Lock release on failure
 */

import assert from "node:assert/strict";
import {
  acquireIdempotencyLock,
  saveIdempotencyResponse,
  releaseIdempotencyLock,
} from "../lib/idempotency";

async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("STARTING IDEMPOTENCY & CONCURRENCY PROTECTION TEST SUITE");
  console.log("==================================================================");

  const tenantId = "comp_test_idempotency";
  const idempotencyKey = `idem_key_${Date.now()}_${Math.random()}`;

  // 1. Initial lock acquisition
  await check("Idempotency: First attempt acquires lock successfully", async () => {
    const res = await acquireIdempotencyLock(idempotencyKey, tenantId, 60);
    assert.equal(res.state, "ACQUIRED");
  });

  // 2. Concurrent duplicate request while in-flight
  await check("Idempotency: Simultaneous request with same key returns IN_FLIGHT", async () => {
    const res = await acquireIdempotencyLock(idempotencyKey, tenantId, 60);
    assert.equal(res.state, "IN_FLIGHT");
  });

  // 3. Complete and persist response
  await check("Idempotency: Successful execution saves response with COMPLETED state", async () => {
    const mockResponseBody = {
      success: true,
      data: { orderId: "ord_idempotent_999", amount: 2500 },
      message: "Order placed successfully",
    };

    await saveIdempotencyResponse(idempotencyKey, tenantId, 201, mockResponseBody, 3600);

    // Subsequent call must return COMPLETED with identical body
    const replay = await acquireIdempotencyLock(idempotencyKey, tenantId, 60);
    assert.equal(replay.state, "COMPLETED");
    if (replay.state === "COMPLETED") {
      assert.equal(replay.response.status, 201);
      assert.equal(replay.response.body.data.orderId, "ord_idempotent_999");
      assert.equal(replay.response.body.data.amount, 2500);
    }
  });

  // 4. Lock release on error
  await check("Idempotency: Failed execution releases lock cleanly so client can retry", async () => {
    const errorKey = `idem_err_key_${Date.now()}`;
    const initial = await acquireIdempotencyLock(errorKey, tenantId, 60);
    assert.equal(initial.state, "ACQUIRED");

    // Release on simulated error
    await releaseIdempotencyLock(errorKey, tenantId);

    // Next attempt must be able to acquire again
    const retry = await acquireIdempotencyLock(errorKey, tenantId, 60);
    assert.equal(retry.state, "ACQUIRED");
  });

  console.log("==================================================================");
  console.log("ALL 4 IDEMPOTENCY ENGINE TESTS PASSED CLEANLY!");
  console.log("==================================================================");

  try {
    const { redisConnection } = await import("../lib/redis");
    redisConnection.disconnect();
  } catch {}

  process.exit(0);
}

runTests().catch((e) => {
  console.error("FATAL TEST ERROR:", e);
  process.exit(1);
});
