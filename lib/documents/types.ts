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
  | "STUDENT_FEE_INVOICE"
  | "STUDENT_FEE_RECEIPT"
  | "CREDIT_NOTE"
  | "DEBIT_NOTE"
  | "DELIVERY_NOTE"
  | "STATEMENT"
  | "PROFORMA_INVOICE"
  | "PAYSLIP"
  | "CERTIFICATE"
  | "CLASS_BROADSHEET";

export type PageSize = "A4" | "LETTER" | "THERMAL_80MM" | "THERMAL_58MM";

export interface CompanyBranding {
  name: string;
  tagline?: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  taxPin?: string;
  registrationNumber?: string;
  currency: string;
  primaryColor?: string;
  accentColor?: string;
  paymentInstructions?: string;
  mpesaShortcode?: string;
  bankDetails?: string;
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
    nextTermBegins?: string;
  };
  gradingScale?: {
    grade: string;
    minScore: number;
    maxScore: number;
    description: string;
  }[];
  feesDue?: {
    termFees: number;
    arrears: number;
    totalDue: number;
    status: string;
  };
  verificationUrl?: string;
  signatures: {
    classTeacherSignature?: string;
    principalSignature?: string;
    showGuardianAck?: boolean;
  };
  footerText?: string;
}

/**
 * Class / Stream Broadsheet & Merit List
 * One row per student, one column per subject, ranked by overall average.
 */
export interface ClassBroadsheetSubject {
  name: string;
  code: string;
  classMean: number;
  highest: number;
  lowest: number;
  meanGrade: string;
}

export interface ClassBroadsheetStudentRow {
  rank: number | null;
  studentId: string;
  admissionNumber: string;
  name: string;
  /** Scores keyed by subject code. null = no score recorded */
  scores: Record<string, number | null>;
  totalMarks: number;
  average: number;
  grade: string;
  absences: number;
}

export interface ClassBroadsheetDocumentData {
  documentType: "CLASS_BROADSHEET";
  templateId: string;
  school: CompanyBranding & {
    motto?: string;
    principalName?: string;
  };
  classroom: {
    id: string;
    name: string;
    academicLevel?: string;
    classTeacher?: string;
  };
  term: {
    id: string;
    name: string;
    year: string;
  };
  subjects: ClassBroadsheetSubject[];
  students: ClassBroadsheetStudentRow[];
  summary: {
    totalStudents: number;
    classMean: number;
    meanGrade: string;
    highestAverage: number;
    lowestAverage: number;
    gradeDistribution: { grade: string; count: number }[];
  };
  generatedAt: string;
  footerText?: string;
}

export type DocumentData =
  | InvoiceDocumentData
  | QuotationDocumentData
  | PurchaseOrderDocumentData
  | ReceiptDocumentData
  | StudentReportDocumentData
  | ClassBroadsheetDocumentData;

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
