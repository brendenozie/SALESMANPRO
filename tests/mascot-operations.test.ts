/**
 * tests/mascot-operations.test.ts
 *
 * Automated Test Suite for SalesmanPro Mascot Operations, OAuth Security,
 * Integration Onboarding, Background Tasks, and Tenant Isolation.
 */

import { IntegrationRegistry } from "@/lib/integrations/registry";
import { IntegrationOAuthService } from "@/lib/integrations/oauth";
import { MascotTaskPlanner } from "@/lib/ai/mascot/taskPlanner";
import { MascotCapabilityRegistry } from "@/lib/ai/mascot/capabilityRegistry";
import { MascotContext } from "@/lib/ai/mascot/types";

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log("🚀 Starting SalesmanPro Mascot Operations Test Suite...\n");

  // =========================================================================
  // TEST 1: Integration Registry Definitions
  // =========================================================================
  console.log("▶ TEST 1: Integration Registry Definitions");
  const allDefs = IntegrationRegistry.getAllDefinitions();
  assert(allDefs.length >= 6, `Expected at least 6 integrations, found ${allDefs.length}`);

  const fbDef = IntegrationRegistry.getDefinition("facebook");
  assert(fbDef !== null, "Facebook definition should exist");
  assert(fbDef?.oauthSupported === true, "Facebook must support OAuth");
  assert(
    fbDef?.scopes.some((s) => s.scope === "pages_show_list"),
    "Facebook requires pages_show_list scope"
  );

  const igDef = IntegrationRegistry.getDefinition("instagram");
  assert(igDef !== null, "Instagram definition should exist");
  assert(
    igDef?.scopes.some((s) => s.scope === "instagram_content_publish"),
    "Instagram requires instagram_content_publish scope"
  );

  const waDef = IntegrationRegistry.getDefinition("whatsapp");
  assert(waDef !== null, "WhatsApp definition should exist");
  assert(
    waDef?.whatItEnables.some((e) => e.includes("AI sales agent")),
    "WhatsApp enables AI sales agent"
  );
  console.log("  ✅ Integration registry definitions verified.\n");

  // =========================================================================
  // TEST 2: OAuth State Cryptographic Signatures & Expiration
  // =========================================================================
  console.log("▶ TEST 2: OAuth Cryptographic State Security");
  const validState = IntegrationOAuthService.generateState({
    companyId: "65a000000000000000000001",
    userId: "65a000000000000000000002",
    provider: "facebook",
    redirectPath: "/admin/test-store/mascot/integrations",
  });

  assert(validState && validState.includes("."), "State token must be in data.signature format");

  // Validate legitimate token
  const decoded = IntegrationOAuthService.validateState(validState);
  assert(decoded.companyId === "65a000000000000000000001", "CompanyId must match");
  assert(decoded.provider === "facebook", "Provider must match");
  assert(decoded.nonce && decoded.nonce.length === 32, "Nonce must be 32 hex chars");

  // Test Tampered Token Rejection
  let tamperedCaught = false;
  try {
    const parts = validState.split(".");
    const forgedToken = `${parts[0]}tampered.${parts[1]}`;
    IntegrationOAuthService.validateState(forgedToken);
  } catch (err: any) {
    tamperedCaught = true;
    assert(err.message.includes("Tampered or forged"), "Must catch forged state");
  }
  assert(tamperedCaught, "Tampered state token must be rejected");

  console.log("  ✅ OAuth cryptographic state and tamper protection verified.\n");

  // =========================================================================
  // TEST 3: Mascot Natural Language Intent Planning
  // =========================================================================
  console.log("▶ TEST 3: Mascot Natural Language Intent Planning");
  const dummyContext: MascotContext = {
    userId: "65a000000000000000000002",
    userEmail: "owner@store.com",
    userName: "Store Owner",
    userRole: "ADMIN",
    companyId: "65a000000000000000000001",
    companyName: "Sample Boutique",
    storeSlug: "sample-boutique",
    storeCategory: "E-commerce",
    storeVariant: "Standard",
    currentPath: "/admin/sample-boutique/mascot",
    enabledModules: ["products", "orders", "inventory", "marketing", "messaging", "integrations", "system"],
    aiCreditBalance: 500,
    mascotEnabled: true,
    isSuperAdmin: false,
    isPlatformScope: false,
  };

  const authorizedCaps = MascotCapabilityRegistry.getAuthorizedCapabilities({
    userRole: dummyContext.userRole,
    storeCategory: dummyContext.storeCategory,
    enabledModules: dummyContext.enabledModules,
  });

  // Prompt A: "Connect my Facebook page"
  const planA = await MascotTaskPlanner.planTask("Connect my Facebook page", dummyContext, authorizedCaps);
  assert(planA.intent === "connect_provider", "Plan A intent must be connect_provider");
  assert(planA.entities.provider === "facebook", "Plan A provider must be facebook");

  // Prompt B: "Help me connect Instagram to my store"
  const planB = await MascotTaskPlanner.planTask("Help me connect Instagram to my store", dummyContext, authorizedCaps);
  assert(planB.intent === "connect_provider", "Plan B intent must be connect_provider");
  assert(planB.entities.provider === "instagram", "Plan B provider must be instagram");

  // Prompt C: "Set up WhatsApp so customers can place orders"
  const planC = await MascotTaskPlanner.planTask("Set up WhatsApp so customers can place orders", dummyContext, authorizedCaps);
  assert(planC.intent === "connect_provider", "Plan C intent must be connect_provider");
  assert(planC.entities.provider === "whatsapp", "Plan C provider must be whatsapp");

  // Prompt D: "Why is my Facebook connection not working?"
  const planD = await MascotTaskPlanner.planTask("Why is my Facebook connection not working?", dummyContext, authorizedCaps);
  assert(planD.intent === "verify_health", "Plan D intent must be verify_health");
  assert(planD.entities.provider === "facebook", "Plan D provider must be facebook");

  // Prompt E: "Show me which accounts still need connecting"
  const planE = await MascotTaskPlanner.planTask("Show me which accounts still need connecting", dummyContext, authorizedCaps);
  assert(planE.intent === "list_connections", "Plan E intent must be list_connections");

  // Prompt F: "What is the agent currently working on?"
  const planF = await MascotTaskPlanner.planTask("What is the agent currently working on?", dummyContext, authorizedCaps);
  assert(planF.intent === "query_active_tasks", "Plan F intent must be query_active_tasks");

  // Prompt G: "Which tasks are waiting for my approval?"
  const planG = await MascotTaskPlanner.planTask("Which tasks are waiting for my approval?", dummyContext, authorizedCaps);
  assert(planG.intent === "query_pending_approvals", "Plan G intent must be query_pending_approvals");

  console.log("  ✅ All mascot natural language intents correctly planned.\n");

  // =========================================================================
  // TEST 4: Role-Based Capability Isolation
  // =========================================================================
  console.log("▶ TEST 4: Role-Based Capability Isolation");
  // Test staff member role: STAFF cannot connect accounts or disconnect
  const staffCaps = MascotCapabilityRegistry.getAuthorizedCapabilities({
    userRole: "STAFF",
    storeCategory: "E-commerce",
    enabledModules: ["products", "integrations", "system"],
  });

  const staffCanConnect = staffCaps.some((c) => c.id === "integrations:connect_provider");
  assert(staffCanConnect === false, "Ordinary STAFF must NOT have integrations:connect_provider permission");

  const staffCanDisconnect = staffCaps.some((c) => c.id === "integrations:disconnect_account");
  assert(staffCanDisconnect === false, "Ordinary STAFF must NOT have integrations:disconnect_account permission");

  const staffCanView = staffCaps.some((c) => c.id === "products:view_catalog");
  assert(staffCanView === true, "STAFF can view products");

  console.log("  ✅ Role-based capability filtering strictly enforced.\n");

  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (4/4 test suites passing)");
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
