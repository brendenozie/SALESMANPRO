import React from "react";
import ManageEventsPageClient from "./ManageEventsPageClient";
import Link from "next/link";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from "@/lib/api/serverFetch";

// IMPORTANT: In a real application, the currentEducatorId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator ID

interface PageProps {
  params: Promise<{ courseId: string; slug: string }>;
  searchParams: Promise<{ classroomId?: string; scheduleId?: string }>;
}

// Define types for data fetched by the server component
export interface EventData {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  startDateTime: string; // ISO string
  endDateTime: string | null; // ISO string
  location: string | null;
  onlineMeetingLink: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  eventType: string; // EventType enum value
  eventStatus: string; // EventStatus enum value
  isRegistrationRequired: boolean;
  maxCapacity: number | null;
  isPaid: boolean;
  price: number | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  organizerName: string;
  audience: string; // EventAudience enum value
  targetAcademicLevelIds: string[];
  targetCourseIds: string[];
  targetEducatorIds: string[];
  targetStudentIds: string[];
  targetDepartmentIds: string[];
  targetParentIds: string[];
}

export interface CourseInfo {
  id: string;
  title: string;
  academicLevelId: string;
  academicLevelName: string;
}

export interface ManageEventsPageData {
  course: CourseInfo;
  events: EventData[];
  educatorId: string; // Pass educator ID to client for API calls
  companyId: string; // Pass company ID to client for API calls
}

export default async function ManageEventsServerPage({ params, searchParams }: PageProps) {
  const { slug, courseId } = await params;
  const sParams = await searchParams;
  const classroomId = sParams?.classroomId || "";
  const scheduleId = sParams?.scheduleId || "";

  const session = await getAuthSession();
  const educatorId = session?.user?.id || MOCK_CURRENT_EDUCATOR_ID;

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let eventsPageData: ManageEventsPageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await serverFetchJson<ManageEventsPageData>(
      `/api/teacher/courses/${courseId}/events?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}&classroomId=${encodeURIComponent(classroomId)}&scheduleId=${encodeURIComponent(scheduleId)}`
    );

    if (res.ok && res.data) {
      eventsPageData = res.data;
      eventsPageData.educatorId = educatorId;
      eventsPageData.companyId = companyId;
    } else {
      fetchError = res.error || res.message || "Failed to fetch events data";
      console.error("[ManageEventsServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[ManageEventsServerPage] Catch error:", err);
  }

  if (fetchError || !eventsPageData || !eventsPageData.course) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Events</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load events data for this course."}</p>
        <Link
          href={`/admin/${slug}/teachersubjectlist`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-200 text-red-800 rounded-md shadow-sm
                     hover:bg-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        >
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <ManageEventsPageClient
      course={eventsPageData.course}
      initialEvents={eventsPageData.events}
      educatorId={eventsPageData.educatorId}
      companyId={eventsPageData.companyId}
    />
  );
}
