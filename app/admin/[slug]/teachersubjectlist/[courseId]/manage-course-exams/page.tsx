// app/educator/[slug]/teacher-classes/[courseId]/exams/page.tsx
import React from "react";
import TeacherExamsClientPage from "./TeacherExamsClientPage";
import { getAuthSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ courseId: string; slug: string }>;
  searchParams: Promise<{ classroomId?: string; scheduleId?: string }>;
}

export default async function TeacherClassExamsPage({ params, searchParams }: PageProps) {
  const session = await getAuthSession();
  const educatorId = session?.user?.id;
  const cookieHeader = (await cookies()).toString();

  // Redirect if not authenticated
  if (!educatorId) redirect("/login");

  const { slug: companyId, courseId } = await params;
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