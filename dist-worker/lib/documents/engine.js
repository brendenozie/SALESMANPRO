"use strict";
/**
 * Unified Document Architecture — Central Generation Engine
 * Coordinates resolution of template settings, data mapping, template rendering, and audit logging.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocument = exports.resolveActiveTemplateId = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const registry_1 = require("./registry");
const mappers_1 = require("./mappers");
const invoiceRenderers_1 = require("./renderers/invoiceRenderers");
const quotationRenderers_1 = require("./renderers/quotationRenderers");
const purchaseOrderRenderers_1 = require("./renderers/purchaseOrderRenderers");
const receiptRenderers_1 = require("./renderers/receiptRenderers");
const studentReportRenderers_1 = require("./renderers/studentReportRenderers");
const schoolFeeRenderers_1 = require("./renderers/schoolFeeRenderers");
/**
 * Resolves the tenant's configured template for a document type
 */
async function resolveActiveTemplateId(companyId, documentType, preferredTemplateId) {
    if (preferredTemplateId) {
        return preferredTemplateId;
    }
    try {
        const setting = await prismadb_1.default.documentTemplateSetting.findUnique({
            where: {
                companyId_documentType: {
                    companyId,
                    documentType: documentType,
                },
            },
        });
        if (setting?.templateId) {
            return setting.templateId;
        }
    }
    catch (err) {
        // Graceful fallback to default
    }
    return (0, registry_1.getDefaultTemplateId)(documentType);
}
exports.resolveActiveTemplateId = resolveActiveTemplateId;
/**
 * Main Centralized Document Generator
 */
async function generateDocument(options) {
    const { type, companyId, sourceId, isPreview, sampleData, userId, pageSize } = options;
    // 1. Resolve template
    const activeTemplateId = options.templateId || (await resolveActiveTemplateId(companyId, type, options.templateId));
    let doc;
    let documentNumber = "DOC-PREVIEW";
    let companyName = "Business";
    // 2. Render based on Document Type & Template ID
    if (type === "INVOICE" ||
        type === "PROFORMA_INVOICE" ||
        type === "CREDIT_NOTE" ||
        type === "DEBIT_NOTE" ||
        type === "DELIVERY_NOTE") {
        const data = isPreview
            ? (sampleData || { ...registry_1.SAMPLE_INVOICE_DATA, templateId: activeTemplateId })
            : await (0, mappers_1.mapInvoiceToDocumentData)(sourceId, companyId, activeTemplateId);
        documentNumber = data.invoiceNumber;
        companyName = data.company?.name || "Store";
        // Handle Document Sub-types cleanly
        if (type === "DELIVERY_NOTE") {
            data.footerText = `Delivery Note & Dispatch Statement — ${data.company.name}`;
        }
        else if (type === "CREDIT_NOTE") {
            data.footerText = `Official Credit Note — ${data.company.name}`;
        }
        if (activeTemplateId === "invoice-corporate" || activeTemplateId === "invoice-classic") {
            doc = await (0, invoiceRenderers_1.renderInvoiceCorporate)(data);
        }
        else if (activeTemplateId === "invoice-minimal" || activeTemplateId === "invoice-modern") {
            doc = await (0, invoiceRenderers_1.renderInvoiceMinimal)(data);
        }
        else if (activeTemplateId === "invoice-executive") {
            doc = await (0, invoiceRenderers_1.renderInvoiceExecutive)(data);
        }
        else if (activeTemplateId === "invoice-pos") {
            doc = await (0, invoiceRenderers_1.renderInvoicePos)(data);
        }
        else if (activeTemplateId === "invoice-creative") {
            doc = await (0, invoiceRenderers_1.renderInvoiceCreative)(data);
        }
        else {
            doc = await (0, invoiceRenderers_1.renderInvoiceCorporate)(data);
        }
    }
    else if (type === "QUOTATION") {
        const data = isPreview
            ? (sampleData || { ...registry_1.SAMPLE_QUOTATION_DATA, templateId: activeTemplateId })
            : await (0, mappers_1.mapQuotationToDocumentData)(sourceId, companyId, activeTemplateId);
        documentNumber = data.quotationNumber;
        companyName = data.company?.name || "Store";
        if (activeTemplateId === "quotation-corporate" || activeTemplateId === "quotation-classic") {
            doc = await (0, quotationRenderers_1.renderQuotationCorporate)(data);
        }
        else if (activeTemplateId === "quotation-minimal" || activeTemplateId === "quotation-modern") {
            doc = await (0, quotationRenderers_1.renderQuotationMinimal)(data);
        }
        else if (activeTemplateId === "quotation-executive") {
            doc = await (0, quotationRenderers_1.renderQuotationExecutive)(data);
        }
        else if (activeTemplateId === "quotation-proposal") {
            doc = await (0, quotationRenderers_1.renderQuotationProposal)(data);
        }
        else if (activeTemplateId === "quotation-creative") {
            doc = await (0, quotationRenderers_1.renderQuotationCreative)(data);
        }
        else {
            doc = await (0, quotationRenderers_1.renderQuotationCorporate)(data);
        }
    }
    else if (type === "PURCHASE_ORDER") {
        const data = isPreview
            ? (sampleData || { ...registry_1.SAMPLE_PURCHASE_ORDER_DATA, templateId: activeTemplateId })
            : await (0, mappers_1.mapPurchaseOrderToDocumentData)(sourceId, companyId, activeTemplateId);
        documentNumber = data.poNumber;
        companyName = data.company?.name || "Store";
        if (activeTemplateId === "po-industrial") {
            doc = (0, purchaseOrderRenderers_1.renderPurchaseOrderIndustrial)(data);
        }
        else if (activeTemplateId === "po-executive") {
            doc = (0, purchaseOrderRenderers_1.renderPurchaseOrderExecutive)(data);
        }
        else {
            doc = (0, purchaseOrderRenderers_1.renderPurchaseOrderStandard)(data);
        }
    }
    else if (type === "SALES_RECEIPT" || type === "PAYMENT_RECEIPT") {
        const data = isPreview
            ? (sampleData || { ...registry_1.SAMPLE_RECEIPT_DATA, templateId: activeTemplateId })
            : await (0, mappers_1.mapReceiptToDocumentData)(sourceId, "PAYMENT", companyId, activeTemplateId);
        documentNumber = data.receiptNumber;
        companyName = data.company?.name || "Store";
        if (activeTemplateId === "receipt-thermal") {
            doc = await (0, receiptRenderers_1.renderReceiptThermal)(data);
        }
        else if (activeTemplateId === "receipt-voucher") {
            doc = await (0, receiptRenderers_1.renderReceiptVoucher)(data);
        }
        else if (activeTemplateId === "receipt-minimal") {
            doc = await (0, receiptRenderers_1.renderReceiptMinimal)(data);
        }
        else if (activeTemplateId === "receipt-executive") {
            doc = await (0, receiptRenderers_1.renderReceiptExecutive)(data);
        }
        else {
            doc = await (0, receiptRenderers_1.renderReceiptStandard)(data);
        }
    }
    else if (type === "STUDENT_REPORT") {
        const [studentId, termId] = sourceId.includes(":") ? sourceId.split(":") : [sourceId, "current"];
        const data = isPreview
            ? (sampleData || { ...registry_1.SAMPLE_STUDENT_REPORT_DATA, templateId: activeTemplateId })
            : await (0, mappers_1.mapStudentReportToDocumentData)(studentId, termId, companyId, activeTemplateId);
        documentNumber = `REP-${data.student.admissionNumber.replace(/\//g, "-")}-${data.term.year}`;
        companyName = data.school?.name || "School";
        if (activeTemplateId === "student-report-modern") {
            doc = await (0, studentReportRenderers_1.renderStudentReportModern)(data);
        }
        else if (activeTemplateId === "student-report-detailed") {
            doc = await (0, studentReportRenderers_1.renderStudentReportDetailed)(data);
        }
        else {
            doc = await (0, studentReportRenderers_1.renderStudentReportClassic)(data);
        }
    }
    else if (type === "STUDENT_FEE_INVOICE") {
        const data = isPreview
            ? (sampleData || {
                ...registry_1.SAMPLE_INVOICE_DATA,
                invoiceNumber: "FEE-2026-001",
                orderReference: "Term 1 (2026/2027)",
                notes: "Official Student Fee Assessment",
                templateId: activeTemplateId,
            })
            : await (0, mappers_1.mapStudentFeeRecordToInvoiceData)(sourceId, companyId, activeTemplateId);
        documentNumber = data.invoiceNumber;
        companyName = data.company.name;
        if (activeTemplateId === "fee-invoice-modern" || activeTemplateId === "invoice-minimal") {
            doc = await (0, schoolFeeRenderers_1.renderSchoolFeeInvoiceModern)(data);
        }
        else if (activeTemplateId === "invoice-corporate") {
            doc = await (0, invoiceRenderers_1.renderInvoiceCorporate)(data);
        }
        else {
            doc = await (0, schoolFeeRenderers_1.renderSchoolFeeInvoiceAcademic)(data);
        }
    }
    else if (type === "STUDENT_FEE_RECEIPT") {
        const isThermal = pageSize === "THERMAL_80MM" || pageSize === "THERMAL_58MM";
        const paperWidth = pageSize === "THERMAL_58MM" ? "58mm" : "80mm";
        const [recordId, paymentId] = sourceId.includes(":") ? sourceId.split(":") : [sourceId, undefined];
        const data = isPreview
            ? (sampleData || {
                ...registry_1.SAMPLE_RECEIPT_DATA,
                receiptNumber: "FRCP-2026-001",
                notes: "Official School Fee Payment Receipt",
                isThermal,
                paperWidth,
                templateId: activeTemplateId,
            })
            : await (0, mappers_1.mapStudentFeePaymentToReceiptData)(recordId, paymentId, companyId, activeTemplateId, isThermal, paperWidth);
        documentNumber = data.receiptNumber;
        companyName = data.company.name;
        if (isThermal || activeTemplateId === "receipt-thermal") {
            doc = await (0, schoolFeeRenderers_1.renderSchoolFeeReceiptThermal)(data);
        }
        else {
            doc = await (0, schoolFeeRenderers_1.renderSchoolFeeReceiptStandard)(data);
        }
    }
    else {
        throw new Error(`Unsupported document type: ${type}`);
    }
    // 3. Export PDF ArrayBuffer & Buffer
    const arrayBuffer = doc.output("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);
    // 4. Meaningful, Professional Filename (e.g. Invoice-INV-001042-Flourish-Home.pdf)
    const docPrefix = type === "INVOICE"
        ? "Invoice"
        : type === "STUDENT_FEE_INVOICE"
            ? "SchoolFeeInvoice"
            : type === "STUDENT_FEE_RECEIPT"
                ? "SchoolFeeReceipt"
                : type === "QUOTATION"
                    ? "Quotation"
                    : type === "SALES_RECEIPT" || type === "PAYMENT_RECEIPT"
                        ? "Receipt"
                        : type === "STUDENT_REPORT"
                            ? "ReportCard"
                            : type === "PURCHASE_ORDER"
                                ? "PurchaseOrder"
                                : type === "DELIVERY_NOTE"
                                    ? "DeliveryNote"
                                    : type;
    const cleanStoreName = (companyName || "Store")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    const fileName = `${docPrefix}-${documentNumber}-${cleanStoreName}.pdf`;
    // 5. Audit Trail Logging (when not preview)
    if (!isPreview) {
        try {
            await prismadb_1.default.generatedDocumentLog.create({
                data: {
                    companyId,
                    documentType: type,
                    documentNumber,
                    sourceEntityId: sourceId,
                    templateId: activeTemplateId,
                    action: "GENERATED",
                    userId: userId || null,
                },
            });
        }
        catch (logErr) {
            console.warn("Document audit log warning:", logErr);
        }
    }
    return {
        buffer,
        fileName,
        contentType: "application/pdf",
        documentNumber,
        templateId: activeTemplateId,
    };
}
exports.generateDocument = generateDocument;
