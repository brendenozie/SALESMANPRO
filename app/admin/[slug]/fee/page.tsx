import React from "react";
import FeesClient from "./FeesClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function FeesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // Retrieve the memoized company data
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const [initialFeeRecords, initialStudents, initialFeeItems, allAcademicLevels, allClassrooms] = 
    await Promise.all([
      prisma.studentFeeRecord.findMany({
        where: { student: { companyId } },
        include: {
          student: {
            include: {
              academicLevel: true,
              classroom: true,
            },
          },
          academicYear: true,
          academicTerm: true,
        },
        orderBy: { createdAt: "desc" },
      }).catch(() => []),
      prisma.student.findMany({
        where: { companyId },
        include: {
          academicLevel: true,
          classroom: true,
        },
        orderBy: { firstName: "asc" },
      }).catch(() => []),
      prisma.feeItem.findMany({
        where: { companyId },
        orderBy: { name: "asc" },
      }).catch(() => []),
      prisma.academicLevel.findMany({
        where: { companyId },
        orderBy: { order: "asc" },
      }).catch(() => []),
      prisma.classroom.findMany({
        where: { companyId },
        orderBy: { name: "asc" },
      }).catch(() => []),
    ]);

  return (
    <FeesClient
      initialFeeRecordsData={JSON.parse(JSON.stringify(initialFeeRecords))}
      initialStudentsData={JSON.parse(JSON.stringify(initialStudents))}
      initialFeeItemsData={JSON.parse(JSON.stringify(initialFeeItems))}
      allAcademicLevels={JSON.parse(JSON.stringify(allAcademicLevels))}
      allClassrooms={JSON.parse(JSON.stringify(allClassrooms))}
      schoolId={companyId}
    />
  );
}