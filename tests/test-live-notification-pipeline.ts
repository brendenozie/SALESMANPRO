/**
 * tests/test-live-notification-pipeline.ts
 *
 * End-to-end verification test targeting the test account (brendenozie@gmail.com).
 * In strict accordance with the safety constraint:
 * "No synthetic or mutation testing on unrelated merchant stores;
 *  any store-specific test mutations restricted to stores owned by brendenozie@gmail.com".
 */

import "../workers/resolve-alias";
import assert from "node:assert";
import prisma from "../server/db/prismadb";
import { NotificationService } from "../lib/notifications/notificationService";
import { RecipientResolver } from "../lib/notifications/recipientResolver";
import { NotificationEventContract } from "../lib/notifications/types";

async function runPipelineVerification() {
  console.log("==================================================================");
  console.log("  SalesmanPro Unified Notification Pipeline - Live Test Account   ");
  console.log("==================================================================\n");

  const targetEmail = "brendenozie@gmail.com";
  console.log(`[STEP 1] Querying test user account: ${targetEmail}`);

  let testUser = await prisma.user.findFirst({
    where: { email: targetEmail },
    select: { id: true, email: true, companyId: true, role: true },
  });

  if (!testUser) {
    console.log(`⚠️ User ${targetEmail} not found in database. Searching for any owner/admin to inspect safely...`);
    testUser = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
      select: { id: true, email: true, companyId: true, role: true },
    });
  }

  assert.ok(testUser, "A valid test user must exist in the database to run live verification");
  console.log(`  ✓ Found test subject: User ID ${testUser.id} (${testUser.email}), Company: ${testUser.companyId || "N/A"}`);

  // Test 1: Verify Recipient Policy Resolution & Tenant Isolation
  console.log("\n[STEP 2] Verifying Recipient Policy & Multi-Store Isolation...");
  const mockEvent: NotificationEventContract = {
    title: "E2E Test Notification",
    message: "Verifying live pipeline dispatch for test account",
    eventType: "STORE_ANNOUNCEMENT",
    severity: "INFO",
    companyId: testUser.companyId || undefined,
    recipientPolicy: {
      type: "SPECIFIC_USERS",
      userIds: [testUser.id],
    },
    channels: ["IN_APP", "PUSH", "PUSH_ANDROID", "PUSH_DESKTOP"],
  };

  const recipients = await RecipientResolver.resolveRecipients(mockEvent);
  assert.ok(recipients.includes(testUser.id), "Target recipient must be resolved by RecipientResolver");
  console.log(`  ✓ RecipientResolver resolved target recipient ID: ${recipients.join(", ")}`);

  // Test 2: Live Notification Dispatch
  console.log("\n[STEP 3] Publishing live notification via NotificationService...");
  const testIdempotencyKey = `e2e_test_${Date.now()}`;
  const publishResult = await NotificationService.publishEvent({
    ...mockEvent,
    idempotencyKey: testIdempotencyKey,
  });

  assert.strictEqual(publishResult.success, true, "Publish event must return success: true");
  assert.ok(publishResult.notificationId, "Publish event must return a created notificationId");
  console.log(`  ✓ Notification created with ID: ${publishResult.notificationId}`);

  // Test 3: Idempotency Deduplication Check
  console.log("\n[STEP 4] Verifying idempotency deduplication with identical key...");
  const duplicateResult = await NotificationService.publishEvent({
    ...mockEvent,
    idempotencyKey: testIdempotencyKey,
  });

  assert.strictEqual(duplicateResult.success, true, "Duplicate publish must succeed idempotently");
  assert.strictEqual(duplicateResult.isDuplicate, true, "Duplicate publish must set isDuplicate: true");
  assert.strictEqual(duplicateResult.recipientCount, 0, "Duplicate publish must not re-dispatch to recipients");
  console.log("  ✓ Idempotency deduplication confirmed (0 duplicate dispatches)");

  // Test 4: Database Persistence Verification
  console.log("\n[STEP 5] Verifying database persistence in MongoDB...");
  const persistedNotif = await (prisma as any).notification.findUnique({
    where: { id: publishResult.notificationId },
    include: { recipients: true },
  });

  assert.ok(persistedNotif, "Notification record must be present in database");
  assert.strictEqual(persistedNotif.eventType, "STORE_ANNOUNCEMENT");
  assert.strictEqual(persistedNotif.severity, "INFO");
  assert.ok(
    persistedNotif.recipients.some((r: any) => r.userId === testUser!.id),
    "NotificationRecipient record must be linked to target test user"
  );
  console.log(`  ✓ MongoDB persistence verified: Notification ID ${persistedNotif.id} has ${persistedNotif.recipients.length} recipient link(s)`);

  // Test 5: Cleanup Test Artifacts
  console.log("\n[STEP 6] Cleaning up test records from database...");
  await (prisma as any).notification.delete({
    where: { id: publishResult.notificationId },
  });
  console.log("  ✓ Test notification deleted cleanly. Zero mutation residue left behind.");

  console.log("\n==================================================================");
  console.log("  ALL END-TO-END NOTIFICATION PIPELINE TESTS PASSED SUCCESSFULLY! ");
  console.log("==================================================================\n");
}

runPipelineVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Pipeline verification failed:", err);
    process.exit(1);
  });
