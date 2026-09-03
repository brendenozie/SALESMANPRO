/**
 * SalesmanPro POS — KRA eTIMS Data Contracts & Types
 */

export type ETIMSInvoicingRequirement =
  | "REQUIRED"        // Legally mandatory for this taxpayer/store
  | "ENABLED"         // Voluntary / standard fiscalization active
  | "NOT_APPLICABLE"  // Business is exempt or below statutory threshold; standard receipts used
  | "NOT_CONFIGURED"; // Store has not completed configuration

export type ETIMSIntegrationMode = "OSCU" | "VSCU";

export type ETIMSStatus =
  | "NOT_CONFIGURED"
  | "PENDING_SETUP"
  | "ACTIVE"
  | "SUSPENDED"
  | "ERROR"
  | "DISCONNECTED";

export type ETIMSSubmissionStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "QUEUED"
  | "SUBMITTING"
  | "CONFIRMED"
  | "FAILED"
  | "RETRYING"
  | "CANCELLED";

export type ETIMSInvoiceType = "ORIGINAL" | "CREDIT_NOTE" | "DEBIT_NOTE";

export type ETIMSTaxCode = "A" | "B" | "C" | "D" | "E";

export interface ETIMSTaxRateInfo {
  code: ETIMSTaxCode;
  rate: number; // e.g., 16 for 16%
  name: string; // e.g., "VAT Standard Rate (16%)"
  description: string;
}

export interface ETIMSItemLine {
  itemSeq: number;
  itemCode: string;
  itemClassificationCode: string; // UNSPSC / KRA HS code
  itemName: string;
  taxTypeCode: ETIMSTaxCode;
  unitPrice: number;
  quantity: number;
  discountRate?: number;
  discountAmount?: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  unitOfMeasure?: string; // EA, U, KG, etc.
}

export interface ETIMSTaxBreakdownItem {
  taxCode: ETIMSTaxCode;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
}

export type ETIMSTaxBreakdown = Record<ETIMSTaxCode, ETIMSTaxBreakdownItem>;

export interface ETIMSInvoicePayload {
  companyId: string;
  orderId?: string;
  orderTrackingNumber?: string;
  branchId: string;
  branchName?: string;
  deviceId: string;
  terminalId?: string;
  cashierId?: string;
  cashierName?: string;
  invoiceType: ETIMSInvoiceType;
  invoiceNumber: string;
  originalInvoiceNumber?: string;
  creditNoteReason?: string;
  kraPin: string;
  customerPin?: string;
  customerName?: string;
  paymentMethod: string;
  totalAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalDiscount: number;
  items: ETIMSItemLine[];
  taxBreakdown: ETIMSTaxBreakdown;
  idempotencyKey: string;
}

export interface ETIMSFiscalResult {
  success: boolean;
  invoiceNumber: string;
  controlCode?: string;     // KRA SCU Receipt Signature (e.g., ABCD-1234-EFGH-5678)
  scuId?: string;           // SDC / SCU Serial
  internalData?: string;    // Verification string block
  qrCodeUrl?: string;       // Verification URL encoded into QR Code
  receiptDate?: Date;
  status: ETIMSSubmissionStatus;
  requestId?: string;
  responseId?: string;
  errorCode?: string;
  errorMessage?: string;
  retryCount?: number;
}

export interface ETIMSDeviceInfo {
  deviceId: string;
  branchId: string;
  branchName?: string;
  terminalId?: string;
  cashierId?: string;
}

export interface ETIMSReconciliationSummary {
  companyId: string;
  startDate: Date;
  endDate: Date;
  totalPaidSales: number;
  totalPaidSalesAmount: number;
  totalFiscalized: number;
  totalFiscalizedAmount: number;
  totalPending: number;
  totalFailed: number;
  discrepancies: Array<{
    orderId: string;
    trackingNumber: string;
    orderAmount: number;
    fiscalInvoiceNumber?: string;
    fiscalAmount?: number;
    issue: string;
  }>;
}
