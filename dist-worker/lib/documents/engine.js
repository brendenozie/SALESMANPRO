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
                    documentType,
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
    const { type, companyId, sourceId, isPreview, sampleData, userId } = options;
    // 1. Resolve template
    const activeTemplateId = options.templateId || (await resolveActiveTemplateId(companyId, type, options.templateId));
    let doc;
    let documentNumber = "DOC-PREVIEW";
    // 2. Render based on Document Type & Template ID
    if (type === "INVOICE") {
        const data = isPreview
            ? (sampleData || { ...registry_1.SAMPLE_INVOICE_DATA, templateId: activeTemplateId })
            : await (0, mappers_1.mapInvoiceToDocumentData)(sourceId, companyId, activeTemplateId);
        documentNumber = data.invoiceNumber;
        if (activeTemplateId === "invoice-modern") {
            doc = (0, invoiceRenderers_1.renderInvoiceModern)(data);
        }
        else if (activeTemplateId === "invoice-executive") {
            doc = (0, invoiceRenderers_1.renderInvoiceExecutive)(data);
        }
        else {
            doc = (0, invoiceRenderers_1.renderInvoiceClassic)(data);
        }
    }
    else if (type === "QUOTATION") {
        const data = isPreview
            ? (sampleData || { ...registry_1.SAMPLE_QUOTATION_DATA, templateId: activeTemplateId })
            : await (0, mappers_1.mapQuotationToDocumentData)(sourceId, companyId, activeTemplateId);
        documentNumber = data.quotationNumber;
        if (activeTemplateId === "quotation-proposal") {
            doc = (0, quotationRenderers_1.renderQuotationProposal)(data);
        }
        else if (activeTemplateId === "quotation-modern") {
            doc = (0, quotationRenderers_1.renderQuotationModern)(data);
        }
        else {
            doc = (0, quotationRenderers_1.renderQuotationClassic)(data);
        }
    }
    else if (type === "PURCHASE_ORDER") {
        const data = isPreview
            ? (sampleData || { ...registry_1.SAMPLE_PURCHASE_ORDER_DATA, templateId: activeTemplateId })
            : await (0, mappers_1.mapPurchaseOrderToDocumentData)(sourceId, companyId, activeTemplateId);
        documentNumber = data.poNumber;
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
        if (activeTemplateId === "receipt-thermal") {
            doc = (0, receiptRenderers_1.renderReceiptThermal)(data);
        }
        else if (activeTemplateId === "receipt-voucher") {
            doc = (0, receiptRenderers_1.renderReceiptVoucher)(data);
        }
        else {
            doc = (0, receiptRenderers_1.renderReceiptStandard)(data);
        }
    }
    else if (type === "STUDENT_REPORT") {
        // sourceId can be studentId or studentId:termId
        const [studentId, termId] = sourceId.includes(":") ? sourceId.split(":") : [sourceId, "current"];
        const data = isPreview
            ? (sampleData || { ...registry_1.SAMPLE_STUDENT_REPORT_DATA, templateId: activeTemplateId })
            : await (0, mappers_1.mapStudentReportToDocumentData)(studentId, termId, companyId, activeTemplateId);
        documentNumber = `REP-${data.student.admissionNumber.replace(/\//g, "-")}-${data.term.year}`;
        if (activeTemplateId === "student-report-modern") {
            doc = (0, studentReportRenderers_1.renderStudentReportModern)(data);
        }
        else if (activeTemplateId === "student-report-detailed") {
            doc = (0, studentReportRenderers_1.renderStudentReportDetailed)(data);
        }
        else {
            doc = (0, studentReportRenderers_1.renderStudentReportClassic)(data);
        }
    }
    else {
        throw new Error(`Unsupported document type: ${type}`);
    }
    // 3. Export PDF ArrayBuffer & Buffer
    const arrayBuffer = doc.output("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${documentNumber.toLowerCase()}-${activeTemplateId}.pdf`;
    // 4. Audit Trail Logging (when not preview)
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
            // Non-blocking logging failure
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
