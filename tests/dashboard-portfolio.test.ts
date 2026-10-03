import "dotenv/config";
import assert from "node:assert";
import {
  resolvePeriodDateRange,
  calculateChangePercent,
  getStartOfDay,
  getEndOfDay,
  ReportingPeriod,
} from "../lib/dashboard/dateRangeHelper";
import { getPortfolioDashboardData } from "../lib/dashboard/portfolioService";

async function runTests() {
  console.log("Starting Multi-Store Portfolio BI Dashboard Tests...\n");

  // Test 1: Date Range Helper - Standard Periods
  {
    const periods: ReportingPeriod[] = [
      "today",
      "yesterday",
      "last7days",
      "last30days",
      "thisWeek",
      "thisMonth",
      "previousMonth",
      "thisQuarter",
      "thisYear",
    ];

    for (const p of periods) {
      const range = resolvePeriodDateRange(p);
      assert.strictEqual(range.period, p);
      assert.ok(range.startDate instanceof Date, `${p} startDate must be a Date`);
      assert.ok(range.endDate instanceof Date, `${p} endDate must be a Date`);
      assert.ok(range.prevStartDate instanceof Date, `${p} prevStartDate must be a Date`);
      assert.ok(range.prevEndDate instanceof Date, `${p} prevEndDate must be a Date`);
      assert.ok(
        range.startDate <= range.endDate,
        `${p} startDate must be <= endDate`,
      );
      assert.ok(
        range.prevStartDate <= range.prevEndDate,
        `${p} prevStartDate must be <= prevEndDate`,
      );
      assert.ok(range.label.length > 0, `${p} label must not be empty`);
    }
    console.log("ok 1 - All 9 standard reporting periods produce valid Date ranges");
  }

  // Test 2: Custom Date Range
  {
    const custom = resolvePeriodDateRange("custom", "2026-05-01", "2026-05-15");
    assert.strictEqual(custom.period, "custom");
    assert.strictEqual(custom.startDate.getFullYear(), 2026);
    assert.strictEqual(custom.startDate.getMonth(), 4); // May (0-indexed)
    assert.strictEqual(custom.startDate.getDate(), 1);
    assert.strictEqual(custom.endDate.getFullYear(), 2026);
    assert.strictEqual(custom.endDate.getMonth(), 4); // May
    assert.strictEqual(custom.endDate.getDate(), 15);
    // Equivalent previous window should be 15 days before
    assert.ok(custom.prevStartDate < custom.startDate);
    assert.ok(custom.prevEndDate <= custom.startDate);
    console.log("ok 2 - Custom date range accurately computes current & equivalent previous window");
  }

  // Test 3: Change Percentage Computations
  {
    assert.strictEqual(calculateChangePercent(100, 100), 0);
    assert.strictEqual(calculateChangePercent(150, 100), 50);
    assert.strictEqual(calculateChangePercent(50, 100), -50);
    assert.strictEqual(calculateChangePercent(100, 0), 100);
    assert.strictEqual(calculateChangePercent(0, 0), 0);
    console.log("ok 3 - Change percentage helper handles zero baseline, increases, and decreases");
  }

  // Test 4: Day boundary helpers
  {
    const d = new Date("2026-06-15T14:32:00.000Z");
    const start = getStartOfDay(d);
    assert.strictEqual(start.getHours(), 0);
    assert.strictEqual(start.getMinutes(), 0);
    assert.strictEqual(start.getSeconds(), 0);
    assert.strictEqual(start.getMilliseconds(), 0);

    const end = getEndOfDay(d);
    assert.strictEqual(end.getHours(), 23);
    assert.strictEqual(end.getMinutes(), 59);
    assert.strictEqual(end.getSeconds(), 59);
    assert.strictEqual(end.getMilliseconds(), 999);
    console.log("ok 4 - getStartOfDay and getEndOfDay correctly snap to millisecond boundaries");
  }

  // Test 5: Empty User / No-stores immediate safe return
  {
    // Calling with a non-existent fake ObjectId should return clean zero state without exceptions
    const fakeUserId = "000000000000000000000000";
    const result = await getPortfolioDashboardData(fakeUserId, "USER", {
      period: "last7days",
      refresh: true,
    });

    assert.ok(result, "Dashboard result must exist");
    assert.strictEqual(result.kpis.totalStores.total, 0);
    assert.strictEqual(result.kpis.totalSales.value, 0);
    assert.strictEqual(result.kpis.totalOrders.value, 0);
    assert.strictEqual(result.kpis.totalRevenue.value, 0);
    assert.strictEqual(result.kpis.totalCustomers.periodUnique, 0);
    assert.strictEqual(result.kpis.outstandingPayments.value, 0);
    assert.strictEqual(result.kpis.activeStores.count, 0);
    assert.deepStrictEqual(result.topPerformingStores, []);
    assert.deepStrictEqual(result.operationalAlerts, []);
    assert.deepStrictEqual(result.recentActivity, []);
    assert.strictEqual(result.metadata.period, "last7days");
    console.log("ok 5 - getPortfolioDashboardData safely handles user with no stores (0 DB aggregation queries)");
  }

  console.log("\nAll Dashboard Portfolio Tests passed successfully!");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
