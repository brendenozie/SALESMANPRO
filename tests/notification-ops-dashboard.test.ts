/**
 * tests/notification-ops-dashboard.test.ts
 *
 * Automated verification of Step 7:
 * - GET /api/super-admin/notifications (Telemetry, Delivery status aggregation, Device stats)
 * - POST /api/super-admin/notifications (Broadcast announcement publisher)
 * - POST /api/super-admin/notifications/retry (Failed delivery attempt retry)
 */

import { NextRequest } from "next/server";
import { GET as getTelemetry, POST as postBroadcast } from "../app/api/super-admin/notifications/route";
import { POST as postRetry } from "../app/api/super-admin/notifications/retry/route";
import prisma from "@/server/db/prismadb";

import { encode } from "next-auth/jwt";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ ${message}`);
  }
}

const TEST_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "default-salesmanpro-auth-secret-32-chars-min";

async function makeSuperAdminHeaders() {
  const token = await encode({
    token: {
      id: "65a000000000000000000001",
      email: "superadmin@salesmanpro.com",
      name: "Root Super Admin",
      role: "SUPER_ADMIN",
    },
    secret: TEST_SECRET,
  });
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function runDashboardOpsTests() {
  console.log("=== STARTING NOTIFICATION OPERATIONS DASHBOARD TEST SUITE ===");
  const authHeaders = await makeSuperAdminHeaders();

  // 1. Test GET Telemetry
  console.log("\n[Test 1] GET /api/super-admin/notifications");
  const getReq = new NextRequest("http://localhost:3000/api/super-admin/notifications", {
    headers: authHeaders,
  });
  const getRes = await getTelemetry(getReq);
  const getJson = await getRes.json();

  assert(getRes.status === 200, "Telemetry response status 200");
  assert(getJson.success === true, "Telemetry success flag is true");
  assert(typeof getJson.stats.totalNotifications === "number", "Reports total notifications count");
  assert(typeof getJson.stats.totalRecipients === "number", "Reports total recipients count");
  assert(typeof getJson.stats.totalDevices === "number", "Reports total devices count");
  assert(Array.isArray(getJson.recentNotifications), "Returns recent notifications array");
  assert(Array.isArray(getJson.failedDeliveries), "Returns failed deliveries array");
  assert(Array.isArray(getJson.recentDevices), "Returns recent registered devices array");

  // 2. Test POST Broadcast Announcement
  console.log("\n[Test 2] POST /api/super-admin/notifications (Broadcast Dispatch)");
  const broadcastPayload = {
    title: "Platform Maintenance Alert",
    message: "Scheduled cloud database optimization at 02:00 UTC.",
    severity: "WARNING",
    targetScope: "SUPER_ADMINS",
    channels: ["IN_APP", "PUSH_ANDROID"],
  };

  const broadcastReq = new NextRequest("http://localhost:3000/api/super-admin/notifications", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(broadcastPayload),
  });
  const broadcastRes = await postBroadcast(broadcastReq);
  const broadcastJson = await broadcastRes.json();

  assert(broadcastRes.status === 200, "Broadcast dispatch status 200");
  assert(broadcastJson.success === true, "Broadcast marked as successful");
  assert(typeof broadcastJson.notificationId === "string", "Returns created notificationId");
  assert(typeof broadcastJson.recipientCount === "number", "Returns targeted recipient count");

  // 3. Test POST Retry Delivery Attempt
  console.log("\n[Test 3] POST /api/super-admin/notifications/retry");
  // Seed a simulated failed delivery attempt
  const mockDelivery = await (prisma as any).notificationDeliveryAttempt.create({
    data: {
      notificationId: broadcastJson.notificationId,
      channel: "IN_APP",
      destination: "simulated_user_destination",
      status: "FAILED",
      error: "Temporary network timeout during socket push",
      attempts: 1,
    },
  });

  const retryReq = new NextRequest("http://localhost:3000/api/super-admin/notifications/retry", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ attemptId: mockDelivery.id }),
  });
  const retryRes = await postRetry(retryReq);
  const retryJson = await retryRes.json();

  assert(retryRes.status === 200, "Retry endpoint status 200");
  assert(retryJson.success === true, "Retry executed successfully");
  assert(retryJson.status === "DELIVERED", "Delivery status transitioned to DELIVERED");

  // Verify DB state updated
  const updatedDelivery = await (prisma as any).notificationDeliveryAttempt.findUnique({
    where: { id: mockDelivery.id },
  });
  assert(updatedDelivery?.status === "DELIVERED", "Database record marked as DELIVERED");
  assert(updatedDelivery?.attempts === 2, "Attempts counter incremented to 2");

  // Clean up mock attempt
  await (prisma as any).notificationDeliveryAttempt.delete({
    where: { id: mockDelivery.id },
  });

  console.log("\n🎉 ALL NOTIFICATION OPERATIONS TESTS PASSED SUCCESSFULLY!");
}

runDashboardOpsTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Dashboard Ops test failed:", err);
    process.exit(1);
  });
