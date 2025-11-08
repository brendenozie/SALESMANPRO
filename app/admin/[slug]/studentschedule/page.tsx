// app/student/[slug]/my-schedule/page.tsx
import React from "react";
import StudentSchedulePageClient from "./StudentSchedulePageClient";

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentStudentId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_STUDENT_ID = "clx023j0d00003b6033877d9c"; // Example: Student ID

interface PageProps {
  params: Promise<{
    slug: string; // studentId
  }>;
}

// Define types for data fetched by the server component
export interface ClassScheduleItem {
  id: string;
  day: string; // DayOfWeek enum value (e.g., "Monday")
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  title: string;     // Course title with teacher name
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

export interface StudentInfo {
  id: string;
  name: string;
  gradeLevel: string;
}

export interface StudentSchedulePageData {
  student: StudentInfo;
  schedule: ClassScheduleItem[]; // Recurring class schedules
  events: EventScheduleItem[];   // Specific one-off events
  companyId: string;
}

export default async function StudentScheduleServerPage({ params }: PageProps) {
  const { slug: studentSlug } = await params;
  const studentId = studentSlug || MOCK_CURRENT_STUDENT_ID;

  let schedulePageData: StudentSchedulePageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiUrl}/student/schedule?studentId=${encodeURIComponent(studentId)}`,
      { next: { revalidate: 60 } } // Ensure fresh data
    );

    if (res.ok) {
      schedulePageData = (await res.json()) as StudentSchedulePageData;
      // schedulePageData.companyId = companyId; // Ensure companyId is passed down
    } else {
      const errorData = await res.json();
      fetchError = errorData.message || `Failed to fetch student schedule: ${res.status} ${res.statusText}`;
      console.error("[StudentScheduleServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[StudentScheduleServerPage] Catch error:", err);
  }

  if (fetchError || !schedulePageData || !schedulePageData.student) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Schedule</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load student schedule data."}</p>
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
    <StudentSchedulePageClient
      student={schedulePageData.student}
      initialSchedule={schedulePageData.schedule}
      initialEvents={schedulePageData.events}
      companyId={schedulePageData.companyId}
    />
  );
}
