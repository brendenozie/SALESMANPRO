import React from "react";
import CourseEducatorDashboard from "./CourseReportsPageClient"; // Rename this to match your new client
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: { slug: string }; // slug is companyId
  searchParams: { 
    courseId?: string; 
    classroomId?: string; 
    scheduleId?: string 
  };
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
  const cookieStore = (await cookies()).toString();

  // Redirect if not logged in
  if (!session?.user?.id) return notFound();

  const educatorId = session.user.id;
  const { slug } = params;
  
  // These usually come from the URL query or a previous selection
  const { courseId, classroomId, scheduleId } = searchParams;

  let initialCourses = [];
  let fetchError: string | null = null;

  
    // const { slug } = await params;
  
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

  try {
    // 1. Fetch available courses for this educator to populate selection dropdowns
    const res = await fetch(
      `${apiBaseUrl}/teacher/courses-for-reports?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}&classroomId=${encodeURIComponent(classroomId || "")}&scheduleId=${encodeURIComponent(scheduleId || "")}`,
      { 
        next: { revalidate: 60 }, 
        headers: { cookie: cookieStore } 
      }
    );

    if (res.ok) {
      const result = await res.json();
      initialCourses = result.data.courses;
    } else {
      fetchError = "Failed to load educator course list.";
    }
  } catch (err: any) {
    fetchError = "Network error while connecting to academic services.";
  }

  // Error State UI
  if (fetchError) {
    return (
      <div className="p-12 text-center bg-white min-h-screen flex flex-col items-center justify-center">
        <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 max-w-md">
          <h2 className="text-2xl font-black text-rose-900 mb-2">Sync Error</h2>
          <p className="text-rose-600/80 font-medium mb-6">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all"
          >
            Retry Connection
          </button>
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