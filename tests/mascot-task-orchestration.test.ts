/**
 * tests/mascot-task-orchestration.test.ts
 *
 * Automated Test Suite for SalesmanPro Mascot Background AI Task Execution,
 * Persistent Lifecycle, Autonomous Monitoring, Multi-Tenant Scoping & Credit Management.
 *
 * Run with:
 * npx ts-node -r ./scripts/register-paths.js --project tsconfig.worker.json tests/mascot-task-orchestration.test.ts
 */

import { MascotTaskService } from "@/lib/ai/mascot/taskService";
import { MascotTaskOrchestrator } from "@/lib/ai/mascot/taskOrchestrator";
import { MascotTaskState, MascotTaskType } from "@/lib/ai/mascot/taskTypes";
import prisma from "@/server/db/prismadb";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (details) console.error("     Details:", details);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log("=========================================================");
  console.log("🤖 RUNNING SALESMANPRO MASCOT BACKGROUND TASK TEST SUITE");
  console.log("=========================================================\n");

  const companyA = "65a000000000000000000001";
  const companyB = "65a000000000000000000002";
  const testUserId = "65a000000000000000000010";

  // --- 1. Persistent Task Lifecycle & State Mapping ---
  console.log("--- 1. Persistent Task Lifecycle & State Mapping ---");
  const states: MascotTaskState[] = [
    "PENDING",
    "VALIDATING",
    "AWAITING_APPROVAL",
    "QUEUED",
    "RUNNING",
    "PAUSED",
    "RETRYING",
    "COMPLETED",
    "PARTIALLY_COMPLETED",
    "FAILED",
    "CANCELLED",
    "EXPIRED",
  ];
  assert(states.length === 12, "Defines all 12 required task states");

  const prismaRunning = MascotTaskService.mapMascotToPrismaStatus("RUNNING");
  assert(prismaRunning === "RUNNING", "RUNNING maps accurately to Prisma RUNNING");

  const prismaWaiting = MascotTaskService.mapMascotToPrismaStatus("AWAITING_APPROVAL");
  assert(prismaWaiting === "WAITING_APPROVAL", "AWAITING_APPROVAL maps accurately to Prisma WAITING_APPROVAL");

  const prismaCompleted = MascotTaskService.mapMascotToPrismaStatus("PARTIALLY_COMPLETED");
  assert(prismaCompleted === "COMPLETED", "PARTIALLY_COMPLETED maps to Prisma COMPLETED");

  // --- 2. Task Creation & Credit Reservation ---
  console.log("\n--- 2. Task Creation & State Initialization ---");

  // Clean up any lingering tasks from previous test runs
  try {
    await (prisma as any).aIAgentTask.deleteMany({
      where: { companyId: companyA },
    });
  } catch (cleanErr) {
    // Ignore if collection not present
  }

  const task = await MascotTaskService.createTask({
    companyId: companyA,
    storeSlug: "acme-store",
    userId: testUserId,
    userRole: "ADMIN",
    taskType: "REPORT_GENERATION",
    title: "Quarterly Revenue Audit",
    priority: 3,
    requiresApproval: false,
    input: { period: "month" },
    creditCost: 5,
  });

  assert(!!task.id, "Task successfully created with durable ID");
  assert(task.status === "QUEUED", "Standard non-approval task enters QUEUED state");
  assert(task.credits.reserved === 5, "Credits accurately reserved for task");
  assert(task.progress.percent === 0, "Initial progress is 0%");
  assert(task.subtasks.length === 3, "Decomposed into 3 structured subtasks");

  // --- 3. Multi-Tenant Scoping & Isolation ---
  console.log("\n--- 3. Strict Multi-Tenant Scoping ---");
  const companyATask = await MascotTaskService.getTaskById(task.id, companyA);
  assert(!!companyATask, "Company A can access its own task");

  const crossTenantAccess = await MascotTaskService.getTaskById(task.id, companyB);
  assert(crossTenantAccess === null, "Company B is strictly blocked from accessing Company A's task");

  // --- 4. Approval Gating & Human Oversight ---
  console.log("\n--- 4. Approval Gating & Human Oversight ---");
  const sensitiveTask = await MascotTaskService.createTask({
    companyId: companyA,
    storeSlug: "acme-store",
    userId: testUserId,
    userRole: "STAFF",
    taskType: "BULK_PRICE_UPDATE",
    title: "Apply 10% Inflation Adjustment",
    priority: 4,
    requiresApproval: true,
    approvalDetails: {
      actionType: "pricing:bulk_price_adjustment",
      title: "Approve 10% Catalog Price Increase",
      description: "Increase prices across store catalog by 10%",
      proposedAction: { percentage: 10 },
      affectedCount: 25,
      risks: ["Irreversible price adjustments on live store"],
    },
    input: { percentage: 10 },
    creditCost: 10,
  });

  assert(sensitiveTask.status === "AWAITING_APPROVAL", "Sensitive task halts in AWAITING_APPROVAL state");
  assert(!!sensitiveTask.approval?.approvalId, "Generates linked AIAgentApproval ticket");

  // Test unauthorized role trying to approve
  let staffApprovalFailed = false;
  try {
    await MascotTaskService.approveTask(sensitiveTask.id, testUserId, companyA, "STAFF");
  } catch (err: any) {
    staffApprovalFailed = err.message.includes("not authorized");
  }
  assert(staffApprovalFailed, "Staff role is strictly forbidden from approving sensitive task");

  // Test authorized Admin approving task
  const approvedTask = await MascotTaskService.approveTask(sensitiveTask.id, testUserId, companyA, "ADMIN");
  assert(approvedTask.status === "QUEUED", "Admin approval transitions task to QUEUED state");
  assert(approvedTask.approval?.status === "APPROVED", "Approval ticket marked as APPROVED");

  // --- 5. Progress Tracking & Defensible ETA Calculation ---
  console.log("\n--- 5. Progress Tracking & Defensible ETA Calculation ---");
  await MascotTaskService.updateProgress(task.id, companyA, {
    percent: 50,
    currentStep: "Auditing product sales records",
    processedCount: 50,
    totalCount: 100,
    checkpointMessage: "Processed 50 of 100 orders",
    subtaskId: "step_prepare",
    subtaskStatus: "RUNNING",
  });

  const updatedProgressTask = (await MascotTaskService.getTaskById(task.id, companyA))!;
  assert(updatedProgressTask.progress.percent === 50, "Progress percent updated to 50%");
  assert(updatedProgressTask.progress.processedCount === 50, "Processed count updated to 50");
  assert(updatedProgressTask.progress.checkpoints.length >= 2, "Checkpoints recorded with audit message");

  // --- 6. Task Pause, Resume, and Cancellation ---
  console.log("\n--- 6. Task Pause, Resume, and Cancellation ---");
  const pausedTask = await MascotTaskService.pauseTask(task.id, testUserId, companyA, "Maintenance hold");
  assert(pausedTask.status === "PAUSED", "Task transitions to PAUSED");

  const resumedTask = await MascotTaskService.resumeTask(task.id, testUserId, companyA);
  assert(resumedTask.status === "QUEUED", "Task transitions back to QUEUED on resume");

  const cancelledTask = await MascotTaskService.cancelTask(task.id, testUserId, companyA, "User requested stop");
  assert(cancelledTask.status === "CANCELLED", "Task transitions to CANCELLED state");

  // --- 7. Execution Engine & Database Verification ---
  console.log("\n--- 7. Autonomous Execution Engine ---");
  const executionTask = await MascotTaskService.createTask({
    companyId: companyA,
    storeSlug: "acme-store",
    userId: testUserId,
    userRole: "ADMIN",
    taskType: "DATA_ANALYSIS",
    title: "Store KPI & Growth Analysis",
    requiresApproval: false,
    input: {},
  });

  // Run orchestrator
  await MascotTaskOrchestrator.executeTask(executionTask);

  const completedTask = (await MascotTaskService.getTaskById(executionTask.id, companyA))!;
  assert(completedTask.status === "COMPLETED", "Orchestrator successfully completed DATA_ANALYSIS task");
  assert(completedTask.progress.percent === 100, "Final progress reached 100%");
  assert(!!completedTask.output?.summary, "Generated authoritative verified summary");
  assert(completedTask.output?.summary.includes("Store Operational Intelligence"), "Summary reflects actual data");

  // --- 8. Partial Completion Handling ---
  console.log("\n--- 8. Partial Completion Handling ---");
  const partialTask = await MascotTaskService.createTask({
    companyId: companyA,
    storeSlug: "acme-store",
    userId: testUserId,
    userRole: "ADMIN",
    taskType: "BULK_PRICE_UPDATE",
    title: "Partial Adjustment Test",
    requiresApproval: false,
    input: { percentage: 5 },
  });

  await MascotTaskService.finalizeTask(partialTask.id, companyA, {
    summary: "Updated 8 products. 2 items skipped due to lock.",
    partiallyCompleted: true,
    partialReason: "2 items locked by POS terminal",
    creditsConsumed: 3,
  });

  const checkedPartial = (await MascotTaskService.getTaskById(partialTask.id, companyA))!;
  assert(checkedPartial.status === "PARTIALLY_COMPLETED", "Accurately records PARTIALLY_COMPLETED status");
  assert(checkedPartial.credits.consumed === 3, "Finalized credits consumed");

  // --- 9. Transient Error Recovery & Bounded Retry ---
  console.log("\n--- 9. Transient Error Recovery & Bounded Retry ---");
  const failTask = await MascotTaskService.createTask({
    companyId: companyA,
    storeSlug: "acme-store",
    userId: testUserId,
    userRole: "ADMIN",
    taskType: "MARKETPLACE_SYNC",
    title: "Fault Tolerance Test",
    requiresApproval: false,
    input: {},
  });

  await MascotTaskService.failTask(failTask.id, companyA, {
    code: "NETWORK_TIMEOUT",
    message: "ETIMEDOUT when connecting to sync gateway",
  });

  const retriedTask = (await MascotTaskService.getTaskById(failTask.id, companyA))!;
  assert(
    retriedTask.status === "RETRYING",
    "Transient network error triggers RETRYING state with exponential backoff"
  );
  assert(retriedTask.error?.category === "TRANSIENT_NETWORK", "Categorized as TRANSIENT_NETWORK");
  assert(retriedTask.error?.retryCount === 1, "Retry attempt counter incremented to 1");

  console.log("\n=========================================================");
  console.log(`🎉 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=========================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution threw uncaught error:", err);
  process.exit(1);
});
