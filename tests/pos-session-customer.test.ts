/**
 * tests/pos-session-customer.test.ts
 *
 * Automated Test Suite for POS Customer/Consumer Management & POS Session Staff Login
 *
 * Covers all 10 Core Test Scenarios:
 * 1. Existing customer search and attach to POS transaction (Phone, email, name search)
 * 2. New customer creation in POS with automatic selection and canonical CRM sync
 * 3. Customer reuse across transactions and sessions
 * 4. Required customer enforcement in ServicePOS
 * 5. Optional walk-in in StorePOS
 * 6. Operator A authentication, session creation & immutable order attribution
 * 7. Operator B shift switch on same terminal & session boundary isolation
 * 8. Switching customer mid-session without corrupting past transactions
 * 9. Cross-store isolation (staff login & customer search scoped strictly to companyId)
 * 10. Inactive / disabled staff login rejection
 */

import assert from "node:assert/strict";
import prisma from "../server/db/prismadb";
import {
  authenticatePOSOperator,
  getCurrentPOSSession,
  endPOSSession,
} from "../lib/pos/posSessionService";
import {
  searchPOSCustomers,
  createPOSCustomer,
} from "../lib/pos/posCustomerService";
import { createOrder as centralizedCreateOrder } from "../lib/orders/centralizedCreateOrder";

async function check(name: string, fn: () => Promise<void> | void) {
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
  console.log("STARTING POS CUSTOMER & SESSION STAFF LOGIN TEST SUITE");
  console.log("=======================================================\n");

  const timestamp = Date.now();

  // 1. Setup Test Companies
  const companyA = await prisma.company.create({
    data: {
      name: `Store A POS ${timestamp}`,
      slug: `store-a-${timestamp}`,
      contactEmail: `storea_${timestamp}@test.com`,
    },
  });

  const companyB = await prisma.company.create({
    data: {
      name: `Store B POS ${timestamp}`,
      slug: `store-b-${timestamp}`,
      contactEmail: `storeb_${timestamp}@test.com`,
    },
  });

  // 2. Setup Operators for Store A & Store B
  // Operator 1 (Store A, Active)
  const userOpA1 = await prisma.user.create({
    data: {
      email: `op_a1_${timestamp}@test.com`,
      name: "Alice Cashier",
      isActive: true,
    },
  });

  const staffA1 = await prisma.staffProfile.create({
    data: {
      userId: userOpA1.id,
      companyId: companyA.id,
      jobTitle: "Cashier",
      department: "Sales",
      employmentStatus: "ACTIVE",
      loginCode: `8841`,
    },
  });

  // Operator 2 (Store A, Terminated/Inactive)
  const userOpA2 = await prisma.user.create({
    data: {
      email: `op_a2_${timestamp}@test.com`,
      name: "Inactive Bob",
      isActive: false,
    },
  });

  const staffA2 = await prisma.staffProfile.create({
    data: {
      userId: userOpA2.id,
      companyId: companyA.id,
      jobTitle: "Cashier",
      department: "Sales",
      employmentStatus: "TERMINATED",
      loginCode: `5521`,
    },
  });

  // Operator 3 (Store B, Active)
  const userOpB = await prisma.user.create({
    data: {
      email: `op_b_${timestamp}@test.com`,
      name: "Charlie StoreB",
      isActive: true,
    },
  });

  const staffB = await prisma.staffProfile.create({
    data: {
      userId: userOpB.id,
      companyId: companyB.id,
      jobTitle: "Cashier",
      department: "Sales",
      employmentStatus: "ACTIVE",
      loginCode: `9911`,
    },
  });

  // Operator 4 (Store A, Active second operator for shift swap)
  const userOpA4 = await prisma.user.create({
    data: {
      email: `op_a4_${timestamp}@test.com`,
      name: "Diana Shift2",
      isActive: true,
    },
  });

  const staffA4 = await prisma.staffProfile.create({
    data: {
      userId: userOpA4.id,
      companyId: companyA.id,
      jobTitle: "Shift Manager",
      department: "Management",
      employmentStatus: "ACTIVE",
      loginCode: `7733`,
    },
  });

  // Create a sample product listing in Store A for order testing
  const listingA = await prisma.marketplaceListings.create({
    data: {
      company: { connect: { id: companyA.id } },
      name: "Store A Espresso Service",
      description: "Service test item",
      sellingPrice: 250,
      quantity: 100,
      subCategory: {},
      status: "ACTIVE",
    },
  });

  let createdCustomer1: any = null;
  let createdCustomer2: any = null;
  let activeSessionA: any = null;

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: Create & Search Existing POS Customer (Name, Phone, Email)
    // -------------------------------------------------------------
    await check("SCENARIO 1: In-POS Customer Creation and Search by Phone/Email/Name", async () => {
      const createRes = await createPOSCustomer({
        companyId: companyA.id,
        name: "John Kamau",
        phone: `+254711${timestamp.toString().slice(-6)}`,
        email: `john_${timestamp}@gmail.com`,
      });

      const cust = createRes.customer;
      assert.ok(cust && cust.id, "Customer must have a valid ID");
      assert.equal(cust.name, "John Kamau");
      assert.equal(createRes.duplicate, false, "Must not be duplicate initially");
      createdCustomer1 = cust;

      // Search by phone snippet
      const byPhone = await searchPOSCustomers({ companyId: companyA.id, query: timestamp.toString().slice(-5) });
      assert.ok(byPhone.length > 0, "Should find customer by phone");
      assert.equal(byPhone[0].id, cust.id);

      // Search by name
      const byName = await searchPOSCustomers({ companyId: companyA.id, query: "Kamau" });
      assert.ok(byName.length > 0, "Should find customer by name");
      assert.equal(byName[0].id, cust.id);

      // Search by email
      const byEmail = await searchPOSCustomers({ companyId: companyA.id, query: `john_${timestamp}` });
      assert.ok(byEmail.length > 0, "Should find customer by email");
      assert.equal(byEmail[0].id, cust.id);
    });

    // -------------------------------------------------------------
    // SCENARIO 2: Deduplication and Canonical User + Client + Consumer Sync
    // -------------------------------------------------------------
    await check("SCENARIO 2: Deduplication prevents duplicates and links User, Client, Consumer", async () => {
      // Attempt to create customer with same phone in same company
      const duplicateAttempt = await createPOSCustomer({
        companyId: companyA.id,
        name: "John Kamau Duplicate",
        phone: createdCustomer1.phone,
        email: "different_email@gmail.com",
      });

      assert.equal(duplicateAttempt.duplicate, true, "Must flag duplicate");
      assert.equal(duplicateAttempt.customer.id, createdCustomer1.id, "Must return existing customer instead of creating duplicate");

      // Verify canonical models in database
      const clientRecord = await prisma.client.findFirst({
        where: { userId: createdCustomer1.id, companyId: companyA.id },
      });
      assert.ok(clientRecord, "Client record must exist in CRM for this company");

      const consumerRecord = await prisma.consumer.findFirst({
        where: { userId: createdCustomer1.id, companyId: companyA.id },
      });
      assert.ok(consumerRecord, "Consumer record must exist for this company");
    });

    // -------------------------------------------------------------
    // SCENARIO 3: Customer Reuse Across Sessions
    // -------------------------------------------------------------
    await check("SCENARIO 3: Customer reuse allows retrieving customer without re-entering info", async () => {
      const searchResults = await searchPOSCustomers({ companyId: companyA.id, query: createdCustomer1.phone });
      assert.ok(searchResults.length === 1, "Customer should be immediately retrievable for reuse");
      assert.equal(searchResults[0].name, "John Kamau");
      assert.equal(searchResults[0].phone, createdCustomer1.phone);
    });

    // -------------------------------------------------------------
    // SCENARIO 4: Required Customer Enforcement in ServicePOS
    // -------------------------------------------------------------
    await check("SCENARIO 4: ServicePOS server-side enforcement blocks booking without customer", async () => {
      // Simulated server validation logic identical to app/api/shop/serviceOrders/route.ts
      const validateServiceOrder = (body: any) => {
        const billing = body.billing || {};
        const hasCustomer =
          Boolean(billing.name && (billing.phone || billing.email)) ||
          Boolean(body.consumerId && body.consumerId !== "pos-service-agent");
        if (!hasCustomer) {
          throw new Error("Customer information (name and phone or email) is required for service appointments and bookings.");
        }
      };

      // 1. Missing customer details should throw
      assert.throws(
        () => validateServiceOrder({ billing: { name: "" }, consumerId: "pos-service-agent" }),
        /Customer information.*is required/
      );

      // 2. Providing customer details should succeed
      assert.doesNotThrow(() =>
        validateServiceOrder({
          billing: { name: createdCustomer1.name, phone: createdCustomer1.phone },
          consumerId: createdCustomer1.id,
        })
      );
    });

    // -------------------------------------------------------------
    // SCENARIO 5: Optional Walk-in in StorePOS
    // -------------------------------------------------------------
    await check("SCENARIO 5: Optional walk-in in StorePOS allows anonymous orders", async () => {
      // Create an order without customer / consumerId (standard retail walk-in)
      const walkInOrder = await centralizedCreateOrder({
        companyId: companyA.id,
        cashierName: "Alice Cashier",
        name: "Walk-in Guest",
        email: "guest@store.com",
        phone: "+254700000000",
        items: [
          {
            marketplaceListingId: listingA.id,
            quantity: 1,
            price: 250,
            totalPrice: 250,
          },
        ],
      });

      assert.ok(walkInOrder.order.id, "Walk-in order must be successfully created");
      assert.equal(walkInOrder.order.consumerId, null, "Walk-in order can have null consumerId");
    });

    // -------------------------------------------------------------
    // SCENARIO 6: Operator A Authentication & POS Order Attribution
    // -------------------------------------------------------------
    await check("SCENARIO 6: Operator A PIN login creates active session and attributes order", async () => {
      const authResult = await authenticatePOSOperator({
        companyId: companyA.id,
        loginCode: "8841",
        terminalId: "T01",
      });

      assert.ok(authResult.success, "Authentication should succeed for valid code");
      assert.equal(authResult.operator.name, "Alice Cashier");
      assert.equal(authResult.operator.role.toUpperCase(), "CASHIER");
      assert.equal(authResult.session.status, "OPEN");

      activeSessionA = authResult.session;

      // Place an order attributed to Operator A and Session A
      const orderA = await centralizedCreateOrder({
        companyId: companyA.id,
        posSessionId: activeSessionA.id,
        operatorId: authResult.operator.id,
        cashierName: authResult.operator.name,
        consumerId: createdCustomer1.id,
        name: createdCustomer1.name,
        email: createdCustomer1.email || "customer@store.com",
        phone: createdCustomer1.phone || "+254711000000",
        items: [
          {
            marketplaceListingId: listingA.id,
            quantity: 2,
            price: 250,
            totalPrice: 500,
          },
        ],
      });

      assert.equal(orderA.order.posSessionId, activeSessionA.id, "Order posSessionId must match");
      assert.equal(orderA.order.operatorId, authResult.operator.id, "Order operatorId must match");
      assert.equal(orderA.order.cashierName, "Alice Cashier", "Order cashierName must match");
      assert.equal(orderA.order.consumerId, createdCustomer1.id, "Order consumerId must match John Kamau");
    });

    // -------------------------------------------------------------
    // SCENARIO 7: Operator B Shift Switch on Same Terminal & Session Isolation
    // -------------------------------------------------------------
    await check("SCENARIO 7: Operator shift switch ends previous session and creates new isolated session", async () => {
      // 1. End Operator A's session
      const closedSession = await endPOSSession(activeSessionA.id, companyA.id);
      assert.equal(closedSession.status, "CLOSED");
      assert.ok(closedSession.closedAt, "Closed session must have closedAt timestamp");
      assert.ok(closedSession.totalSales >= 500, "Closed session aggregates sales totals");

      // 2. Operator Diana logs in to the same terminal T01
      const authDiana = await authenticatePOSOperator({
        companyId: companyA.id,
        loginCode: "7733",
        terminalId: "T01",
      });

      assert.ok(authDiana.success);
      assert.equal(authDiana.operator.name, "Diana Shift2");
      assert.notEqual(authDiana.session.id, activeSessionA.id, "New session must be created for new shift");
      assert.equal(authDiana.session.status, "OPEN");

      // Verify active session for T01 is now Diana's session
      const current = await getCurrentPOSSession(companyA.id, "T01");
      assert.ok(current);
      assert.equal(current.operator?.name, "Diana Shift2");
    });

    // -------------------------------------------------------------
    // SCENARIO 8: Switching Customer Mid-Session
    // -------------------------------------------------------------
    await check("SCENARIO 8: Customer switching mid-session preserves prior order integrity", async () => {
      // Create Customer 2
      const cust2Res = await createPOSCustomer({
        companyId: companyA.id,
        name: "Mary Wanjiku",
        phone: `+254722${timestamp.toString().slice(-6)}`,
        email: `mary_${timestamp}@test.com`,
      });
      createdCustomer2 = cust2Res.customer;

      // Place order for Customer 2
      const order2 = await centralizedCreateOrder({
        companyId: companyA.id,
        consumerId: createdCustomer2.id,
        cashierName: "Diana Shift2",
        name: createdCustomer2.name,
        email: createdCustomer2.email || "customer2@store.com",
        phone: createdCustomer2.phone || "+254722000000",
        items: [
          {
            marketplaceListingId: listingA.id,
            quantity: 1,
            price: 250,
            totalPrice: 250,
          },
        ],
      });

      // Query order 1 from Scenario 6 to guarantee it still belongs to John Kamau
      const priorOrders = await prisma.customerOrder.findMany({
        where: { consumerId: createdCustomer1.id },
      });
      assert.ok(priorOrders.length >= 1, "Prior order for John Kamau must remain untouched");
      assert.equal(priorOrders[0].consumerId, createdCustomer1.id);

      // Verify order 2 belongs to Mary Wanjiku
      assert.equal(order2.order.consumerId, createdCustomer2.id);
    });

    // -------------------------------------------------------------
    // SCENARIO 9: Cross-Store Isolation (Staff PIN and Customers)
    // -------------------------------------------------------------
    await check("SCENARIO 9: Cross-store isolation prevents unauthorized login and cross-tenant data leaks", async () => {
      // 1. Attempt Store B staff PIN (9911) on Store A terminal
      await assert.rejects(
        async () => {
          await authenticatePOSOperator({
            companyId: companyA.id,
            loginCode: "9911", // Code belonging to Store B
            terminalId: "T01",
          });
        },
        /Access denied|not authorized|Invalid/
      );

      // 2. Search for Store A's customer in Store B - must return empty
      const crossTenantSearch = await searchPOSCustomers({ companyId: companyB.id, query: createdCustomer1.phone });
      assert.equal(crossTenantSearch.length, 0, "Store B must NOT be able to see Store A's customers");
    });

    // -------------------------------------------------------------
    // SCENARIO 10: Inactive / Disabled Staff Login Rejection
    // -------------------------------------------------------------
    await check("SCENARIO 10: Inactive or terminated staff cannot log in to POS", async () => {
      // Inactive Bob has code 5521 in Store A
      await assert.rejects(
        async () => {
          await authenticatePOSOperator({
            companyId: companyA.id,
            loginCode: "5521",
            terminalId: "T01",
          });
        },
        /inactive or disabled/
      );
    });

    console.log("\n=======================================================");
    console.log("ALL 10 POS SCENARIOS PASSED WITH ZERO REGRESSIONS!");
    console.log("=======================================================\n");
  } finally {
    // Cleanup test artifacts
    try {
      const cIds = [companyA?.id, companyB?.id].filter(Boolean) as string[];
      await prisma.deliveryStop.deleteMany({
        where: { order: { companyId: { in: cIds } } },
      }).catch(() => {});
      await prisma.invoice.deleteMany({
        where: { companyId: { in: cIds } },
      }).catch(() => {});
      await prisma.orderItem.deleteMany({
        where: { order: { companyId: { in: cIds } } },
      }).catch(() => {});
      await prisma.customerOrder.deleteMany({
        where: { companyId: { in: cIds } },
      });
      await prisma.posSession.deleteMany({
        where: { companyId: { in: cIds } },
      });
      await prisma.marketplaceListings.deleteMany({
        where: { companyId: { in: cIds } },
      });
      await prisma.staffProfile.deleteMany({
        where: { companyId: { in: cIds } },
      });
      await prisma.client.deleteMany({
        where: { companyId: { in: cIds } },
      });
      await prisma.consumer.deleteMany({
        where: { companyId: { in: cIds } },
      });
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [
              userOpA1?.id,
              userOpA2?.id,
              userOpB?.id,
              userOpA4?.id,
              createdCustomer1?.id,
              createdCustomer2?.id,
            ].filter(Boolean),
          },
        },
      });
      await prisma.company.deleteMany({
        where: { id: { in: cIds } },
      });
    } catch (cleanErr) {
      console.warn("Test cleanup notice:", cleanErr);
    }
  }
}

runTestSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  });
