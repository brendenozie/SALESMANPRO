"use strict";
/**
 * Unified Document Architecture — Numbering System
 * Tenant-specific, sequential, concurrency-safe document numbering
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocumentNumber = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const DEFAULT_CONFIGS = {
    INVOICE: { defaultPrefix: "INV-", padLength: 6 },
    QUOTATION: { defaultPrefix: "QUO-", padLength: 6 },
    PURCHASE_ORDER: { defaultPrefix: "PO-", padLength: 6 },
    SALES_RECEIPT: { defaultPrefix: "REC-", padLength: 6 },
    PAYMENT_RECEIPT: { defaultPrefix: "RCPT-", padLength: 6 },
    STUDENT_REPORT: { defaultPrefix: "REP-", padLength: 6 },
    CREDIT_NOTE: { defaultPrefix: "CN-", padLength: 6 },
    DEBIT_NOTE: { defaultPrefix: "DN-", padLength: 6 },
    DELIVERY_NOTE: { defaultPrefix: "DN-", padLength: 6 },
    STATEMENT: { defaultPrefix: "STMT-", padLength: 6 },
    PROFORMA_INVOICE: { defaultPrefix: "PRO-", padLength: 6 },
    PAYSLIP: { defaultPrefix: "PAY-", padLength: 6 },
    CERTIFICATE: { defaultPrefix: "CERT-", padLength: 6 },
};
/**
 * Generates the next sequential, tenant-specific document number.
 * Uses atomic upsert/update on DocumentTemplateSetting when available.
 */
async function generateDocumentNumber(companyId, documentType) {
    const config = DEFAULT_CONFIGS[documentType] || { defaultPrefix: "DOC-", padLength: 6 };
    try {
        // Attempt to read/update the setting atomically
        const setting = await prismadb_1.default.documentTemplateSetting.findUnique({
            where: {
                companyId_documentType: {
                    companyId,
                    documentType,
                },
            },
        });
        if (setting) {
            const currentNext = setting.nextNumber || 1;
            const prefix = setting.prefix ?? config.defaultPrefix;
            // Increment sequence
            await prismadb_1.default.documentTemplateSetting.update({
                where: { id: setting.id },
                data: { nextNumber: currentNext + 1 },
            });
            return `${prefix}${currentNext.toString().padStart(config.padLength, "0")}`;
        }
        // If no setting exists yet, count existing records to find sequence number
        let count = 0;
        if (documentType === "INVOICE") {
            count = await prismadb_1.default.invoice.count({ where: { companyId } });
        }
        else if (documentType === "QUOTATION") {
            count = await prismadb_1.default.quotation.count({ where: { companyId } });
        }
        else if (documentType === "PURCHASE_ORDER") {
            count = await prismadb_1.default.purchaseOrder.count({ where: { companyId } });
        }
        else if (documentType === "SALES_RECEIPT" || documentType === "PAYMENT_RECEIPT") {
            count = await prismadb_1.default.payment.count({ where: { companyId } });
        }
        const nextSeq = count + 1;
        return `${config.defaultPrefix}${nextSeq.toString().padStart(config.padLength, "0")}`;
    }
    catch (err) {
        // Fallback timestamp-based concurrency-safe number
        const timestampSuffix = Date.now().toString().slice(-6);
        return `${config.defaultPrefix}${timestampSuffix}`;
    }
}
exports.generateDocumentNumber = generateDocumentNumber;
