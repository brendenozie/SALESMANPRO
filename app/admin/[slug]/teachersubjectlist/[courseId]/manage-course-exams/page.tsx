// app/educator/[slug]/teacher-classes/[courseId]/exams/page.tsx
import React from "react";
import TeacherExamsClientPage from "./TeacherExamsClientPage";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ courseId: string; slug: string }>;
  searchParams: Promise<{ classroomId?: string; scheduleId?: string }>;
}

export default async function TeacherClassExamsPage({ params, searchParams }: PageProps) {
  const session = await getAuthSession();
  const educatorId = session?.user?.id;
  const cookieHeader = (await cookies()).toString();

    const { slug, courseId } = await params;
  
    // const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  // Redirect if not authenticated
  if (!educatorId) redirect("/login");

  // const { s,  } = await params;
  const { classroomId, scheduleId } = await searchParams;

  let initialExams = [];
  let courseDetails = null;

  try {
    // Fetch exams scoped to this specific educator, course, and classroom

    const url = `${apiBaseUrl}/teacher/courses/${courseId}/exams?educatorId=${encodeURIComponent(educatorId)}&classroomId=${encodeURIComponent(classroomId || "")}&scheduleId=${encodeURIComponent(scheduleId || "")}`;
    
    const res = await fetch(url, {
      headers: { Cookie: cookieHeader },
      next: { revalidate: 0 }
    });

    if (res.ok) {
      const result = await res.json();
      initialExams = result.data.exams || [];
      courseDetails = result.data.course;
    }
  } catch (err) {
    console.error("Failed to fetch exams for this class:", err);
  }

  return (
    <TeacherExamsClientPage
      initialExams={initialExams}
      courseDetails={courseDetails}
      companyId={companyId}
      courseId={courseId}
      classroomId={classroomId}
      educatorId={educatorId}
    />
  );
}