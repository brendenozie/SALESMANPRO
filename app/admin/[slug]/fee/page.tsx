import React from "react";
import { cookies } from "next/headers";
import FeesClient from "./FeesClient";
import { Student, FeeItem } from "@/lib/data";
import { AcademicLevelOption, ClassRoomOption } from "../students/StudentsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function FeesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug }  = await params;
  const cookHeader = (await cookies()).toString();
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  // Parallel data fetching for performance
  const fetchData = async (endpoint: string) => {
    const res = await fetch(`${apiBaseUrl}${endpoint}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookHeader },
    });
    return res.ok ? (await res.json()).data : [];
  };

  const [initialFeeRecords, initialStudents, initialFeeItems, allAcademicLevels, allClassrooms] = 
    await Promise.all([
      fetchData(`/admin/student-fee-records?companyId=${companyId}`),
      fetchData(`/admin/students?companyId=${companyId}`),
      fetchData(`/admin/fee-items?companyId=${companyId}`),
      fetchData(`/admin/academic-levels?companyId=${companyId}`),
      fetchData(`/admin/classrooms?companyId=${companyId}`),
    ]);
  
  return (
    <FeesClient
      initialFeeRecordsData={initialFeeRecords}
      initialStudentsData={initialStudents}
      initialFeeItemsData={initialFeeItems}
      allAcademicLevels={allAcademicLevels}
      allClassrooms={allClassrooms}
      schoolId={companyId}
    />
  );
}