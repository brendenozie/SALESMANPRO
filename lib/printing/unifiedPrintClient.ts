/**
 * SalesmanPro Unified Cross-Platform Printing Service
 * Coordinates print dispatching across Android, Desktop (WPF/WebView2), and Web Browser.
 */

export type PrintingAction =
  | "POS_RECEIPT"
  | "POS_REFUND"
  | "CUSTOMER_INVOICE"
  | "CUSTOMER_QUOTATION"
  | "KITCHEN_ORDER"
  | "BAR_ORDER"
  | "BARCODE_LABEL"
  | "PAYMENT_RECEIPT"
  | "DELIVERY_NOTE"
  | "STUDENT_REPORT"
  | "LOGISTICS_SLIP"
  | "TEST_SLIP";

export const PRINTING_ACTION_KEYS: PrintingAction[] = [
  "POS_RECEIPT",
  "CUSTOMER_INVOICE",
  "KITCHEN_ORDER",
  "BAR_ORDER",
  "BARCODE_LABEL",
  "STUDENT_REPORT",
  "LOGISTICS_SLIP",
];

export interface NormalizedPrintItem {
  id?: string;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
  notes?: string;
  category?: string;
}

export interface NormalizedPaymentInfo {
  method: string;
  amount: number;
  reference?: string;
}

export interface NormalizedFiscalDetails {
  taxpayerPin?: string;
  branchId?: string;
  branchName?: string;
  deviceId?: string;
  controlCode?: string;
  internalData?: string;
  receiptNumber?: string;
  qrCodeUrl?: string;
  invoiceType?: string;
}

export interface NormalizedDocument {
  number: string;
  date: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  cashierName?: string;
  staffCode?: string;
  orderType?: string;
  table?: string;
  items: NormalizedPrintItem[];
  totals: {
    subtotal: number;
    discount?: number;
    tax?: number;
    taxRate?: number;
    deliveryFee?: number;
    total: number;
    paid?: number;
    balance?: number;
    change?: number;
    currency: string;
  };
  payments?: NormalizedPaymentInfo[];
  fiscalDetails?: NormalizedFiscalDetails | null;
  qrCodeUrl?: string;
  footer?: string;
}

export interface NormalizedPrintPayload {
  protocolVersion: number; // 1
  jobId: string;
  actionKey: PrintingAction;
  documentType: string;
  documentId: string;
  companyId: string;
  storeId?: string;
  deviceId?: string;
  createdAt: string;
  isReprint?: boolean;
  reprintCount?: number;
  targetPrinterId?: string;
  document: NormalizedDocument;
}

export interface DiscoveredNativePrinter {
  id: string;
  name: string;
  address: string; // MAC address, Windows printer queue name, or IP:Port
  connectionType: "BLUETOOTH" | "NETWORK" | "WINDOWS_DRIVER" | "SERIAL" | "USB";
  paperWidth?: "58mm" | "80mm" | "A4";
  isDefault?: boolean;
}

export type PlatformType = "ANDROID" | "DESKTOP" | "WEB";

/**
 * Identify active host platform
 */
export function detectPlatform(): PlatformType {
  if (typeof window === "undefined") return "WEB";
  if ((window as any).AndroidBridge) return "ANDROID";
  if ((window as any).chrome?.webview) return "DESKTOP";
  return "WEB";
}

/**
 * Execute a Print Job across Android, Desktop, or Standard Web Browser
 */
export async function executeUnifiedPrint(
  payload: NormalizedPrintPayload,
  htmlFallback?: string
): Promise<{ success: boolean; dispatchedTo: PlatformType; error?: string }> {
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
      (window as any).AndroidBridge.postMessage(message);
      return { success: true, dispatchedTo: "ANDROID" };
    } catch (err: any) {
      console.error("[UnifiedPrint] Android bridge failed:", err);
      // Only fall back to browser if bridge throws
    }
  }

  // 2. Windows Desktop Bridge (WPF WebView2)
  if (platform === "DESKTOP") {
    try {
      (window as any).chrome.webview.postMessage({
        type: "PRINT_PAYLOAD",
        payload,
      });
      return { success: true, dispatchedTo: "DESKTOP" };
    } catch (err: any) {
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
            } catch (printErr: any) {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              resolve({ success: false, dispatchedTo: "WEB", error: printErr?.message });
            }
          };
        });
      }
    } catch (err: any) {
      return { success: false, dispatchedTo: "WEB", error: err?.message };
    }
  }

  return { success: true, dispatchedTo: platform };
}

/**
 * Ask native host to discover connected local printers
 */
export async function requestDiscoveredPrinters(): Promise<DiscoveredNativePrinter[]> {
  const platform = detectPlatform();

  if (platform === "ANDROID") {
    return new Promise((resolve) => {
      const listener = (event: any) => {
        window.removeEventListener("SalesmanProNativePrintersDiscovered", listener);
        resolve(event.detail?.printers || []);
      };
      window.addEventListener("SalesmanProNativePrintersDiscovered", listener);

      try {
        (window as any).AndroidBridge.postMessage(
          JSON.stringify({ type: "DISCOVER_PRINTERS" })
        );
      } catch (e) {
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
      const messageHandler = (event: any) => {
        const data = event.data;
        if (data?.type === "PRINTERS_DISCOVERED") {
          window.chrome?.webview?.removeEventListener("message", messageHandler);
          resolve(data.printers || []);
        }
      };

      try {
        window.chrome?.webview?.addEventListener("message", messageHandler);
        (window as any).chrome.webview.postMessage({ type: "DISCOVER_PRINTERS" });
      } catch (e) {
        resolve([]);
      }

      // Timeout after 5 seconds
      setTimeout(() => {
        window.chrome?.webview?.removeEventListener("message", messageHandler);
        resolve([]);
      }, 5000);
    });
  }

  return [];
}

/**
 * Trigger a native hardware test slip print
 */
export async function requestNativeTestSlip(
  printerAddress: string,
  connectionType: string,
  paperWidth: string = "80mm"
): Promise<{ success: boolean; error?: string }> {
  const platform = detectPlatform();

  if (platform === "ANDROID") {
    try {
      (window as any).AndroidBridge.postMessage(
        JSON.stringify({
          type: "TEST_PRINT",
          address: printerAddress,
          connectionType,
          paperWidth,
        })
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  if (platform === "DESKTOP") {
    try {
      (window as any).chrome.webview.postMessage({
        type: "TEST_PRINT",
        address: printerAddress,
        connectionType,
        paperWidth,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  return { success: false, error: "Test slips on standard web browser use standard print dialog" };
}
