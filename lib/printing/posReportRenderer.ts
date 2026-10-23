import { ShiftReportData } from "@/lib/pos/posReportService";
import { NormalizedPrintPayload } from "./unifiedPrintClient";

/**
 * Builds a NormalizedPrintPayload for an X-Report or Z-Report
 */
export function buildPosReportPrintPayload(
  report: ShiftReportData,
  opts: {
    targetPrinterId?: string | null;
  } = {}
): NormalizedPrintPayload {
  const isZ = report.reportType === "Z_REPORT";
  const actionKey = "POS_RECEIPT";

  return {
    protocolVersion: 1,
    jobId: `${report.reportType.toLowerCase()}_${report.session.terminalId}_${Date.now()}`,
    actionKey,
    documentType: isZ ? "POS_Z_REPORT" : "POS_X_REPORT",
    documentId: report.reportNumber,
    companyId: report.company.id,
    createdAt: report.generatedAt,
    targetPrinterId: opts.targetPrinterId || undefined,
    document: {
      number: report.reportNumber,
      date: report.generatedAt,
      cashierName: report.operator.name,
      staffCode: report.operator.role,
      orderType: report.reportTitle,
      items: report.paymentBreakdown.map((p) => ({
        name: `PAYMENT: ${p.method} (${p.count} txns)`,
        quantity: p.count,
        price: p.total,
        total: p.total,
      })),
      totals: {
        subtotal: report.financials.grossSales,
        discount: report.financials.totalDiscounts,
        tax: report.financials.totalTax,
        total: report.financials.netSales,
        paid: report.drawerReconciliation.expectedCash,
        currency: report.company.currency,
      },
      footer: isZ
        ? "*** OFFICIAL Z-REPORT: REGISTER CLOSED & BALANCED ***"
        : "*** OFFICIAL X-REPORT: MID-SHIFT AUDIT READING ***",
    },
  };
}

/**
 * Render thermal receipt HTML (80mm width standard) with clean monospace typography
 */
export function renderPosReportHtml(
  report: ShiftReportData,
  paperWidth: "58mm" | "80mm" = "80mm"
): string {
  const isZ = report.reportType === "Z_REPORT";
  const is58 = paperWidth === "58mm";
  const widthPx = is58 ? 220 : 300;
  const currency = report.company.currency === "KES" ? "KSh" : report.company.currency;
  const openedTime = new Date(report.session.openedAt).toLocaleString();
  const reportTime = new Date(report.generatedAt).toLocaleString();
  const closedTime = report.session.closedAt
    ? new Date(report.session.closedAt).toLocaleString()
    : "STILL OPEN";

  const paymentRows = report.paymentBreakdown
    .map(
      (p) => `
      <tr>
        <td style="padding: 2px 0; font-size: 11px;">${p.method} (${p.count})</td>
        <td style="padding: 2px 0; text-align: right; font-weight: bold; font-size: 11px;">
          ${currency} ${p.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    `
    )
    .join("");

  const varianceText =
    report.drawerReconciliation.variance !== null
      ? `${report.drawerReconciliation.variance >= 0 ? "+" : ""}${currency} ${report.drawerReconciliation.variance.toFixed(2)}`
      : "NOT ENTERED";

  const varianceColor =
    report.drawerReconciliation.isBalanced
      ? "#000"
      : (report.drawerReconciliation.variance ?? 0) < 0
      ? "#d32f2f"
      : "#1976d2";

  return `
    <div style="font-family: 'Courier New', Courier, monospace; width: ${widthPx}px; margin: 0 auto; padding: 8px; background: #fff; color: #000; box-sizing: border-box; font-size: 11px;">
      
      <!-- STORE HEADER -->
      <div style="text-align: center; margin-bottom: 6px;">
        <div style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
          ${report.company.name}
        </div>
        ${report.company.address ? `<div style="font-size: 9px; color: #444;">${report.company.address}</div>` : ""}
        ${report.company.phone ? `<div style="font-size: 9px; color: #444;">Tel: ${report.company.phone}</div>` : ""}
      </div>

      <div style="border-top: 2px solid #000; border-bottom: 2px solid #000; text-align: center; padding: 4px 0; margin: 6px 0;">
        <div style="font-size: 13px; font-weight: 900; letter-spacing: 1.5px;">
          ${isZ ? "*** Z-REPORT ***" : "*** X-REPORT ***"}
        </div>
        <div style="font-size: 9px; font-weight: bold; text-transform: uppercase;">
          ${isZ ? "END-OF-DAY REGISTER CLOSURE" : "MID-SHIFT INTERIM READING"}
        </div>
      </div>

      <!-- METADATA -->
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 6px;">
        <tr>
          <td style="color: #555;">Report #:</td>
          <td style="text-align: right; font-weight: bold;">${report.reportNumber}</td>
        </tr>
        <tr>
          <td style="color: #555;">Terminal:</td>
          <td style="text-align: right; font-weight: bold;">${report.session.terminalId}</td>
        </tr>
        <tr>
          <td style="color: #555;">Cashier:</td>
          <td style="text-align: right; font-weight: bold;">${report.operator.name} (${report.operator.role})</td>
        </tr>
        <tr>
          <td style="color: #555;">Shift Open:</td>
          <td style="text-align: right;">${openedTime}</td>
        </tr>
        ${
          isZ
            ? `<tr>
                <td style="color: #555;">Shift Close:</td>
                <td style="text-align: right; font-weight: bold;">${closedTime}</td>
              </tr>`
            : `<tr>
                <td style="color: #555;">Reading At:</td>
                <td style="text-align: right;">${reportTime}</td>
              </tr>`
        }
      </table>

      <!-- FINANCIAL SUMMARY -->
      <div style="border-top: 1px dashed #000; padding-top: 4px; margin-top: 6px;">
        <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">
          [ FINANCIAL SUMMARY ]
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <tr>
            <td>Transactions:</td>
            <td style="text-align: right; font-weight: bold;">${report.financials.totalTransactions}</td>
          </tr>
          <tr>
            <td>Gross Sales:</td>
            <td style="text-align: right; font-weight: bold;">
              ${currency} ${report.financials.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
          ${
            report.financials.totalDiscounts > 0
              ? `<tr>
                  <td>Discounts:</td>
                  <td style="text-align: right; color: #d32f2f;">
                    -${currency} ${report.financials.totalDiscounts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>`
              : ""
          }
          <tr>
            <td>Taxes Collected:</td>
            <td style="text-align: right;">
              ${currency} ${report.financials.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
          <tr style="border-top: 1px solid #000; border-bottom: 1px solid #000; font-weight: 900; font-size: 12px;">
            <td style="padding: 3px 0;">NET SALES:</td>
            <td style="padding: 3px 0; text-align: right;">
              ${currency} ${report.financials.netSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td style="color: #555; font-size: 9px; padding-top: 2px;">Avg Transaction:</td>
            <td style="text-align: right; font-size: 9px; padding-top: 2px;">
              ${currency} ${report.financials.averageTransactionValue.toFixed(2)}
            </td>
          </tr>
        </table>
      </div>

      <!-- PAYMENT BREAKDOWN -->
      <div style="border-top: 1px dashed #000; padding-top: 4px; margin-top: 6px;">
        <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">
          [ PAYMENT METHODS ]
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>${paymentRows}</tbody>
        </table>
      </div>

      <!-- CASH DRAWER RECONCILIATION -->
      <div style="border-top: 1px dashed #000; padding-top: 4px; margin-top: 6px;">
        <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">
          [ DRAWER RECONCILIATION ]
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <tr>
            <td>Opening Float:</td>
            <td style="text-align: right;">${currency} ${report.drawerReconciliation.openingFloat.toFixed(2)}</td>
          </tr>
          <tr>
            <td>+ Cash Sales:</td>
            <td style="text-align: right;">${currency} ${report.drawerReconciliation.cashSales.toFixed(2)}</td>
          </tr>
          ${
            report.drawerReconciliation.cashRefunds > 0
              ? `<tr>
                  <td>- Cash Refunds:</td>
                  <td style="text-align: right; color: #d32f2f;">-${currency} ${report.drawerReconciliation.cashRefunds.toFixed(2)}</td>
                </tr>`
              : ""
          }
          <tr style="font-weight: bold; border-top: 1px dotted #888;">
            <td style="padding-top: 2px;">Expected in Drawer:</td>
            <td style="text-align: right; padding-top: 2px;">
              ${currency} ${report.drawerReconciliation.expectedCash.toFixed(2)}
            </td>
          </tr>
          ${
            report.drawerReconciliation.countedCash !== null
              ? `<tr>
                  <td>Physical Counted:</td>
                  <td style="text-align: right; font-weight: bold;">
                    ${currency} ${report.drawerReconciliation.countedCash.toFixed(2)}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #000; font-weight: 900; color: ${varianceColor};">
                  <td style="padding: 2px 0;">VARIANCE (${report.drawerReconciliation.isBalanced ? "BALANCED" : (report.drawerReconciliation.variance ?? 0) > 0 ? "OVER" : "SHORT"}):</td>
                  <td style="padding: 2px 0; text-align: right;">${varianceText}</td>
                </tr>`
              : ""
          }
        </table>
      </div>

      ${
        report.notes
          ? `<div style="border-top: 1px dashed #000; padding-top: 4px; margin-top: 6px; font-size: 10px;">
              <span style="font-weight: bold;">Notes:</span> ${report.notes}
            </div>`
          : ""
      }

      <!-- FOOTER -->
      <div style="border-top: 2px solid #000; margin-top: 10px; padding-top: 6px; text-align: center;">
        <div style="font-size: 10px; font-weight: 900; letter-spacing: 1px;">
          ${isZ ? "FINAL SHIFT AUDIT SETTLEMENT" : "INTERIM AUDIT READING — UNRESET"}
        </div>
        <div style="font-size: 8px; color: #666; margin-top: 2px;">
          SalesmanPro POS • Hardware Ver. 2.4
        </div>
      </div>
    </div>
  `;
}
