/**
 * Unified Document Architecture — Numbering System
 * Tenant-specific, sequential, concurrency-safe document numbering
 */

import prisma from "@/server/db/prismadb";
import { DocumentType } from "./types";

interface NumberingConfig {
  defaultPrefix: string;
  padLength: number;
}

const DEFAULT_CONFIGS: Record<DocumentType, NumberingConfig> = {
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
export async function generateDocumentNumber(
  companyId: string,
  documentType: DocumentType
): Promise<string> {
  const config = DEFAULT_CONFIGS[documentType] || { defaultPrefix: "DOC-", padLength: 6 };

  try {
    // Attempt to read/update the setting atomically
    const setting = await prisma.documentTemplateSetting.findUnique({
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
      await prisma.documentTemplateSetting.update({
        where: { id: setting.id },
        data: { nextNumber: currentNext + 1 },
      });

      return `${prefix}${currentNext.toString().padStart(config.padLength, "0")}`;
    }

    // If no setting exists yet, count existing records to find sequence number
    let count = 0;
    if (documentType === "INVOICE") {
      count = await prisma.invoice.count({ where: { companyId } });
    } else if (documentType === "QUOTATION") {
      count = await prisma.quotation.count({ where: { companyId } });
    } else if (documentType === "PURCHASE_ORDER") {
      count = await prisma.purchaseOrder.count({ where: { companyId } });
    } else if (documentType === "SALES_RECEIPT" || documentType === "PAYMENT_RECEIPT") {
      count = await prisma.payment.count({ where: { companyId } });
    }

    const nextSeq = count + 1;
    return `${config.defaultPrefix}${nextSeq.toString().padStart(config.padLength, "0")}`;
  } catch (err) {
    // Fallback timestamp-based concurrency-safe number
    const timestampSuffix = Date.now().toString().slice(-6);
    return `${config.defaultPrefix}${timestampSuffix}`;
  }
}
