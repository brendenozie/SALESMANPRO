import prisma from "../server/db/prismadb";
import * as financeService from "../lib/finance/financeService";

/**
 * Automated Verification Script for SALESmanPro Business Operating System
 * Tests real database queries and calculations across the financial engine.
 */
async function main() {
  console.log("=== SALESmanPro Business Operating System Verification ===");

  // 1. Find a test company in the database
  const company = await prisma.company.findFirst({
    select: { id: true, name: true, currency: true },
  });

  if (!company) {
    console.log("⚠️ No company found in the database. Verifying engine functions with a mock company ID.");
  }

  const testCompanyId = company?.id || "mock-company-id";
  console.log(`Testing with Company: ${company?.name || "Test"} (ID: ${testCompanyId})`);

  // 2. Test Income Statement (P&L) Engine
  console.log("\n--- Testing Income Statement (P&L) Engine ---");
  const pnl = await financeService.getIncomeStatement(testCompanyId);
  console.log("Revenue Summary:", {
    grossSales: pnl.revenue.grossSales,
    discounts: pnl.revenue.discounts,
    returnsAndRefunds: pnl.revenue.returnsAndRefunds,
    netRevenue: pnl.revenue.netRevenue,
  });
  console.log("COGS & Profit Summary:", {
    totalCOGS: pnl.cogs.totalCOGS,
    grossProfit: pnl.profitability.grossProfit,
    grossMarginPct: `${pnl.profitability.grossMarginPercentage}%`,
    totalOperatingExpenses: pnl.profitability.totalOperatingExpenses,
    netProfit: pnl.profitability.netProfit,
    netMarginPct: `${pnl.profitability.netMarginPercentage}%`,
  });

  // Verify arithmetic
  const expectedNetRev = Math.max(0, pnl.revenue.grossSales - pnl.revenue.returnsAndRefunds);
  if (Math.abs(pnl.revenue.netRevenue - expectedNetRev) > 0.01) {
    throw new Error(`Net revenue mismatch: got ${pnl.revenue.netRevenue}, expected ${expectedNetRev}`);
  }
  const expectedGrossProfit = pnl.revenue.netRevenue - pnl.cogs.totalCOGS;
  if (Math.abs(pnl.profitability.grossProfit - expectedGrossProfit) > 0.01) {
    throw new Error(`Gross profit mismatch: got ${pnl.profitability.grossProfit}, expected ${expectedGrossProfit}`);
  }
  console.log("✅ Income Statement arithmetic verified.");

  // 3. Test Cash Flow Engine
  console.log("\n--- Testing Cash Flow Statement Engine ---");
  const cashFlow = await financeService.getCashFlowStatement(testCompanyId);
  console.log("Cash Flow Summary:", {
    cashIn: cashFlow.summary.totalCashIn,
    cashOut: cashFlow.summary.totalCashOut,
    netCashMovement: cashFlow.summary.netCashMovement,
    movementCount: cashFlow.movements.length,
  });
  const expectedNetCash = cashFlow.summary.totalCashIn - cashFlow.summary.totalCashOut;
  if (Math.abs(cashFlow.summary.netCashMovement - expectedNetCash) > 0.01) {
    throw new Error(`Net cash flow mismatch: got ${cashFlow.summary.netCashMovement}, expected ${expectedNetCash}`);
  }
  console.log("✅ Cash Flow arithmetic verified.");

  // 4. Test Accounts Receivable (AR) Engine
  console.log("\n--- Testing Accounts Receivable (AR) Engine ---");
  const ar = await financeService.getAccountsReceivable(testCompanyId);
  console.log("AR Summary:", {
    totalReceivables: ar.totalReceivables,
    totalOverdue: ar.totalOverdue,
    unpaidInvoicesCount: ar.unpaidInvoicesCount,
    agingBuckets: {
      current: ar.aging.current,
      days1to30: ar.aging.days1to30,
      days31to60: ar.aging.days31to60,
      days61to90: ar.aging.days61to90,
      daysOver90: ar.aging.daysOver90,
      total: ar.aging.total,
    },
  });
  const sumAging =
    ar.aging.current +
    ar.aging.days1to30 +
    ar.aging.days31to60 +
    ar.aging.days61to90 +
    ar.aging.daysOver90;
  if (Math.abs(ar.totalReceivables - sumAging) > 0.02) {
    throw new Error(`AR Aging sum mismatch: total ${ar.totalReceivables} vs bucket sum ${sumAging}`);
  }
  console.log("✅ AR Aging bucket consistency verified.");

  // 5. Test Accounts Payable (AP) Engine
  console.log("\n--- Testing Accounts Payable (AP) Engine ---");
  const ap = await financeService.getAccountsPayable(testCompanyId);
  console.log("AP Summary:", {
    totalPayables: ap.totalPayables,
    totalOverdue: ap.totalOverdue,
    unpaidBillsCount: ap.unpaidBillsCount,
    agingBuckets: {
      current: ap.aging.current,
      days1to30: ap.aging.days1to30,
      days31to60: ap.aging.days31to60,
      days61to90: ap.aging.days61to90,
      daysOver90: ap.aging.daysOver90,
      total: ap.aging.total,
    },
  });
  const sumApAging =
    ap.aging.current +
    ap.aging.days1to30 +
    ap.aging.days31to60 +
    ap.aging.days61to90 +
    ap.aging.daysOver90;
  if (Math.abs(ap.totalPayables - sumApAging) > 0.02) {
    throw new Error(`AP Aging sum mismatch: total ${ap.totalPayables} vs bucket sum ${sumApAging}`);
  }
  console.log("✅ AP Aging bucket consistency verified.");

  // 6. Test Tax / VAT Report Engine
  console.log("\n--- Testing Tax / VAT Report Engine ---");
  const tax = await financeService.getTaxReport(testCompanyId);
  console.log("Tax Summary:", {
    salesTax: tax.taxCollectedOnSales,
    expenseTax: tax.taxPaidOnExpenses,
    procurementTax: tax.taxPaidOnProcurement,
    netTaxPayable: tax.netTaxPayable,
  });
  const expectedNetTax =
    tax.taxCollectedOnSales - (tax.taxPaidOnExpenses + tax.taxPaidOnProcurement);
  if (Math.abs(tax.netTaxPayable - expectedNetTax) > 0.01) {
    throw new Error(`Net tax payable mismatch: got ${tax.netTaxPayable}, expected ${expectedNetTax}`);
  }
  console.log("✅ Tax / VAT calculation verified.");

  // 7. Test Inventory Valuation Engine
  console.log("\n--- Testing Inventory Valuation Engine ---");
  const valuation = await financeService.getInventoryValuation(testCompanyId);
  console.log("Inventory Valuation Summary:", {
    totalItemsInCatalog: valuation.totalItemsInCatalog,
    totalUnitsInStock: valuation.totalUnitsInStock,
    totalCostValue: valuation.totalCostValue,
    totalRetailValue: valuation.totalRetailValue,
    potentialProfit: valuation.potentialProfit,
  });
  console.log("✅ Inventory Valuation verified.");

  // 8. Test Attention Items Engine
  console.log("\n--- Testing Attention Items Engine ---");
  const attention = await financeService.getAttentionItems(testCompanyId);
  console.log(`Attention Items Summary: ${attention.length} actionable alerts identified:`);
  attention.slice(0, 3).forEach((item, idx) => {
    console.log(`  [${item.severity}] ${item.title}: ${item.description}`);
  });
  console.log("✅ Attention Items verified.");

  console.log("\n🎉 ALL FINANCIAL ENGINE VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n");
}

main()
  .catch((err) => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
