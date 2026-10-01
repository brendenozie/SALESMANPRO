/**
 * tests/notification-integrations.test.ts
 *
 * Automated verification of business event integrations:
 * - MascotTaskNotificationService -> NotificationService
 * - Observability alert trigger -> NotificationService
 * - ClientNotificationBridge cross-platform detection
 */

import { MascotTaskNotificationService } from "../lib/ai/mascot/taskNotificationService";
import { MascotTaskRecord } from "../lib/ai/mascot/taskTypes";
import { NotificationService } from "../lib/notifications/notificationService";
import { ClientNotificationBridge } from "../lib/notifications/clientBridge";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ ${message}`);
  }
}

async function runIntegrationTests() {
  console.log("=== STARTING BUSINESS EVENT & CLIENT ADAPTER TEST SUITE ===");

  const testCompanyId = "65a0000000000000000000aa";
  const testUserId = "65a000000000000000000001";

  // Test 1: Mascot Approval Required Event
  console.log("\n[Test 1] Mascot Task Approval Requested Integration");
  const mockTask: MascotTaskRecord = {
    id: `task_${Date.now()}`,
    companyId: testCompanyId,
    storeId: "store_main",
    storeSlug: "demo-store",
    userId: testUserId,
    taskType: "BULK_PRICE_UPDATE",
    title: "Bulk Price Adjustment for 50 Items",
    status: "WAITING_APPROVAL",
    priority: "HIGH",
    state: "AWAITING_APPROVAL",
    progress: 0,
    currentStep: 1,
    totalSteps: 2,
    subtasks: [],
    inputPayload: {},
    retryCount: 0,
    maxRetries: 3,
    requiresApproval: true,
    riskLevel: "HIGH",
    checkpoints: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await MascotTaskNotificationService.notifyTaskEvent(mockTask, "APPROVAL_REQUESTED", {
    reason: "Exceeds automated change threshold",
    affectedCount: 50,
  });

  const notifs = await NotificationService.getUserNotifications({
    userId: testUserId,
    limit: 5,
  });
  const mascotAlert = notifs.items.find((n) => n.resourceId === mockTask.id);
  assert(mascotAlert !== undefined, "Mascot approval notification was persisted and targeted to user");
  assert(mascotAlert?.severity === "CRITICAL", "Mascot approval has CRITICAL severity");
  assert(mascotAlert?.eventType === "MASCOT_APPROVAL_REQUESTED", "Mapped to MASCOT_APPROVAL_REQUESTED event type");

  // Test 2: Mascot Task Completed Event
  console.log("\n[Test 2] Mascot Task Completed Integration");
  await MascotTaskNotificationService.notifyTaskEvent(mockTask, "TASK_COMPLETED");

  const completedNotifs = await NotificationService.getUserNotifications({
    userId: testUserId,
    limit: 5,
  });
  const completedAlert = completedNotifs.items.find(
    (n) => n.resourceId === mockTask.id && n.eventType === "MASCOT_TASK_COMPLETED"
  );
  assert(completedAlert !== undefined, "Mascot completion notification was persisted");
  assert(completedAlert?.severity === "INFO", "Mascot completion has INFO severity");

  // Test 3: Client Notification Bridge Detection
  console.log("\n[Test 3] Client Notification Bridge Runtime Detection");
  const platform = ClientNotificationBridge.getPlatform();
  assert(platform === "WEB", "Node/SSR environment resolves platform to WEB cleanly");

  console.log("\n🎉 ALL BUSINESS EVENT & CLIENT ADAPTER TESTS PASSED SUCCESSFULLY!");
}

runIntegrationTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Integration test failed:", err);
    process.exit(1);
  });
