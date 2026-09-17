/**
 * tests/observability-integration.test.ts
 *
 * Automated Integration Test Suite for the Superadmin Observability
 * and Performance Subsystem.
 */

import { generateErrorFingerprint, normalizeErrorMessage } from "../lib/observability/errorFingerprint";
import { collectServerMetrics } from "../lib/observability/serverCollector";
import { evaluateAlertRules } from "../lib/observability/alertEngine";
import { getLiveTrafficSummary, trackRequest } from "../lib/observability/tracker";
import { getAllQueueStatuses } from "../lib/observability/queueMonitor";

async function runTests() {
  console.log("================================================================================");
  console.log("STARTING SUPERADMIN OBSERVABILITY INTEGRATION TESTS");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extra?: any) {
    if (condition) {
      console.log(`✔ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✖ FAIL: ${testName}`, extra || "");
      failed++;
    }
  }

  // 1. Error Fingerprint Normalization
  console.log("--- 1. Testing Error Normalization & Fingerprinting ---");
  const rawMsg = "Error: Order 654321abcdef1234567890 failed for user 12345 with token=secret123";
  const normalized = normalizeErrorMessage(rawMsg);
  assert(!normalized.includes("654321abcdef1234567890"), "ObjectIds are replaced with placeholder");
  assert(normalized.includes("[REDACTED]"), "Tokens and secrets are properly redacted");

  const err1 = new TypeError("Cannot read properties of undefined (reading 'company')");
  const fp1 = generateErrorFingerprint(err1);
  const err2 = new TypeError("Cannot read properties of undefined (reading 'company')");
  const fp2 = generateErrorFingerprint(err2);
  assert(fp1.fingerprint === fp2.fingerprint, "Identical errors produce stable identical fingerprints");
  assert(fp1.errorType === "TypeError", "Error type is correctly resolved");

  // 2. Server Metrics Collector
  console.log("\n--- 2. Testing Server Resource Collector ---");
  const serverMetrics = await collectServerMetrics();
  assert(typeof serverMetrics.cpuUsagePercent === "number", "CPU usage is reported as number");
  assert(serverMetrics.memoryTotalBytes > 0, "Memory total is non-zero");
  assert(serverMetrics.memoryUsedBytes >= 0, "Memory used is non-negative");
  assert(serverMetrics.uptimeSeconds >= 0, "Uptime is non-negative");
  assert(["ONLINE", "WARNING", "DEGRADED", "OFFLINE"].includes(serverMetrics.status), "Server status is valid enum");
  assert(serverMetrics.activeServices.includes("next.js"), "Active services includes next.js");

  // 3. In-Memory Request Tracking & Live Traffic
  console.log("\n--- 3. Testing Non-Blocking Request Tracking ---");
  const testRequestId = "test_req_" + Date.now();
  trackRequest({
    requestId: testRequestId,
    method: "POST",
    route: "/api/shop/orders",
    statusCode: 201,
    durationMs: 42.5,
    authDurationMs: 12.0,
    dbDurationMs: 25.0,
    hostname: "salesmanpro.site",
  });

  const trafficSummary = getLiveTrafficSummary();
  assert(trafficSummary.totalRequests >= 1, "Tracked request appears in live traffic total");
  const foundReq = trafficSummary.recentRequests.find((r) => r.requestId === testRequestId);
  assert(Boolean(foundReq), "Tracked request is stored in circular live stream buffer");
  assert(foundReq?.durationMs === 42.5, "Duration is accurately preserved");

  // 4. Alert Rules Engine
  console.log("\n--- 4. Testing Alert Rules Engine ---");
  const alertsNormal = await evaluateAlertRules({
    cpu_percent: 15,
    memory_percent: 40,
    disk_percent: 35,
    error_rate: 0.2,
    p95_latency: 80,
    db_latency: 12,
    queue_backlog: 5,
  });
  assert(Array.isArray(alertsNormal), "Alert rules return an array of definitions");

  const alertsSpike = await evaluateAlertRules({
    cpu_percent: 95, // Above 85% threshold
    memory_percent: 92, // Above 90% threshold
    disk_percent: 40,
    error_rate: 15, // Above 5% threshold
    p95_latency: 3500, // Above 2000ms threshold
    db_latency: 20,
    queue_backlog: 250, // Above 150 threshold
  });

  const cpuAlert = alertsSpike.find((a) => a.metric === "cpu_percent");
  assert(cpuAlert?.state === "TRIGGERED", "CPU spike triggers alert state transition");
  const errorAlert = alertsSpike.find((a) => a.metric === "error_rate");
  assert(errorAlert?.state === "TRIGGERED", "High error rate triggers alert state transition");

  // 5. Queue Status Monitor
  console.log("\n--- 5. Testing Queue Status Monitor ---");
  const queues = await getAllQueueStatuses();
  assert(Array.isArray(queues), "Queue monitor returns an array of queue statuses");
  assert(queues.length >= 10, "Monitors at least 10 core application BullMQ queues");
  const whatsappQ = queues.find((q) => q.name === "whatsapp-messages");
  assert(Boolean(whatsappQ), "WhatsApp queue is present in monitored queue set");

  console.log("\n================================================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
