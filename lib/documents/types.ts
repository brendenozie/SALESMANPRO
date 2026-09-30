/**
 * Unified Document Architecture — Types and Interfaces
 * SalesmanPro Central Document System
 */

export type DocumentType =
  | "INVOICE"
  | "QUOTATION"
  | "PURCHASE_ORDER"
  | "SALES_RECEIPT"
  | "PAYMENT_RECEIPT"
  | "STUDENT_REPORT"
  | "CREDIT_NOTE"
  | "DEBIT_NOTE"
  | "DELIVERY_NOTE"
  | "STATEMENT"
  | "PROFORMA_INVOICE"
  | "PAYSLIP"
  | "CERTIFICATE";

export type PageSize = "A4" | "LETTER" | "THERMAL_80MM" | "THERMAL_58MM";

export interface CompanyBranding {
  name: string;
  tagline?: string;
  logoUrl?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  taxPin?: string;
  registrationNumber?: string;
  currency: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface InvoiceLineItem {
  sku?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // percentage or fixed
  taxRate?: number;
  taxAmount?: number;
  lineTotal: number;
}

export interface InvoiceDocumentData {
  documentType: "INVOICE";
  templateId: string;
  company: CompanyBranding;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: "DRAFT" | "PENDING" | "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "CANCELLED";
  orderReference?: string;
  quotationReference?: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    billingAddress?: string;
    shippingAddress?: string;
    taxId?: string;
  };
  items: InvoiceLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
  paymentMethod?: string;
  paymentInstructions?: string;
  notes?: string;
  terms?: string;
  footerText?: string;
}

export interface QuotationLineItem {
  sku?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  taxAmount?: number;
  lineTotal: number;
}

export interface QuotationDocumentData {
  documentType: "QUOTATION";
  templateId: string;
  company: CompanyBranding;
  quotationNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED";
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: QuotationLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  validityPeriod?: string;
  notes?: string;
  terms?: string;
  acceptanceSection?: {
    clientSignatureName?: string;
    signatureDate?: string;
    clientNotes?: string;
  };
  footerText?: string;
}

export interface PurchaseOrderLineItem {
  sku?: string;
  description: string;
  quantityOrdered: number;
  quantityReceived?: number;
  unitCost: number;
  taxRate?: number;
  taxAmount?: number;
  lineTotal: number;
}

export interface PurchaseOrderDocumentData {
  documentType: "PURCHASE_ORDER";
  templateId: string;
  company: CompanyBranding;
  poNumber: string;
  issueDate: string;
  expectedDate?: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "IN_TRANSIT" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
  supplier: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  deliveryAddress?: string;
  items: PurchaseOrderLineItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  authorizedBy?: string;
  footerText?: string;
}

export interface ReceiptLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ReceiptDocumentData {
  documentType: "SALES_RECEIPT" | "PAYMENT_RECEIPT";
  templateId: string;
  company: CompanyBranding;
  receiptNumber: string;
  paymentDate: string;
  paymentMethod: string;
  transactionReference: string;
  invoiceReference?: string;
  orderReference?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  items?: ReceiptLineItem[];
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  amountPaid: number;
  outstandingBalance?: number;
  cashierName?: string;
  notes?: string;
  returnPolicy?: string;
  isThermal?: boolean;
  paperWidth?: "58mm" | "80mm";
  footerText?: string;
}

export interface SubjectResult {
  subject: string;
  code?: string;
  assignmentsScore?: number;
  examScore?: number;
  totalScore: number;
  grade: string;
  description?: string;
  teacherRemarks?: string;
  classAverage?: number;
  position?: number;
}

export interface StudentReportDocumentData {
  documentType: "STUDENT_REPORT";
  templateId: string;
  school: CompanyBranding & {
    motto?: string;
    registrationNumber?: string;
    principalName?: string;
  };
  student: {
    id: string;
    admissionNumber: string;
    name: string;
    currentClass?: string;
    stream?: string;
    academicLevel?: string;
    gender?: string;
    dob?: string;
    photoUrl?: string;
  };
  term: {
    id?: string;
    name: string;
    year: string;
    startDate?: string;
    endDate?: string;
  };
  results: SubjectResult[];
  summary: {
    totalMarks: number;
    maxPossibleMarks: number;
    average: number;
    overallGrade: string;
    classRank?: number | null;
    totalStudents?: number;
    attendance: {
      presentDays: number;
      absentDays: number;
      totalDays: number;
      attendanceRate: number;
    };
    classTeacherComment?: string;
    principalComment?: string;
  };
  signatures: {
    classTeacherSignature?: string;
    principalSignature?: string;
    showGuardianAck?: boolean;
  };
  footerText?: string;
}

export type DocumentData =
  | InvoiceDocumentData
  | QuotationDocumentData
  | PurchaseOrderDocumentData
  | ReceiptDocumentData
  | StudentReportDocumentData;

export interface TemplateDefinition {
  id: string;
  name: string;
  documentType: DocumentType;
  description: string;
  category: "Commercial" | "School" | "POS";
  defaultPageSize: PageSize;
  badge: string;
  colors: {
    primary: string;
    accent: string;
    bgPreview: string;
  };
  features: string[];
}

export interface GenerateDocumentOptions {
  type: DocumentType;
  companyId: string;
  sourceId: string;
  templateId?: string;
  format?: "pdf" | "html";
  pageSize?: PageSize;
  isPreview?: boolean;
  sampleData?: DocumentData;
  userId?: string;
}

export interface GeneratedDocumentResult {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  documentNumber: string;
  templateId: string;
}
