import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { generateDocument } from "@/lib/documents/engine";
import { DocumentType } from "@/lib/documents/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type: rawType, id } = await params;
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId") || undefined;
    const isDownload = searchParams.get("download") === "true";
    const requestedCompanyId = searchParams.get("companyId");

    const session = await getServerSession(authOptions);

    // Normalize type string to DocumentType enum
    let docType: DocumentType;
    const normalizedType = rawType.toUpperCase().replace(/-/g, "_");

    if (normalizedType === "INVOICE") docType = "INVOICE";
    else if (normalizedType === "QUOTATION" || normalizedType === "QUOTE") docType = "QUOTATION";
    else if (normalizedType === "PURCHASE_ORDER" || normalizedType === "PO") docType = "PURCHASE_ORDER";
    else if (normalizedType === "SALES_RECEIPT" || normalizedType === "RECEIPT") docType = "SALES_RECEIPT";
    else if (normalizedType === "PAYMENT_RECEIPT") docType = "PAYMENT_RECEIPT";
    else if (normalizedType === "STUDENT_REPORT" || normalizedType === "REPORT_CARD") docType = "STUDENT_REPORT";
    else if (normalizedType === "STUDENT_FEE_INVOICE" || normalizedType === "FEE_INVOICE") docType = "STUDENT_FEE_INVOICE";
    else if (normalizedType === "STUDENT_FEE_RECEIPT" || normalizedType === "FEE_RECEIPT") docType = "STUDENT_FEE_RECEIPT";
    else if (normalizedType === "DELIVERY_NOTE") docType = "DELIVERY_NOTE";
    else if (normalizedType === "CREDIT_NOTE") docType = "CREDIT_NOTE";
    else if (normalizedType === "PROFORMA_INVOICE") docType = "PROFORMA_INVOICE";
    else if (normalizedType === "STATEMENT") docType = "STATEMENT";
    else if (
      normalizedType === "CLASS_BROADSHEET" ||
      normalizedType === "BROADSHEET" ||
      normalizedType === "MERIT_LIST"
    ) docType = "CLASS_BROADSHEET";
    else if (
      normalizedType === "CLASS_TIMETABLE" ||
      normalizedType === "TIMETABLE" ||
      normalizedType === "SCHEDULE" ||
      normalizedType === "CLASS_SCHEDULE"
    ) docType = "CLASS_TIMETABLE";
    else {
      return NextResponse.json({ error: `Invalid document type: ${rawType}` }, { status: 400 });
    }

    const isPreview = id === "sample" || searchParams.get("preview") === "true";

    // Resolve tenant companyId from source entity to enforce multi-tenant isolation
    let resolvedCompanyId: string | null = null;

    if (isPreview) {
      resolvedCompanyId = requestedCompanyId || (session?.user as any)?.companyId || "sample-company";
    } else if (docType === "INVOICE" || docType === "DELIVERY_NOTE" || docType === "CREDIT_NOTE" || docType === "PROFORMA_INVOICE") {
      const inv = await prisma.invoice.findUnique({
        where: { id },
        select: { companyId: true, clientId: true, consumerId: true },
      });
      if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      resolvedCompanyId = inv.companyId;
    } else if (docType === "QUOTATION") {
      const quo = await prisma.quotation.findUnique({
        where: { id },
        select: { companyId: true, clientId: true, consumerId: true },
      });
      if (!quo) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
      resolvedCompanyId = quo.companyId;
    } else if (docType === "PURCHASE_ORDER") {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id },
        select: { companyId: true },
      });
      if (!po) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
      resolvedCompanyId = po.companyId;
    } else if (docType === "SALES_RECEIPT" || docType === "PAYMENT_RECEIPT") {
      const payment = await prisma.payment.findUnique({
        where: { id },
        select: { companyId: true },
      });
      if (payment) {
        resolvedCompanyId = payment.companyId;
      } else {
        const order = await prisma.customerOrder.findUnique({
          where: { id },
          select: { companyId: true },
        });
        if (order) resolvedCompanyId = order.companyId;
      }
    } else if (docType === "STUDENT_REPORT") {
      const studentId = id.includes(":") ? id.split(":")[0] : id;
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { companyId: true, parentId: true, userId: true },
      });
      if (!student) return NextResponse.json({ error: "Student record not found" }, { status: 404 });
      resolvedCompanyId = student.companyId;
    } else if (docType === "STUDENT_FEE_INVOICE" || docType === "STUDENT_FEE_RECEIPT") {
      const recordId = id.includes(":") ? id.split(":")[0] : id;
      const feeRec = await prisma.studentFeeRecord.findUnique({
        where: { id: recordId },
        select: { student: { select: { companyId: true } } },
      });
      if (feeRec?.student?.companyId) {
        resolvedCompanyId = feeRec.student.companyId;
      }
    } else if (docType === "CLASS_BROADSHEET") {
      const classroomId = id.split(":")[0];
      const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId },
        select: { companyId: true },
      });
      if (!classroom) return NextResponse.json({ error: "Classroom / stream not found" }, { status: 404 });
      resolvedCompanyId = classroom.companyId;
    } else if (docType === "CLASS_TIMETABLE") {
      const rawClassId = id.includes(":") ? id.replace("class:", "").split(":").pop()! : id;
      const classroom = await prisma.classroom.findUnique({
        where: { id: rawClassId },
        select: { companyId: true },
      });
      if (classroom?.companyId) {
        resolvedCompanyId = classroom.companyId;
      } else {
        const level = await prisma.academicLevel.findUnique({
          where: { id: rawClassId },
          select: { companyId: true },
        });
        if (level?.companyId) resolvedCompanyId = level.companyId;
      }
    }

    if (!resolvedCompanyId) {
      resolvedCompanyId = requestedCompanyId || null;
    }

    if (!resolvedCompanyId && !isPreview) {
      return NextResponse.json({ error: "Unable to verify document company ownership" }, { status: 403 });
    }

    // Server-side Multi-tenant validation
    if (requestedCompanyId && requestedCompanyId !== resolvedCompanyId) {
      return NextResponse.json({ error: "Tenant mismatch verification failure" }, { status: 403 });
    }

    // Merit-list URL alias defaults to the merit-list template
    const effectiveTemplateId =
      templateId || (normalizedType === "MERIT_LIST" ? "broadsheet-merit-list" : undefined);

    // Generate Document
    const result = await generateDocument({
      type: docType,
      companyId: resolvedCompanyId || "sample-company",
      sourceId: id,
      templateId: effectiveTemplateId,
      isPreview,
      userId: session?.user?.id || undefined,
    });

    const disposition = isDownload ? "attachment" : "inline";

    return new NextResponse(result.buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${result.fileName}"`,
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    console.error("Document PDF Generation Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate document PDF" },
      { status: 500 }
    );
  }
}
