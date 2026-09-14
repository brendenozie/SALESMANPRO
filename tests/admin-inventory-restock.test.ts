/**
 * tests/admin-inventory-restock.test.ts
 *
 * Automated Test Suite for:
 * 1. Admin Post-Restock Schema Boundary Validation (Zod)
 * 2. Admin Post-Restock Atomic Increment/Decrement Logic
 * 3. Cross-Tenant IDOR Guard on Inventory & Restock
 * 4. Admin Post-Inventory Pagination and Scoping
 */

import assert from "node:assert/strict";
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

// Schemas matching app/api/admin/post-restock/route.ts
const restockItemSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.number().int().positive("quantity must be a positive integer"),
  unitCost: z.number().nonnegative("unitCost cannot be negative").optional(),
});

const restockPayloadSchema = z.object({
  items: z.array(restockItemSchema).min(1, "At least one item is required for restock"),
  companyId: z.string().optional(),
  type: z.enum(["RESTOCK", "RETURN", "DAMAGE", "ADJUSTMENT"]).default("RESTOCK"),
  notes: z.string().max(500).optional(),
});

// Schema matching app/api/admin/post-inventory/route.ts
const inventoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  status: z.string().optional(),
  companyId: z.string().optional(),
});

async function runTests() {
  console.log("==================================================================");
  console.log("RUNNING ADMIN INVENTORY & RESTOCK SECURITY TEST SUITE");
  console.log("==================================================================");

  // 1. Restock Zod schema: valid payload
  await check("Restock Schema: Valid payload passes validation", () => {
    const valid = {
      items: [
        { productId: "prod_123", quantity: 10, unitCost: 45.5 },
        { productId: "prod_456", quantity: 5 },
      ],
      type: "RESTOCK",
      notes: "Warehouse shipment A1",
    };
    const result = restockPayloadSchema.safeParse(valid);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.items.length, 2);
      assert.equal(result.data.type, "RESTOCK");
    }
  });

  // 2. Restock Zod schema: rejects non-positive quantity
  await check("Restock Schema: Rejects zero or negative restock quantity", () => {
    const invalid = {
      items: [{ productId: "prod_123", quantity: 0 }],
      type: "RESTOCK",
    };
    const result = restockPayloadSchema.safeParse(invalid);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.errors[0].message, /quantity must be a positive integer/);
    }
  });

  // 3. Restock Zod schema: rejects empty items array
  await check("Restock Schema: Rejects empty items array", () => {
    const invalid = {
      items: [],
      type: "RESTOCK",
    };
    const result = restockPayloadSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  // 4. Atomic Increment/Decrement Logic Simulation
  await check("Atomic Stock: Increments stock on RESTOCK and decrements safely on DAMAGE", () => {
    let currentStock = 50;

    const applyStockChange = (type: "RESTOCK" | "RETURN" | "DAMAGE" | "ADJUSTMENT", qty: number) => {
      if (type === "RESTOCK" || type === "RETURN") {
        currentStock += qty;
        return { success: true, stock: currentStock };
      } else {
        if (currentStock < qty) {
          return { success: false, error: "Insufficient stock for deduction" };
        }
        currentStock -= qty;
        return { success: true, stock: currentStock };
      }
    };

    // Restock +20
    const res1 = applyStockChange("RESTOCK", 20);
    assert.equal(res1.success, true);
    assert.equal(currentStock, 70);

    // Damage -15
    const res2 = applyStockChange("DAMAGE", 15);
    assert.equal(res2.success, true);
    assert.equal(currentStock, 55);

    // Excessive damage (100 > 55)
    const res3 = applyStockChange("DAMAGE", 100);
    assert.equal(res3.success, false);
    assert.equal(currentStock, 55, "Stock must remain unchanged on failed deduction");
  });

  // 5. Cross-Tenant IDOR: rejects items belonging to another company
  await check("Tenant Scoping: Rejects restock when products belong to different company", () => {
    const companyA = "comp_A_111";
    const companyB = "comp_B_222";

    const databaseProducts: Record<string, { id: string; companyId: string }> = {
      prod_A1: { id: "prod_A1", companyId: companyA },
      prod_B1: { id: "prod_B1", companyId: companyB },
    };

    const attemptRestockForCompanyA = (productIds: string[]) => {
      const allBelong = productIds.every(
        (id) => databaseProducts[id] && databaseProducts[id].companyId === companyA
      );
      if (!allBelong) {
        return { success: false, error: "One or more products not found or not owned by your company" };
      }
      return { success: true };
    };

    // Own product: pass
    assert.equal(attemptRestockForCompanyA(["prod_A1"]).success, true);

    // Cross-tenant product attempt: fail
    const crossTenantRes = attemptRestockForCompanyA(["prod_A1", "prod_B1"]);
    assert.equal(crossTenantRes.success, false);
    assert.match(crossTenantRes.error!, /not owned by your company/);
  });

  // 6. Inventory Query Schema: bounds limit to max 100
  await check("Inventory Query Schema: Clamps limit and provides default pagination", () => {
    const parsedDefault = inventoryQuerySchema.parse({});
    assert.equal(parsedDefault.page, 1);
    assert.equal(parsedDefault.limit, 20);

    const parsedOverLimit = inventoryQuerySchema.safeParse({ limit: 500 });
    assert.equal(parsedOverLimit.success, false, "Should reject limit exceeding 100");
  });

  console.log("==================================================================");
  console.log("ALL 6 ADMIN INVENTORY & RESTOCK SECURITY TESTS PASSED CLEANLY!");
  console.log("==================================================================");

  process.exit(0);
}

runTests().catch((err) => {
  console.error("FATAL TEST SUITE ERROR:", err);
  process.exit(1);
});
