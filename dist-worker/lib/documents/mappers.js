"use strict";
/**
 * Unified Document Architecture — Data Mappers
 * Maps live Prisma models into normalized document data structures.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStudentReportToDocumentData = exports.mapReceiptToDocumentData = exports.mapPurchaseOrderToDocumentData = exports.mapQuotationToDocumentData = exports.mapInvoiceToDocumentData = exports.extractCompanyBranding = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const schoolService_1 = require("@/lib/school/schoolService");
/**
 * Extracts normalized company branding from Company and settings
 */
async function extractCompanyBranding(companyId) {
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        include: {
            settings: true,
        },
    });
    if (!company) {
        throw new Error(`Company not found with ID ${companyId}`);
    }
    const theme = company.themeSettings || {};
    return {
        name: company.name,
        tagline: company.tagline ?? undefined,
        logoUrl: company.logoUrl ?? company.settings?.logoUrl ?? undefined,
        address: company.address ?? company.settings?.address ?? undefined,
        contactEmail: company.contactEmail ?? company.settings?.contactEmail ?? undefined,
        contactPhone: company.contactPhone ?? company.settings?.contactPhone ?? undefined,
        website: company.domain ?? (company.hasWebsite ? `https://${company.slug}.salesmanpro.site` : undefined),
        taxPin: undefined,
        currency: company.currency || "KES",
        primaryColor: theme.primaryColor || "#2563EB",
        accentColor: theme.accentColor || "#1E40AF",
    };
}
exports.extractCompanyBranding = extractCompanyBranding;
/**
 * Map live Invoice to normalized InvoiceDocumentData
 */
async function mapInvoiceToDocumentData(invoiceId, companyId, templateId = "invoice-classic") {
    const invoice = await prismadb_1.default.invoice.findFirst({
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
    const orderData = invoice.order;
    const customerName = invoice.customerName ||
        invoice.consumer?.user?.name ||
        invoice.client?.user?.name ||
        orderData?.name ||
        "Valued Customer";
    const customerEmail = invoice.customerEmail ||
        invoice.consumer?.user?.email ||
        invoice.client?.user?.email ||
        orderData?.email ||
        undefined;
    const customerPhone = invoice.customerPhone ||
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
    const items = invoice.items.map((it) => ({
        sku: it.productId ? `PROD-${it.productId.slice(-6)}` : undefined,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount,
        taxRate: it.taxRate,
        lineTotal: it.totalPrice,
    }));
    const invoiceStatusMap = {
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
        terms: invoice.terms ?? "Payment due within 30 days of invoice date.",
        footerText: `Official Tax Invoice — ${branding.name}`,
    };
}
exports.mapInvoiceToDocumentData = mapInvoiceToDocumentData;
/**
 * Map live Quotation to normalized QuotationDocumentData
 */
async function mapQuotationToDocumentData(quotationId, companyId, templateId = "quotation-classic") {
    const quotation = await prismadb_1.default.quotation.findFirst({
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
    const customerName = quotation.customerName ||
        quotation.consumer?.user?.name ||
        quotation.client?.user?.name ||
        "Client / Prospective Partner";
    const customerEmail = quotation.customerEmail ||
        quotation.consumer?.user?.email ||
        quotation.client?.user?.email ||
        undefined;
    const customerPhone = quotation.customerPhone ||
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
exports.mapQuotationToDocumentData = mapQuotationToDocumentData;
/**
 * Map live PurchaseOrder to normalized PurchaseOrderDocumentData
 */
async function mapPurchaseOrderToDocumentData(poId, companyId, templateId = "po-standard") {
    const po = await prismadb_1.default.purchaseOrder.findFirst({
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
exports.mapPurchaseOrderToDocumentData = mapPurchaseOrderToDocumentData;
/**
 * Map live Payment or CustomerOrder to normalized ReceiptDocumentData
 */
async function mapReceiptToDocumentData(sourceId, sourceKind, companyId, templateId = "receipt-standard") {
    const branding = await extractCompanyBranding(companyId);
    if (sourceKind === "PAYMENT") {
        const payment = await prismadb_1.default.payment.findFirst({
            where: { id: sourceId, companyId },
            include: {
                order: { include: { items: true } },
            },
        });
        if (!payment) {
            throw new Error(`Payment record not found: ${sourceId}`);
        }
        const items = payment.order?.items?.map((it) => ({
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
        const order = await prismadb_1.default.customerOrder.findFirst({
            where: { id: sourceId, companyId },
            include: { items: true, Payment: true },
        });
        if (!order) {
            throw new Error(`Customer order not found: ${sourceId}`);
        }
        const totalPaid = order.Payment.filter((p) => p.status === "COMPLETED").reduce((acc, p) => acc + p.amount, 0);
        const balance = Math.max(0, (order.totalFinalPrice || order.totalPrice || 0) - totalPaid);
        const items = order.items.map((it) => ({
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
    const invoice = await prismadb_1.default.invoice.findFirst({
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
exports.mapReceiptToDocumentData = mapReceiptToDocumentData;
/**
 * Map live School Report Card data to normalized StudentReportDocumentData
 */
async function mapStudentReportToDocumentData(studentId, termId, companyId, templateId = "student-report-classic") {
    const reportData = await (0, schoolService_1.generateReportCard)(studentId, termId, companyId);
    const branding = await extractCompanyBranding(companyId);
    const headTeacher = await prismadb_1.default.headTeacher.findFirst({
        where: { companyId },
        include: { user: true },
    });
    const studentRecord = await prismadb_1.default.student.findUnique({
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
exports.mapStudentReportToDocumentData = mapStudentReportToDocumentData;
