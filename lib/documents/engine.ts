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
  ClassBroadsheetDocumentData,
  ClassTimetableDocumentData,
} from "./types";
import {
  getDefaultTemplateId,
  SAMPLE_INVOICE_DATA,
  SAMPLE_QUOTATION_DATA,
  SAMPLE_PURCHASE_ORDER_DATA,
  SAMPLE_RECEIPT_DATA,
  SAMPLE_STUDENT_REPORT_DATA,
  SAMPLE_CLASS_BROADSHEET_DATA,
  SAMPLE_CLASS_TIMETABLE_DATA,
} from "./registry";
import {
  mapInvoiceToDocumentData,
  mapQuotationToDocumentData,
  mapPurchaseOrderToDocumentData,
  mapReceiptToDocumentData,
  mapStudentReportToDocumentData,
  mapStudentFeeRecordToInvoiceData,
  mapStudentFeePaymentToReceiptData,
  mapClassBroadsheetToDocumentData,
  mapClassTimetableToDocumentData,
} from "./mappers";
import {
  renderInvoiceCorporate,
  renderInvoiceMinimal,
  renderInvoiceExecutive,
  renderInvoicePos,
  renderInvoiceCreative,
  renderInvoiceClassic,
  renderInvoiceModern,
} from "./renderers/invoiceRenderers";
import {
  renderQuotationCorporate,
  renderQuotationMinimal,
  renderQuotationExecutive,
  renderQuotationProposal,
  renderQuotationCreative,
  renderQuotationClassic,
  renderQuotationModern,
} from "./renderers/quotationRenderers";
import {
  renderPurchaseOrderStandard,
  renderPurchaseOrderIndustrial,
  renderPurchaseOrderExecutive,
} from "./renderers/purchaseOrderRenderers";
import {
  renderReceiptStandard,
  renderReceiptMinimal,
  renderReceiptExecutive,
  renderReceiptVoucher,
  renderReceiptThermal,
} from "./renderers/receiptRenderers";
import {
  renderStudentReportClassic,
  renderStudentReportModern,
  renderStudentReportDetailed,
} from "./renderers/studentReportRenderers";
import {
  renderSchoolFeeInvoiceAcademic,
  renderSchoolFeeInvoiceModern,
  renderSchoolFeeReceiptStandard,
  renderSchoolFeeReceiptThermal,
} from "./renderers/schoolFeeRenderers";
import {
  renderClassBroadsheetMatrix,
  renderClassMeritList,
} from "./renderers/gradeBroadsheetRenderers";
import {
  renderClassTimetableGrid,
  renderClassTimetableAgenda,
} from "./renderers/timetableRenderers";

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
          documentType: documentType as any,
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
  const { type, companyId, sourceId, isPreview, sampleData, userId, pageSize } = options;

  // 1. Resolve template
  const activeTemplateId = options.templateId || (await resolveActiveTemplateId(companyId, type, options.templateId));

  let doc: jsPDF;
  let documentNumber = "DOC-PREVIEW";
  let companyName = "Business";

  // 2. Render based on Document Type & Template ID
  if (
    type === "INVOICE" ||
    type === "PROFORMA_INVOICE" ||
    type === "CREDIT_NOTE" ||
    type === "DEBIT_NOTE" ||
    type === "DELIVERY_NOTE"
  ) {
    const data: InvoiceDocumentData = isPreview
      ? ((sampleData as InvoiceDocumentData) || { ...SAMPLE_INVOICE_DATA, templateId: activeTemplateId })
      : await mapInvoiceToDocumentData(sourceId, companyId, activeTemplateId);

    documentNumber = data.invoiceNumber;
    companyName = data.company?.name || "Store";

    // Handle Document Sub-types cleanly
    if (type === "DELIVERY_NOTE") {
      data.footerText = `Delivery Note & Dispatch Statement — ${data.company.name}`;
    } else if (type === "CREDIT_NOTE") {
      data.footerText = `Official Credit Note — ${data.company.name}`;
    }

    if (activeTemplateId === "invoice-corporate" || activeTemplateId === "invoice-classic") {
      doc = await renderInvoiceCorporate(data);
    } else if (activeTemplateId === "invoice-minimal" || activeTemplateId === "invoice-modern") {
      doc = await renderInvoiceMinimal(data);
    } else if (activeTemplateId === "invoice-executive") {
      doc = await renderInvoiceExecutive(data);
    } else if (activeTemplateId === "invoice-pos") {
      doc = await renderInvoicePos(data);
    } else if (activeTemplateId === "invoice-creative") {
      doc = await renderInvoiceCreative(data);
    } else {
      doc = await renderInvoiceCorporate(data);
    }
  } else if (type === "QUOTATION") {
    const data: QuotationDocumentData = isPreview
      ? ((sampleData as QuotationDocumentData) || { ...SAMPLE_QUOTATION_DATA, templateId: activeTemplateId })
      : await mapQuotationToDocumentData(sourceId, companyId, activeTemplateId);

    documentNumber = data.quotationNumber;
    companyName = data.company?.name || "Store";

    if (activeTemplateId === "quotation-corporate" || activeTemplateId === "quotation-classic") {
      doc = await renderQuotationCorporate(data);
    } else if (activeTemplateId === "quotation-minimal" || activeTemplateId === "quotation-modern") {
      doc = await renderQuotationMinimal(data);
    } else if (activeTemplateId === "quotation-executive") {
      doc = await renderQuotationExecutive(data);
    } else if (activeTemplateId === "quotation-proposal") {
      doc = await renderQuotationProposal(data);
    } else if (activeTemplateId === "quotation-creative") {
      doc = await renderQuotationCreative(data);
    } else {
      doc = await renderQuotationCorporate(data);
    }
  } else if (type === "PURCHASE_ORDER") {
    const data: PurchaseOrderDocumentData = isPreview
      ? ((sampleData as PurchaseOrderDocumentData) || { ...SAMPLE_PURCHASE_ORDER_DATA, templateId: activeTemplateId })
      : await mapPurchaseOrderToDocumentData(sourceId, companyId, activeTemplateId);

    documentNumber = data.poNumber;
    companyName = data.company?.name || "Store";

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
    companyName = data.company?.name || "Store";

    if (activeTemplateId === "receipt-thermal") {
      doc = await renderReceiptThermal(data);
    } else if (activeTemplateId === "receipt-voucher") {
      doc = await renderReceiptVoucher(data);
    } else if (activeTemplateId === "receipt-minimal") {
      doc = await renderReceiptMinimal(data);
    } else if (activeTemplateId === "receipt-executive") {
      doc = await renderReceiptExecutive(data);
    } else {
      doc = await renderReceiptStandard(data);
    }
  } else if (type === "STUDENT_REPORT") {
    const [studentId, termId] = sourceId.includes(":") ? sourceId.split(":") : [sourceId, "current"];

    const data: StudentReportDocumentData = isPreview
      ? ((sampleData as StudentReportDocumentData) || { ...SAMPLE_STUDENT_REPORT_DATA, templateId: activeTemplateId })
      : await mapStudentReportToDocumentData(studentId, termId, companyId, activeTemplateId);

    documentNumber = `REP-${data.student.admissionNumber.replace(/\//g, "-")}-${data.term.year}`;
    companyName = data.school?.name || "School";

    if (activeTemplateId === "student-report-modern") {
      doc = await renderStudentReportModern(data);
    } else if (activeTemplateId === "student-report-detailed") {
      doc = await renderStudentReportDetailed(data);
    } else {
      doc = await renderStudentReportClassic(data);
    }
  } else if (type === "STUDENT_FEE_INVOICE") {
    const data: InvoiceDocumentData = isPreview
      ? ((sampleData as InvoiceDocumentData) || {
          ...SAMPLE_INVOICE_DATA,
          invoiceNumber: "FEE-2026-001",
          orderReference: "Term 1 (2026/2027)",
          notes: "Official Student Fee Assessment",
          templateId: activeTemplateId,
        })
      : await mapStudentFeeRecordToInvoiceData(sourceId, companyId, activeTemplateId);

    documentNumber = data.invoiceNumber;
    companyName = data.company.name;

    if (activeTemplateId === "fee-invoice-modern" || activeTemplateId === "invoice-minimal") {
      doc = await renderSchoolFeeInvoiceModern(data);
    } else if (activeTemplateId === "invoice-corporate") {
      doc = await renderInvoiceCorporate(data);
    } else {
      doc = await renderSchoolFeeInvoiceAcademic(data);
    }
  } else if (type === "STUDENT_FEE_RECEIPT") {
    const isThermal = pageSize === "THERMAL_80MM" || pageSize === "THERMAL_58MM";
    const paperWidth = pageSize === "THERMAL_58MM" ? "58mm" : "80mm";

    const [recordId, paymentId] = sourceId.includes(":") ? sourceId.split(":") : [sourceId, undefined];

    const data: ReceiptDocumentData = isPreview
      ? ((sampleData as ReceiptDocumentData) || {
          ...SAMPLE_RECEIPT_DATA,
          receiptNumber: "FRCP-2026-001",
          notes: "Official School Fee Payment Receipt",
          isThermal,
          paperWidth,
          templateId: activeTemplateId,
        })
      : await mapStudentFeePaymentToReceiptData(recordId, paymentId, companyId, activeTemplateId, isThermal, paperWidth);

    documentNumber = data.receiptNumber;
    companyName = data.company.name;

    if (isThermal || activeTemplateId === "receipt-thermal") {
      doc = await renderSchoolFeeReceiptThermal(data);
    } else {
      doc = await renderSchoolFeeReceiptStandard(data);
    }
  } else if (type === "CLASS_BROADSHEET") {
    const [classroomId, termId] = sourceId.split(":");
    if (!isPreview && (!classroomId || !termId)) {
      throw new Error("Class broadsheet requires sourceId in the form <classroomId>:<termId>");
    }

    const data: ClassBroadsheetDocumentData = isPreview
      ? ((sampleData as ClassBroadsheetDocumentData) || { ...SAMPLE_CLASS_BROADSHEET_DATA, templateId: activeTemplateId })
      : await mapClassBroadsheetToDocumentData(classroomId, termId, companyId, activeTemplateId);

    const isMerit = activeTemplateId === "broadsheet-merit-list";
    const cleanClass = data.classroom.name.replace(/[^a-zA-Z0-9]+/g, "-");
    const cleanTerm = `${data.term.name}-${data.term.year}`.replace(/[^a-zA-Z0-9]+/g, "-");
    documentNumber = `${isMerit ? "MERIT" : "BRD"}-${cleanClass}-${cleanTerm}`;
    companyName = data.school?.name || "School";

    doc = isMerit ? await renderClassMeritList(data) : await renderClassBroadsheetMatrix(data);
  } else if (type === "CLASS_TIMETABLE") {
    const data: ClassTimetableDocumentData = isPreview
      ? ((sampleData as ClassTimetableDocumentData) || { ...SAMPLE_CLASS_TIMETABLE_DATA, templateId: activeTemplateId })
      : await mapClassTimetableToDocumentData(sourceId, companyId, activeTemplateId);

    const isAgenda = activeTemplateId === "timetable-agenda";
    const cleanTarget = data.scheduleFor.name.replace(/[^a-zA-Z0-9]+/g, "-");
    documentNumber = `TT-${cleanTarget}-${Date.now().toString().slice(-4)}`;
    companyName = data.school?.name || "School";

    doc = isAgenda ? await renderClassTimetableAgenda(data) : await renderClassTimetableGrid(data);
  } else {
    throw new Error(`Unsupported document type: ${type}`);
  }

  // 3. Export PDF ArrayBuffer & Buffer
  const arrayBuffer = doc.output("arraybuffer");
  const buffer = Buffer.from(arrayBuffer);

  // 4. Meaningful, Professional Filename (e.g. Invoice-INV-001042-Flourish-Home.pdf)
  const docPrefix =
    type === "INVOICE"
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
      : type === "CLASS_BROADSHEET"
      ? "ClassBroadsheet"
      : type === "CLASS_TIMETABLE"
      ? "ClassTimetable"
      : type;

  const cleanStoreName = (companyName || "Store")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const fileName = `${docPrefix}-${documentNumber}-${cleanStoreName}.pdf`;

  // 5. Audit Trail Logging (when not preview)
  if (!isPreview) {
    try {
      await prisma.generatedDocumentLog.create({
        data: {
          companyId,
          documentType: type as any,
          documentNumber,
          sourceEntityId: sourceId,
          templateId: activeTemplateId,
          action: "GENERATED",
          userId: userId || null,
        },
      });
    } catch (logErr) {
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
