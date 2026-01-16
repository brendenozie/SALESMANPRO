// app/admin/[slug]/teacher-classes/[courseId]/take-attendance/page.tsx
import React from "react";
import TakeAttendancePageClient from "./TakeAttendancePageClient"; // Renamed client component
import { getAuthSession } from "@/lib/auth";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentTeacherUserId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator ID

interface PageProps {
  params: Promise<{
    // slug: string; // companyId
    courseId: string;
  }>;
}

// Define types for data fetched by the server component
export interface StudentAttendanceData {
  studentId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface CourseAttendanceInfo {
  id: string;
  title: string;
  academicLevelId: string;
  academicLevelName: string;
}

export interface AttendancePageData {
  course: CourseAttendanceInfo;
  students: StudentAttendanceData[];
  existingAttendance: { [studentId: string]: string }; // Status string like 'Present', 'Absent'
  educatorId: string; // Pass educator ID to client for API calls
  companyId: string; // Pass company ID to client for API calls
}

export default async function TakeAttendanceServerPage({ params }: PageProps) {
  const { courseId } = await params; // slug: companyId, 
  // const educatorId = companyId || MOCK_CURRENT_EDUCATOR_ID; // In a real app, get this from auth context
  const cookiesStore = (await cookies()).toString()
  const session = await getAuthSession();

  const educatorId = session?.user?.id || MOCK_CURRENT_EDUCATOR_ID;
  const companyId = "clx022z7f00002b60g6r4q6v9"; // Example company ID session?.user?.companyId || 
  let attendancePageData: AttendancePageData | null = null;
  let fetchError: string | null = null;

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for initial fetch

    const res = await fetch(
      `${apiBaseUrl}/teacher/courses/${courseId}/attendance-data?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}&date=${encodeURIComponent(today)}`,
      { 
        headers: { 'Cookie': cookiesStore || '' },
        next: { revalidate: 60 } } // Ensure fresh data
    );

    if (res.ok) {
      const data = (await res.json()).data || {};
      attendancePageData = {
        course: data.course,
        students: data.students,
        existingAttendance: data.existingAttendance,
        educatorId: educatorId,
        companyId: companyId,
      };
    } else {
      const errorData = (await res.json()).data || {};
      fetchError = errorData.message || `Failed to fetch attendance data: ${res.status} ${res.statusText}`;
      console.error("[TakeAttendanceServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[TakeAttendanceServerPage] Catch error:", err);
  }

  if (fetchError || !attendancePageData) {
    // Render an error state or a fallback with a message
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Attendance</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load attendance data for this course."}</p>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-200 text-red-800 rounded-md shadow-sm
                     hover:bg-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <TakeAttendancePageClient
      course={attendancePageData.course}
      students={attendancePageData.students}
      initialAttendance={attendancePageData.existingAttendance}
      educatorId={attendancePageData.educatorId}
      companyId={attendancePageData.companyId}
    />
  );
}
