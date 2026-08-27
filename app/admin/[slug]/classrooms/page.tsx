import React from "react";
import ClassroomsClient, { ClassroomType, AcademicLevelType } from "./ClassroomsClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ClassroomsManagementPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeaders = (await cookies()).toString();

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
      fetch(`${apiBaseUrl}/admin/classrooms?companyId=${encodeURIComponent(companyId)}`, {
        next: { revalidate: 0 },
        headers: { cookie: cookieHeaders }
      }),
      fetch(`${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, {
        next: { revalidate: 60 },
        headers: { cookie: cookieHeaders }
      })
    ]);

    if (classRes.ok) classrooms = (await classRes.json()).data;
    if (levelsRes.ok) academicLevels = (await levelsRes.json()).data;

    // console.log("Fetched Classrooms:", classrooms); 

  } catch (err) {
    console.error("Fetch error:", err);
  }

  return (
    <ClassroomsClient
      initialClassrooms={classrooms}
      academicLevels={academicLevels}
      companyId={companyId}
      apiBaseUrl={apiBaseUrl}
    />
  );
}