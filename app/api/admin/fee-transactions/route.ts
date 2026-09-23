import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/fee-transactions?companyId=...
export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  // 1. Fetch fee records with payments for this school
  const feeRecords = await prisma.studentFeeRecord.findMany({
    where: {
      student: {
        companyId: companyId,
      },
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNumber: true,
          currentClass: true,
          academicLevel: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: {
      dueDate: "desc",
    },
  });

  // Flatten embedded payments into a standardized transaction list
  const transactions: any[] = [];

  feeRecords.forEach((record) => {
    const payments = (record.payments as any[]) || [];
    const studentName = record.student
      ? `${record.student.firstName} ${record.student.lastName}`
      : record.student?.user?.name || "Student";

    payments.forEach((payment, idx) => {
      transactions.push({
        id: payment.paymentId || `${record.id}-p${idx}`,
        receiptNumber: payment.receiptNumber || `REC-${record.academicYear?.replace(/[^a-zA-Z0-9]/g, "")}-${String(idx + 1).padStart(3, "0")}`,
        studentId: record.studentId,
        studentName,
        admissionNumber: record.student?.admissionNumber || "N/A",
        studentClass: record.student?.currentClass || "General",
        academicYear: record.academicYear,
        term: record.term,
        amount: Number(payment.amount) || 0,
        paymentDate: payment.date || record.lastPaymentDate || new Date().toISOString().slice(0, 10),
        paymentMethod: payment.method || payment.provider || "CASH",
        reference: payment.reference || payment.transactionId || "Direct Deposit",
        status: payment.status || "SUCCESS",
        invoiceNumber: record.invoiceNumber,
      });
    });
  });

  // Sort descending by payment date
  transactions.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  // Aggregate metrics
  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const mpesaVolume = transactions.filter((t) => /mpesa|m-pesa/i.test(t.paymentMethod)).reduce((acc, t) => acc + t.amount, 0);
  const bankVolume = transactions.filter((t) => /bank|transfer|wire/i.test(t.paymentMethod)).reduce((acc, t) => acc + t.amount, 0);
  const cashVolume = transactions.filter((t) => /cash/i.test(t.paymentMethod)).reduce((acc, t) => acc + t.amount, 0);

  return formatResponse(true, {
    transactions,
    summary: {
      totalVolume,
      mpesaVolume,
      bankVolume,
      cashVolume,
      transactionCount: transactions.length,
    },
  }, "Transactions retrieved successfully", 200);
});

// POST /api/admin/fee-transactions
export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const {
    companyId,
    studentFeeRecordId,
    studentId,
    academicYear,
    term,
    amount,
    paymentMethod,
    reference,
    paymentDate,
    payerName,
    notes,
  } = body;

  const paymentAmount = Number(amount);
  if (!companyId || isNaN(paymentAmount) || paymentAmount <= 0) {
    return formatResponse(false, null, "Valid companyId and payment amount greater than 0 are required.", 400);
  }

  // 1. Locate the fee record
  let feeRecord: any = null;
  if (studentFeeRecordId) {
    feeRecord = await prisma.studentFeeRecord.findUnique({
      where: { id: studentFeeRecordId },
      include: { student: true },
    });
  } else if (studentId && academicYear && term) {
    feeRecord = await prisma.studentFeeRecord.findUnique({
      where: {
        studentId_academicYear_term: {
          studentId,
          academicYear,
          term,
        },
      },
      include: { student: true },
    });
  }

  if (!feeRecord) {
    return formatResponse(false, null, "Student fee record not found for this period. Please create or bill an invoice first.", 404);
  }

  // Generate unique receipt number
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const receiptNumber = `REC-${feeRecord.academicYear?.replace(/[^a-zA-Z0-9]/g, "")}-${timestamp}-${randomSuffix}`;
  const transactionId = reference || `TXN-${receiptNumber}`;
  const effectiveDate = paymentDate || new Date().toISOString().slice(0, 10);

  const newPaymentEntry = {
    paymentId: `PAY-${timestamp}`,
    receiptNumber,
    amount: paymentAmount,
    date: effectiveDate,
    method: paymentMethod || "CASH",
    reference: transactionId,
    payerName: payerName || `${feeRecord.student.firstName} ${feeRecord.student.lastName}`,
    notes: notes || "School fee payment",
    status: "SUCCESS",
    recordedAt: new Date().toISOString(),
  };

  const currentPayments = (feeRecord.payments as any[]) || [];
  const updatedPayments = [...currentPayments, newPaymentEntry];
  const newAmountPaid = (feeRecord.amountPaid || 0) + paymentAmount;

  // Calculate total due from applied fee items
  const feeItems = (feeRecord.appliedFeeItems as any[]) || [];
  const totalDue = feeItems.reduce((acc: number, item: any) => acc + (Number(item.amount) || 0), 0);

  let newPaymentStatus = "Unpaid";
  if (newAmountPaid >= totalDue && totalDue > 0) {
    newPaymentStatus = "Paid";
  } else if (newAmountPaid > 0) {
    newPaymentStatus = "Partially Paid";
  }

  // Update StudentFeeRecord in Prisma
  const updatedRecord = await prisma.studentFeeRecord.update({
    where: { id: feeRecord.id },
    data: {
      amountPaid: newAmountPaid,
      paymentStatus: newPaymentStatus,
      lastPaymentDate: effectiveDate,
      payments: updatedPayments,
    },
  });

  return formatResponse(true, {
    receiptNumber,
    payment: newPaymentEntry,
    studentFeeRecord: {
      id: updatedRecord.id,
      totalDue,
      amountPaid: newAmountPaid,
      balance: Math.max(0, totalDue - newAmountPaid),
      paymentStatus: newPaymentStatus,
    },
  }, "Payment recorded and receipt issued successfully.", 201);
});
