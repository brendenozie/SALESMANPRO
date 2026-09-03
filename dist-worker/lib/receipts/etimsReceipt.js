"use strict";
/**
 * SalesmanPro POS — Mode A: Official KRA eTIMS Fiscal / Tax Invoice Receipt Renderer
 * Strictly compliant with KRA eTIMS technical specifications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEtimsReceiptHtml = void 0;
const constants_1 = require("../etims/constants");
function renderEtimsReceiptHtml(data) {
    const isReprint = Boolean(data.isReprint);
    const isCreditNote = data.invoiceType === "CREDIT_NOTE";
    // Format line items with KRA tax code indicator (e.g. "[A]" for 16% VAT)
    const itemsHtml = data.items
        .map((item) => {
        const taxCode = item.taxTypeCode || "A";
        const variantStr = item.variantDescription ? ` (${item.variantDescription})` : "";
        return `
        <div style="margin-bottom: 5px; font-size: 12px; line-height: 1.3;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; flex: 1;">${item.name}${variantStr}</span>
            <span style="font-size: 10px; font-weight: 700; color: #0284c7; margin-left: 4px;">[${taxCode}]</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #475569; font-size: 11px;">
            <span>${item.quantity} x ${data.currency} ${item.unitPrice.toFixed(2)}</span>
            <span style="font-weight: 600; color: #0f172a;">${data.currency} ${item.subtotal.toFixed(2)}</span>
          </div>
        </div>
      `;
    })
        .join("");
    // Tax Analysis Table Rows
    const breakdown = data.taxBreakdown || {};
    const taxRows = ["A", "B", "C", "D", "E"]
        .filter((code) => breakdown[code] && breakdown[code].taxableAmount > 0)
        .map((code) => {
        const row = breakdown[code];
        const rateLabel = constants_1.ETIMS_TAX_RATES[code]?.rate ? `${constants_1.ETIMS_TAX_RATES[code].rate}%` : "0%";
        return `
        <tr style="font-size: 11px; border-bottom: 1px dotted #e2e8f0;">
          <td style="padding: 2px 4px; text-align: left;">[${code}] ${rateLabel}</td>
          <td style="padding: 2px 4px; text-align: right;">${data.currency} ${row.taxableAmount.toFixed(2)}</td>
          <td style="padding: 2px 4px; text-align: right;">${data.currency} ${row.taxAmount.toFixed(2)}</td>
        </tr>
      `;
    })
        .join("");
    // Construct QR Code Image URL (using reliable online QR render service for verification link)
    const qrUrl = data.qrCodeUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=${encodeURIComponent(data.qrCodeUrl)}`
        : "";
    return `
    <div style="font-family: 'Courier New', Courier, monospace, monospace; width: 300px; margin: 0 auto; padding: 14px; color: #000; background-color: #fff; line-height: 1.35;">
      
      ${isReprint
        ? `<div style="text-align: center; border: 2px solid #dc2626; padding: 4px; font-weight: 900; font-size: 13px; color: #dc2626; margin-bottom: 10px; text-transform: uppercase;">
              *** DUPLICATE / REPRINT ***
              <div style="font-size: 9px; font-weight: normal; color: #000;">Reprinted: ${data.reprintedAt || new Date().toLocaleString()}</div>
            </div>`
        : ""}

      <!-- KRA Fiscal Header -->
      <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
        <div style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
          KENYA REVENUE AUTHORITY
        </div>
        <div style="font-size: 12px; font-weight: 800; margin: 2px 0;">
          ${isCreditNote ? "eTIMS FISCAL CREDIT NOTE" : "eTIMS FISCAL TAX INVOICE"}
        </div>
        <div style="font-size: 15px; font-weight: 900; margin-top: 6px;">
          ${data.storeName}
        </div>
        ${data.storeAddress ? `<div style="font-size: 11px;">${data.storeAddress}</div>` : ""}
        ${data.storePhone ? `<div style="font-size: 11px;">TEL: ${data.storePhone}</div>` : ""}
      </div>

      <!-- Taxpayer & Device Meta -->
      <div style="font-size: 11px; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 6px;">
        <div style="display: flex; justify-content: space-between;">
          <span>PIN:</span><span style="font-weight: 900;">${data.kraPin || "N/A"}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>BRANCH ID:</span><span>${data.branchId || "00"} (${data.branchName || "Head Office"})</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>SDC / SCU ID:</span><span>${data.scuId || data.deviceId || "OSCU000000"}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>INVOICE NO:</span><span style="font-weight: 900;">${data.invoiceNumber || "N/A"}</span>
        </div>
        ${isCreditNote && data.originalInvoiceNumber
        ? `<div style="display: flex; justify-content: space-between; color: #dc2626; font-weight: 700;">
                <span>ORIGINAL INV:</span><span>${data.originalInvoiceNumber}</span>
              </div>`
        : ""}
        <div style="display: flex; justify-content: space-between;">
          <span>DATE & TIME:</span><span>${data.date} ${data.time}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>CASHIER:</span><span>${data.cashierName}</span>
        </div>
        ${data.customerPin
        ? `<div style="display: flex; justify-content: space-between; border-top: 1px dotted #999; margin-top: 3px; padding-top: 2px;">
                <span>BUYER PIN:</span><span style="font-weight: 900;">${data.customerPin}</span>
              </div>`
        : ""}
        ${data.customerName && data.customerName !== "Walk-in Customer"
        ? `<div style="display: flex; justify-content: space-between;">
                <span>BUYER NAME:</span><span>${data.customerName}</span>
              </div>`
        : ""}
      </div>

      <!-- Items Section -->
      <div style="font-size: 11px; font-weight: 800; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px; display: flex; justify-content: space-between;">
        <span>DESCRIPTION</span>
        <span>TOTAL</span>
      </div>

      ${itemsHtml}

      <div style="border-top: 1px dashed #000; margin: 8px 0;"></div>

      <!-- Financial Totals -->
      <div style="font-size: 12px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between;">
          <span>SUBTOTAL:</span>
          <span>${data.currency} ${data.subtotal.toFixed(2)}</span>
        </div>
        ${data.totalDiscount > 0
        ? `<div style="display: flex; justify-content: space-between;">
                <span>DISCOUNT:</span>
                <span>-${data.currency} ${data.totalDiscount.toFixed(2)}</span>
              </div>`
        : ""}
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin: 4px 0;">
          <span>${isCreditNote ? "REFUND TOTAL:" : "TOTAL AMOUNT:"}</span>
          <span>${data.currency} ${data.finalTotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>PAYMENT:</span>
          <span style="font-weight: 800; text-transform: uppercase;">${data.paymentMethodDetails || data.paymentMethod}</span>
        </div>
      </div>

      <!-- Tax Analysis Breakdown -->
      <div style="margin-bottom: 8px; border: 1px solid #000; padding: 4px;">
        <div style="font-size: 10px; font-weight: 900; text-align: center; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 3px;">
          TAX RATE ANALYSIS
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="font-size: 10px; border-bottom: 1px solid #000;">
              <th style="text-align: left; padding: 2px 4px;">RATE</th>
              <th style="text-align: right; padding: 2px 4px;">TAXABLE</th>
              <th style="text-align: right; padding: 2px 4px;">TAX AMT</th>
            </tr>
          </thead>
          <tbody>
            ${taxRows || `<tr><td colspan="3" style="text-align: center; font-size: 10px;">[A] 16% VAT Included</td></tr>`}
            <tr style="font-size: 11px; font-weight: 900; border-top: 1px solid #000;">
              <td style="padding: 2px 4px; text-align: left;">TOTAL TAX:</td>
              <td style="padding: 2px 4px; text-align: right;"></td>
              <td style="padding: 2px 4px; text-align: right;">${data.currency} ${data.totalTax.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- KRA Fiscal Signature & Verification Block -->
      <div style="text-align: center; font-size: 10px; margin-top: 8px; border-top: 1px dashed #000; padding-top: 8px;">
        <div style="font-weight: 900; font-size: 11px; margin-bottom: 2px;">SCU RECEIPT SIGNATURE / CONTROL CODE:</div>
        <div style="font-size: 13px; font-weight: 900; letter-spacing: 1px; margin: 4px 0; word-break: break-all;">
          ${data.controlCode || "PENDING-FISCAL-SIGNATURE"}
        </div>
        ${data.internalData
        ? `<div style="font-size: 9px; color: #555; word-break: break-all; margin-bottom: 6px;">
                SCU DATA: ${data.internalData}
              </div>`
        : ""}

        <!-- KRA Verification QR Code -->
        ${qrUrl
        ? `<div style="margin: 8px auto; width: 130px; height: 130px; text-align: center;">
                <img src="${qrUrl}" alt="KRA eTIMS QR" style="width: 130px; height: 130px; display: block; margin: 0 auto;" />
              </div>
              <div style="font-size: 9px; color: #444; margin-bottom: 4px;">
                SCAN QR CODE TO VERIFY FISCAL RECEIPT ON KRA PORTAL
              </div>`
        : ""}

        <div style="font-size: 11px; font-weight: 800; margin-top: 6px;">
          END OF LEGAL FISCAL RECEIPT
        </div>
        <div style="font-size: 9px; margin-top: 2px; color: #555;">
          Powered by SalesmanPro POS • Authoritative eTIMS Certified
        </div>
      </div>
    </div>
  `;
}
exports.renderEtimsReceiptHtml = renderEtimsReceiptHtml;
