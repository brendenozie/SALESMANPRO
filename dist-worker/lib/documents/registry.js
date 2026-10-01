"use strict";
/**
 * Unified Document Architecture — Template Registry & Sample Data
 * SalesmanPro Central Document System
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSampleDocumentData = exports.getRegisteredTemplates = exports.SAMPLE_STUDENT_REPORT_DATA = exports.SAMPLE_RECEIPT_DATA = exports.SAMPLE_PURCHASE_ORDER_DATA = exports.SAMPLE_QUOTATION_DATA = exports.SAMPLE_INVOICE_DATA = exports.SAMPLE_COMPANY_BRANDING = exports.getDefaultTemplateId = exports.getTemplatesForType = exports.DOCUMENT_TEMPLATES = void 0;
exports.DOCUMENT_TEMPLATES = [
    // ── INVOICE TEMPLATES ──
    {
        id: "invoice-classic",
        name: "Classic Corporate",
        documentType: "INVOICE",
        description: "Elegant, crisp corporate design with refined borders, blue accents, structured itemized tables, and complete banking details.",
        category: "Commercial",
        defaultPageSize: "A4",
        badge: "Most Popular",
        colors: { primary: "#2563EB", accent: "#1E40AF", bgPreview: "#EFF6FF" },
        features: ["Clean table borders", "Tax breakdown", "Bank wire instructions", "QR code area"],
    },
    {
        id: "invoice-modern",
        name: "Modern Tech Slate",
        documentType: "INVOICE",
        description: "Contemporary dark-slate top banner, vibrant badge statuses, geometric summary cards, and clean typography.",
        category: "Commercial",
        defaultPageSize: "A4",
        badge: "Contemporary",
        colors: { primary: "#0F172A", accent: "#6366F1", bgPreview: "#EEF2FF" },
        features: ["Full-width banner", "Status pill badges", "Modern typography", "Compact totals"],
    },
    {
        id: "invoice-executive",
        name: "Executive Minimalist",
        documentType: "INVOICE",
        description: "Sophisticated monochrome high-density layout with emerald financial accents and prominent company branding.",
        category: "Commercial",
        defaultPageSize: "A4",
        badge: "Executive",
        colors: { primary: "#047857", accent: "#065F46", bgPreview: "#ECFDF5" },
        features: ["High data density", "Prominent branding", "Detailed payment terms", "Signature line"],
    },
    // ── QUOTATION TEMPLATES ──
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
        description: "Optimized for thermal POS printers with condensed typography, dotted separators, cashier ID, and return policy.",
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
];
function getTemplatesForType(type) {
    return exports.DOCUMENT_TEMPLATES.filter((t) => t.documentType === type);
}
exports.getTemplatesForType = getTemplatesForType;
function getDefaultTemplateId(type) {
    switch (type) {
        case "INVOICE":
            return "invoice-classic";
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
        default:
            return "invoice-classic";
    }
}
exports.getDefaultTemplateId = getDefaultTemplateId;
// ─────────────────────────────────────────────────────────────────────────────
// REALISTIC SAMPLE PREVIEW DATA
// ─────────────────────────────────────────────────────────────────────────────
exports.SAMPLE_COMPANY_BRANDING = {
    name: "Apex Global Solutions Ltd",
    tagline: "Empowering Next-Gen Enterprise Commerce",
    logoUrl: "https://salesmanpro.site/assets/logo.png",
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
exports.SAMPLE_INVOICE_DATA = {
    documentType: "INVOICE",
    templateId: "invoice-classic",
    company: exports.SAMPLE_COMPANY_BRANDING,
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
exports.SAMPLE_QUOTATION_DATA = {
    documentType: "QUOTATION",
    templateId: "quotation-classic",
    company: exports.SAMPLE_COMPANY_BRANDING,
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
exports.SAMPLE_PURCHASE_ORDER_DATA = {
    documentType: "PURCHASE_ORDER",
    templateId: "po-standard",
    company: exports.SAMPLE_COMPANY_BRANDING,
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
exports.SAMPLE_RECEIPT_DATA = {
    documentType: "PAYMENT_RECEIPT",
    templateId: "receipt-standard",
    company: exports.SAMPLE_COMPANY_BRANDING,
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
exports.SAMPLE_STUDENT_REPORT_DATA = {
    documentType: "STUDENT_REPORT",
    templateId: "student-report-classic",
    school: {
        name: "St. Jude Premier Academy & High School",
        tagline: "Striving for Virtues, Wisdom & Leadership",
        logoUrl: "https://salesmanpro.site/assets/school-crest.png",
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
function getRegisteredTemplates() {
    return exports.DOCUMENT_TEMPLATES;
}
exports.getRegisteredTemplates = getRegisteredTemplates;
function getSampleDocumentData(type) {
    switch (type) {
        case "INVOICE":
            return exports.SAMPLE_INVOICE_DATA;
        case "QUOTATION":
            return exports.SAMPLE_QUOTATION_DATA;
        case "PURCHASE_ORDER":
            return exports.SAMPLE_PURCHASE_ORDER_DATA;
        case "SALES_RECEIPT":
        case "PAYMENT_RECEIPT":
            return exports.SAMPLE_RECEIPT_DATA;
        case "STUDENT_REPORT":
            return exports.SAMPLE_STUDENT_REPORT_DATA;
        default:
            return exports.SAMPLE_INVOICE_DATA;
    }
}
exports.getSampleDocumentData = getSampleDocumentData;
