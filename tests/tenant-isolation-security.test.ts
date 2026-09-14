/**
 * tests/tenant-isolation-security.test.ts
 *
 * Automated Test Suite for Platform-wide Multi-Tenant Isolation & IDOR Elimination:
 * 1. Authoritative tenant identity extraction from session token
 * 2. Cross-tenant access rejection (IDOR / BOLA)
 * 3. Empty-query tenant leak prevention (no cross-tenant dumps)
 * 4. Response formatting contract consistency (message vs. error separation)
 * 5. Correlation ID propagation (x-request-id)
 * 6. Malformed ObjectId handling (graceful 400 instead of database crash)
 */

import assert from "node:assert/strict";
import { resolveAuthorizedCompany, buildTenantWhere, isValidObjectId } from "../lib/auth/tenantScope";
import { formatResponse, formatSuccess, formatError } from "../lib/formatResponse";

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
  console.log("STARTING MULTI-TENANT ISOLATION & IDOR SECURITY TEST SUITE");
  console.log("==================================================================");

  // 1. Session token matching requested companyId
  await check("Tenant Resolution: Authorized when requestedCompanyId matches token companyId", async () => {
    const user = {
      id: "usr_alice",
      role: "ADMIN",
      companyId: "507f1f77bcf86cd799439011",
      isActive: true,
    };

    const res = await resolveAuthorizedCompany(user, "507f1f77bcf86cd799439011");
    assert.equal(res.authorized, true);
    assert.equal(res.companyId, "507f1f77bcf86cd799439011");
  });

  // 2. Defaulting when requestedCompanyId is omitted (Prevents where: {} leak)
  await check("Tenant Resolution: Defaults strictly to user.companyId when parameter is omitted", async () => {
    const user = {
      id: "usr_alice",
      role: "ADMIN",
      companyId: "507f1f77bcf86cd799439011",
      isActive: true,
    };

    const res = await resolveAuthorizedCompany(user, undefined);
    assert.equal(res.authorized, true);
    assert.equal(res.companyId, "507f1f77bcf86cd799439011");
  });

  // 3. Rejecting malformed company tenant ID gracefully (400)
  await check("Tenant Isolation: Rejects malformed company ID without DB crash", async () => {
    const user = {
      id: "usr_alice",
      role: "ADMIN",
      companyId: "507f1f77bcf86cd799439011",
      isActive: true,
    };

    const res = await resolveAuthorizedCompany(user, "invalid_non_hex_id");
    assert.equal(res.authorized, false);
    assert.equal(res.status, 400);
  });

  // 4. Rejecting unauthorized cross-tenant spoofing with valid format ID (404/403)
  await check("Tenant Isolation: Blocks user from company A accessing company B", async () => {
    const user = {
      id: "usr_alice",
      role: "ADMIN",
      companyId: "507f1f77bcf86cd799439011",
      isActive: true,
    };

    // A valid 24-hex string that belongs to another/non-existent company
    const res = await resolveAuthorizedCompany(user, "507f191e810c19729de860ea");
    assert.equal(res.authorized, false);
    assert.ok(res.status === 404 || res.status === 403);
  });

  // 5. Inactive user blocking
  await check("Security: Rejects inactive user accounts even if companyId matches", async () => {
    const user = {
      id: "usr_banned",
      role: "ADMIN",
      companyId: "507f1f77bcf86cd799439011",
      isActive: false,
    };

    const res = await resolveAuthorizedCompany(user, "507f1f77bcf86cd799439011");
    assert.equal(res.authorized, false);
    assert.equal(res.status, 403);
  });

  // 6. Super Admin cross-tenant oversight
  await check("Privilege: Platform SUPER_ADMIN can resolve any requested tenant", async () => {
    const superAdmin = {
      id: "usr_superadmin",
      role: "SUPER_ADMIN",
      isActive: true,
    };

    const res = await resolveAuthorizedCompany(superAdmin, "507f1f77bcf86cd799439011");
    assert.equal(res.authorized, true);
    assert.equal(res.companyId, "507f1f77bcf86cd799439011");
  });

  // 7. buildTenantWhere validation
  await check("Database Safety: buildTenantWhere enforces companyId and rejects empty tenant", () => {
    const where = buildTenantWhere("507f1f77bcf86cd799439011", { status: "PAID", delivery: true });
    assert.deepEqual(where, { status: "PAID", delivery: true, companyId: "507f1f77bcf86cd799439011" });

    assert.throws(() => {
      buildTenantWhere("" as any, { status: "PAID" });
    }, /SECURITY_ERROR/);
  });

  // 8. Response Formatter: Success string does NOT pollute error field
  await check("Contract: formatResponse separates success message from error field", async () => {
    const response = formatResponse(true, { id: "ord_123" }, "Order fetched successfully", 200);
    const json = await response.json();

    assert.equal(json.success, true);
    assert.equal(json.data.id, "ord_123");
    assert.equal(json.message, "Order fetched successfully");
    assert.equal(json.error, null); // Error MUST be null!
  });

  // 9. Response Formatter: Standardized Error Envelope
  await check("Contract: formatError produces structured error envelope with requestId", async () => {
    const response = formatError("Tenant access denied", "FORBIDDEN", 403, null, "req_test_999");
    const json = await response.json();

    assert.equal(json.success, false);
    assert.equal(json.error.code, "FORBIDDEN");
    assert.equal(json.error.message, "Tenant access denied");
    assert.equal(json.requestId, "req_test_999");
    assert.equal(response.status, 403);
  });

  console.log("==================================================================");
  console.log("ALL 9 TENANT ISOLATION & CONTRACT TESTS PASSED CLEANLY!");
  console.log("==================================================================");
}

runTests().catch((e) => {
  console.error("FATAL TEST ERROR:", e);
  process.exit(1);
});
