// app/admin/[slug]/departments/page.tsx

import React from "react";
import DepartmentsPage, { DepartmentData } from "./DepartmentsPage";
import { EducatorType } from "../teachers/TeachersClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Server Component: fetches all departments
 * and passes them down to the client component.
 */
export default async function DepartmentsManagerPage({ params }: PageProps) {
  const { slug } = await params;

  let departmentsData: DepartmentData[] = [];
  let initialEducators: EducatorType[] = [];
  
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

  try {
    const [deptRes, educatorsRes] = await Promise.all([
      serverFetchJson<DepartmentData[]>(`/api/admin/departments?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<EducatorType[]>(`/api/admin/educators?companyId=${encodeURIComponent(companyId)}`),
    ]);

    if (deptRes.success && Array.isArray(deptRes.data)) {
      departmentsData = deptRes.data;
    } else if (deptRes.ok && deptRes.data && Array.isArray((deptRes.data as any).data)) {
      departmentsData = (deptRes.data as any).data;
    }

    if (educatorsRes.success && Array.isArray(educatorsRes.data)) {
      initialEducators = educatorsRes.data;
    } else if (educatorsRes.ok && educatorsRes.data && Array.isArray((educatorsRes.data as any).data)) {
      initialEducators = (educatorsRes.data as any).data;
    }
  } catch (err: any) {
    console.error("[DepartmentsManagerPage] Error fetching departments/educators:", err);
  }

  return (
    <DepartmentsPage
      initialDepartments={departmentsData}
      possibleHeads={initialEducators}
      companyId={companyId}
    />
  );
}

