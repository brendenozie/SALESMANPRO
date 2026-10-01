/**
 * tests/ai-mascot.test.ts
 *
 * Verification & Penetration Test Suite for SalesmanPro AI Mascot.
 * Tests:
 * 1. Capability Registry & Category Mapping
 * 2. Multi-Tenant Isolation & Role Boundary Enforcement
 * 3. Human-in-the-Loop Approval Gating on Sensitive Actions
 * 4. Intent Parsing & Natural Language Task Planning
 * 5. Category Intelligence & Module Availability Guards
 * 6. Store Settings & Custom Overrides
 */

import { MascotCapabilityRegistry } from "../lib/ai/mascot/capabilityRegistry";
import { MascotTaskPlanner } from "../lib/ai/mascot/taskPlanner";
import { MascotActionEngine } from "../lib/ai/mascot/actionEngine";
import { MascotSettingsService, DEFAULT_MASCOT_SETTINGS } from "../lib/ai/mascot/settingsService";
import { MascotContext, MascotCapability } from "../lib/ai/mascot/types";
import { isConsumerOnlyAccount, hasDashboardRole } from "../lib/auth/authorization";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runMascotTests() {
  console.log("=========================================================");
  console.log("🤖 RUNNING SALESMANPRO AI MASCOT VERIFICATION TEST SUITE");
  console.log("=========================================================\n");

  // TEST 1: Capability Registry Integrity
  console.log("--- 1. Capability Registry & Module Coverage ---");
  const allCaps = MascotCapabilityRegistry.getAllCapabilities();
  assert(allCaps.length >= 15, `Authoritative capability registry contains ${allCaps.length} capabilities`);

  const productCaps = allCaps.filter((c) => c.module === "products");
  assert(productCaps.length >= 3, `Products module has core capabilities (actual: ${productCaps.length})`);

  const pricingCaps = allCaps.filter((c) => c.module === "pricing");
  assert(pricingCaps.length >= 2, `Pricing module has individual & bulk adjustment capabilities (actual: ${pricingCaps.length})`);

  const educationCaps = allCaps.filter((c) => c.module === "education");
  assert(educationCaps.length >= 3, `Education module has student records, grading, and parent reports (actual: ${educationCaps.length})`);

  const marketplaceCaps = allCaps.filter((c) => c.module === "marketplace");
  assert(marketplaceCaps.length >= 2, `Marketplace module has Ghuba sync and publishing (actual: ${marketplaceCaps.length})`);

  // TEST 2: Role-Aware Capability Resolution
  console.log("\n--- 2. Role-Aware Capability Resolution ---");
  const retailModules = ["products", "inventory", "orders", "pricing", "finance", "messaging", "marketing", "marketplace", "staff", "system"];

  // Admin in Retail Store
  const adminRetailCaps = MascotCapabilityRegistry.getAuthorizedCapabilities({
    userRole: "ADMIN",
    storeCategory: "E-commerce",
    enabledModules: retailModules,
  });
  assert(
    adminRetailCaps.some((c) => c.id === "pricing:bulk_price_adjustment"),
    "Admin role is authorized for bulk price adjustments",
  );
  assert(
    adminRetailCaps.some((c) => c.id === "products:create_product"),
    "Admin role is authorized to create products",
  );

  // Staff in Retail Store
  const staffRetailCaps = MascotCapabilityRegistry.getAuthorizedCapabilities({
    userRole: "STAFF",
    storeCategory: "E-commerce",
    enabledModules: retailModules,
  });
  assert(
    !staffRetailCaps.some((c) => c.id === "pricing:bulk_price_adjustment"),
    "Staff role is strictly forbidden from bulk price adjustments",
  );
  assert(
    !staffRetailCaps.some((c) => c.id === "products:create_product"),
    "Standard Staff role cannot create products without permission",
  );
  assert(
    staffRetailCaps.some((c) => c.id === "inventory:check_stock_levels"),
    "Staff role can safely read stock levels and audits",
  );

  // Sales Agent
  const agentRetailCaps = MascotCapabilityRegistry.getAuthorizedCapabilities({
    userRole: "AGENT",
    storeCategory: "E-commerce",
    enabledModules: retailModules,
  });
  assert(
    agentRetailCaps.some((c) => c.id === "finance:prepare_invoice"),
    "Sales Agent is authorized to prepare draft invoices",
  );
  assert(
    !agentRetailCaps.some((c) => c.id === "pricing:bulk_price_adjustment"),
    "Sales Agent is forbidden from bulk price adjustments",
  );

  // TEST 3: Strict Tenant Boundary & Consumer Exclusion
  console.log("\n--- 3. Tenant Boundary & Consumer Exclusion ---");
  const consumerUser = { id: "user_cons_1", role: "USER", companyId: null, hasTenantAccess: false };
  assert(
    isConsumerOnlyAccount(consumerUser),
    "Public Consumer account is recognized as consumer-only and blocked from Mascot access",
  );

  const staffUser = { id: "user_staff_1", role: "STAFF", companyId: "store_123" };
  assert(
    !isConsumerOnlyAccount(staffUser) && hasDashboardRole("STAFF"),
    "Store Staff account is recognized as operational dashboard user",
  );

  // TEST 4: Category-Specific Intelligence (Retail vs School vs Restaurant)
  console.log("\n--- 4. Category-Specific Intelligence ---");

  // School Category
  const schoolModules = ["education", "finance", "messaging", "staff", "system"];
  const schoolCaps = MascotCapabilityRegistry.getAuthorizedCapabilities({
    userRole: "TEACHER",
    storeCategory: "School",
    enabledModules: schoolModules,
  });
  assert(
    schoolCaps.some((c) => c.id === "education:view_student_records"),
    "Teacher in School category receives student academic records capability",
  );
  assert(
    !schoolCaps.some((c) => c.id === "marketplace:publish_listings"),
    "School category does NOT receive Ghuba marketplace capabilities",
  );

  // Retail Store
  assert(
    !adminRetailCaps.some((c) => c.id === "education:view_student_records"),
    "Retail Store does NOT receive student grading capabilities",
  );

  // TEST 5: Natural Language Task Planning & Intent Parsing
  console.log("\n--- 5. Natural Language Task Planning ---");
  const mockContext: MascotContext = {
    userId: "65a000000000000000000002",
    userEmail: "admin@store.com",
    userName: "Store Admin",
    userRole: "ADMIN",
    companyId: "65a000000000000000000001",
    companyName: "Acme Retail",
    storeSlug: "acme-retail",
    storeCategory: "E-commerce",
    currentPath: "/admin/acme-retail/inventory",
    enabledModules: retailModules,
    aiCreditBalance: 1500,
    mascotEnabled: true,
    isSuperAdmin: false,
    isPlatformScope: false,
  };

  // Inventory query
  const planInventory = await MascotTaskPlanner.planTask(
    "Which products are low in stock?",
    mockContext,
    adminRetailCaps,
  );
  assert(
    planInventory.intent === "check_stock_levels" && planInventory.actionType === "READ",
    "Understands low stock inquiry -> maps to check_stock_levels READ action",
  );

  // Business Performance query
  const planReport = await MascotTaskPlanner.planTask(
    "How did our store perform this month?",
    mockContext,
    adminRetailCaps,
  );
  assert(
    planReport.intent === "view_business_report" && planReport.actionType === "READ",
    "Understands performance question -> maps to view_business_report",
  );

  // Bulk price increase query (Sensitive / Financial)
  const planPrice = await MascotTaskPlanner.planTask(
    "Increase the price of all products in electronics category by 5%",
    mockContext,
    adminRetailCaps,
  );
  assert(
    planPrice.intent === "bulk_price_adjustment" && planPrice.requiresApproval === true,
    "Bulk price change query strictly mandates requiresApproval=true",
  );
  assert(
    planPrice.entities.percentage === 5 && planPrice.actionCard !== undefined,
    "Accurately extracted 5% percentage and generated actionCard draft",
  );

  // TEST 6: Category Capability Guard & Hallucination Prevention
  console.log("\n--- 6. Category Capability Guard & Hallucination Prevention ---");
  const schoolContext: MascotContext = {
    ...mockContext,
    storeCategory: "School",
    enabledModules: schoolModules,
  };

  let preventedMarketplace = false;
  try {
    await MascotTaskPlanner.planTask(
      "Add these products to Ghuba marketplace",
      schoolContext,
      schoolCaps,
    );
  } catch (err: any) {
    preventedMarketplace = true;
    assert(
      err.message.includes("Marketplace integration is not enabled"),
      "Mascot gracefully explains marketplace is unavailable for School category instead of hallucinating",
    );
  }
  assert(preventedMarketplace, "Marketplace query in School category was strictly blocked");

  // TEST 7: Store Settings & Custom Overrides
  console.log("\n--- 7. Store Settings & Custom Overrides ---");
  assert(DEFAULT_MASCOT_SETTINGS.enabled === true, "Default mascot settings are enabled");
  assert(
    DEFAULT_MASCOT_SETTINGS.approvalOverrides["pricing:bulk_price_adjustment"] === true,
    "Approval override policy defaults bulk price adjustment to requiring approval",
  );

  // TEST 8: Action Engine Approval Gating
  console.log("\n--- 8. Action Engine Approval Gating ---");
  const sensitiveCap = MascotCapabilityRegistry.getCapability("pricing:bulk_price_adjustment")!;
  const unapprovedResult = await MascotActionEngine.executeAction({
    capability: sensitiveCap,
    entities: { percentage: 5 },
    context: mockContext,
    approved: false,
  });

  assert(
    unapprovedResult.requiresApproval === true,
    "Unapproved sensitive action strictly halts and yields requiresApproval=true",
  );
  assert(
    unapprovedResult.actionCard?.status === "pending_approval",
    "Generated ActionCard has status pending_approval with human approval prompt",
  );

  console.log("\n=========================================================");
  console.log(`🎉 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=========================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMascotTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
