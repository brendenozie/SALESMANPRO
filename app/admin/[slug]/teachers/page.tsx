import React from "react";
import TeachersClient, { EducatorType, DepartmentOption, AcademicLevelOption } from "./TeachersClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from "@/lib/api/serverFetch";

export interface ClassroomOption {
  id: string;
  name: string;
  academicLevelId?: string;
  academicLevel?: AcademicLevelOption;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeachersManagementPage({ params }: PageProps) {
  const { slug } = await params;

  let initialEducators: EducatorType[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allClassrooms: ClassroomOption[] = [];

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  try {
    const [educatorsRes, departmentsRes, levelsRes, classroomsRes] = await Promise.all([
      serverFetchJson<EducatorType[]>(`/api/admin/educators?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<DepartmentOption[]>(`/api/admin/departments?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<AcademicLevelOption[]>(`/api/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<ClassroomOption[]>(`/api/admin/classrooms?companyId=${encodeURIComponent(companyId)}`)
    ]);

    if (educatorsRes.success && Array.isArray(educatorsRes.data)) {
      initialEducators = educatorsRes.data;
    }
    if (departmentsRes.success && Array.isArray(departmentsRes.data)) {
      allDepartments = departmentsRes.data;
    }
    if (levelsRes.success && Array.isArray(levelsRes.data)) {
      allAcademicLevels = levelsRes.data;
    }
    if (classroomsRes.success && Array.isArray(classroomsRes.data)) {
      allClassrooms = classroomsRes.data;
    }
  } catch (err: any) {
    console.error("[TeachersManagementPage] Error fetching data:", err);
  }

  return (
    <TeachersClient
      initialEducators={initialEducators}
      allDepartments={allDepartments}
      allAcademicLevels={allAcademicLevels}
      allClassrooms={allClassrooms}
      companyId={companyId}
      apiBaseUrl="/api"
    />
  );
}
