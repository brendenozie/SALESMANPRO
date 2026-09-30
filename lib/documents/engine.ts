/**
 * Unified Document Architecture — Central Generation Engine
 * Coordinates resolution of template settings, data mapping, template rendering, and audit logging.
 */

import prisma from "@/server/db/prismadb";
import { jsPDF } from "jspdf";
import {
  DocumentType,
  GenerateDocumentOptions,
  GeneratedDocumentResult,
  InvoiceDocumentData,
  QuotationDocumentData,
  PurchaseOrderDocumentData,
  ReceiptDocumentData,
  StudentReportDocumentData,
} from "./types";
import {
  getDefaultTemplateId,
  SAMPLE_INVOICE_DATA,
  SAMPLE_QUOTATION_DATA,
  SAMPLE_PURCHASE_ORDER_DATA,
  SAMPLE_RECEIPT_DATA,
  SAMPLE_STUDENT_REPORT_DATA,
} from "./registry";
import {
  mapInvoiceToDocumentData,
  mapQuotationToDocumentData,
  mapPurchaseOrderToDocumentData,
  mapReceiptToDocumentData,
  mapStudentReportToDocumentData,
} from "./mappers";
import {
  renderInvoiceClassic,
  renderInvoiceModern,
  renderInvoiceExecutive,
} from "./renderers/invoiceRenderers";
import {
  renderQuotationClassic,
  renderQuotationProposal,
  renderQuotationModern,
} from "./renderers/quotationRenderers";
import {
  renderPurchaseOrderStandard,
  renderPurchaseOrderIndustrial,
  renderPurchaseOrderExecutive,
} from "./renderers/purchaseOrderRenderers";
import {
  renderReceiptStandard,
  renderReceiptVoucher,
  renderReceiptThermal,
} from "./renderers/receiptRenderers";
import {
  renderStudentReportClassic,
  renderStudentReportModern,
  renderStudentReportDetailed,
} from "./renderers/studentReportRenderers";

/**
 * Resolves the tenant's configured template for a document type
 */
export async function resolveActiveTemplateId(
  companyId: string,
  documentType: DocumentType,
  preferredTemplateId?: string
): Promise<string> {
  if (preferredTemplateId) {
    return preferredTemplateId;
  }

  try {
    const setting = await prisma.documentTemplateSetting.findUnique({
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
  } catch (err) {
    // Graceful fallback to default
  }

  return getDefaultTemplateId(documentType);
}

/**
 * Main Centralized Document Generator
 */
export async function generateDocument(
  options: GenerateDocumentOptions
): Promise<GeneratedDocumentResult> {
  const { type, companyId, sourceId, isPreview, sampleData, userId } = options;

  // 1. Resolve template
  const activeTemplateId = options.templateId || (await resolveActiveTemplateId(companyId, type, options.templateId));

  let doc: jsPDF;
  let documentNumber = "DOC-PREVIEW";

  // 2. Render based on Document Type & Template ID
  if (type === "INVOICE") {
    const data: InvoiceDocumentData = isPreview
      ? ((sampleData as InvoiceDocumentData) || { ...SAMPLE_INVOICE_DATA, templateId: activeTemplateId })
      : await mapInvoiceToDocumentData(sourceId, companyId, activeTemplateId);

    documentNumber = data.invoiceNumber;

    if (activeTemplateId === "invoice-modern") {
      doc = renderInvoiceModern(data);
    } else if (activeTemplateId === "invoice-executive") {
      doc = renderInvoiceExecutive(data);
    } else {
      doc = renderInvoiceClassic(data);
    }
  } else if (type === "QUOTATION") {
    const data: QuotationDocumentData = isPreview
      ? ((sampleData as QuotationDocumentData) || { ...SAMPLE_QUOTATION_DATA, templateId: activeTemplateId })
      : await mapQuotationToDocumentData(sourceId, companyId, activeTemplateId);

    documentNumber = data.quotationNumber;

    if (activeTemplateId === "quotation-proposal") {
      doc = renderQuotationProposal(data);
    } else if (activeTemplateId === "quotation-modern") {
      doc = renderQuotationModern(data);
    } else {
      doc = renderQuotationClassic(data);
    }
  } else if (type === "PURCHASE_ORDER") {
    const data: PurchaseOrderDocumentData = isPreview
      ? ((sampleData as PurchaseOrderDocumentData) || { ...SAMPLE_PURCHASE_ORDER_DATA, templateId: activeTemplateId })
      : await mapPurchaseOrderToDocumentData(sourceId, companyId, activeTemplateId);

    documentNumber = data.poNumber;

    if (activeTemplateId === "po-industrial") {
      doc = renderPurchaseOrderIndustrial(data);
    } else if (activeTemplateId === "po-executive") {
      doc = renderPurchaseOrderExecutive(data);
    } else {
      doc = renderPurchaseOrderStandard(data);
    }
  } else if (type === "SALES_RECEIPT" || type === "PAYMENT_RECEIPT") {
    const data: ReceiptDocumentData = isPreview
      ? ((sampleData as ReceiptDocumentData) || { ...SAMPLE_RECEIPT_DATA, templateId: activeTemplateId })
      : await mapReceiptToDocumentData(sourceId, "PAYMENT", companyId, activeTemplateId);

    documentNumber = data.receiptNumber;

    if (activeTemplateId === "receipt-thermal") {
      doc = renderReceiptThermal(data);
    } else if (activeTemplateId === "receipt-voucher") {
      doc = renderReceiptVoucher(data);
    } else {
      doc = renderReceiptStandard(data);
    }
  } else if (type === "STUDENT_REPORT") {
    // sourceId can be studentId or studentId:termId
    const [studentId, termId] = sourceId.includes(":") ? sourceId.split(":") : [sourceId, "current"];

    const data: StudentReportDocumentData = isPreview
      ? ((sampleData as StudentReportDocumentData) || { ...SAMPLE_STUDENT_REPORT_DATA, templateId: activeTemplateId })
      : await mapStudentReportToDocumentData(studentId, termId, companyId, activeTemplateId);

    documentNumber = `REP-${data.student.admissionNumber.replace(/\//g, "-")}-${data.term.year}`;

    if (activeTemplateId === "student-report-modern") {
      doc = renderStudentReportModern(data);
    } else if (activeTemplateId === "student-report-detailed") {
      doc = renderStudentReportDetailed(data);
    } else {
      doc = renderStudentReportClassic(data);
    }
  } else {
    throw new Error(`Unsupported document type: ${type}`);
  }

  // 3. Export PDF ArrayBuffer & Buffer
  const arrayBuffer = doc.output("arraybuffer");
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${documentNumber.toLowerCase()}-${activeTemplateId}.pdf`;

  // 4. Audit Trail Logging (when not preview)
  if (!isPreview) {
    try {
      await prisma.generatedDocumentLog.create({
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
    } catch (logErr) {
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
