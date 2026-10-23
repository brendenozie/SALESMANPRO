"use strict";
/**
 * SalesmanPro Unified Cross-Platform Printing Service
 * Coordinates print dispatching across Android, Desktop (WPF/WebView2), and Web Browser.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderA4CommercialDocumentHtml = exports.resolvePrinterAssignment = exports.requestNativeTestSlip = exports.requestDiscoveredPrinters = exports.executeUnifiedPrint = exports.detectPlatform = exports.PRINTING_ACTION_KEYS = void 0;
exports.PRINTING_ACTION_KEYS = [
    "POS_RECEIPT",
    "CUSTOMER_INVOICE",
    "CUSTOMER_QUOTATION",
    "KITCHEN_ORDER",
    "BAR_ORDER",
    "BARCODE_LABEL",
    "STUDENT_REPORT",
    "LOGISTICS_SLIP",
];
/**
 * Identify active host platform
 */
function detectPlatform() {
    if (typeof window === "undefined")
        return "WEB";
    if (window.AndroidBridge)
        return "ANDROID";
    if (window.chrome?.webview)
        return "DESKTOP";
    return "WEB";
}
exports.detectPlatform = detectPlatform;
/**
 * Execute a Print Job across Android, Desktop, or Standard Web Browser
 */
async function executeUnifiedPrint(payload, htmlFallback) {
    if (typeof window === "undefined") {
        return { success: false, dispatchedTo: "WEB", error: "Window is undefined" };
    }
    const platform = detectPlatform();
    // 1. Android Bridge (Handheld POS, Tablet, Mobile)
    if (platform === "ANDROID") {
        try {
            const message = JSON.stringify({
                type: "PRINT_PAYLOAD",
                payload,
            });
            window.AndroidBridge.postMessage(message);
            return { success: true, dispatchedTo: "ANDROID" };
        }
        catch (err) {
            console.error("[UnifiedPrint] Android bridge failed:", err);
            // Only fall back to browser if bridge throws
        }
    }
    // 2. Windows Desktop Bridge (WPF WebView2)
    if (platform === "DESKTOP") {
        try {
            window.chrome.webview.postMessage({
                type: "PRINT_PAYLOAD",
                payload,
            });
            return { success: true, dispatchedTo: "DESKTOP" };
        }
        catch (err) {
            console.error("[UnifiedPrint] Desktop bridge failed:", err);
        }
    }
    // 3. Browser Fallback (Standard Web)
    if (htmlFallback) {
        try {
            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "0";
            iframe.style.visibility = "hidden";
            document.body.appendChild(iframe);
            const iframeDoc = iframe.contentWindow?.document;
            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${payload.documentType || "Print Job"}</title>
              <style>
                @page { size: auto; margin: 0; }
                body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
              </style>
            </head>
            <body>${htmlFallback}</body>
          </html>
        `);
                iframeDoc.close();
                return new Promise((resolve) => {
                    iframe.onload = () => {
                        try {
                            iframe.contentWindow?.focus();
                            iframe.contentWindow?.print();
                            setTimeout(() => {
                                if (document.body.contains(iframe)) {
                                    document.body.removeChild(iframe);
                                }
                                resolve({ success: true, dispatchedTo: "WEB" });
                            }, 1000);
                        }
                        catch (printErr) {
                            if (document.body.contains(iframe)) {
                                document.body.removeChild(iframe);
                            }
                            resolve({ success: false, dispatchedTo: "WEB", error: printErr?.message });
                        }
                    };
                });
            }
        }
        catch (err) {
            return { success: false, dispatchedTo: "WEB", error: err?.message };
        }
    }
    return { success: true, dispatchedTo: platform };
}
exports.executeUnifiedPrint = executeUnifiedPrint;
/**
 * Ask native host to discover connected local printers
 */
async function requestDiscoveredPrinters() {
    const platform = detectPlatform();
    if (platform === "ANDROID") {
        return new Promise((resolve) => {
            const listener = (event) => {
                window.removeEventListener("SalesmanProNativePrintersDiscovered", listener);
                resolve(event.detail?.printers || []);
            };
            window.addEventListener("SalesmanProNativePrintersDiscovered", listener);
            try {
                window.AndroidBridge.postMessage(JSON.stringify({ type: "DISCOVER_PRINTERS" }));
            }
            catch (e) {
                resolve([]);
            }
            // Timeout after 5 seconds
            setTimeout(() => {
                window.removeEventListener("SalesmanProNativePrintersDiscovered", listener);
                resolve([]);
            }, 5000);
        });
    }
    if (platform === "DESKTOP") {
        return new Promise((resolve) => {
            const chromeWebview = window.chrome?.webview;
            const messageHandler = (event) => {
                const data = event.data;
                if (data?.type === "PRINTERS_DISCOVERED") {
                    chromeWebview?.removeEventListener("message", messageHandler);
                    resolve(data.printers || []);
                }
            };
            try {
                chromeWebview?.addEventListener("message", messageHandler);
                chromeWebview?.postMessage({ type: "DISCOVER_PRINTERS" });
            }
            catch (e) {
                resolve([]);
            }
            // Timeout after 5 seconds
            setTimeout(() => {
                chromeWebview?.removeEventListener("message", messageHandler);
                resolve([]);
            }, 5000);
        });
    }
    return [];
}
exports.requestDiscoveredPrinters = requestDiscoveredPrinters;
/**
 * Trigger a native hardware test slip print
 */
async function requestNativeTestSlip(printerAddress, connectionType, paperWidth = "80mm") {
    const platform = detectPlatform();
    if (platform === "ANDROID") {
        try {
            window.AndroidBridge.postMessage(JSON.stringify({
                type: "TEST_PRINT",
                address: printerAddress,
                connectionType,
                paperWidth,
            }));
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err?.message };
        }
    }
    if (platform === "DESKTOP") {
        try {
            window.chrome.webview.postMessage({
                type: "TEST_PRINT",
                address: printerAddress,
                connectionType,
                paperWidth,
            });
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err?.message };
        }
    }
    return { success: false, error: "Test slips on standard web browser use standard print dialog" };
}
exports.requestNativeTestSlip = requestNativeTestSlip;
/**
 * Resolve hardware routing assignment for a specific action key (e.g. CUSTOMER_INVOICE or CUSTOMER_QUOTATION)
 */
async function resolvePrinterAssignment(companyId, actionKey, storeId) {
    try {
        const params = new URLSearchParams({ companyId });
        if (storeId)
            params.append("storeId", storeId);
        const res = await fetch(`/api/devices/assignments?${params.toString()}`);
        if (!res.ok)
            return null;
        const data = await res.json();
        if (!data.success || !data.data?.routingMap)
            return null;
        return data.data.routingMap[actionKey] || null;
    }
    catch (err) {
        console.warn(`[unifiedPrintClient] Failed to resolve assignment for ${actionKey}:`, err);
        return null;
    }
}
exports.resolvePrinterAssignment = resolvePrinterAssignment;
/**
 * Renders an authoritative, letterhead A4 HTML document for formal commercial documents
 * (Invoices, Quotations, Proformas, Credit Notes) for office laser and network printing.
 */
function renderA4CommercialDocumentHtml(payload, branding) {
    const doc = payload.document;
    const isQuotation = payload.actionKey === "CUSTOMER_QUOTATION" || payload.documentType === "QUOTATION";
    const title = isQuotation ? "OFFICIAL QUOTATION" : "TAX INVOICE";
    const currency = doc.totals.currency || "KES";
    const companyName = branding?.companyName || "Ghuba SalesmanPro Merchant";
    const kraPin = branding?.taxPin || doc.fiscalDetails?.taxpayerPin;
    const formattedDate = doc.date ? new Date(doc.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString();
    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 24px 32px; background: #ffffff;">
      <style>
        @page { size: A4 portrait; margin: 12mm 15mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff !important; }
        }
      </style>

      <!-- LETTERHEAD HEADER -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border-bottom: 2px solid #0f172a; padding-bottom: 16px;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            ${branding?.logoUrl ? `<img src="${branding.logoUrl}" alt="${companyName}" style="max-height: 50px; margin-bottom: 8px; object-fit: contain;" /><br/>` : ""}
            <div style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">${companyName}</div>
            ${branding?.tagline ? `<div style="font-size: 11px; color: #64748b; font-style: italic; margin-bottom: 4px;">${branding.tagline}</div>` : ""}
            <div style="font-size: 11px; color: #475569; line-height: 1.5;">
              ${branding?.address ? `${branding.address}, ` : ""}${branding?.city ? `${branding.city}, ` : ""}${branding?.country || "Kenya"}<br/>
              ${branding?.contactPhone ? `Tel: ${branding.contactPhone} &bull; ` : ""}${branding?.contactEmail ? `Email: ${branding.contactEmail}` : ""}
              ${kraPin ? `<br/><b>KRA PIN / Tax ID:</b> ${kraPin}` : ""}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <div style="font-size: 26px; font-weight: 900; color: ${isQuotation ? "#2563eb" : "#059669"}; letter-spacing: 0.5px; text-transform: uppercase;">${title}</div>
            <div style="font-size: 13px; font-weight: 700; color: #334155; margin-top: 4px;"># ${doc.number}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Date: <b>${formattedDate}</b></div>
            ${payload.isReprint ? `<div style="display: inline-block; background: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-top: 6px;">*** REPRINT COPY #${payload.reprintCount || 1} ***</div>` : ""}
          </td>
        </tr>
      </table>

      <!-- BILL TO & META GRID -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <tr>
          <td style="width: 55%; padding: 14px 16px; vertical-align: top; border-right: 1px solid #e2e8f0;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 6px;">${isQuotation ? "Quotation Prepared For" : "Billed To"}</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${doc.customer?.name || "Cash Customer"}</div>
            ${doc.customer?.address ? `<div style="font-size: 11px; color: #475569; margin-top: 2px;">${doc.customer.address}</div>` : ""}
            ${doc.customer?.phone ? `<div style="font-size: 11px; color: #475569; margin-top: 2px;">Tel: ${doc.customer.phone}</div>` : ""}
            ${doc.customer?.email ? `<div style="font-size: 11px; color: #475569; margin-top: 2px;">Email: ${doc.customer.email}</div>` : ""}
          </td>
          <td style="width: 45%; padding: 14px 16px; vertical-align: top;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 6px;">Commercial Details</div>
            <table style="width: 100%; font-size: 11px; color: #334155;">
              <tr>
                <td style="color: #64748b; padding-bottom: 4px;">Terms:</td>
                <td style="text-align: right; font-weight: 600; padding-bottom: 4px;">${isQuotation ? "Valid for 30 Days" : "Net 30 Days"}</td>
              </tr>
              ${doc.cashierName ? `
              <tr>
                <td style="color: #64748b; padding-bottom: 4px;">Issuer / Agent:</td>
                <td style="text-align: right; font-weight: 600; padding-bottom: 4px;">${doc.cashierName}</td>
              </tr>` : ""}
              <tr>
                <td style="color: #64748b;">Currency:</td>
                <td style="text-align: right; font-weight: 700;">${currency}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- LINE ITEMS TABLE -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11px;">
        <thead>
          <tr style="background: #0f172a; color: #ffffff; text-align: left;">
            <th style="padding: 10px 12px; font-weight: 700; width: 8%;">#</th>
            <th style="padding: 10px 12px; font-weight: 700; width: 48%;">Item Description</th>
            <th style="padding: 10px 12px; font-weight: 700; text-align: center; width: 12%;">Qty</th>
            <th style="padding: 10px 12px; font-weight: 700; text-align: right; width: 16%;">Unit Price</th>
            <th style="padding: 10px 12px; font-weight: 700; text-align: right; width: 16%;">Amount (${currency})</th>
          </tr>
        </thead>
        <tbody>
          ${doc.items.length > 0 ? doc.items.map((item, idx) => `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
              <td style="padding: 10px 12px; color: #64748b;">${idx + 1}</td>
              <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">
                ${item.name}
                ${item.sku ? `<span style="font-size: 9px; color: #64748b; margin-left: 6px; font-weight: normal;">[${item.sku}]</span>` : ""}
                ${item.notes ? `<div style="font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px;">${item.notes}</div>` : ""}
              </td>
              <td style="padding: 10px 12px; text-align: center; font-weight: 600; color: #334155;">${item.quantity}</td>
              <td style="padding: 10px 12px; text-align: right; color: #334155;">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0f172a;">${item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `).join("") : `
            <tr>
              <td colspan="5" style="padding: 24px; text-align: center; color: #94a3b8; font-style: italic;">No line items recorded for this document.</td>
            </tr>
          `}
        </tbody>
      </table>

      <!-- SUMMARY TOTALS & SETTLEMENT -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 20px;">
            ${(branding?.paymentInstructions || doc.footer) ? `
              <div style="background: #f1f5f9; border-radius: 8px; padding: 12px 14px; font-size: 10.5px; color: #334155; border-left: 3px solid #0284c7;">
                <div style="font-weight: 800; color: #0369a1; text-transform: uppercase; margin-bottom: 4px;">Payment & Settlement Instructions</div>
                <div style="line-height: 1.5;">${branding?.paymentInstructions || doc.footer}</div>
              </div>
            ` : ""}

            ${doc.fiscalDetails?.taxpayerPin ? `
              <div style="margin-top: 12px; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 10px 12px; font-size: 10px; color: #475569; background: #fafafa;">
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 4px;">eTIMS Fiscal Verification (KRA)</div>
                <div>PIN: <b>${doc.fiscalDetails.taxpayerPin}</b> &bull; SCU ID: <b>${doc.fiscalDetails.deviceId || "VSCU-01"}</b></div>
                ${doc.fiscalDetails.controlCode ? `<div>Control No: <b>${doc.fiscalDetails.controlCode}</b></div>` : ""}
              </div>
            ` : ""}
          </td>
          <td style="width: 50%; vertical-align: top;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px 12px; color: #64748b;">Subtotal:</td>
                <td style="padding: 6px 12px; text-align: right; font-weight: 600; color: #1e293b;">${currency} ${doc.totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              ${doc.totals.discount ? `
                <tr style="border-bottom: 1px solid #e2e8f0; color: #dc2626;">
                  <td style="padding: 6px 12px;">Discount:</td>
                  <td style="padding: 6px 12px; text-align: right; font-weight: 600;">- ${currency} ${doc.totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ` : ""}
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px 12px; color: #64748b;">VAT / Sales Tax (16%):</td>
                <td style="padding: 6px 12px; text-align: right; font-weight: 600; color: #1e293b;">${currency} ${(doc.totals.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr style="background: #0f172a; color: #ffffff; font-size: 14px; font-weight: 800;">
                <td style="padding: 10px 12px; border-radius: 6px 0 0 6px;">Total Payable:</td>
                <td style="padding: 10px 12px; text-align: right; border-radius: 0 6px 6px 0;">${currency} ${doc.totals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              ${doc.totals.paid ? `
                <tr>
                  <td style="padding: 6px 12px; color: #059669; font-weight: 600;">Amount Paid / Deposit:</td>
                  <td style="padding: 6px 12px; text-align: right; font-weight: 700; color: #059669;">${currency} ${doc.totals.paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; color: #e11d48; font-weight: 700;">Balance Outstanding:</td>
                  <td style="padding: 6px 12px; text-align: right; font-weight: 800; color: #e11d48;">${currency} ${(doc.totals.balance ?? (doc.totals.total - doc.totals.paid)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ` : ""}
            </table>
          </td>
        </tr>
      </table>

      <!-- FORMAL FOOTER & STATUTORY NOTICE -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 16px; margin-top: 32px; font-size: 10px; color: #94a3b8; text-align: center; line-height: 1.5;">
        This is an official statutory commercial document generated by ${companyName} via SalesmanPro Unified Dispatch.<br/>
        For questions or accounts reconciliation, contact <b>${branding?.contactEmail || "accounts@business.com"}</b>.
      </div>
    </div>
  `;
}
exports.renderA4CommercialDocumentHtml = renderA4CommercialDocumentHtml;
