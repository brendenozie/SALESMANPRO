import React from "react";
import MaterialsGlobalClient, { CourseMaterialType, CourseOption, EducatorOption, AcademicLevelOption } from "./MaterialsGlobalClient";
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from "@/lib/api/serverFetch";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function GlobalCourseMaterialsManagementPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();
  
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

  let initialMaterials: CourseMaterialType[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let fetchError: boolean = false;

  try {
    const [materialsRes, coursesRes, educatorsRes, levelsRes] = await Promise.all([
      serverFetchJson<CourseMaterialType[]>(`/api/admin/course-materials?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<any[]>(`/api/admin/courses?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<any[]>(`/api/admin/educators?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<AcademicLevelOption[]>(`/api/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`)
    ]);

    if (materialsRes.success && Array.isArray(materialsRes.data)) {
      initialMaterials = materialsRes.data;
    }
    if (coursesRes.success && Array.isArray(coursesRes.data)) {
      allCourses = coursesRes.data.map((c: any) => ({
        id: c.id,
        title: c.title,
        instructorName: c.instructorName,
        academicLevels: c.academicLevels,
      }));
    }
    if (educatorsRes.success && Array.isArray(educatorsRes.data)) {
      allEducators = educatorsRes.data.map((e: any) => ({
        id: e.id,
        name: e.name,
        email: e.email,
      }));
    }
    if (levelsRes.success && Array.isArray(levelsRes.data)) {
      allAcademicLevels = levelsRes.data;
    }
  } catch (err: any) {
    console.error("[CourseMaterialsPage] SSR fetch error:", err);
  }

  return (
    <MaterialsGlobalClient
      initialMaterials={initialMaterials}
      allCourses={allCourses}
      allEducators={allEducators}
      allAcademicLevels={allAcademicLevels}
      companyId={companyId}
      apiBaseUrl={apiBaseUrl}
    />
  );
}