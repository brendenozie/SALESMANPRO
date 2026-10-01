/**
 * lib/ai/mascot/documentTypes.ts
 *
 * Core TypeScript definitions for the SalesmanPro Mascot Multimodal Document Intelligence System.
 * Covers classification, structured extraction, duplicate matching, document-to-action mapping,
 * arithmetic validation, and audit traceability.
 */

export type MascotDocumentType =
  | "SUPPLIER_RECEIPT"
  | "EXPENSE_RECEIPT"
  | "PURCHASE_INVOICE"
  | "SALES_INVOICE"
  | "QUOTATION"
  | "PURCHASE_ORDER"
  | "DELIVERY_NOTE"
  | "BANK_STATEMENT"
  | "PAYMENT_CONFIRMATION"
  | "CONTRACT"
  | "STAFF_DOCUMENT"
  | "STUDENT_ASSESSMENT"
  | "GENERAL_REPORT"
  | "CORRESPONDENCE";

export type DocumentActionType =
  | "DRAFT_EXPENSE"
  | "DRAFT_SUPPLIER_BILL"
  | "DRAFT_PURCHASE_ORDER"
  | "PREPARE_GOODS_RECEIVED"
  | "MATCH_CUSTOMER_INVOICE"
  | "RECONCILE_BANK_STATEMENT"
  | "RECORD_PAYMENT"
  | "RECORD_STUDENT_ASSESSMENT"
  | "ATTACH_STAFF_DOCUMENT";

export interface ExtractedLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
  discount?: number;
  sku?: string;
}

export interface ExtractedDocumentData {
  documentType: MascotDocumentType;
  documentNumber?: string;
  supplierOrCustomer?: string;
  documentDate?: string;
  dueDate?: string;
  currency: string;
  subtotal?: number;
  taxes?: number;
  total: number;
  paymentStatus?: "PAID" | "UNPAID" | "PARTIALLY_PAID" | "UNKNOWN";
  paymentMethod?: string;
  referenceNumber?: string;
  category?: string;
  lineItems: ExtractedLineItem[];
  confidence: number; // 0.0 to 1.0
  rawText?: string;
  isLegible: boolean;
  arithmeticValid: boolean;
  notes?: string;
  clarificationsNeeded?: string[];
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchConfidence: number; // 0.0 to 1.0
  matchReason?: string;
  existingRecordId?: string;
  existingRecordType?: "EXPENSE" | "SUPPLIER_BILL" | "INVOICE" | "CUSTOMER_ORDER";
  existingRecordDate?: string;
  existingRecordAmount?: number;
  existingRecordUrl?: string;
}

export interface DocumentActionDraft {
  actionType: DocumentActionType;
  title: string;
  description: string;
  targetModule: string;
  proposedRecord: Record<string, any>;
  duplicateWarning?: DuplicateCheckResult;
  requiresApproval: boolean;
  creditCost: number;
}

export interface ProcessedDocumentRecord {
  id: string;
  companyId: string;
  storeSlug?: string;
  uploadedBy: string;
  uploaderRole: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  fileHash?: string;
  extractedData: ExtractedDocumentData;
  duplicateCheck: DuplicateCheckResult;
  suggestedAction: DocumentActionDraft;
  status: "ANALYZED" | "AWAITING_APPROVAL" | "APPROVED" | "EXECUTED" | "REJECTED" | "FAILED";
  resultingRecordId?: string;
  resultingRecordType?: string;
  createdAt: string;
  updatedAt: string;
}
