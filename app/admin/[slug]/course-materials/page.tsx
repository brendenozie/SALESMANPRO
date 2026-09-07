import React from "react";
import MaterialsGlobalClient, { CourseMaterialType, CourseOption, EducatorOption, AcademicLevelOption } from "./MaterialsGlobalClient";
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
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
    // Fetch all materials for this company
    const materialsRes = await fetch(
      `${apiBaseUrl}/admin/course-materials?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (materialsRes.ok) {
      const data = (await materialsRes.json()).data;
      initialMaterials = data as CourseMaterialType[];
    } else {
      fetchError = true;
    }

    // Fetch all courses for this company
    const coursesRes = await fetch(
      `${apiBaseUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (coursesRes.ok) {
      const fetchedCourses = (await coursesRes.json()).data as any[];
      allCourses = fetchedCourses.map(c => ({
        id: c.id,
        title: c.title,
        instructorName: c.instructorName,
        academicLevels: c.academicLevels,
      }));
    } else {
      fetchError = true;
    }

    // Fetch all educators
    const educatorsRes = await fetch(
      `${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (educatorsRes.ok) {
      const fetchedEducators = (await educatorsRes.json()).data as any[];
      allEducators = fetchedEducators.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
      }));
    } else {
      fetchError = true;
    }

    // Fetch all academic levels
    const academicLevelsRes = await fetch(
      `${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (academicLevelsRes.ok) {
      const data = (await academicLevelsRes.json()).data;
      allAcademicLevels = data as AcademicLevelOption[];
    } else {
      fetchError = true;
    }

  } catch (err: any) {
    fetchError = true;
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