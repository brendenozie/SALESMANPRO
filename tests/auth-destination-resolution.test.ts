import "dotenv/config";
import assert from "node:assert";
import {
  resolveUserDestination,
  resolveDestinationFromToken,
  UserDestinationContext,
} from "../lib/auth/destinationResolver";

async function runTests() {
  console.log("Starting Unified Role-Based Destination Resolution Tests...\n");

  // Test 1: Inactive account
  {
    const inactiveUser: UserDestinationContext = {
      id: "usr_inactive",
      email: "inactive@salesmanpro.site",
      role: "ADMIN",
      isActive: false,
      emailVerified: true,
    };
    const res = await resolveUserDestination(inactiveUser);
    assert.strictEqual(res.isAuthorized, false);
    assert.strictEqual(res.destination, "/unauthorized?reason=inactive");
    assert.strictEqual(resolveDestinationFromToken(inactiveUser), "/unauthorized?reason=inactive");
    console.log("ok 1 - Inactive accounts are blocked and routed to /unauthorized");
  }

  // Test 2: Unverified email
  {
    const unverifiedUser: UserDestinationContext = {
      id: "usr_unverified",
      email: "test@example.com",
      role: "ADMIN",
      isActive: true,
      emailVerified: false,
    };
    const res = await resolveUserDestination(unverifiedUser);
    assert.strictEqual(res.isAuthorized, false);
    assert(res.destination.startsWith("/verify-email"));
    assert(resolveDestinationFromToken(unverifiedUser).startsWith("/verify-email"));
    console.log("ok 2 - Unverified email accounts are redirected to /verify-email");
  }

  // Test 3: Super Admin
  {
    const superAdmin: UserDestinationContext = {
      id: "usr_superadmin",
      email: "superadmin@salesmanpro.site",
      role: "SUPER_ADMIN",
      isActive: true,
      emailVerified: true,
    };
    const res = await resolveUserDestination(superAdmin);
    assert.strictEqual(res.isAuthorized, true);
    assert.strictEqual(res.destination, "/super-admin");
    assert.strictEqual(resolveDestinationFromToken(superAdmin), "/super-admin");
    console.log("ok 3 - Super Admin resolves strictly to /super-admin");
  }

  // Test 4: Company Admin with company slug
  {
    const storeAdmin: UserDestinationContext = {
      id: "usr_admin",
      email: "owner@retailer.com",
      role: "ADMIN",
      companyId: "comp_123",
      companySlug: "retailer-hub",
      isActive: true,
      emailVerified: true,
    };
    const res = await resolveUserDestination(storeAdmin);
    assert.strictEqual(res.isAuthorized, true);
    assert.strictEqual(res.destination, "/admin/retailer-hub");
    assert.strictEqual(resolveDestinationFromToken(storeAdmin), "/admin/retailer-hub");
    console.log("ok 4 - Store/Company Admin resolves to /admin/{companySlug}");
  }

  // Test 4b: Multi-Store / Portfolio Admin (no specific company slug)
  {
    const multiStoreAdmin: UserDestinationContext = {
      id: "usr_multi_admin",
      email: "director@retailgroup.com",
      role: "ADMIN",
      companyId: null,
      companySlug: null,
      isActive: true,
      emailVerified: true,
    };
    const res = await resolveUserDestination(multiStoreAdmin);
    assert.strictEqual(res.isAuthorized, true);
    assert.strictEqual(res.destination, "/dashboards");
    assert.strictEqual(resolveDestinationFromToken(multiStoreAdmin), "/dashboards");
    console.log("ok 4b - Multi-Store Admin resolves to /dashboards");
  }

  // Test 5: Staff on Web vs Staff on POS client (Android/WPF)
  {
    const staffUser: UserDestinationContext = {
      id: "usr_staff",
      email: "cashier@retailer.com",
      role: "STAFF",
      companyId: "comp_123",
      companySlug: "retailer-hub",
      isActive: true,
      emailVerified: true,
    };
    const webRes = await resolveUserDestination(staffUser, { platform: "WEB" });
    assert.strictEqual(webRes.isAuthorized, true);
    assert.strictEqual(webRes.destination, "/admin/retailer-hub");

    const posRes = await resolveUserDestination(staffUser, { platform: "ANDROID" });
    assert.strictEqual(posRes.isAuthorized, true);
    assert.strictEqual(posRes.destination, "/admin/retailer-hub/storepos");

    const wpfRes = await resolveUserDestination(staffUser, { platform: "WPF" });
    assert.strictEqual(wpfRes.isAuthorized, true);
    assert.strictEqual(wpfRes.destination, "/admin/retailer-hub/storepos");

    assert.strictEqual(
      resolveDestinationFromToken(staffUser, { platform: "ANDROID" }),
      "/admin/retailer-hub/storepos",
    );
    console.log("ok 5 - Staff routes to management on Web and directly to storepos on Android/WPF");
  }

  // Test 6: Sales Agent
  {
    const agentUser: UserDestinationContext = {
      id: "usr_agent",
      email: "agent@salesmanpro.site",
      role: "AGENT",
      isActive: true,
      emailVerified: true,
    };
    const res = await resolveUserDestination(agentUser);
    assert.strictEqual(res.isAuthorized, true);
    assert.strictEqual(res.destination, "/agents");
    assert.strictEqual(resolveDestinationFromToken(agentUser), "/agents");
    console.log("ok 6 - Sales Agents route to /agents");
  }

  // Test 7: Transport Driver
  {
    const driverUser: UserDestinationContext = {
      id: "usr_driver",
      email: "driver@transport.com",
      role: "DRIVER",
      companyId: "comp_123",
      companySlug: "logistics-ltd",
      isActive: true,
      emailVerified: true,
    };
    const res = await resolveUserDestination(driverUser);
    assert.strictEqual(res.isAuthorized, true);
    assert.strictEqual(res.destination, "/admin/logistics-ltd/store-transport-routes");
    assert.strictEqual(
      resolveDestinationFromToken(driverUser),
      "/admin/logistics-ltd/store-transport-routes",
    );
    console.log("ok 7 - Drivers route to their transport route management");
  }

  // Test 8: Education User (Teacher / Educator)
  {
    const educatorUser: UserDestinationContext = {
      id: "usr_edu",
      email: "teacher@school.edu",
      role: "EDUCATOR",
      companyId: "comp_sch",
      companySlug: "st-jude-academy",
      isActive: true,
      emailVerified: true,
    };
    const res = await resolveUserDestination(educatorUser);
    assert.strictEqual(res.isAuthorized, true);
    assert.strictEqual(res.destination, "/admin/st-jude-academy");
    console.log("ok 8 - Educator routes to their school administrative workspace");
  }

  // Test 9: Consumer / Marketplace User
  {
    const consumerUser: UserDestinationContext = {
      id: "usr_consumer",
      email: "shopper@gmail.com",
      role: "CLIENT",
      isActive: true,
      emailVerified: true,
    };
    const res = await resolveUserDestination(consumerUser);
    assert.strictEqual(res.isAuthorized, true);
    assert.strictEqual(res.destination, "/clients");
    assert.strictEqual(resolveDestinationFromToken(consumerUser), "/clients");

    const ghubaRes = await resolveUserDestination(consumerUser, { originHost: "ghuba.site" });
    assert.strictEqual(ghubaRes.destination, "/ghuba");
    console.log("ok 9 - Consumers and marketplace users route to /clients and /ghuba");
  }

  // Test 10: Unauthorized destination override attempt
  {
    const regularUser: UserDestinationContext = {
      id: "usr_regular",
      email: "regular@gmail.com",
      role: "USER",
      isActive: true,
      emailVerified: true,
    };
    // Attacker tries to supply a preferred destination of /super-admin
    const res = await resolveUserDestination(regularUser, {
      preferredDestination: "/super-admin",
    });
    // Server independently validates and rejects client-supplied destination
    assert.strictEqual(res.destination, "/clients");
    console.log("ok 10 - Server independently rejects unauthorized destination overrides");
  }

  // Test 11: Handover Audience Matching for Mobile and Desktop apps
  {
    const { matchesHandoverAudience } = await import("../lib/auth/handover");
    assert.strictEqual(
      matchesHandoverAudience("site.salesmanpro.android", "salesmanpro.site"),
      true,
      "Android package audience must be accepted at API host"
    );
    assert.strictEqual(
      matchesHandoverAudience("salesmanpro.android", "auth.salesmanpro.site"),
      true,
      "Android client audience must be accepted at auth host"
    );
    assert.strictEqual(
      matchesHandoverAudience("site.salesmanpro.desktop", "salesmanpro.site"),
      true,
      "Desktop client audience must be accepted at API host"
    );
    assert.strictEqual(
      matchesHandoverAudience("salesmanpro.site", "salesmanpro.site"),
      true,
      "Matching web host must be accepted"
    );
    assert.strictEqual(
      matchesHandoverAudience("malicious-site.com", "salesmanpro.site"),
      false,
      "Unrelated origin host must be rejected"
    );

    console.log("ok 11 - Handover audience matching correctly handles Android and Desktop clients");
  }

  console.log("\nAll Role-Based Destination Resolution Tests passed successfully!");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
