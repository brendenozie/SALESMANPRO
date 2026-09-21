import React from "react";
import CoursesClient, { CourseType, EducatorOption, DepartmentOption, AcademicLevelOption } from "./CoursesClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminCoursesPage({ params }: PageProps) {
  const { slug } = await params;

  let initialCourses: CourseType[] = [];
  let allEducators: EducatorOption[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  try {
    const [coursesRes, educatorsRes, departmentsRes, levelsRes] = await Promise.all([
      serverFetchJson<CourseType[]>(`/api/admin/courses?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<any[]>(`/api/admin/educators?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<DepartmentOption[]>(`/api/admin/departments?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<AcademicLevelOption[]>(`/api/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`)
    ]);

    if (coursesRes.success && Array.isArray(coursesRes.data)) {
      initialCourses = coursesRes.data;
    }
    if (educatorsRes.success && Array.isArray(educatorsRes.data)) {
      allEducators = educatorsRes.data.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
      }));
    }
    if (departmentsRes.success && Array.isArray(departmentsRes.data)) {
      allDepartments = departmentsRes.data;
    }
    if (levelsRes.success && Array.isArray(levelsRes.data)) {
      allAcademicLevels = levelsRes.data;
    }
  } catch (err: any) {
    console.error("[AdminCoursesPage] Error fetching courses data:", err);
  }

  return (
    <CoursesClient
      initialCourses={initialCourses}
      allEducators={allEducators}
      allDepartments={allDepartments}
      allAcademicLevels={allAcademicLevels}
      companyId={companyId}
      apiBaseUrl="/api"
    />
  );
}
