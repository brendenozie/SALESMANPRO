/**
 * SalesmanPro POS — Unified Receipt Rendering & Dispatch Engine
 * Delivers HTML and ESC/POS thermal printer commands for both Mode A (eTIMS) and Mode B (Standard).
 */

import { ReceiptMode, UnifiedReceiptData } from "./types";
import { renderStandardReceiptHtml } from "./standardReceipt";
import { renderEtimsReceiptHtml } from "./etimsReceipt";

export class ReceiptRenderer {
  /**
   * Render HTML for Web Browser Printing & WebView
   */
  renderHtml(data: UnifiedReceiptData, mode: ReceiptMode = "STANDARD"): string {
    if (mode === "ETIMS" || data.isFiscal) {
      return renderEtimsReceiptHtml(data);
    }
    return renderStandardReceiptHtml(data);
  }

  /**
   * Render structured payload for Desktop ESC/POS Service & Android POS Bridge
   */
  renderEscPos(data: UnifiedReceiptData, mode: ReceiptMode = "STANDARD"): Record<string, any> {
    const isFiscal = mode === "ETIMS" || data.isFiscal;
    const documentId = data.invoiceNumber || data.trackingNumber;
    const jobId = `job_${data.trackingNumber || Date.now().toString(36)}_${Date.now()}`;

    return {
      type: "PRINT_ESC_POS",
      protocolVersion: 1,
      jobId,
      documentType: "RECEIPT",
      documentId,
      companyId: (data as any).companyId || "",
      storeId: (data as any).storeId || "",
      mode: isFiscal ? "ETIMS" : "STANDARD",
      isReprint: Boolean(data.isReprint),
      reprintCount: data.isReprint ? 1 : 0,
      createdAt: new Date().toISOString(),
      document: {
        number: documentId,
        date: `${data.date} ${data.time}`,
        cashier: data.cashierName,
        customer: {
          name: data.customerName,
          pin: data.customerPin || "",
        },
        business: {
          name: data.storeName,
          address: data.storeAddress || "",
          phone: data.storePhone || "",
          taxPin: data.kraPin || "",
          branchName: data.branchName || "",
          branchId: data.branchId || "00",
        },
        items: data.items.map((item) => ({
          name: item.name + (item.variantDescription ? ` (${item.variantDescription})` : ""),
          quantity: item.quantity,
          price: item.unitPrice,
          discount: item.discount || 0,
          total: item.subtotal,
          route: (item as any).route || "receipt",
          taxTypeCode: item.taxTypeCode || "A",
        })),
        totals: {
          subtotal: data.subtotal,
          discount: data.totalDiscount,
          tax: data.totalTax,
          taxRate: 16.0,
          total: data.finalTotal,
          paid: data.amountPaid || data.finalTotal,
          change: data.changeAmount || 0,
          currency: data.currency,
        },
        payment: {
          method: data.paymentMethodDetails || data.paymentMethod,
          reference: data.transactionReference || "",
        },
        qrCodeUrl: data.qrCodeUrl,
        footer: isFiscal ? "Fiscal Receipt - Thank You!" : "Thank you for shopping with us!",
      },
      // Backward compatibility fields for legacy clients
      BusinessName: data.storeName,
      BusinessAddress: data.storeAddress || "",
      PhoneNumber: data.storePhone || "",
      ReceiptNumber: data.trackingNumber,
      InvoiceId: documentId,
      CustomerName: data.customerName,
      CustomerPin: data.customerPin || "",
      StaffName: data.cashierName,
      Date: `${data.date} ${data.time}`,
      Currency: data.currency,
      Subtotal: data.subtotal,
      Discount: data.totalDiscount,
      Tax: data.totalTax,
      Total: data.finalTotal,
      PaymentMethod: data.paymentMethodDetails || data.paymentMethod,
      Items: data.items.map((item) => ({
        Name: item.name + (item.variantDescription ? ` (${item.variantDescription})` : ""),
        Quantity: item.quantity,
        Price: item.unitPrice,
        Discount: item.discount || 0,
        Subtotal: item.subtotal,
        Total: item.subtotal,
        TaxType: item.taxTypeCode || "A",
      })),
      FiscalDetails: isFiscal
        ? {
            TaxpayerPin: data.kraPin,
            BranchId: data.branchId || "00",
            BranchName: data.branchName || "Head Office",
            DeviceId: data.deviceId || data.scuId,
            ControlCode: data.controlCode,
            InternalData: data.internalData,
            QrCodeUrl: data.qrCodeUrl,
            TaxBreakdown: data.taxBreakdown,
          }
        : null,
    };
  }

  /**
   * Execute Browser / Desktop Print sequence
   */
  printReceipt(htmlContent: string, escPosPayload?: any): void {
    if (typeof window === "undefined") return;

    // 1. Android Bridge (e.g. handheld POS with thermal printer)
    if ((window as any).AndroidBridge) {
      try {
        const payload = escPosPayload ? JSON.stringify(escPosPayload) : htmlContent;
        (window as any).AndroidBridge.postMessage(payload);
        return;
      } catch (e) {
        console.warn("AndroidBridge print failed, falling back to browser print:", e);
      }
    }

    // 2. SalesmanPro Windows Desktop App Bridge (WebView2)
    if ((window as any).chrome?.webview) {
      try {
        if (escPosPayload) {
          (window as any).chrome.webview.postMessage(escPosPayload);
        } else {
          (window as any).chrome.webview.postMessage({
            type: "PRINT_HTML_RECEIPT",
            payload: htmlContent,
          });
        }
        (window as any).chrome.webview.postMessage({
          type: "NOTIFY",
          message: "Receipt sent to printer!",
        });
        return;
      } catch (e) {
        console.warn("Desktop WebView print failed:", e);
      }
    }

    // 3. Fallback for Standard Web Browsers using hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      iframeDoc.close();

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1500);
      };
    } else {
      // Fallback pop-up window
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        alert("Please allow pop-ups to print receipt.");
      }
    }
  }
}

export const receiptRenderer = new ReceiptRenderer();
