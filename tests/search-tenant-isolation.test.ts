/**
 * tests/search-tenant-isolation.test.ts
 *
 * Automated test suite for multi-tenant isolation in search:
 * 1. Store search scoping enforces companyId strictly
 * 2. Cross-tenant queries are blocked
 * 3. Ghuba marketplace excludes unapproved, unlisted, and private store products
 */

import assert from "node:assert/strict";
import { FilterService } from "../lib/search/filterService";

async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function run() {
  console.log("==================================================================");
  console.log("STARTING SEARCH TENANT ISOLATION TESTS");
  console.log("==================================================================");

  // 1. Store scope attaches companyId
  await check("Tenant Scoping: Store search strictly injects companyId into Prisma where clause", () => {
    const companyA = "507f1f77bcf86cd799439011";
    const where = FilterService.buildPrismaWhereFilters({}, "STORE", companyA);

    assert.equal(where.companyId, companyA);
    assert.equal(where.status, "ACTIVE");
    assert.equal(where.isAvailable, true);
    assert.equal(where.showOnGhuba, undefined); // Does not enforce Ghuba status for store-owned catalog
  });

  // 2. Tenant isolation: Store A where clause cannot match Store B
  await check("Tenant Isolation: Store A where clause strictly excludes Store B companyId", () => {
    const companyA = "507f1f77bcf86cd799439011";
    const companyB = "507f1f77bcf86cd799439022";

    const whereA = FilterService.buildPrismaWhereFilters({}, "STORE", companyA);
    assert.notEqual(whereA.companyId, companyB);
    assert.equal(whereA.companyId, companyA);
  });

  // 3. Ghuba Scope: requires active, available, and admin-approved status
  await check("Ghuba Marketplace: Enforces showOnGhuba, ghubaAdminApproved, and ghubaStatus", () => {
    const whereGhuba = FilterService.buildPrismaWhereFilters({}, "GHUBA");

    assert.equal(whereGhuba.showOnGhuba, true);
    assert.equal(whereGhuba.ghubaAdminApproved, true);
    assert.equal(whereGhuba.ghubaStatus, "APPROVED");
    assert.equal(whereGhuba.status, "ACTIVE");
    assert.equal(whereGhuba.isAvailable, true);
  });

  console.log("==================================================================");
  console.log("ALL SEARCH TENANT ISOLATION TESTS PASSED");
  console.log("==================================================================");
  process.exit(0);
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
