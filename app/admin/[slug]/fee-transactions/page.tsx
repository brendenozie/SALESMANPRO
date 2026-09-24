import React from "react";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import OnlinePaymentsClient from "./OnlinePaymentsClient";
import prisma from "@/server/db/prismadb";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminFeeTransactionsPage({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-8 text-center text-rose-500 font-semibold">
        School organization not found.
      </div>
    );
  }

  const companyId = company.id;

  const [feeRecords, students] = await Promise.all([
    prisma.studentFeeRecord.findMany({
      where: {
        student: { companyId },
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
      orderBy: { dueDate: "desc" },
    }).catch(() => []),
    prisma.student.findMany({
      where: { companyId },
      orderBy: { firstName: "asc" },
    }).catch(() => []),
  ]);

  const transactions: any[] = [];
  const invoices: any[] = [];

  feeRecords.forEach((record) => {
    const feeItems = (record.appliedFeeItems as any[]) || [];
    const totalDue = feeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const amountPaid = record.amountPaid || 0;
    const balance = Math.max(0, totalDue - amountPaid);
    let status = record.status || "PENDING";
    if (balance <= 0 && totalDue > 0) status = "PAID";
    else if (amountPaid > 0 && balance > 0) status = "PARTIAL";

    const studentName = record.student
      ? `${record.student.firstName} ${record.student.lastName}`
      : record.student?.user?.name || "Student";

    invoices.push({
      id: record.id,
      invoiceNumber: `INV-${record.id.slice(-6).toUpperCase()}`,
      studentId: record.studentId,
      studentName,
      admissionNumber: record.student?.admissionNumber || "N/A",
      className: record.student?.currentClass || "General",
      term: record.term || "Term 1",
      academicYear: record.academicYear || new Date().getFullYear().toString(),
      totalDue,
      amountPaid,
      balance,
      status,
    });

    const payments = (record.payments as any[]) || [];
    payments.forEach((payment, idx) => {
      transactions.push({
        id: payment.paymentId || `${record.id}-p${idx}`,
        receiptNumber: payment.receiptNumber || `REC-${record.academicYear?.replace(/[^a-zA-Z0-9]/g, "") || "YEAR"}-${String(idx + 1).padStart(3, "0")}`,
        studentId: record.studentId,
        studentName,
        admissionNumber: record.student?.admissionNumber || "N/A",
        studentClass: record.student?.currentClass || "General",
        academicYear: record.academicYear,
        term: record.term,
        amount: Number(payment.amount) || 0,
        paymentDate: payment.date || record.lastPaymentDate || new Date().toISOString().slice(0, 10),
        paymentMethod: payment.method || "CASH",
        referenceNumber: payment.reference || payment.transactionId || "N/A",
        status: payment.status || "COMPLETED",
        feeRecordId: record.id,
      });
    });
  });

  const totalCollected = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthTransactions = transactions.filter((t) => t.paymentDate?.startsWith(currentMonthStr));
  const thisMonthTotal = thisMonthTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const summary = {
    totalCollected,
    totalTransactions: transactions.length,
    thisMonthTotal,
    thisMonthCount: thisMonthTransactions.length,
  };

  return (
    <OnlinePaymentsClient
      companyId={companyId}
      schoolSlug={slug}
      initialTransactions={JSON.parse(JSON.stringify(transactions))}
      initialSummary={JSON.parse(JSON.stringify(summary))}
      invoices={JSON.parse(JSON.stringify(invoices))}
      students={JSON.parse(JSON.stringify(students))}
    />
  );
}
