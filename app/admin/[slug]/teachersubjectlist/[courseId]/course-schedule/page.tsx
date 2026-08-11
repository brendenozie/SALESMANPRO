// app/admin/[slug]/teacher-classes/[courseId]/class-schedule/page.tsx
import React from "react";
import ClassSchedulePageClient from "./ClassSchedulePageClient"; // Renamed client component

import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentEducatorId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator ID

// interface PageProps {
//   params: Promise<{
//     slug: string; // companyId
//     courseId: string;
//   }>;
// }
interface PageProps {
  params: { courseId: string; slug: string };
  searchParams: { classroomId?: string; scheduleId?: string };
}

// Define types for data fetched by the server component
export interface ClassScheduleData {
  id: string;
  day: string; // DayOfWeek enum value
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  topic: string | null;
  meetingLink: string | null; // Added meetingLink
  room?: string; // Made optional as it's not in the current schema
}

export interface EventData {
  id: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  location: string | null;
  onlineMeetingLink: string | null; // Added onlineMeetingLink
  type: string; // EventType enum value
}

export interface CourseScheduleInfo {
  id: string;
  title: string;
  academicLevelId: string;
  academicLevelName: string;
}

export interface ClassSchedulePageData {
  course: CourseScheduleInfo;
  schedule: ClassScheduleData[]; // Recurring class schedules
  events: EventData[];           // Specific one-off events
  educatorId: string; // Pass educator ID to client for API calls
  companyId: string; // Pass company ID to client for API calls
}

export default async function ClassScheduleServerPage({ params, searchParams }: PageProps) {

  const cookiesStore = (await cookies()).toString();
  const session = await getAuthSession();
  const educatorId = session?.user?.id || MOCK_CURRENT_EDUCATOR_ID;
  // const companyId = params.slug;

  const { slug, courseId } = params;
  const { classroomId, scheduleId } = searchParams;
  
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

  // const { slug: companyId, courseId } = await params;
  // const educatorId = MOCK_CURRENT_EDUCATOR_ID; // In a real app, get this from auth context

  let schedulePageData: ClassSchedulePageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiBaseUrl}/teacher/courses/${courseId}/schedule?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}&classroomId=${encodeURIComponent(classroomId || "")}&scheduleId=${encodeURIComponent(scheduleId || "")}`,
      { next: { revalidate: 60 }, headers: { cookie: cookiesStore } } // Ensure fresh data
    );

    if (res.ok) {
      schedulePageData = (await res.json()).data as ClassSchedulePageData;
      // Also pass down educatorId and companyId for client-side API calls
      schedulePageData.educatorId = educatorId;
      schedulePageData.companyId = companyId;
    } else {
      const errorData = await res.json();
      fetchError = errorData.message || `Failed to fetch schedule data: ${res.status} ${res.statusText}`;
      console.error("[ClassScheduleServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[ClassScheduleServerPage] Catch error:", err);
  }

  if (fetchError || !schedulePageData || !schedulePageData.course) {
    // Render an error state or a fallback with a message
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Schedule</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load schedule data for this course."}</p>
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
    <ClassSchedulePageClient
      course={schedulePageData.course}
      initialSchedule={schedulePageData.schedule}
      initialEvents={schedulePageData.events}
      educatorId={schedulePageData.educatorId}
      companyId={schedulePageData.companyId}
    />
  );
}
