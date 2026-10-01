/**
 * tests/notification-api.test.ts
 *
 * Automated Test Suite for Notification REST APIs:
 * Tests listing, unread counter, read actions, devices registration, preferences.
 */

import { NextRequest } from "next/server";
import { GET as getNotifications, POST as postNotification } from "../app/api/notifications/route";
import { GET as getUnreadCount } from "../app/api/notifications/unread-count/route";
import { POST as markRead } from "../app/api/notifications/[id]/read/route";
import { POST as markAllRead } from "../app/api/notifications/mark-all-read/route";
import { POST as acknowledgeNotif } from "../app/api/notifications/[id]/acknowledge/route";
import { POST as registerDevice, GET as getDevices, DELETE as revokeDevice } from "../app/api/notifications/devices/route";
import { GET as getPreferences, PUT as updatePreferences } from "../app/api/notifications/preferences/route";
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

async function makeAuthHeaders(userId: string, role = "ADMIN", companyId = "65a0000000000000000000aa") {
  const token = await encode({
    token: { id: userId, email: `user_${userId}@test.com`, name: "Test User", role, companyId },
    secret: TEST_SECRET,
  });
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function runApiTests() {
  console.log("=== STARTING NOTIFICATION API TEST SUITE ===");

  const testUserId = "65a000000000000000000001";
  const headers = await makeAuthHeaders(testUserId, "ADMIN");

  // 1. Post notification via API
  console.log("\n[API Test 1] POST /api/notifications (Publish Event)");
  const postReq = new NextRequest("http://localhost:3000/api/notifications", {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "API Created Alert",
      message: "Order #999 needs review.",
      eventType: "ORDER_CREATED",
      severity: "INFO",
      recipientPolicy: { type: "SPECIFIC_USERS", userIds: [testUserId] },
    }),
  });

  const postRes = await postNotification(postReq);
  const postJson = await postRes.json();
  assert(postRes.status === 201 && postJson.success, "Published notification via API");
  const notificationId = postJson.notificationId;

  // 2. Unread count API
  console.log("\n[API Test 2] GET /api/notifications/unread-count");
  const unreadReq = new NextRequest("http://localhost:3000/api/notifications/unread-count", {
    method: "GET",
    headers,
  });
  const unreadRes = await getUnreadCount(unreadReq);
  const unreadJson = await unreadRes.json();
  assert(unreadRes.status === 200 && unreadJson.count >= 1, "Unread count returns accurate number");

  // 3. List notifications API
  console.log("\n[API Test 3] GET /api/notifications");
  const listReq = new NextRequest("http://localhost:3000/api/notifications?limit=10", {
    method: "GET",
    headers,
  });
  const listRes = await getNotifications(listReq);
  const listJson = await listRes.json();
  assert(listRes.status === 200 && Array.isArray(listJson.data), "Lists notifications array");
  const found = listJson.data.find((n: any) => n.id === notificationId);
  assert(found !== undefined && found.read === false, "Found created notification in unread state");

  // 4. Mark as read API
  console.log("\n[API Test 4] POST /api/notifications/[id]/read");
  const markReadReq = new NextRequest(`http://localhost:3000/api/notifications/${notificationId}/read`, {
    method: "POST",
    headers,
  });
  const markReadRes = await markRead(markReadReq, { params: { id: notificationId } });
  const markReadJson = await markReadRes.json();
  assert(markReadRes.status === 200 && markReadJson.success, "Marked notification as read");

  // 5. Acknowledge API
  console.log("\n[API Test 5] POST /api/notifications/[id]/acknowledge");
  const ackReq = new NextRequest(`http://localhost:3000/api/notifications/${notificationId}/acknowledge`, {
    method: "POST",
    headers,
  });
  const ackRes = await acknowledgeNotif(ackReq, { params: { id: notificationId } });
  const ackJson = await ackRes.json();
  assert(ackRes.status === 200 && ackJson.success, "Acknowledged notification");

  // 6. Device registration & token revocation API
  console.log("\n[API Test 6] Device Registration & Token Revocation");
  const testDeviceToken = `fcm_token_test_${Date.now()}`;
  const regReq = new NextRequest("http://localhost:3000/api/notifications/devices", {
    method: "POST",
    headers,
    body: JSON.stringify({
      platform: "ANDROID",
      pushToken: testDeviceToken,
      deviceName: "Pixel 7 Pro",
      appVersion: "1.4.0",
    }),
  });
  const regRes = await registerDevice(regReq);
  const regJson = await regRes.json();
  assert(regRes.status === 200 && regJson.success, "Registered Android push device");

  const getDevReq = new NextRequest("http://localhost:3000/api/notifications/devices", {
    method: "GET",
    headers,
  });
  const getDevRes = await getDevices(getDevReq);
  const getDevJson = await getDevRes.json();
  const registered = getDevJson.data?.find((d: any) => d.id === regJson.deviceId);
  assert(registered !== undefined && registered.isActive === true, "Retrieved registered device");

  const revokeReq = new NextRequest("http://localhost:3000/api/notifications/devices", {
    method: "DELETE",
    headers,
    body: JSON.stringify({ pushToken: testDeviceToken }),
  });
  const revokeRes = await revokeDevice(revokeReq);
  const revokeJson = await revokeRes.json();
  assert(revokeRes.status === 200 && revokeJson.success, "Revoked device token");

  // 7. Preferences API
  console.log("\n[API Test 7] Preferences GET & PUT");
  const putPrefReq = new NextRequest("http://localhost:3000/api/notifications/preferences", {
    method: "PUT",
    headers,
    body: JSON.stringify({
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
      mutedEventTypes: ["STORE_ANNOUNCEMENT"],
    }),
  });
  const putPrefRes = await updatePreferences(putPrefReq);
  const putPrefJson = await putPrefRes.json();
  assert(putPrefRes.status === 200 && putPrefJson.success, "Updated user notification preferences");

  const getPrefReq = new NextRequest("http://localhost:3000/api/notifications/preferences", {
    method: "GET",
    headers,
  });
  const getPrefRes = await getPreferences(getPrefReq);
  const getPrefJson = await getPrefRes.json();
  assert(getPrefJson.data.quietHoursStart === "22:00", "Persisted quiet hours correctly");
  assert(getPrefJson.data.mutedEventTypes.includes("STORE_ANNOUNCEMENT"), "Persisted muted event types");

  // 8. Mark all as read API
  console.log("\n[API Test 8] POST /api/notifications/mark-all-read");
  const markAllReq = new NextRequest("http://localhost:3000/api/notifications/mark-all-read", {
    method: "POST",
    headers,
  });
  const markAllRes = await markAllRead(markAllReq);
  const markAllJson = await markAllRes.json();
  assert(markAllRes.status === 200 && typeof markAllJson.count === "number", "Marked all as read");

  console.log("\n🎉 ALL NOTIFICATION API TESTS PASSED SUCCESSFULLY!");
}

runApiTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("API Test failed:", err);
    process.exit(1);
  });
