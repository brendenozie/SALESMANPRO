// app/admin/[slug]/teacher-schedule/page.tsx
import React from "react";
import TeachersSchedulePageClient from "./TeachersSchedulePageClient";

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentEducatorId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator ID

interface PageProps {
  params:Promise<{ slug: string }>
}

// Define types for data fetched by the server component
export interface ClassScheduleItem {
  id: string;
  day: string; // DayOfWeek enum value (e.g., "Monday")
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  title: string;     // Course title with academic level
  topic: string | null;
  meetingLink: string | null;
  type: 'class';
}

export interface EventScheduleItem {
  id: string;
  title: string;
  summary: string | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  location: string | null;
  onlineMeetingLink: string | null;
  type: string; // EventType enum value (e.g., "MEETING", "WORKSHOP")
}

export interface TeacherInfo {
  id: string;
  name: string;
  role: string; // e.g., "Mathematics Teacher" or department name
}

export interface TeacherSchedulePageData {
  educator: TeacherInfo;
  schedule: ClassScheduleItem[]; // Recurring class schedules
  events: EventScheduleItem[];   // Specific one-off events
  companyId: string;
}

export default async function TeachersScheduleServerPage({ params }: PageProps) {
  const { slug : companyId } = await params;
  const educatorId = companyId || MOCK_CURRENT_EDUCATOR_ID;

  let schedulePageData: TeacherSchedulePageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiBaserUrl}/teacher/schedule?educatorId=${encodeURIComponent(educatorId)}`,
      { next: { revalidate: 60 } } // Ensure fresh data
    );

    if (res.ok) {
      schedulePageData = (await res.json()) as TeacherSchedulePageData;
      // schedulePageData.companyId = companyId; // Ensure companyId is passed down
    } else {
      const errorData = await res.json();
      fetchError = errorData.message || `Failed to fetch teacher schedule: ${res.status} ${res.statusText}`;
      console.error("[TeachersScheduleServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[TeachersScheduleServerPage] Catch error:", err);
  }

  if (fetchError || !schedulePageData || !schedulePageData.educator) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Schedule</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load teacher schedule data."}</p>
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
    <TeachersSchedulePageClient
      educator={schedulePageData.educator}
      initialSchedule={schedulePageData.schedule}
      initialEvents={schedulePageData.events}
      companyId={schedulePageData.companyId}
    />
  );
}
