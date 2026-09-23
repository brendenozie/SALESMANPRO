import React from "react";
import CourseEducatorDashboard from "./CourseReportsPageClient"; // Rename this to match your new client
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

import Link from "next/link";
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{ slug: string; courseId?: string }>;
  searchParams: Promise<{ 
    courseId?: string; 
    classroomId?: string; 
    scheduleId?: string 
  }>;
}

// Updated Types for Subject-Specific Analytics
export interface StudentSubjectReport {
  studentId: string;
  name: string;
  email: string;
  image: string | null;
  admissionNumber: string;
  stats: {
    assignments: {
      completed: number;
      total: number;
      average: string;
    };
    exams: {
      completed: number;
      total: number;
      average: string;
    };
    attendance: {
      present: number;
      total: number;
      percentage: string;
    };
  };
}

export default async function CourseReportsServerPage({ params, searchParams }: PageProps) {
  const session = await getAuthSession();

  // Redirect if not logged in
  if (!session?.user?.id) return notFound();

  const educatorId = session.user.id;
  const { slug, courseId: paramCourseId } = await params;
  const sParams = await searchParams;
  const courseId = paramCourseId || sParams?.courseId;
  const classroomId = sParams?.classroomId;
  const scheduleId = sParams?.scheduleId;

  let initialCourses = [];
  let fetchError: string | null = null;

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  try {
    const res = await serverFetchJson<{ courses: any[] }>(
      `/api/teacher/courses-for-reports?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}&classroomId=${encodeURIComponent(classroomId || "")}&scheduleId=${encodeURIComponent(scheduleId || "")}`
    );

    if (res.ok && res.data?.courses) {
      initialCourses = res.data.courses;
    } else {
      fetchError = res.error || res.message || "Failed to load educator course list.";
    }
  } catch (err: any) {
    fetchError = "Network error while connecting to academic services.";
  }

  // Error State UI
  if (fetchError && initialCourses.length === 0) {
    return (
      <div className="p-12 text-center bg-white min-h-screen flex flex-col items-center justify-center">
        <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 max-w-md">
          <h2 className="text-2xl font-black text-rose-900 mb-2">Sync Error</h2>
          <p className="text-rose-600/80 font-medium mb-6">{fetchError}</p>
          <Link
            href={`/admin/${slug}/teachersubjectlist`}
            className="inline-block w-full py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all text-center"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  // 2. Prepare Context for the Client Component
  // We pass these down so the Client knows exactly which report to fetch
  const pageContext = {
    companyId,
    educatorId,
    courseId: courseId || (initialCourses.length > 0 ? initialCourses[0].id : null),
    classroomId: classroomId || "General",
    scheduleId: scheduleId || "",
    courseTitle: initialCourses.find((c: any) => c.id === courseId)?.title || "Subject Report",
    educatorName: session.user.name || "Educator"
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <CourseEducatorDashboard 
        context={pageContext} 
        availableCourses={initialCourses} 
      />
    </div>
  );
}