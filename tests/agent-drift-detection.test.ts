/**
 * tests/agent-drift-detection.test.ts
 *
 * Automated Architecture Drift Detection Test Suite
 *
 * Verifies:
 * 1. Feature Registry integrity & validity
 * 2. Agent route existence on disk (no missing routes for active agent features)
 * 3. Strict exclusion of Admin-only features from Agent workspaces
 * 4. Category-to-POS mapping correctness
 * 5. Role-to-Workspace resolution integrity
 * 6. Elimination of hardcoded mock IDs across agent pages
 * 7. Server-side path allowance rules
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  FEATURE_REGISTRY,
  normalizeCategory,
  normalizeStaffRole,
  getFeaturesFor,
  getPOSRouteForCategory,
  getDefaultLandingForRole,
  isAgentPathAllowed,
} from "../lib/features/featureRegistry";

async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("STARTING AGENT ARCHITECTURE DRIFT DETECTION TEST SUITE");
  console.log("=======================================================\n");

  const appAgentsDir = path.join(process.cwd(), "app", "agents", "[slug]");

  // 1. Verify Feature Registry Schema & Completeness
  await check("Feature Registry has valid categories and features", () => {
    assert.ok(FEATURE_REGISTRY.categories.length >= 5, "At least 5 business categories must be defined");
    assert.ok(FEATURE_REGISTRY.features.length >= 10, "At least 10 core features must be registered");
    assert.ok(FEATURE_REGISTRY.roles.length >= 5, "At least 5 staff roles must be registered");

    for (const f of FEATURE_REGISTRY.features) {
      assert.ok(f.id, `Feature must have an id: ${JSON.stringify(f)}`);
      assert.ok(f.title, `Feature ${f.id} must have a title`);
      assert.ok(f.category && f.category.length > 0, `Feature ${f.id} must declare categories`);
      assert.ok(f.adminRoute, `Feature ${f.id} must declare an admin route`);
    }
  });

  // 2. Verify all Agent-Supported Features have actual disk route files
  await check("All agent-enabled features have corresponding route files in app/agents/[slug]", () => {
    const agentFeatures = FEATURE_REGISTRY.features.filter((f) => !f.adminOnly && f.agentRoute);

    for (const f of agentFeatures) {
      // e.g. /agents/{slug}/orders -> orders
      const parts = f.agentRoute!.split("/").filter(Boolean);
      const section = parts[2] || "dashboard";

      let targetDir = path.join(appAgentsDir, section);
      if (section === "dashboard") {
        targetDir = path.join(appAgentsDir, "dashboard");
      }

      const pageFile = path.join(targetDir, "page.tsx");
      assert.ok(
        fs.existsSync(pageFile),
        `Agent feature '${f.id}' declares route '${f.agentRoute}', but file '${pageFile}' does not exist on disk!`
      );
    }
  });

  // 3. Verify Admin-Only Features NEVER have Agent routes
  await check("Admin-only features are strictly marked inapplicable with no agent routes", () => {
    const adminOnlyFeatures = FEATURE_REGISTRY.features.filter((f) => f.adminOnly);
    assert.ok(adminOnlyFeatures.length >= 4, "Core administrative features must be marked adminOnly");

    for (const f of adminOnlyFeatures) {
      assert.equal(
        f.agentRoute,
        null,
        `SECURITY VIOLATION: Admin-only feature '${f.id}' must NOT have an agent route!`
      );
      assert.equal(
        f.status,
        "inapplicable",
        `Admin-only feature '${f.id}' status must be 'inapplicable' for agent workspaces`
      );
    }
  });

  // 4. Category-Aware POS Resolution
  await check("POS correctly resolves to category-specific registers without hardcoding", () => {
    const slug = "test-store";

    const ecommercePOS = getPOSRouteForCategory("ecommerce", slug);
    assert.equal(ecommercePOS, `/admin/${slug}/storepos`);

    const servicesPOS = getPOSRouteForCategory("services", slug);
    assert.equal(servicesPOS, `/admin/${slug}/service-pos`);

    const fitnessPOS = getPOSRouteForCategory("fitness", slug);
    assert.equal(fitnessPOS, `/admin/${slug}/fitness-pos`);

    const restaurantPOS = getPOSRouteForCategory("restaurant", slug);
    assert.equal(restaurantPOS, `/admin/${slug}/pos`);

    const automotivePOS = getPOSRouteForCategory("automotive", slug);
    assert.equal(automotivePOS, `/admin/${slug}/storepos`);
  });

  // 5. Category Alias Normalization
  await check("Category normalizer handles variations and synonyms accurately", () => {
    assert.equal(normalizeCategory("Fashion Shop"), "ecommerce");
    assert.equal(normalizeCategory("Groceries Store"), "ecommerce");
    assert.equal(normalizeCategory("Salon & Spa"), "services");
    assert.equal(normalizeCategory("Gym & Wellness"), "fitness");
    assert.equal(normalizeCategory("Cafe & Bakery"), "restaurant");
    assert.equal(normalizeCategory("Car Dealership"), "automotive");
    assert.equal(normalizeCategory("Medical Clinic"), "healthcare");
    assert.equal(normalizeCategory("High School"), "education");
  });

  // 6. Role-Based Landing Pages
  await check("Default landing workspaces correctly align with staff roles", () => {
    const slug = "alpha-corp";

    // Cashier -> direct POS
    assert.equal(getDefaultLandingForRole("ecommerce", "CASHIER", slug), `/agents/${slug}/pos`);

    // Sales Agent -> Sales workspace
    assert.equal(getDefaultLandingForRole("ecommerce", "SALES_AGENT", slug), `/agents/${slug}/sales`);

    // Service Agent -> Bookings workspace
    assert.equal(getDefaultLandingForRole("services", "SERVICE_AGENT", slug), `/agents/${slug}/bookings`);

    // Fitness Staff -> Members workspace
    assert.equal(getDefaultLandingForRole("fitness", "FITNESS_STAFF", slug), `/agents/${slug}/members`);

    // Inventory Staff -> Inventory workspace
    assert.equal(getDefaultLandingForRole("ecommerce", "INVENTORY_STAFF", slug), `/agents/${slug}/inventory`);
  });

  // 7. Route Permission & Path Allowance Validation
  await check("isAgentPathAllowed strictly allows authorized paths and blocks unauthorized paths", () => {
    // Sales Agent in Ecommerce: Allowed orders, sales, catalog, inventory, dashboard
    assert.ok(isAgentPathAllowed("/agents/my-shop/dashboard", "ecommerce", "SALES_AGENT"));
    assert.ok(isAgentPathAllowed("/agents/my-shop/orders", "ecommerce", "SALES_AGENT"));
    assert.ok(isAgentPathAllowed("/agents/my-shop/sales", "ecommerce", "SALES_AGENT"));

    // Cashier in Ecommerce: Should NOT have access to sales targets
    assert.equal(isAgentPathAllowed("/agents/my-shop/targets", "ecommerce", "CASHIER"), false);

    // Fitness staff in Fitness: Should have members, but NOT restaurant tables
    assert.ok(isAgentPathAllowed("/agents/my-gym/members", "fitness", "FITNESS_STAFF"));
    assert.equal(isAgentPathAllowed("/agents/my-gym/tables", "fitness", "FITNESS_STAFF"), false);

    // Disallowed Admin paths: /settings, /payroll, /ai must be denied for sales agent
    assert.equal(isAgentPathAllowed("/agents/my-shop/settings", "ecommerce", "SALES_AGENT"), false);
    assert.equal(isAgentPathAllowed("/agents/my-shop/payroll", "ecommerce", "SALES_AGENT"), false);
  });

  // 8. Elimination of hardcoded ObjectIds in app/agents
  await check("No hardcoded ancient ObjectIds exist in app/agents", () => {
    const badIds = ["63f7c9e2d91b1b2a5e80b016", "63f7c9e2d91b1b2a5e80b007"];
    function checkDir(dir: string) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const f of files) {
        const full = path.join(dir, f.name);
        if (f.isDirectory()) {
          checkDir(full);
        } else if (f.name.endsWith(".ts") || f.name.endsWith(".tsx")) {
          const content = fs.readFileSync(full, "utf-8");
          for (const badId of badIds) {
            assert.ok(
              !content.includes(badId),
              `File '${full}' contains deprecated hardcoded ObjectId: ${badId}!`
            );
          }
        }
      }
    }
    checkDir(path.join(process.cwd(), "app", "agents"));
  });

  console.log("\n=======================================================");
  console.log("ALL 8 AGENT ARCHITECTURE DRIFT CHECKS PASSED SUCCESSFULLY!");
  console.log("=======================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
