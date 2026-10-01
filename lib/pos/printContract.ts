/**
 * SalesmanPro Unified Print Protocol Contract
 * Version: 1
 * Platform-independent normalized print payload schema for Web, WPF Desktop, and Android POS clients.
 */

export const PROTOCOL_VERSION = 1;

export type DocumentType =
  | "RECEIPT"
  | "INVOICE"
  | "KITCHEN"
  | "BAR"
  | "REPORT"
  | "LABEL"
  | "ORDER";

export type PrinterPurpose =
  | "RECEIPT"
  | "INVOICE"
  | "KITCHEN"
  | "BAR"
  | "A4"
  | "LABEL"
  | "REPORT";

export type PrintJobStatus =
  | "QUEUED"
  | "PRINTING"
  | "PRINTED"
  | "FAILED"
  | "CANCELLED";

export interface NormalizedPrintItem {
  name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  route?: string; // e.g. "receipt", "kitchen", "bar"
  category?: string;
  taxTypeCode?: string;
  notes?: string;
}

export interface NormalizedPrintTotals {
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  total: number;
  paid: number;
  change: number;
  currency: string;
}

export interface NormalizedPrintCustomer {
  name?: string;
  phone?: string;
  email?: string;
  pin?: string;
}

export interface NormalizedPrintBusiness {
  name: string;
  address?: string;
  phone?: string;
  taxPin?: string;
  branchName?: string;
  branchId?: string;
  logoUrl?: string;
}

export interface NormalizedPrintPayment {
  method: string; // CASH, MPESA, CARD, INVOICE, SPLIT
  reference?: string;
  details?: Record<string, any>;
}

export interface NormalizedFiscalDetails {
  taxpayerPin?: string;
  branchId?: string;
  branchName?: string;
  deviceId?: string;
  controlCode?: string;
  internalData?: string;
  qrCodeUrl?: string;
  invoiceType?: "ORIGINAL" | "CREDIT_NOTE";
  taxBreakdown?: Record<string, { taxableAmount: number; taxAmount: number }>;
}

export interface NormalizedPrintDocument {
  number: string;
  date: string;
  cashier: string;
  customer?: NormalizedPrintCustomer;
  business: NormalizedPrintBusiness;
  items: NormalizedPrintItem[];
  totals: NormalizedPrintTotals;
  payment: NormalizedPrintPayment;
  fiscalDetails?: NormalizedFiscalDetails;
  qrCodeUrl?: string;
  footer?: string;
  notes?: string;
  table?: string;
  guestCount?: number;
}

export interface PrinterProfileConfig {
  paperWidth: "58mm" | "80mm" | "A4";
  characterWidth?: number; // 32 for 58mm, 42-48 for 80mm
  encoding?: string;
  cutPaper?: boolean;
  openCashDrawer?: boolean;
  copies?: number;
}

export interface NormalizedPrintPayload {
  protocolVersion: number;
  jobId: string;
  documentType: DocumentType;
  documentId: string;
  companyId: string;
  storeId?: string;
  deviceId?: string;
  createdAt: string;
  isReprint: boolean;
  reprintCount: number;
  document: NormalizedPrintDocument;
  printerProfile?: PrinterProfileConfig;
}

/**
 * Validates a print payload against protocol version 1 specifications.
 */
export function validatePrintPayload(payload: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload) {
    return { valid: false, errors: ["Missing payload"] };
  }
  if (payload.protocolVersion !== PROTOCOL_VERSION) {
    errors.push(`Unsupported protocol version: ${payload.protocolVersion}, expected ${PROTOCOL_VERSION}`);
  }
  if (!payload.jobId || typeof payload.jobId !== "string") {
    errors.push("Missing or invalid jobId");
  }
  if (!payload.documentType) {
    errors.push("Missing documentType");
  }
  if (!payload.document) {
    errors.push("Missing document object");
  } else {
    const doc = payload.document;
    if (!doc.number) errors.push("Missing document.number");
    if (!doc.business?.name) errors.push("Missing document.business.name");
    if (!doc.totals) {
      errors.push("Missing document.totals");
    } else {
      if (typeof doc.totals.total !== "number" || isNaN(doc.totals.total)) {
        errors.push("Invalid document.totals.total");
      }
      if (!doc.totals.currency) {
        errors.push("Missing document.totals.currency");
      }
    }
    if (!Array.isArray(doc.items)) {
      errors.push("document.items must be an array");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a unique print job ID
 */
export function createPrintJobId(prefix: string = "job"): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomPart}`;
}
