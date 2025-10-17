// app/admin/[slug]/teacher-classes/[courseId]/class-schedule/page.tsx
import React from "react";
import ClassSchedulePageClient from "./ClassSchedulePageClient"; // Renamed client component

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentEducatorId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator ID

interface PageProps {
  params: {
    slug: string; // companyId
    courseId: string;
  };
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

export default async function ClassScheduleServerPage({ params }: PageProps) {
  const { slug : companyId } = await params;
  const courseId = params.courseId;
  const educatorId = MOCK_CURRENT_EDUCATOR_ID; // In a real app, get this from auth context

  let schedulePageData: ClassSchedulePageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiUrl}/teacher/courses/${courseId}/schedule?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 } } // Ensure fresh data
    );

    if (res.ok) {
      schedulePageData = (await res.json()) as ClassSchedulePageData;
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
