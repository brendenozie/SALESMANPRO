"use strict";
/**
 * SalesmanPro POS — Mode B: Standard SalesmanPro Receipt Renderer
 * For legitimate non-eTIMS sales and non-fiscal businesses.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderStandardReceiptHtml = void 0;
function renderStandardReceiptHtml(data) {
    const isReprint = Boolean(data.isReprint);
    const itemsHtml = data.items
        .map((item) => {
        const variantStr = item.variantDescription ? `<br><small style="color: #666;">(${item.variantDescription})</small>` : "";
        return `
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; line-height: 1.3;">
          <span style="flex: 1; padding-right: 8px;">
            ${item.name}${variantStr}
          </span>
          <span style="width: 35px; text-align: center;">x${item.quantity}</span>
          <span style="width: 70px; text-align: right;">${data.currency} ${item.unitPrice.toFixed(2)}</span>
          <span style="width: 80px; text-align: right; font-weight: 600;">${data.currency} ${item.subtotal.toFixed(2)}</span>
        </div>
      `;
    })
        .join("");
    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; width: 300px; margin: 0 auto; padding: 16px; color: #111; background-color: #fff; line-height: 1.4;">
      ${isReprint
        ? `<div style="text-align: center; background: #fee2e2; color: #991b1b; padding: 4px 8px; font-size: 12px; font-weight: bold; border: 1px dashed #ef4444; border-radius: 4px; margin-bottom: 12px;">
              *** DUPLICATE / REPRINT ***
              <div style="font-size: 10px; font-weight: normal;">Reprinted at: ${data.reprintedAt || new Date().toLocaleString()}</div>
            </div>`
        : ""}

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 12px;">
        <h2 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 800; text-transform: uppercase; color: #1e293b;">${data.storeName}</h2>
        ${data.storeAddress ? `<p style="margin: 0; font-size: 11px; color: #64748b;">${data.storeAddress}</p>` : ""}
        ${data.storePhone ? `<p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">Tel: ${data.storePhone}</p>` : ""}
        <div style="display: inline-block; margin-top: 6px; padding: 2px 10px; background: #f1f5f9; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.5px;">
          SALES RECEIPT
        </div>
      </div>

      <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 10px 0;">

      <!-- Transaction Meta -->
      <div style="font-size: 11px; color: #475569; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>Receipt #:</span><span style="font-weight: 600; color: #1e293b;">${data.trackingNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>Date / Time:</span><span>${data.date} ${data.time}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>Cashier:</span><span>${data.cashierName}</span>
        </div>
        ${data.customerName && data.customerName !== "Walk-in Customer"
        ? `<div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>Customer:</span><span style="font-weight: 600;">${data.customerName}</span>
              </div>`
        : ""}
      </div>

      <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 10px 0;">

      <!-- Line Items Header -->
      <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
        <span style="flex: 1;">Item</span>
        <span style="width: 35px; text-align: center;">Qty</span>
        <span style="width: 70px; text-align: right;">Price</span>
        <span style="width: 80px; text-align: right;">Total</span>
      </div>

      <!-- Items List -->
      ${itemsHtml}

      <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 12px 0 8px 0;">

      <!-- Financial Totals -->
      <div style="font-size: 13px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #475569;">
          <span>Subtotal:</span>
          <span>${data.currency} ${data.subtotal.toFixed(2)}</span>
        </div>
        ${data.totalDiscount > 0
        ? `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #dc2626;">
                <span>Discount:</span>
                <span>-${data.currency} ${data.totalDiscount.toFixed(2)}</span>
              </div>`
        : ""}
        ${data.totalTax > 0
        ? `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #475569;">
                <span>Tax:</span>
                <span>${data.currency} ${data.totalTax.toFixed(2)}</span>
              </div>`
        : ""}
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #0f172a; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 6px;">
          <span>TOTAL:</span>
          <span>${data.currency} ${data.finalTotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-top: 6px;">
          <span>Payment Mode:</span>
          <span style="font-weight: 700; text-transform: uppercase;">${data.paymentMethodDetails || data.paymentMethod}</span>
        </div>
      </div>

      <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 12px 0;">

      <!-- Footer -->
      <div style="text-align: center; font-size: 11px; color: #64748b;">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: #1e293b; font-size: 13px;">THANK YOU FOR YOUR BUSINESS!</p>
        <p style="margin: 0 0 2px 0;">Powered by SalesmanPro POS</p>
        <p style="margin: 0; font-size: 10px; color: #94a3b8;">Official Commercial Sales Receipt</p>
      </div>
    </div>
  `;
}
exports.renderStandardReceiptHtml = renderStandardReceiptHtml;
