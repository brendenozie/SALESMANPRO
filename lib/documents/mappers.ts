/**
 * Unified Document Architecture — Data Mappers
 * Maps live Prisma models into normalized document data structures.
 */

import prisma from "@/server/db/prismadb";
import {
  CompanyBranding,
  InvoiceDocumentData,
  QuotationDocumentData,
  PurchaseOrderDocumentData,
  ReceiptDocumentData,
  StudentReportDocumentData,
  ClassBroadsheetDocumentData,
  ClassBroadsheetSubject,
  ClassBroadsheetStudentRow,
} from "./types";
import {
  generateReportCard,
  bulkGenerateReportCards,
  scoreToLetterGrade,
} from "@/lib/school/schoolService";

/**
 * Extracts normalized company branding from Company and settings
 */
export async function extractCompanyBranding(companyId: string): Promise<CompanyBranding> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      settings: true,
      addresses: true,
      PaymentSettings: true,
    },
  });

  if (!company) {
    throw new Error(`Company not found with ID ${companyId}`);
  }

  // Lookup authoritative KRA PIN from KraConfiguration if available
  let kraPin: string | undefined = undefined;
  try {
    const kraConfig = await prisma.kraConfiguration.findUnique({
      where: { companyId },
      select: { kraPin: true },
    });
    if (kraConfig?.kraPin) {
      kraPin = kraConfig.kraPin;
    }
  } catch (err) {
    // Non-blocking lookup fallback
  }

  const theme = (company.themeSettings as any) || {};
  const settings = company.settings as any;
  const addresses = (company as any).addresses || [];
  const primaryAddr = addresses[0];

  const streetAddress = company.address || settings?.address || primaryAddr?.street || undefined;
  const city = settings?.city || primaryAddr?.city || undefined;
  const state = settings?.state || primaryAddr?.state || undefined;
  const country = settings?.country || primaryAddr?.country || "Kenya";
  const postalAddress = settings?.zipCode || primaryAddr?.postalCode || undefined;

  // Build verified payment instructions without exposing API keys/secrets
  const paymentParts: string[] = [];
  const paymentSettings = (company as any).PaymentSettings;
  if (paymentSettings?.isMpesaEnabled && paymentSettings?.mpesaShortcode) {
    paymentParts.push(`M-PESA: Paybill / Till: ${paymentSettings.mpesaShortcode}`);
  }
  if (paymentSettings?.whatsappPaymentInstructions) {
    paymentParts.push(paymentSettings.whatsappPaymentInstructions);
  }
  if (settings?.bankAccountDetails) {
    const bank = typeof settings.bankAccountDetails === "string" 
      ? settings.bankAccountDetails 
      : JSON.stringify(settings.bankAccountDetails);
    paymentParts.push(`Bank: ${bank}`);
  }

  const paymentInstructions = paymentParts.length > 0 ? paymentParts.join(" • ") : undefined;

  return {
    name: company.name,
    tagline: company.tagline ?? undefined,
    logoUrl: company.logoUrl ?? company.settings?.logoUrl ?? undefined,
    address: streetAddress,
    city,
    state,
    country,
    postalAddress,
    contactEmail: company.contactEmail ?? company.settings?.contactEmail ?? undefined,
    contactPhone: company.contactPhone ?? company.settings?.contactPhone ?? undefined,
    website: company.domain 
      ? (company.domain.startsWith("http") ? company.domain : `https://${company.domain}`)
      : (company.hasWebsite ? `https://${company.slug}.${process.env.PLATFORM_BASE_DOMAIN || "salesmanpro.store"}` : undefined),
    taxPin: kraPin || settings?.taxPin || undefined,
    registrationNumber: settings?.registrationNumber || undefined,
    currency: company.currency || settings?.currency || "KES",
    primaryColor: theme.primaryColor || "#1E3A8A",
    accentColor: theme.accentColor || "#3B82F6",
    paymentInstructions,
    mpesaShortcode: paymentSettings?.mpesaShortcode || undefined,
  };
}

/**
 * Map live Invoice to normalized InvoiceDocumentData
 */
export async function mapInvoiceToDocumentData(
  invoiceId: string,
  companyId: string,
  templateId: string = "invoice-classic"
): Promise<InvoiceDocumentData> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, companyId },
    include: {
      items: true,
      consumer: { include: { user: true } },
      client: { include: { user: true } },
      order: true,
      company: { include: { settings: true } },
    },
  });

  if (!invoice) {
    throw new Error(`Invoice not found: ${invoiceId}`);
  }

  const branding = await extractCompanyBranding(companyId);

  const orderData = invoice.order as any;

  const customerName =
    invoice.customerName ||
    invoice.consumer?.user?.name ||
    invoice.client?.user?.name ||
    orderData?.name ||
    "Valued Customer";

  const customerEmail =
    invoice.customerEmail ||
    invoice.consumer?.user?.email ||
    invoice.client?.user?.email ||
    orderData?.email ||
    undefined;

  const customerPhone =
    invoice.customerPhone ||
    invoice.consumer?.user?.phone ||
    invoice.client?.user?.phone ||
    orderData?.phone ||
    undefined;

  const billingAddr = orderData?.billingAddress
    ? typeof orderData.billingAddress === "string"
      ? orderData.billingAddress
      : Object.values(orderData.billingAddress).join(", ")
    : undefined;

  const shippingAddr = orderData?.shippingAddress
    ? typeof orderData.shippingAddress === "string"
      ? orderData.shippingAddress
      : Object.values(orderData.shippingAddress).join(", ")
    : undefined;

  const items = invoice.items.map((it: any) => ({
    sku: it.productId ? `PROD-${it.productId.slice(-6)}` : undefined,
    description: it.description,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    discount: it.discount,
    taxRate: it.taxRate,
    lineTotal: it.totalPrice,
  }));

  const invoiceStatusMap: Record<string, "DRAFT" | "PENDING" | "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "CANCELLED"> = {
    DRAFT: "DRAFT",
    PENDING: "PENDING",
    SENT: "PENDING",
    PAID: "PAID",
    PARTIALLY_PAID: "PARTIALLY_PAID",
    OVERDUE: "OVERDUE",
    CANCELLED: "CANCELLED",
  };

  const normalizedStatus = invoiceStatusMap[invoice.status] || "PENDING";

  return {
    documentType: "INVOICE",
    templateId,
    company: branding,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    status: normalizedStatus,
    orderReference: invoice.orderId ? `ORD-${invoice.orderId.slice(-6)}` : undefined,
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      billingAddress: billingAddr,
      shippingAddress: shippingAddr,
    },
    items,
    subtotal: invoice.subtotal || invoice.amount,
    discountTotal: invoice.discountAmount || 0,
    taxTotal: invoice.taxAmount || 0,
    grandTotal: invoice.amount,
    amountPaid: invoice.amountPaid || 0,
    amountDue: invoice.amountDue !== undefined ? invoice.amountDue : Math.max(0, invoice.amount - (invoice.amountPaid || 0)),
    notes: invoice.notes ?? undefined,
    paymentInstructions: (invoice as any).paymentInstructions || branding.paymentInstructions,
    terms: invoice.terms ?? "Payment due within 30 days of invoice date.",
    footerText: `Official Tax Invoice — ${branding.name}`,
  };
}

/**
 * Map live Quotation to normalized QuotationDocumentData
 */
export async function mapQuotationToDocumentData(
  quotationId: string,
  companyId: string,
  templateId: string = "quotation-classic"
): Promise<QuotationDocumentData> {
  const quotation = await prisma.quotation.findFirst({
    where: { id: quotationId, companyId },
    include: {
      items: true,
      consumer: { include: { user: true } },
      client: { include: { user: true } },
    },
  });

  if (!quotation) {
    throw new Error(`Quotation not found: ${quotationId}`);
  }

  const branding = await extractCompanyBranding(companyId);

  const customerName =
    quotation.customerName ||
    quotation.consumer?.user?.name ||
    quotation.client?.user?.name ||
    "Client / Prospective Partner";

  const customerEmail =
    quotation.customerEmail ||
    quotation.consumer?.user?.email ||
    quotation.client?.user?.email ||
    undefined;

  const customerPhone =
    quotation.customerPhone ||
    quotation.consumer?.user?.phone ||
    quotation.client?.user?.phone ||
    undefined;

  const items = quotation.items.map((it) => ({
    sku: it.productId ? `SKU-${it.productId.slice(-6)}` : undefined,
    description: it.description,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    discount: it.discount,
    taxRate: it.taxRate,
    lineTotal: it.totalPrice,
  }));

  return {
    documentType: "QUOTATION",
    templateId,
    company: branding,
    quotationNumber: quotation.quotationNumber,
    issueDate: quotation.issueDate.toISOString(),
    expiryDate: quotation.expiryDate.toISOString(),
    status: quotation.status,
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
    },
    items,
    subtotal: quotation.subtotal,
    discountTotal: quotation.discountAmount,
    taxTotal: quotation.taxAmount,
    grandTotal: quotation.totalAmount,
    validityPeriod: "30 Days from date of issue",
    notes: quotation.notes ?? undefined,
    terms: quotation.terms ?? "Standard delivery and mobilization terms apply.",
    acceptanceSection: {
      clientSignatureName: customerName,
    },
    footerText: `Authorized Quotation — ${branding.name}`,
  };
}

/**
 * Map live PurchaseOrder to normalized PurchaseOrderDocumentData
 */
export async function mapPurchaseOrderToDocumentData(
  poId: string,
  companyId: string,
  templateId: string = "po-standard"
): Promise<PurchaseOrderDocumentData> {
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: poId, companyId },
    include: {
      items: true,
      supplier: true,
    },
  });

  if (!po) {
    throw new Error(`Purchase order not found: ${poId}`);
  }

  const branding = await extractCompanyBranding(companyId);

  const items = po.items.map((it) => ({
    sku: it.productId ? `SKU-${it.productId.slice(-6)}` : undefined,
    description: it.description,
    quantityOrdered: it.quantityOrdered,
    quantityReceived: it.quantityReceived,
    unitCost: it.unitCost,
    lineTotal: it.totalCost,
  }));

  return {
    documentType: "PURCHASE_ORDER",
    templateId,
    company: branding,
    poNumber: po.poNumber,
    issueDate: po.issueDate.toISOString(),
    expectedDate: po.expectedDate ? po.expectedDate.toISOString() : undefined,
    status: po.status,
    supplier: {
      name: po.supplier.name,
      contactPerson: po.supplier.contactPerson ?? undefined,
      email: po.supplier.email ?? undefined,
      phone: po.supplier.phone ?? undefined,
      address: po.supplier.address ?? undefined,
    },
    deliveryAddress: branding.address || "Main Receiving Warehouse",
    items,
    subtotal: po.subtotal,
    taxAmount: po.taxAmount,
    shippingCost: po.shippingCost,
    totalAmount: po.totalAmount,
    notes: po.notes ?? undefined,
    terms: "Net 30 payment terms upon physical receipt and verification.",
    authorizedBy: po.approvedBy || "Authorized Purchasing Officer",
    footerText: `Official Purchase Order — ${branding.name}`,
  };
}

/**
 * Map live Payment or CustomerOrder to normalized ReceiptDocumentData
 */
export async function mapReceiptToDocumentData(
  sourceId: string,
  sourceKind: "PAYMENT" | "ORDER" | "INVOICE",
  companyId: string,
  templateId: string = "receipt-standard"
): Promise<ReceiptDocumentData> {
  const branding = await extractCompanyBranding(companyId);

  if (sourceKind === "PAYMENT") {
    const payment = await prisma.payment.findFirst({
      where: { id: sourceId, companyId },
      include: {
        order: { include: { items: true } },
      },
    });

    if (!payment) {
      throw new Error(`Payment record not found: ${sourceId}`);
    }

    const items = payment.order?.items?.map((it: any) => ({
      description: it.serviceNotes || (it.productId ? `Product Item (${it.productId.slice(-6)})` : "Order Line Item"),
      quantity: it.quantity || 1,
      unitPrice: it.price || 0,
      lineTotal: (it.quantity || 1) * (it.price || 0),
    }));

    return {
      documentType: "PAYMENT_RECEIPT",
      templateId,
      company: branding,
      receiptNumber: `REC-${payment.transactionId.slice(-8)}`,
      paymentDate: payment.paidAt?.toISOString() || payment.createdAt?.toISOString() || new Date().toISOString(),
      paymentMethod: payment.provider || "CASH",
      transactionReference: payment.transactionId,
      orderReference: `ORD-${payment.orderId.slice(-6)}`,
      customer: {
        name: payment.order?.name ?? undefined,
        phone: payment.order?.phone ?? undefined,
        email: payment.order?.email ?? undefined,
      },
      items,
      amountPaid: payment.amount,
      outstandingBalance: 0,
      footerText: `Thank you for your payment — ${branding.name}`,
    };
  }

  if (sourceKind === "ORDER") {
    const order = await prisma.customerOrder.findFirst({
      where: { id: sourceId, companyId },
      include: { items: true, Payment: true },
    });

    if (!order) {
      throw new Error(`Customer order not found: ${sourceId}`);
    }

    const totalPaid = order.Payment.filter((p) => p.status === "COMPLETED").reduce((acc, p) => acc + p.amount, 0);
    const balance = Math.max(0, (order.totalFinalPrice || order.totalPrice || 0) - totalPaid);

    const items = order.items.map((it: any) => ({
      description: it.serviceNotes || (it.productId ? `Product Item (${it.productId.slice(-6)})` : "Product"),
      quantity: it.quantity || 1,
      unitPrice: it.price || 0,
      lineTotal: (it.quantity || 1) * (it.price || 0),
    }));

    return {
      documentType: "SALES_RECEIPT",
      templateId,
      company: branding,
      receiptNumber: `REC-${order.id.slice(-8).toUpperCase()}`,
      paymentDate: order.createdAt.toISOString(),
      paymentMethod: order.paymentOption || "CARD/CASH",
      transactionReference: order.transactionReference || order.transactionId || order.id.slice(-8),
      orderReference: `ORD-${order.id.slice(-6)}`,
      customer: {
        name: order.name ?? undefined,
        phone: order.phone ?? undefined,
        email: order.email ?? undefined,
      },
      items,
      subtotal: order.totalPrice || 0,
      taxAmount: order.totalTax || 0,
      discountAmount: order.totalDiscount || 0,
      amountPaid: totalPaid || order.totalFinalPrice || order.totalPrice || 0,
      outstandingBalance: balance,
      cashierName: order.cashierName ?? undefined,
      footerText: `Thank you for shopping with ${branding.name}!`,
    };
  }

  // Fallback to INVOICE
  const invoice = await prisma.invoice.findFirst({
    where: { id: sourceId, companyId },
    include: { items: true },
  });

  if (!invoice) {
    throw new Error(`Invoice not found: ${sourceId}`);
  }

  return {
    documentType: "PAYMENT_RECEIPT",
    templateId,
    company: branding,
    receiptNumber: `REC-${invoice.invoiceNumber}`,
    paymentDate: invoice.updatedAt.toISOString(),
    paymentMethod: "REMITTANCE",
    transactionReference: invoice.invoiceNumber,
    invoiceReference: invoice.invoiceNumber,
    customer: {
      name: invoice.customerName ?? undefined,
      phone: invoice.customerPhone ?? undefined,
      email: invoice.customerEmail ?? undefined,
    },
    items: invoice.items.map((it) => ({
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      lineTotal: it.totalPrice,
    })),
    amountPaid: invoice.amountPaid || 0,
    outstandingBalance: invoice.amountDue || 0,
    footerText: `Payment acknowledgment for ${invoice.invoiceNumber} — ${branding.name}`,
  };
}

/**
 * Map live School Report Card data to normalized StudentReportDocumentData
 */
export async function mapStudentReportToDocumentData(
  studentId: string,
  termId: string,
  companyId: string,
  templateId: string = "student-report-classic"
): Promise<StudentReportDocumentData> {
  const reportData = await generateReportCard(studentId, termId, companyId);
  const branding = await extractCompanyBranding(companyId);

  const headTeacher = await prisma.headTeacher.findFirst({
    where: { companyId },
    include: { user: true },
  });

  const studentRecord = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      gender: true,
      dateOfBirth: true,
      profilePicture: true,
      academicLevel: true,
    },
  });

  const results = reportData.subjects.map((sub, idx) => ({
    subject: sub.courseName,
    code: `SUB-0${idx + 1}`,
    assignmentsScore: sub.assignments,
    examScore: sub.exams,
    totalScore: sub.averageScore,
    grade: sub.letterGrade,
    description: sub.averageScore >= 80 ? "Excellent" : sub.averageScore >= 65 ? "Good" : "Satisfactory",
    teacherRemarks: sub.teacherComment || "Consistent engagement in coursework.",
  }));

  const maxMarks = (reportData.subjects.length || 1) * 100;
  const totalScoreMarks = reportData.subjects.reduce((sum, s) => sum + s.averageScore, 0);

  const present = Math.max(0, 70 - (reportData.totalAbsences || 0));

  return {
    documentType: "STUDENT_REPORT",
    templateId,
    school: {
      ...branding,
      motto: branding.tagline || "Excellence in Education and Integrity",
      principalName: headTeacher?.user?.name || "The Principal",
    },
    student: {
      id: reportData.student.id,
      admissionNumber: reportData.student.admissionNumber,
      name: `${reportData.student.firstName} ${reportData.student.lastName}`,
      currentClass: reportData.student.currentClass,
      academicLevel: studentRecord?.academicLevel,
      gender: studentRecord?.gender ?? undefined,
      dob: studentRecord?.dateOfBirth ?? undefined,
      photoUrl: studentRecord?.profilePicture ?? undefined,
    },
    term: {
      id: reportData.term.id,
      name: reportData.term.name,
      year: reportData.term.year,
    },
    results,
    summary: {
      totalMarks: Math.round(totalScoreMarks),
      maxPossibleMarks: maxMarks,
      average: reportData.overallAverage,
      overallGrade: reportData.overallLetterGrade,
      classRank: reportData.classRank,
      attendance: {
        presentDays: present,
        absentDays: reportData.totalAbsences || 0,
        totalDays: 70,
        attendanceRate: Math.round((present / 70) * 100),
      },
      classTeacherComment: "Shows keen intellect and active academic participation.",
      principalComment: reportData.principalComment || "Commendable term result. Recommended to maintain this standard.",
    },
    signatures: {
      classTeacherSignature: "Class Teacher",
      principalSignature: headTeacher?.user?.name || "Headteacher / Principal",
      showGuardianAck: true,
    },
    footerText: `Official Academic Transcript — ${branding.name}`,
  };
}

/**
 * Map live StudentFeeRecord to InvoiceDocumentData
 */
export async function mapStudentFeeRecordToInvoiceData(
  recordId: string,
  companyId: string,
  templateId: string = "invoice-corporate"
): Promise<InvoiceDocumentData> {
  const record = await prisma.studentFeeRecord.findUnique({
    where: { id: recordId },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
          parent: { include: { user: { select: { name: true, email: true, phone: true } } } },
          StudentAcademicLevel: {
            include: {
              classRoom: true,
              academicLevel: true,
            },
          },
        },
      },
    },
  });

  if (!record) {
    throw new Error(`Student fee record not found: ${recordId}`);
  }

  const resolvedCompanyId = companyId || record.student.companyId || "default";
  const branding = await extractCompanyBranding(resolvedCompanyId);
  const student = record.student;

  const academicLevel =
    student.StudentAcademicLevel.find(
      (l) => l.year === record.academicYear && l.term === record.term
    ) ?? student.StudentAcademicLevel[0];

  const classroom = academicLevel?.classRoom?.name ?? student.currentClass ?? "General Class";

  const appliedItems = (record.appliedFeeItems || []) as Array<{
    name: string;
    description?: string;
    amount: number;
  }>;

  const items = appliedItems.length > 0
    ? appliedItems.map((item) => ({
        description: item.name + (item.description ? ` (${item.description})` : ""),
        quantity: 1,
        unitPrice: Number(item.amount) || 0,
        lineTotal: Number(item.amount) || 0,
      }))
    : [
        {
          description: `Tuition & School Levies (${record.term} - ${record.academicYear})`,
          quantity: 1,
          unitPrice: Number(record.amountPaid) || 0,
          lineTotal: Number(record.amountPaid) || 0,
        },
      ];

  const grandTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const amountPaid = Number(record.amountPaid) || 0;
  const amountDue = grandTotal - amountPaid;

  const studentFullName = `${student.firstName} ${student.lastName}`.trim() || student.user?.name || "Student";
  const parentName = student.parent?.user?.name;

  return {
    documentType: "INVOICE",
    templateId,
    company: branding,
    invoiceNumber: record.invoiceNumber || `FEE-${record.id.slice(-6).toUpperCase()}`,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: record.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status:
      amountDue <= 0
        ? "PAID"
        : amountPaid > 0
        ? "PARTIALLY_PAID"
        : "PENDING",
    orderReference: `${record.term} (${record.academicYear})`,
    customer: {
      name: studentFullName,
      email: student.user?.email || student.parent?.user?.email || student.contactEmail || undefined,
      phone: student.user?.phone || student.parent?.user?.phone || student.contactPhone || undefined,
      billingAddress: `Admission No: ${student.admissionNumber} • Class: ${classroom}${parentName ? ` • Guardian: ${parentName}` : ""}`,
    },
    items,
    subtotal: grandTotal,
    discountTotal: 0,
    taxTotal: 0,
    grandTotal,
    amountPaid,
    amountDue,
    notes: `Official School Fee Statement for ${record.term} (${record.academicYear}). All fees are payable according to institutional terms.`,
    terms: `Please ensure fees are settled before the due date. Quote Admission No. "${student.admissionNumber}" as your payment reference.`,
    footerText: `Official School Fee Assessment — ${branding.name}`,
  };
}

/**
 * Map live StudentFeeRecord payment transaction to ReceiptDocumentData
 */
export async function mapStudentFeePaymentToReceiptData(
  recordId: string,
  paymentId?: string,
  companyId?: string,
  templateId: string = "receipt-standard",
  isThermal: boolean = false,
  paperWidth: "58mm" | "80mm" = "80mm"
): Promise<ReceiptDocumentData> {
  const record = await prisma.studentFeeRecord.findUnique({
    where: { id: recordId },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
          parent: { include: { user: { select: { name: true, email: true, phone: true } } } },
        },
      },
    },
  });

  if (!record) {
    throw new Error(`Student fee record not found: ${recordId}`);
  }

  const resolvedCompanyId = companyId || record.student.companyId || "default";
  const branding = await extractCompanyBranding(resolvedCompanyId);
  const student = record.student;

  const payments = (record.payments || []) as any[];
  const payment = paymentId
    ? payments.find((p) => p.paymentId === paymentId)
    : payments[payments.length - 1];

  const appliedItems = (record.appliedFeeItems || []) as any[];
  const totalFeesDue = appliedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const amountPaidForThisTransaction = payment ? Number(payment.amount) || 0 : Number(record.amountPaid) || 0;
  const balanceRemaining = totalFeesDue - (Number(record.amountPaid) || 0);

  const studentFullName = `${student.firstName} ${student.lastName}`.trim() || student.user?.name || "Student";

  return {
    documentType: "PAYMENT_RECEIPT",
    templateId,
    company: branding,
    receiptNumber: payment?.receiptNumber || payment?.paymentId || `RCP-${record.id.slice(-6).toUpperCase()}`,
    paymentDate: payment?.date || record.lastPaymentDate || new Date().toISOString().slice(0, 10),
    paymentMethod: payment?.method || "M-Pesa / Bank",
    transactionReference: payment?.receiptNumber || payment?.paymentId || "FEE-TRANS",
    invoiceReference: record.invoiceNumber || `FEE-${record.id.slice(-6).toUpperCase()}`,
    customer: {
      name: `${studentFullName} (Adm: ${student.admissionNumber})`,
      phone: student.user?.phone || student.contactPhone,
      email: student.user?.email || student.contactEmail,
    },
    items: [
      {
        description: `School Fee Payment (${record.term} - ${record.academicYear})`,
        quantity: 1,
        unitPrice: amountPaidForThisTransaction,
        lineTotal: amountPaidForThisTransaction,
      },
    ],
    amountPaid: amountPaidForThisTransaction,
    subtotal: amountPaidForThisTransaction,
    outstandingBalance: Math.max(0, balanceRemaining),
    cashierName: "School Bursar Desk",
    notes: `Fee payment credited for student ${studentFullName} (Adm: ${student.admissionNumber}). Term: ${record.term} ${record.academicYear}.`,
    isThermal,
    paperWidth,
    footerText: `Official School Fee Payment Receipt — ${branding.name}`,
  };
}

/**
 * Map a classroom/stream + term into a ranked Class Broadsheet / Merit List.
 * sourceId format handled by the engine: "<classroomId>:<termId>"
 */
export async function mapClassBroadsheetToDocumentData(
  classroomId: string,
  termId: string,
  companyId: string,
  templateId: string = "broadsheet-matrix"
): Promise<ClassBroadsheetDocumentData> {
  const [branding, classroom, term, headTeacher, cards] = await Promise.all([
    extractCompanyBranding(companyId),
    prisma.classroom.findFirst({
      where: { id: classroomId, companyId },
      select: {
        id: true,
        name: true,
        academicLevel: { select: { name: true } },
      },
    }),
    prisma.term.findFirst({
      where: { id: termId, companyId },
      select: { id: true, name: true, academicYear: { select: { name: true } } },
    }),
    prisma.headTeacher.findFirst({
      where: { companyId },
      include: { user: true },
    }),
    bulkGenerateReportCards(classroomId, termId, companyId),
  ]);

  if (!classroom) {
    throw new Error("Classroom / stream not found for this school");
  }
  if (!term) {
    throw new Error("Academic term not found for this school");
  }

  // Build stable subject columns (union of all subjects across students, alphabetical)
  const subjectNames = Array.from(
    new Set(cards.flatMap((c) => c.subjects.map((s) => s.courseName)))
  ).sort((a, b) => a.localeCompare(b));

  const usedCodes = new Set<string>();
  const subjectCodeByName = new Map<string, string>();
  subjectNames.forEach((name) => {
    // Short column header code, e.g. "Mathematics" -> "MAT", "Social Studies" -> "SOC"
    const base = name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "SUB";
    let code = base;
    let n = 2;
    while (usedCodes.has(code)) {
      code = `${base.slice(0, 2)}${n++}`;
    }
    usedCodes.add(code);
    subjectCodeByName.set(name, code);
  });

  const students: ClassBroadsheetStudentRow[] = cards.map((card) => {
    const scores: Record<string, number | null> = {};
    subjectNames.forEach((name) => {
      scores[subjectCodeByName.get(name)!] = null;
    });
    card.subjects.forEach((s) => {
      const code = subjectCodeByName.get(s.courseName);
      if (code) scores[code] = s.averageScore;
    });

    return {
      rank: card.classRank,
      studentId: card.student.id,
      admissionNumber: card.student.admissionNumber || "—",
      name: `${card.student.firstName} ${card.student.lastName}`.trim(),
      scores,
      totalMarks: Math.round(card.subjects.reduce((sum, s) => sum + (s.averageScore || 0), 0)),
      average: card.overallAverage,
      grade: card.overallLetterGrade,
      absences: card.totalAbsences || 0,
    };
  });

  const subjects: ClassBroadsheetSubject[] = subjectNames.map((name) => {
    const code = subjectCodeByName.get(name)!;
    const vals = students
      .map((s) => s.scores[code])
      .filter((v): v is number => typeof v === "number");
    const mean = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
    return {
      name,
      code,
      classMean: mean,
      highest: vals.length ? Math.max(...vals) : 0,
      lowest: vals.length ? Math.min(...vals) : 0,
      meanGrade: scoreToLetterGrade(mean),
    };
  });

  const averages = students.map((s) => s.average);
  const classMean = averages.length
    ? Math.round((averages.reduce((a, b) => a + b, 0) / averages.length) * 10) / 10
    : 0;

  const gradeOrder = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "E"];
  const gradeDistribution = gradeOrder.map((grade) => ({
    grade,
    count: students.filter((s) => s.grade === grade).length,
  }));

  return {
    documentType: "CLASS_BROADSHEET",
    templateId,
    school: {
      ...branding,
      motto: branding.tagline || "Excellence in Education and Integrity",
      principalName: headTeacher?.user?.name || "The Principal",
    },
    classroom: {
      id: classroom.id,
      name: classroom.name,
      academicLevel: classroom.academicLevel?.name,
    },
    term: {
      id: term.id,
      name: term.name,
      year: term.academicYear?.name ?? "—",
    },
    subjects,
    students,
    summary: {
      totalStudents: students.length,
      classMean,
      meanGrade: scoreToLetterGrade(classMean),
      highestAverage: averages.length ? Math.max(...averages) : 0,
      lowestAverage: averages.length ? Math.min(...averages) : 0,
      gradeDistribution,
    },
    generatedAt: new Date().toISOString(),
    footerText: `Official Academic Broadsheet — ${branding.name}`,
  };
}

