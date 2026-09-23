import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/fee-invoices?companyId=...&term=...&year=...&classId=...
export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const term = searchParams.get("term");
  const year = searchParams.get("year");
  const classId = searchParams.get("classId");

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  // Build filter for student fee records
  const whereClause: any = {
    student: {
      companyId: companyId,
      ...(classId ? { currentClass: classId } : {}),
    },
    ...(term ? { term } : {}),
    ...(year ? { academicYear: year } : {}),
  };

  const feeRecords = await prisma.studentFeeRecord.findMany({
    where: whereClause,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNumber: true,
          currentClass: true,
          academicLevel: true,
          contactEmail: true,
          contactPhone: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      dueDate: "desc",
    },
  });

  // Calculate dynamic totals for each record
  const invoices = feeRecords.map((record) => {
    const feeItems = (record.appliedFeeItems as any[]) || [];
    const totalDue = feeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const amountPaid = record.amountPaid || 0;
    const balance = Math.max(0, totalDue - amountPaid);

    const studentFullName = record.student
      ? `${record.student.firstName} ${record.student.lastName}`
      : record.student?.user?.name || "Unknown Student";

    return {
      id: record.id,
      invoiceNumber: record.invoiceNumber || `INV-${record.academicYear?.replace(/[^a-zA-Z0-9]/g, "")}-${record.student?.admissionNumber || record.studentId.slice(-4)}`,
      studentId: record.studentId,
      studentName: studentFullName,
      admissionNumber: record.student?.admissionNumber || "N/A",
      studentClass: record.student?.currentClass || "Unassigned",
      academicLevel: record.student?.academicLevel || "FRESHMAN",
      academicYear: record.academicYear,
      term: record.term,
      dueDate: record.dueDate || new Date().toISOString().slice(0, 10),
      lastPaymentDate: record.lastPaymentDate,
      paymentStatus: record.paymentStatus || (amountPaid >= totalDue && totalDue > 0 ? "Paid" : amountPaid > 0 ? "Partially Paid" : "Unpaid"),
      totalDue,
      amountPaid,
      balance,
      appliedFeeItems: feeItems,
      paymentsCount: (record.payments as any[])?.length || 0,
    };
  });

  // Summary statistics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalDue, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.balance, 0);
  const paidCount = invoices.filter((i) => i.paymentStatus === "Paid").length;
  const partialCount = invoices.filter((i) => i.paymentStatus === "Partially Paid").length;
  const unpaidCount = invoices.filter((i) => i.paymentStatus === "Unpaid").length;

  return formatResponse(true, {
    invoices,
    summary: {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      count: invoices.length,
      paidCount,
      partialCount,
      unpaidCount,
      collectionRate: totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0,
    },
  }, "Invoices retrieved successfully", 200);
});

// POST /api/admin/fee-invoices
export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { action, companyId, academicYear, term, dueDate, studentIds, classroomId, feeStructureId, customItems } = body;

  if (!companyId || !academicYear || !term) {
    return formatResponse(false, null, "companyId, academicYear, and term are required.", 400);
  }

  // ==========================================
  // ACTION: BATCH GENERATE INVOICES
  // ==========================================
  if (action === "batch") {
    // 1. Fetch eligible students in company (optionally filtered by classroom)
    const studentQuery: any = { companyId };
    if (classroomId) {
      studentQuery.currentClass = classroomId;
    }
    if (studentIds && studentIds.length > 0) {
      studentQuery.id = { in: studentIds };
    }

    const students = await prisma.student.findMany({
      where: studentQuery,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        currentClass: true,
        academicLevel: true,
      },
    });

    if (students.length === 0) {
      return formatResponse(false, null, "No students found matching criteria.", 404);
    }

    // 2. Resolve fee items: either from a selected FeeStructure or FeeItems
    let feeLineItems: any[] = [];

    if (feeStructureId) {
      const structure = await prisma.feeStructure.findUnique({
        where: { id: feeStructureId },
        include: { items: true },
      });
      if (structure && structure.items) {
        feeLineItems = structure.items.map((item) => ({
          feeItemId: item.id,
          name: item.name,
          amount: item.amount,
          description: structure.name,
          isMandatory: !item.isOptional,
        }));
      }
    }

    // Fallback: if no specific feeStructureId, pull applicable FeeItems
    if (feeLineItems.length === 0) {
      const defaultFeeItems = await prisma.feeItem.findMany({
        where: { companyId },
      });
      feeLineItems = defaultFeeItems.map((fi) => ({
        feeItemId: fi.id,
        name: fi.name,
        amount: fi.defaultAmount,
        description: fi.description || fi.name,
        isMandatory: fi.isMandatory,
      }));
    }

    if (feeLineItems.length === 0) {
      return formatResponse(false, null, "No fee structure or fee items found to bill students.", 400);
    }

    const generatedDate = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const results = [];

    for (const student of students) {
      const invoiceNumber = `INV-${academicYear.replace(/[^a-zA-Z0-9]/g, "")}-${term.replace(/\s+/g, "")}-${student.admissionNumber || student.id.slice(-4)}`;

      // Upsert student fee record for year + term
      const record = await prisma.studentFeeRecord.upsert({
        where: {
          studentId_academicYear_term: {
            studentId: student.id,
            academicYear,
            term,
          },
        },
        update: {
          appliedFeeItems: feeLineItems,
          dueDate: generatedDate,
          invoiceNumber,
        },
        create: {
          studentId: student.id,
          academicYear,
          term,
          dueDate: generatedDate,
          invoiceNumber,
          appliedFeeItems: feeLineItems,
          payments: [],
          amountPaid: 0,
          paymentStatus: "Unpaid",
        },
      });
      results.push(record);
    }

    return formatResponse(true, {
      count: results.length,
      academicYear,
      term,
      dueDate: generatedDate,
    }, `Successfully generated ${results.length} student invoices.`, 201);
  }

  // ==========================================
  // ACTION: INDIVIDUAL STUDENT INVOICE ADJUSTMENT
  // ==========================================
  if (action === "individual" || action === "adjustment") {
    const { studentId, items, invoiceNumber, notes } = body;
    if (!studentId) {
      return formatResponse(false, null, "studentId is required for individual invoice.", 400);
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return formatResponse(false, null, "Student not found.", 404);
    }

    const finalInvoiceNumber = invoiceNumber || `INV-${academicYear.replace(/[^a-zA-Z0-9]/g, "")}-${term.replace(/\s+/g, "")}-${student.admissionNumber || student.id.slice(-4)}`;
    const lineItems = items || customItems || [];

    const existingRecord = await prisma.studentFeeRecord.findUnique({
      where: {
        studentId_academicYear_term: {
          studentId,
          academicYear,
          term,
        },
      },
    });

    const totalDue = lineItems.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
    const amountPaid = existingRecord?.amountPaid || 0;
    const paymentStatus = amountPaid >= totalDue && totalDue > 0 ? "Paid" : amountPaid > 0 ? "Partially Paid" : "Unpaid";

    const record = await prisma.studentFeeRecord.upsert({
      where: {
        studentId_academicYear_term: {
          studentId,
          academicYear,
          term,
        },
      },
      update: {
        appliedFeeItems: lineItems,
        dueDate: dueDate || existingRecord?.dueDate || new Date().toISOString().slice(0, 10),
        invoiceNumber: finalInvoiceNumber,
        paymentStatus,
      },
      create: {
        studentId,
        academicYear,
        term,
        dueDate: dueDate || new Date().toISOString().slice(0, 10),
        invoiceNumber: finalInvoiceNumber,
        appliedFeeItems: lineItems,
        payments: [],
        amountPaid: 0,
        paymentStatus: "Unpaid",
      },
    });

    return formatResponse(true, record, "Individual invoice saved successfully.", 200);
  }

  return formatResponse(false, null, "Invalid action specified.", 400);
});
