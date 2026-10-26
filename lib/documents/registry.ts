/**
 * Unified Document Architecture — Template Registry & Sample Data
 * SalesmanPro Central Document System
 */

import {
  DocumentType,
  TemplateDefinition,
  InvoiceDocumentData,
  QuotationDocumentData,
  PurchaseOrderDocumentData,
  ReceiptDocumentData,
  StudentReportDocumentData,
  ClassBroadsheetDocumentData,
  ClassTimetableDocumentData,
} from "./types";

export const DOCUMENT_TEMPLATES: TemplateDefinition[] = [
  // ── INVOICE TEMPLATES ──
  {
    id: "invoice-corporate",
    name: "Modern Corporate",
    documentType: "INVOICE",
    description: "Executive enterprise layout with deep navy accents, prominent brand emblem, structured itemized tables, verified payment credentials, and signature approval.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Most Popular",
    colors: { primary: "#1E3A8A", accent: "#3B82F6", bgPreview: "#EFF6FF" },
    features: ["Clean table borders", "Tax breakdown", "Bank wire instructions", "QR code area"],
  },
  {
    id: "invoice-classic",
    name: "Classic Corporate (Standard)",
    documentType: "INVOICE",
    description: "Time-tested corporate format with crisp borders, dual client dossier cards, and bank transfer credentials.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Standard",
    colors: { primary: "#1E3A8A", accent: "#3B82F6", bgPreview: "#EFF6FF" },
    features: ["Clean table borders", "Tax breakdown", "Bank wire instructions", "QR code area"],
  },
  {
    id: "invoice-minimal",
    name: "Contemporary Minimal",
    documentType: "INVOICE",
    description: "Swiss-style modern tech aesthetic with dark slate header, electric indigo accents, generous whitespace, and high data readability.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Contemporary",
    colors: { primary: "#0F172A", accent: "#6366F1", bgPreview: "#EEF2FF" },
    features: ["Full-width banner", "Status pill badges", "Modern typography", "Compact totals"],
  },
  {
    id: "invoice-modern",
    name: "Modern Tech Slate",
    documentType: "INVOICE",
    description: "Contemporary dark-slate top banner, vibrant badge statuses, geometric summary cards, and clean typography.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Tech Modern",
    colors: { primary: "#0F172A", accent: "#6366F1", bgPreview: "#EEF2FF" },
    features: ["Full-width banner", "Status pill badges", "Modern typography", "Compact totals"],
  },
  {
    id: "invoice-executive",
    name: "Executive Luxury & High-End",
    documentType: "INVOICE",
    description: "Distinguished luxury layout with emerald and gold accents, official statutory fiscal certification, and dual executive signatures.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Executive",
    colors: { primary: "#047857", accent: "#B45309", bgPreview: "#ECFDF5" },
    features: ["High data density", "Prominent branding", "Detailed payment terms", "Signature line"],
  },
  {
    id: "invoice-pos",
    name: "Retail & Counter POS",
    documentType: "INVOICE",
    description: "Compact high-density counter billing format optimized for supermarkets, retail merchants, and quick counter dispatch.",
    category: "POS",
    defaultPageSize: "A4",
    badge: "POS Counter",
    colors: { primary: "#0284C7", accent: "#0369A1", bgPreview: "#F0F9FF" },
    features: ["Fast SKU scanning", "Immediate totals", "Cashier reference", "Instant QR"],
  },
  {
    id: "invoice-creative",
    name: "Branded Creative Studio",
    documentType: "INVOICE",
    description: "Dynamic asymmetric layout tailored for creative agencies, design studios, fashion houses, and lifestyle merchants.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Creative",
    colors: { primary: "#7C3AED", accent: "#EC4899", bgPreview: "#FAF5FF" },
    features: ["Asymmetric banner", "Creative pills", "Project milestones", "Vibrant accents"],
  },

  // ── QUOTATION TEMPLATES ──
  {
    id: "quotation-corporate",
    name: "Modern Corporate Estimate",
    documentType: "QUOTATION",
    description: "Formal quotation format with clear validity date, scope breakdown, and dedicated client acceptance and signature block.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Corporate",
    colors: { primary: "#0284C7", accent: "#0369A1", bgPreview: "#F0F9FF" },
    features: ["Acceptance section", "Validity period", "Itemized breakdown", "Notes block"],
  },
  {
    id: "quotation-classic",
    name: "Standard Estimate",
    documentType: "QUOTATION",
    description: "Formal quotation format with clear validity date, scope breakdown, and dedicated client acceptance and signature block.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Standard",
    colors: { primary: "#0284C7", accent: "#0369A1", bgPreview: "#F0F9FF" },
    features: ["Acceptance section", "Validity period", "Itemized breakdown", "Notes block"],
  },
  {
    id: "quotation-minimal",
    name: "Contemporary Minimal",
    documentType: "QUOTATION",
    description: "Clean minimalist layout with prominent expiry highlights, swift conversion markers, and modern item grid.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Minimalist",
    colors: { primary: "#0F172A", accent: "#0284C7", bgPreview: "#F8FAFC" },
    features: ["Prominent expiry", "Conversion ready", "Clean column layout", "Clear subtotals"],
  },
  {
    id: "quotation-modern",
    name: "Modern Minimalist",
    documentType: "QUOTATION",
    description: "Clean minimalist layout with prominent expiry highlights, swift conversion markers, and modern item grid.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Minimalist",
    colors: { primary: "#D97706", accent: "#B45309", bgPreview: "#FFFBEB" },
    features: ["Prominent expiry", "Conversion ready", "Clean column layout", "Clear subtotals"],
  },
  {
    id: "quotation-executive",
    name: "Executive Commercial Quotation",
    documentType: "QUOTATION",
    description: "Prestigious executive proposal format with formal gold rules, deliverable milestones, and corporate approval sign-off.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Executive",
    colors: { primary: "#B45309", accent: "#0F172A", bgPreview: "#FFFBEB" },
    features: ["Dossier cards", "Milestone breakdown", "Executive sign-off", "Dual seal"],
  },
  {
    id: "quotation-proposal",
    name: "Commercial Proposal",
    documentType: "QUOTATION",
    description: "Rich proposal-style quotation with hero branding, summary narrative, itemized costs, and payment milestones.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "B2B Proposal",
    colors: { primary: "#7C3AED", accent: "#6D28D9", bgPreview: "#F5F3FF" },
    features: ["Milestone breakdown", "Executive summary", "Terms & deliverables", "Approval block"],
  },
  {
    id: "quotation-creative",
    name: "Branded Creative Proposal",
    documentType: "QUOTATION",
    description: "Vibrant creative proposal for agencies, design studios, and lifestyle brands with integrated acceptance section.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Creative",
    colors: { primary: "#7C3AED", accent: "#EC4899", bgPreview: "#FAF5FF" },
    features: ["Creative header", "Deliverable timeline", "Visual totals", "Client approval"],
  },

  // ── PURCHASE ORDER TEMPLATES ──
  {
    id: "po-standard",
    name: "Standard Procurement",
    documentType: "PURCHASE_ORDER",
    description: "Rigorous B2B purchase order with vendor details, delivery address, SKU lines, delivery milestones, and approval sign-off.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Standard",
    colors: { primary: "#475569", accent: "#334155", bgPreview: "#F8FAFC" },
    features: ["Vendor address box", "Receiving checkpoints", "Approval sign-off", "Shipping terms"],
  },
  {
    id: "po-industrial",
    name: "Industrial & Supply",
    documentType: "PURCHASE_ORDER",
    description: "Engineered for high-volume supply chains, featuring SKU codes, warehouse instructions, and tax breakdowns.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Supply Chain",
    colors: { primary: "#C2410C", accent: "#9A3412", bgPreview: "#FFF7ED" },
    features: ["Warehouse instructions", "SKU & Part tracking", "Tax itemization", "Delivery due alert"],
  },
  {
    id: "po-executive",
    name: "Corporate Acquisition",
    documentType: "PURCHASE_ORDER",
    description: "Sleek executive purchasing order with budget attribution, department code, and supplier acknowledgment clause.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Corporate",
    colors: { primary: "#1E293B", accent: "#0EA5E9", bgPreview: "#F0F9FF" },
    features: ["Department code", "Budget attribution", "Supplier acknowledgment", "Dual authorization"],
  },

  // ── RECEIPT TEMPLATES ──
  {
    id: "receipt-standard",
    name: "Official A4 Payment Receipt",
    documentType: "PAYMENT_RECEIPT",
    description: "Full-page formal transaction receipt with payment verification stamp, ledger breakdown, and outstanding balance summary.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Official A4",
    colors: { primary: "#059669", accent: "#047857", bgPreview: "#ECFDF5" },
    features: ["Verification stamp", "Payment method breakdown", "Outstanding balance", "Tax invoice ref"],
  },
  {
    id: "receipt-minimal",
    name: "Contemporary Clean Receipt",
    documentType: "PAYMENT_RECEIPT",
    description: "Modern, clutter-free transaction receipt with clean typography, scannable QR verification, and instant ledger balance.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Contemporary",
    colors: { primary: "#0F172A", accent: "#059669", bgPreview: "#F8FAFC" },
    features: ["Clean typography", "Ledger balance", "QR verification", "Crisp borders"],
  },
  {
    id: "receipt-executive",
    name: "Executive Settlement Receipt",
    documentType: "PAYMENT_RECEIPT",
    description: "Prestigious receipt for high-value corporate settlements with formal cashier certification and dual accounting stamps.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Executive",
    colors: { primary: "#047857", accent: "#B45309", bgPreview: "#ECFDF5" },
    features: ["Cashier certification", "High-value settlement", "Dual seal", "Tax compliance"],
  },
  {
    id: "receipt-voucher",
    name: "Payment Voucher / Slip",
    documentType: "PAYMENT_RECEIPT",
    description: "Compact voucher slip format with dual-receipt cut-lines, customer copy, and teller/cashier acknowledgment.",
    category: "Commercial",
    defaultPageSize: "A4",
    badge: "Voucher Slip",
    colors: { primary: "#4F46E5", accent: "#4338CA", bgPreview: "#EEF2FF" },
    features: ["Compact voucher", "Cashier signature", "Ledger balance", "Customer copy"],
  },
  {
    id: "receipt-thermal",
    name: "Thermal POS Receipt (58mm / 80mm)",
    documentType: "SALES_RECEIPT",
    description: "Optimized for thermal POS printers with condensed typography, dotted separators, cashier ID, return policy, and scannable QR code.",
    category: "POS",
    defaultPageSize: "THERMAL_80MM",
    badge: "POS Thermal",
    colors: { primary: "#111827", accent: "#374151", bgPreview: "#F9FAFB" },
    features: ["58mm & 80mm auto-fit", "Monospace clarity", "Barcode/QR ready", "Store policy"],
  },

  // ── STUDENT REPORT CARD TEMPLATES ──
  {
    id: "student-report-classic",
    name: "Academic Excellence (Classic Crest)",
    documentType: "STUDENT_REPORT",
    description: "Traditional institutional school report with crest, admission details, exam scores, class averages, and headteacher remarks.",
    category: "School",
    defaultPageSize: "A4",
    badge: "Classic Crest",
    colors: { primary: "#1E3A8A", accent: "#172554", bgPreview: "#EFF6FF" },
    features: ["Institutional crest", "Subject position", "Class average comparison", "Principal signature"],
  },
  {
    id: "student-report-modern",
    name: "Modern Holistic Progress",
    documentType: "STUDENT_REPORT",
    description: "Contemporary card-based report card featuring visual KPI metrics for attendance, overall GPA, teacher remarks, and ranking.",
    category: "School",
    defaultPageSize: "A4",
    badge: "Holistic Cards",
    colors: { primary: "#7E22CE", accent: "#6B21A8", bgPreview: "#FAF5FF" },
    features: ["Attendance rate badge", "GPA rank card", "Dual teacher narrative", "Progress metrics"],
  },
  {
    id: "student-report-detailed",
    name: "Comprehensive Term Assessment",
    documentType: "STUDENT_REPORT",
    description: "In-depth performance evaluation with assignments vs exam breakdown, grading scale matrix (A+ to F), and guardian sign-off.",
    category: "School",
    defaultPageSize: "A4",
    badge: "Comprehensive",
    colors: { primary: "#0F766E", accent: "#115E59", bgPreview: "#F0FDFA" },
    features: ["Grading scale matrix", "Assignment vs Exam split", "Conduct evaluation", "Guardian sign-off"],
  },

  // ── SCHOOL FEE INVOICE TEMPLATES ──
  {
    id: "fee-invoice-academic",
    name: "Academic Classic Fee Invoice",
    documentType: "STUDENT_FEE_INVOICE",
    description: "Official school fee assessment with school crest, vote heads, verified M-Pesa Paybill / Bank account box, and bursary stamp.",
    category: "School",
    defaultPageSize: "A4",
    badge: "School Crest",
    colors: { primary: "#1E3A8A", accent: "#C5A059", bgPreview: "#EFF6FF" },
    features: ["School crest header", "Vote head itemization", "M-Pesa/Bank details", "Bursar sign-off"],
  },
  {
    id: "fee-invoice-modern",
    name: "Modern Card Fee Invoice",
    documentType: "STUDENT_FEE_INVOICE",
    description: "Contemporary card-based school fee invoice in emerald and slate for private academies and international schools.",
    category: "School",
    defaultPageSize: "A4",
    badge: "Modern School",
    colors: { primary: "#059669", accent: "#047857", bgPreview: "#ECFDF5" },
    features: ["Clean card layout", "Student placement tag", "Verified payment badge", "QR fee check"],
  },

  // ── SCHOOL FEE RECEIPT TEMPLATES ──
  {
    id: "fee-receipt-standard",
    name: "Standard School Fee Receipt",
    documentType: "STUDENT_FEE_RECEIPT",
    description: "Official bursary fee payment receipt with student particulars, transaction reference, remaining balance, and official seal.",
    category: "School",
    defaultPageSize: "A4",
    badge: "Official Bursary",
    colors: { primary: "#1E3A8A", accent: "#10B981", bgPreview: "#F0FDF4" },
    features: ["Payment verification", "Fee balance tracking", "Official school stamp", "QR code verification"],
  },
  {
    id: "fee-receipt-thermal",
    name: "Thermal Bursary Counter Slip",
    documentType: "STUDENT_FEE_RECEIPT",
    description: "Instant roll printing for school bursary cash registers and cashier desks in 80mm and 58mm roll paper.",
    category: "POS",
    defaultPageSize: "THERMAL_80MM",
    badge: "Bursary Roll",
    colors: { primary: "#111827", accent: "#374151", bgPreview: "#F9FAFB" },
    features: ["58mm & 80mm roll support", "Monospace clarity", "Remaining fee balance", "Scannable QR"],
  },

  // ── CLASS / STREAM BROADSHEET & MERIT LIST TEMPLATES ──
  {
    id: "broadsheet-matrix",
    name: "Stream Broadsheet (Subject Matrix)",
    documentType: "CLASS_BROADSHEET",
    description: "Landscape class/stream broadsheet with every student's score per subject, totals, mean, grade, position, subject means and grade distribution.",
    category: "School",
    defaultPageSize: "A4",
    badge: "Broadsheet",
    colors: { primary: "#1E3A8A", accent: "#C5A059", bgPreview: "#EFF6FF" },
    features: ["Per-subject score grid", "Subject mean / high / low", "Colour-coded grades", "Teacher & principal sign-off"],
  },
  {
    id: "broadsheet-merit-list",
    name: "Ranked Merit List",
    documentType: "CLASS_BROADSHEET",
    description: "Portrait merit list ranking all students in the class/stream with top-3 podium, deviation from class mean, remarks and grade distribution.",
    category: "School",
    defaultPageSize: "A4",
    badge: "Merit List",
    colors: { primary: "#7C2D12", accent: "#C5A059", bgPreview: "#FFF7ED" },
    features: ["Top-3 podium", "± class mean", "Performance remarks", "Grade distribution chart"],
  },

  // ── CLASS / EDUCATOR TIMETABLE TEMPLATES ──
  {
    id: "timetable-grid",
    name: "Weekly Matrix Timetable",
    documentType: "CLASS_TIMETABLE",
    description: "Landscape weekly timetable grid with days as columns, time periods, subject codes, rooms, and official seals.",
    category: "School",
    defaultPageSize: "A4",
    badge: "Weekly Grid",
    colors: { primary: "#1E3A8A", accent: "#C5A059", bgPreview: "#EFF6FF" },
    features: ["Weekly days × periods matrix", "Room & teacher tags", "Dean & principal sign-off", "Landscape A4"],
  },
  {
    id: "timetable-agenda",
    name: "Daily Agenda Timetable",
    documentType: "CLASS_TIMETABLE",
    description: "Portrait day-by-day lesson itinerary with time pills, course badges, educator names, and meeting links.",
    category: "School",
    defaultPageSize: "A4",
    badge: "Daily Agenda",
    colors: { primary: "#4338CA", accent: "#065F46", bgPreview: "#EEF2FF" },
    features: ["Day-by-day chronology", "Time period badges", "Room & educator details", "Portrait A4"],
  },
];

export function getTemplatesForType(type: DocumentType): TemplateDefinition[] {
  return DOCUMENT_TEMPLATES.filter((t) => t.documentType === type);
}

export function getDefaultTemplateId(type: DocumentType): string {
  switch (type) {
    case "INVOICE":
      return "invoice-classic";
    case "STUDENT_FEE_INVOICE":
      return "fee-invoice-academic";
    case "STUDENT_FEE_RECEIPT":
      return "fee-receipt-standard";
    case "QUOTATION":
      return "quotation-classic";
    case "PURCHASE_ORDER":
      return "po-standard";
    case "SALES_RECEIPT":
      return "receipt-thermal";
    case "PAYMENT_RECEIPT":
      return "receipt-standard";
    case "STUDENT_REPORT":
      return "student-report-classic";
    case "CLASS_BROADSHEET":
      return "broadsheet-matrix";
    case "CLASS_TIMETABLE":
      return "timetable-grid";
    default:
      return "invoice-classic";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REALISTIC SAMPLE PREVIEW DATA
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_COMPANY_BRANDING = {
  name: "Apex Global Solutions Ltd",
  tagline: "Empowering Next-Gen Enterprise Commerce",
  logoUrl: "https://salesmanpro.store/assets/logo.png",
  address: "Riverside Square, Westlands, 4th Floor, Suite 402, Nairobi, Kenya",
  contactEmail: "billing@apexsolutions.co.ke",
  contactPhone: "+254 712 345 678",
  website: "www.apexsolutions.co.ke",
  taxPin: "P051239845X",
  registrationNumber: "CPR/2021/894312",
  currency: "KES",
  primaryColor: "#2563EB",
  accentColor: "#1E40AF",
};

export const SAMPLE_INVOICE_DATA: InvoiceDocumentData = {
  documentType: "INVOICE",
  templateId: "invoice-classic",
  company: SAMPLE_COMPANY_BRANDING,
  invoiceNumber: "INV-001042",
  issueDate: "2026-09-15",
  dueDate: "2026-10-15",
  status: "PENDING",
  orderReference: "ORD-998231",
  customer: {
    name: "Safari Crest Logistics Ltd",
    email: "accounts@safaricrest.com",
    phone: "+254 722 890 123",
    billingAddress: "Mombasa Road, Industrial Park, Gate 3, Nairobi, Kenya",
    taxId: "P059948211Z",
  },
  items: [
    {
      sku: "SRV-CLOUD-01",
      description: "Enterprise Cloud ERP Platform — Annual Subscription (25 Users)",
      quantity: 1,
      unitPrice: 150000,
      discount: 10,
      taxRate: 16,
      taxAmount: 21600,
      lineTotal: 156600,
    },
    {
      sku: "SRV-MIGR-02",
      description: "Database Migration & POS Fleet Deployment Services",
      quantity: 2,
      unitPrice: 35000,
      discount: 0,
      taxRate: 16,
      taxAmount: 11200,
      lineTotal: 81200,
    },
    {
      sku: "HDW-POS-TERM",
      description: "Sunmi Dual-Screen Wireless Thermal POS Terminals (80mm)",
      quantity: 3,
      unitPrice: 28000,
      discount: 5,
      taxRate: 16,
      taxAmount: 12768,
      lineTotal: 92568,
    },
  ],
  subtotal: 284800,
  discountTotal: 19200,
  taxTotal: 45568,
  grandTotal: 330368,
  amountPaid: 100000,
  amountDue: 230368,
  paymentMethod: "Bank Transfer / M-Pesa Paybill",
  paymentInstructions: "Bank: Standard Chartered Bank | A/C: 010203040506 | Paybill: 247247, Acc: INV-001042",
  notes: "Goods supplied remain property of Apex Global Solutions until fully settled.",
  terms: "Payment strictly due within 30 days. Late balances attract 2% monthly interest.",
  footerText: "Thank you for partnering with Apex Global Solutions!",
};

export const SAMPLE_QUOTATION_DATA: QuotationDocumentData = {
  documentType: "QUOTATION",
  templateId: "quotation-classic",
  company: SAMPLE_COMPANY_BRANDING,
  quotationNumber: "QUO-000854",
  issueDate: "2026-09-20",
  expiryDate: "2026-10-20",
  status: "SENT",
  customer: {
    name: "Kilifi Coast Developers Consortium",
    email: "procurement@kilificonstruction.co.ke",
    phone: "+254 733 456 789",
    address: "Bofa Road, Ocean View Plaza, Kilifi, Kenya",
  },
  items: [
    {
      sku: "SYS-SOLAR-COMM",
      description: "Commercial 50kW Hybrid Solar Inverter System with Lithium Battery Bank",
      quantity: 1,
      unitPrice: 1250000,
      discount: 5,
      taxRate: 16,
      taxAmount: 190000,
      lineTotal: 1377500,
    },
    {
      sku: "LBR-INSTALL-PRO",
      description: "Rooftop Mounting, Civil Structural Works & Certified Grid Interconnect",
      quantity: 1,
      unitPrice: 280000,
      discount: 0,
      taxRate: 16,
      taxAmount: 44800,
      lineTotal: 324800,
    },
    {
      sku: "WARRANTY-EXT-3Y",
      description: "3-Year Priority Maintenance SLA & 24/7 Telemetric Remote Monitoring",
      quantity: 1,
      unitPrice: 95000,
      discount: 10,
      taxRate: 16,
      taxAmount: 13680,
      lineTotal: 99180,
    },
  ],
  subtotal: 1562500,
  discountTotal: 72000,
  taxTotal: 248480,
  grandTotal: 1801480,
  validityPeriod: "30 Calendar Days from Issue Date",
  notes: "Site accessibility and safety scaffolding provided by client prior to technical mobilization.",
  terms: "50% mobilization deposit upon order acceptance, 40% on delivery of hardware, 10% on commissioning.",
  acceptanceSection: {
    clientSignatureName: "Eng. Davis Mwashumbe",
    signatureDate: "",
    clientNotes: "Accepted as per technical specifications dated September 2026.",
  },
  footerText: "We look forward to delivering excellence for your sustainable energy project.",
};

export const SAMPLE_PURCHASE_ORDER_DATA: PurchaseOrderDocumentData = {
  documentType: "PURCHASE_ORDER",
  templateId: "po-standard",
  company: SAMPLE_COMPANY_BRANDING,
  poNumber: "PO-000419",
  issueDate: "2026-09-22",
  expectedDate: "2026-10-05",
  status: "APPROVED",
  supplier: {
    name: "Silicon Trans-Africa Distributors Ltd",
    contactPerson: "Brenda K. Okoth",
    email: "orders@silicontrans.com",
    phone: "+254 700 112 233",
    address: "Enterprise Road, Godown 14B, Industrial Area, Nairobi, Kenya",
  },
  deliveryAddress: "Apex Central Distribution Hub, Syokimau Airport Road, Nairobi",
  items: [
    {
      sku: "HW-SCAN-2D",
      description: "Zebra DS2208 Handheld 2D Barcode Scanners (USB Cable included)",
      quantityOrdered: 20,
      quantityReceived: 0,
      unitCost: 8500,
      taxRate: 16,
      taxAmount: 27200,
      lineTotal: 197200,
    },
    {
      sku: "HW-PRN-ROLL",
      description: "High-Sensitivity 80mm x 80m Thermal Receipt Paper Rolls (Box of 50)",
      quantityOrdered: 15,
      quantityReceived: 0,
      unitCost: 3200,
      taxRate: 16,
      taxAmount: 7680,
      lineTotal: 55680,
    },
  ],
  subtotal: 218000,
  taxAmount: 34880,
  shippingCost: 3500,
  totalAmount: 256380,
  notes: "Consignment must include signed delivery note and certificate of conformity.",
  terms: "Net 30 days from date of verified physical warehouse receipt.",
  authorizedBy: "Brenden O. — Chief Procurement Officer",
  footerText: "Authorized Official Purchase Order — Apex Global Solutions Ltd",
};

export const SAMPLE_RECEIPT_DATA: ReceiptDocumentData = {
  documentType: "PAYMENT_RECEIPT",
  templateId: "receipt-standard",
  company: SAMPLE_COMPANY_BRANDING,
  receiptNumber: "REC-002381",
  paymentDate: "2026-09-28 14:32",
  paymentMethod: "M-Pesa Express",
  transactionReference: "QKD8482N19",
  invoiceReference: "INV-001042",
  orderReference: "ORD-998231",
  customer: {
    name: "Safari Crest Logistics Ltd",
    phone: "+254 722 890 123",
    email: "accounts@safaricrest.com",
  },
  items: [
    { description: "Partial Payment against Invoice INV-001042", quantity: 1, unitPrice: 100000, lineTotal: 100000 },
  ],
  subtotal: 100000,
  taxAmount: 0,
  amountPaid: 100000,
  outstandingBalance: 230368,
  cashierName: "Alice Wambui (Teller 02)",
  notes: "Electronic receipt acknowledging verified digital payment. No signature required.",
  returnPolicy: "Goods once sold are not returnable without original receipt within 7 days.",
  paperWidth: "80mm",
  footerText: "Thank you for your business! Empowering your daily operations.",
};

export const SAMPLE_STUDENT_REPORT_DATA: StudentReportDocumentData = {
  documentType: "STUDENT_REPORT",
  templateId: "student-report-classic",
  school: {
    name: "St. Jude Premier Academy & High School",
    tagline: "Striving for Virtues, Wisdom & Leadership",
    logoUrl: "https://salesmanpro.store/assets/school-crest.png",
    address: "P.O. Box 40201-00100, Karen Plains, Nairobi, Kenya",
    contactEmail: "info@stjudeacademy.ac.ke",
    contactPhone: "+254 720 998 877",
    website: "www.stjudeacademy.ac.ke",
    registrationNumber: "MOE/REG/2014/9912",
    motto: "In Virtute et Sapientia (In Virtue & Wisdom)",
    principalName: "Dr. Margaret W. Kinyanjui, Ph.D.",
    currency: "KES",
  },
  student: {
    id: "std-sample-01",
    admissionNumber: "SJA/2023/048",
    name: "Ethan Joshua Mwangi",
    currentClass: "Grade 10 - Blue Sapphire",
    stream: "Science & Technology",
    academicLevel: "Senior Secondary",
    gender: "Male",
    dob: "2010-04-12",
  },
  term: {
    name: "Term 2 Examination & Term Progress",
    year: "2026",
    startDate: "2026-05-04",
    endDate: "2026-08-07",
  },
  results: [
    {
      subject: "Mathematics",
      code: "MAT-101",
      assignmentsScore: 28,
      examScore: 64,
      totalScore: 92,
      grade: "A",
      description: "Excellent",
      teacherRemarks: "Exemplary analytical reasoning and problem solving.",
      classAverage: 68.4,
      position: 1,
    },
    {
      subject: "Physics",
      code: "PHY-102",
      assignmentsScore: 26,
      examScore: 61,
      totalScore: 87,
      grade: "A",
      description: "Excellent",
      teacherRemarks: "Outstanding laboratory execution and mathematical rigor.",
      classAverage: 64.1,
      position: 2,
    },
    {
      subject: "Chemistry",
      code: "CHM-103",
      assignmentsScore: 25,
      examScore: 57,
      totalScore: 82,
      grade: "A-",
      description: "Very Good",
      teacherRemarks: "Strong grasp of stoichiometry and organic principles.",
      classAverage: 61.5,
      position: 4,
    },
    {
      subject: "Biology",
      code: "BIO-104",
      assignmentsScore: 27,
      examScore: 58,
      totalScore: 85,
      grade: "A",
      description: "Excellent",
      teacherRemarks: "Very articulate in theoretical physiology.",
      classAverage: 65.0,
      position: 3,
    },
    {
      subject: "English Language & Literature",
      code: "ENG-105",
      assignmentsScore: 24,
      examScore: 54,
      totalScore: 78,
      grade: "B+",
      description: "Good",
      teacherRemarks: "Commendable critical essays. Expand vocabulary.",
      classAverage: 69.2,
      position: 7,
    },
    {
      subject: "Computer Science & Robotics",
      code: "CSC-106",
      assignmentsScore: 29,
      examScore: 66,
      totalScore: 95,
      grade: "A+",
      description: "Exceptional",
      teacherRemarks: "Top of class in Python algorithms and microcontroller design.",
      classAverage: 71.0,
      position: 1,
    },
    {
      subject: "History & Global Citizenship",
      code: "HIS-107",
      assignmentsScore: 23,
      examScore: 52,
      totalScore: 75,
      grade: "B+",
      description: "Good",
      teacherRemarks: "Insightful participation in constitutional debates.",
      classAverage: 66.8,
      position: 6,
    },
  ],
  summary: {
    totalMarks: 594,
    maxPossibleMarks: 700,
    average: 84.9,
    overallGrade: "A",
    classRank: 2,
    totalStudents: 38,
    attendance: {
      presentDays: 68,
      absentDays: 2,
      totalDays: 70,
      attendanceRate: 97.1,
    },
    classTeacherComment: "Ethan continues to demonstrate supreme intellectual vigor, discipline, and exemplary peer leadership.",
    principalComment: "An outstanding academic performance. Recommended for National STEM Olympiad Honors.",
  },
  signatures: {
    classTeacherSignature: "Mr. Patrick Odhiambo, B.Ed (Sc)",
    principalSignature: "Dr. Margaret W. Kinyanjui, Ph.D.",
    showGuardianAck: true,
  },
  footerText: "Official Academic Transcript — St. Jude Premier Academy — Affiliated with Kenya National Examinations Council",
};

export function getRegisteredTemplates(): TemplateDefinition[] {
  return DOCUMENT_TEMPLATES;
}

const SAMPLE_BROADSHEET_SUBJECTS = [
  { name: "Biology", code: "BIO" },
  { name: "Chemistry", code: "CHE" },
  { name: "English", code: "ENG" },
  { name: "Kiswahili", code: "KIS" },
  { name: "Mathematics", code: "MAT" },
  { name: "Physics", code: "PHY" },
];

const SAMPLE_BROADSHEET_STUDENTS: ReadonlyArray<readonly [string, string, readonly number[]]> = [
  ["Ethan Mwangi", "SJ/2026/001", [92, 88, 85, 79, 95, 90]],
  ["Amani Wanjiru", "SJ/2026/014", [88, 84, 90, 86, 82, 80]],
  ["Brian Otieno", "SJ/2026/007", [80, 78, 74, 70, 88, 85]],
  ["Faith Chebet", "SJ/2026/022", [76, 72, 82, 84, 68, 66]],
  ["Kevin Kamau", "SJ/2026/031", [70, 66, 68, 72, 74, 70]],
  ["Grace Njeri", "SJ/2026/018", [64, 60, 75, 78, 55, 58]],
  ["Daniel Kiprop", "SJ/2026/009", [58, 54, 62, 60, 61, 57]],
  ["Mercy Achieng", "SJ/2026/027", [48, 45, 66, 70, 42, 44]],
  ["Samuel Mutua", "SJ/2026/035", [40, 38, 52, 55, 36, 39]],
];

export const SAMPLE_CLASS_BROADSHEET_DATA: ClassBroadsheetDocumentData = (() => {
  const scoreToGrade = (s: number) =>
    s >= 90 ? "A+" : s >= 85 ? "A" : s >= 80 ? "A-" : s >= 75 ? "B+" : s >= 70 ? "B" : s >= 65 ? "B-" :
    s >= 60 ? "C+" : s >= 55 ? "C" : s >= 50 ? "C-" : s >= 45 ? "D+" : s >= 40 ? "D" : "E";

  const students = SAMPLE_BROADSHEET_STUDENTS.map(([name, adm, marks], idx) => {
    const total = marks.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / marks.length);
    const scores: Record<string, number | null> = {};
    SAMPLE_BROADSHEET_SUBJECTS.forEach((s, i) => (scores[s.code] = marks[i]));
    return {
      rank: idx + 1,
      studentId: `sample-${idx}`,
      admissionNumber: adm,
      name,
      scores,
      totalMarks: total,
      average: avg,
      grade: scoreToGrade(avg),
      absences: idx % 3,
    };
  });

  const subjects = SAMPLE_BROADSHEET_SUBJECTS.map((s, i) => {
    const vals = SAMPLE_BROADSHEET_STUDENTS.map((r) => r[2][i] as number);
    const mean = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    return { ...s, classMean: mean, highest: Math.max(...vals), lowest: Math.min(...vals), meanGrade: scoreToGrade(mean) };
  });

  const avgs = students.map((s) => s.average);
  const classMean = Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10;
  const order = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "E"];

  return {
    documentType: "CLASS_BROADSHEET",
    templateId: "broadsheet-matrix",
    school: {
      ...SAMPLE_COMPANY_BRANDING,
      name: "St. Jude Premier Academy",
      primaryColor: "#1E3A8A",
      motto: "Knowledge, Integrity and Service",
      principalName: "Dr. Margaret W. Kinyanjui",
    },
    classroom: { id: "sample-class", name: "Form 3 East", academicLevel: "Form 3", classTeacher: "Mr. Patrick Odhiambo" },
    term: { id: "sample-term", name: "Term 2", year: "2026" },
    subjects,
    students,
    summary: {
      totalStudents: students.length,
      classMean,
      meanGrade: scoreToGrade(classMean),
      highestAverage: Math.max(...avgs),
      lowestAverage: Math.min(...avgs),
      gradeDistribution: order.map((g) => ({ grade: g, count: students.filter((s) => s.grade === g).length })),
    },
    generatedAt: new Date().toISOString(),
    footerText: "Official Academic Broadsheet — St. Jude Premier Academy",
  };
})();

export function getSampleDocumentData(type: DocumentType): any {
  switch (type) {
    case "INVOICE":
      return SAMPLE_INVOICE_DATA;
    case "QUOTATION":
      return SAMPLE_QUOTATION_DATA;
    case "PURCHASE_ORDER":
      return SAMPLE_PURCHASE_ORDER_DATA;
    case "SALES_RECEIPT":
    case "PAYMENT_RECEIPT":
      return SAMPLE_RECEIPT_DATA;
    case "STUDENT_REPORT":
      return SAMPLE_STUDENT_REPORT_DATA;
    case "CLASS_BROADSHEET":
      return SAMPLE_CLASS_BROADSHEET_DATA;
    case "CLASS_TIMETABLE":
      return SAMPLE_CLASS_TIMETABLE_DATA;
    default:
      return SAMPLE_INVOICE_DATA;
  }
}

export const SAMPLE_CLASS_TIMETABLE_DATA: ClassTimetableDocumentData = {
  documentType: "CLASS_TIMETABLE",
  templateId: "timetable-grid",
  school: {
    ...SAMPLE_COMPANY_BRANDING,
    name: "St. Jude Premier Academy",
    primaryColor: "#1E3A8A",
    motto: "Knowledge, Integrity and Service",
    principalName: "Dr. Margaret W. Kinyanjui",
  },
  scheduleFor: {
    type: "CLASSROOM",
    name: "Form 3 East",
    academicLevel: "Form 3",
    educatorName: "Mr. Patrick Odhiambo",
    roomName: "Room 204",
  },
  academicYear: "2026/2027",
  termName: "Term 2",
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  timeSlots: [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:30 - 12:30",
    "12:30 - 13:30",
    "14:00 - 15:00",
    "15:00 - 16:00",
  ],
  entries: [
    { id: "t1", dayOfWeek: "Monday", startTime: "08:00", endTime: "09:00", courseTitle: "Mathematics", courseCode: "MAT301", educatorName: "Mr. P. Odhiambo", roomName: "Rm 204" },
    { id: "t2", dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00", courseTitle: "English Literature", courseCode: "ENG301", educatorName: "Ms. J. Smith", roomName: "Rm 204" },
    { id: "t3", dayOfWeek: "Monday", startTime: "10:00", endTime: "11:00", courseTitle: "Chemistry", courseCode: "CHE301", educatorName: "Dr. A. Lee", roomName: "Chem Lab" },
    { id: "t4", dayOfWeek: "Monday", startTime: "11:30", endTime: "12:30", courseTitle: "Biology", courseCode: "BIO301", educatorName: "Mrs. N. Mwangi", roomName: "Bio Lab" },
    { id: "t5", dayOfWeek: "Monday", startTime: "14:00", endTime: "15:00", courseTitle: "History & Government", courseCode: "HIS301", educatorName: "Mr. D. Ochieng", roomName: "Rm 204" },

    { id: "t6", dayOfWeek: "Tuesday", startTime: "08:00", endTime: "09:00", courseTitle: "Physics", courseCode: "PHY301", educatorName: "Mr. E. Koech", roomName: "Physics Lab" },
    { id: "t7", dayOfWeek: "Tuesday", startTime: "09:00", endTime: "10:00", courseTitle: "Mathematics", courseCode: "MAT301", educatorName: "Mr. P. Odhiambo", roomName: "Rm 204" },
    { id: "t8", dayOfWeek: "Tuesday", startTime: "10:00", endTime: "11:00", courseTitle: "Geography", courseCode: "GEO301", educatorName: "Ms. A. Mutua", roomName: "Rm 204" },
    { id: "t9", dayOfWeek: "Tuesday", startTime: "11:30", endTime: "12:30", courseTitle: "Kiswahili", courseCode: "KIS301", educatorName: "Mwalimu Barasa", roomName: "Rm 204" },
    { id: "t10", dayOfWeek: "Tuesday", startTime: "14:00", endTime: "15:00", courseTitle: "Computer Studies", courseCode: "COM301", educatorName: "Eng. Kiprono", roomName: "ICT Lab" },

    { id: "t11", dayOfWeek: "Wednesday", startTime: "08:00", endTime: "09:00", courseTitle: "English Language", courseCode: "ENG301", educatorName: "Ms. J. Smith", roomName: "Rm 204" },
    { id: "t12", dayOfWeek: "Wednesday", startTime: "09:00", endTime: "10:00", courseTitle: "Chemistry", courseCode: "CHE301", educatorName: "Dr. A. Lee", roomName: "Chem Lab" },
    { id: "t13", dayOfWeek: "Wednesday", startTime: "10:00", endTime: "11:00", courseTitle: "Biology", courseCode: "BIO301", educatorName: "Mrs. N. Mwangi", roomName: "Bio Lab" },
    { id: "t14", dayOfWeek: "Wednesday", startTime: "11:30", endTime: "12:30", courseTitle: "Business Studies", courseCode: "BUS301", educatorName: "Mr. G. Njoroge", roomName: "Rm 204" },
    { id: "t15", dayOfWeek: "Wednesday", startTime: "14:00", endTime: "15:00", courseTitle: "Physical Education", courseCode: "PE301", educatorName: "Coach Wekesa", roomName: "Sports Pitch" },

    { id: "t16", dayOfWeek: "Thursday", startTime: "08:00", endTime: "09:00", courseTitle: "Mathematics", courseCode: "MAT301", educatorName: "Mr. P. Odhiambo", roomName: "Rm 204" },
    { id: "t17", dayOfWeek: "Thursday", startTime: "09:00", endTime: "10:00", courseTitle: "Physics", courseCode: "PHY301", educatorName: "Mr. E. Koech", roomName: "Physics Lab" },
    { id: "t18", dayOfWeek: "Thursday", startTime: "10:00", endTime: "11:00", courseTitle: "Kiswahili", courseCode: "KIS301", educatorName: "Mwalimu Barasa", roomName: "Rm 204" },
    { id: "t19", dayOfWeek: "Thursday", startTime: "11:30", endTime: "12:30", courseTitle: "History & Government", courseCode: "HIS301", educatorName: "Mr. D. Ochieng", roomName: "Rm 204" },
    { id: "t20", dayOfWeek: "Thursday", startTime: "14:00", endTime: "15:00", courseTitle: "Christian Religious Ed", courseCode: "CRE301", educatorName: "Rev. Waweru", roomName: "Rm 204" },

    { id: "t21", dayOfWeek: "Friday", startTime: "08:00", endTime: "09:00", courseTitle: "English Literature", courseCode: "ENG301", educatorName: "Ms. J. Smith", roomName: "Rm 204" },
    { id: "t22", dayOfWeek: "Friday", startTime: "09:00", endTime: "10:00", courseTitle: "Chemistry Practical", courseCode: "CHE301", educatorName: "Dr. A. Lee", roomName: "Chem Lab" },
    { id: "t23", dayOfWeek: "Friday", startTime: "10:00", endTime: "11:00", courseTitle: "Biology Practical", courseCode: "BIO301", educatorName: "Mrs. N. Mwangi", roomName: "Bio Lab" },
    { id: "t24", dayOfWeek: "Friday", startTime: "11:30", endTime: "12:30", courseTitle: "Mathematics", courseCode: "MAT301", educatorName: "Mr. P. Odhiambo", roomName: "Rm 204" },
    { id: "t25", dayOfWeek: "Friday", startTime: "14:00", endTime: "15:00", courseTitle: "Clubs & Societies", courseCode: "ACT301", educatorName: "Patrons", roomName: "Campus" },
  ],
  summary: {
    totalLessons: 25,
    activeDays: 5,
    uniqueSubjects: 11,
    earliestStart: "08:00",
    latestEnd: "15:00",
  },
  generatedAt: new Date().toISOString(),
  footerText: "Official Academic Timetable — St. Jude Premier Academy",
};

