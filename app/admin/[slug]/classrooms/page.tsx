import React from "react";
import ClassroomsClient, { ClassroomType, AcademicLevelType } from "./ClassroomsClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ClassroomsManagementPage({ params }: PageProps) {
  const { slug } = await params;

  let classrooms: ClassroomType[] = [];
  let academicLevels: AcademicLevelType[] = [];
  
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
    // Fetch Classrooms and Academic Levels in parallel
    const [classRes, levelsRes] = await Promise.all([
      serverFetchJson<ClassroomType[]>(`/api/admin/classrooms?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<AcademicLevelType[]>(`/api/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`)
    ]);

    if (classRes.success && Array.isArray(classRes.data)) classrooms = classRes.data;
    if (levelsRes.success && Array.isArray(levelsRes.data)) academicLevels = levelsRes.data;
  } catch (err) {
    console.error("Fetch error:", err);
  }

  return (
    <ClassroomsClient
      initialClassrooms={classrooms}
      academicLevels={academicLevels}
      companyId={companyId}
      apiBaseUrl="/api"
    />
  );
}