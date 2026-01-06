import React from "react";
import ClassroomsClient, { ClassroomType, AcademicLevelType } from "./ClassroomsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ClassroomsManagementPage({ params }: PageProps) {
  const { slug: companyId } = await params;
  const cookieHeaders = (await cookies()).toString();

  let classrooms: ClassroomType[] = [];
  let academicLevels: AcademicLevelType[] = [];

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