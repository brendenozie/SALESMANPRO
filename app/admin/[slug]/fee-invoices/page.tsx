import React from "react";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import StudentInvoicingClient from "./StudentInvoicingClient";
import prisma from "@/server/db/prismadb";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminFeeInvoicesPage({ params }: Props) {
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

  const [feeRecords, students, classrooms, feeStructures] = await Promise.all([
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
            contactEmail: true,
            contactPhone: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { dueDate: "desc" },
    }).catch(() => []),
    prisma.student.findMany({
      where: { companyId },
      include: { classroom: true, academicLevel: true },
      orderBy: { firstName: "asc" },
    }).catch(() => []),
    prisma.classroom.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    }).catch(() => []),
    prisma.feeStructure.findMany({
      where: { companyId },
      include: { items: { include: { feeItem: true } } },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ]);

  const invoices = feeRecords.map((record) => {
    const feeItems = (record.appliedFeeItems as any[]) || [];
    const totalDue = feeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const amountPaid = record.amountPaid || 0;
    const balance = Math.max(0, totalDue - amountPaid);
    let status = record.status || "PENDING";
    if (balance <= 0 && totalDue > 0) status = "PAID";
    else if (amountPaid > 0 && balance > 0) status = "PARTIAL";

    return {
      id: record.id,
      invoiceNumber: `INV-${record.id.slice(-6).toUpperCase()}`,
      studentId: record.studentId,
      studentName: `${record.student?.firstName || ""} ${record.student?.lastName || ""}`.trim() || "Unknown Student",
      admissionNumber: record.student?.admissionNumber || "N/A",
      className: record.student?.currentClass || "Unassigned",
      term: record.term || "Term 1",
      academicYear: record.academicYear || new Date().getFullYear().toString(),
      totalDue,
      amountPaid,
      balance,
      dueDate: record.dueDate ? new Date(record.dueDate).toISOString().split("T")[0] : null,
      status,
      items: feeItems,
    };
  });

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalDue, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + inv.balance, 0);

  const summary = {
    totalInvoiced,
    totalCollected,
    totalPending,
    totalCount: invoices.length,
    paidCount: invoices.filter((i) => i.status === "PAID").length,
    partialCount: invoices.filter((i) => i.status === "PARTIAL").length,
    pendingCount: invoices.filter((i) => i.status === "PENDING").length,
  };

  return (
    <StudentInvoicingClient
      companyId={companyId}
      schoolSlug={slug}
      initialInvoices={JSON.parse(JSON.stringify(invoices))}
      initialSummary={JSON.parse(JSON.stringify(summary))}
      students={JSON.parse(JSON.stringify(students))}
      classrooms={JSON.parse(JSON.stringify(classrooms))}
      feeStructures={JSON.parse(JSON.stringify(feeStructures))}
    />
  );
}
