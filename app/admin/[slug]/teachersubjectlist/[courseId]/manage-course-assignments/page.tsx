// app/admin/[slug]/teacher-classes/[courseId]/manage-assignments/page.tsx
import React from "react";
import ManageAssignmentsPageClient from "./ManageAssignmentsPageClient"; // Renamed client component
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// IMPORTANT: In a real application, the currentEducatorId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator ID

interface PageProps {
  params: { courseId: string; slug: string };
  searchParams: { classroomId?: string; scheduleId?: string };
}

// Define types for data fetched by the server component
export interface AssignmentData {
  id: string;
  title: string;
  description: string | null;
  courseInstructorName: string;
  dueDate: string;
  status: string;
  maxGrade: number;
  courseId: string;
  courseTitle: string;
  course: { id: string; title: string; academicLevels: { id: string; name: string }[] } | null;
  courseAcademicLevels: { id: string; name: string }[];
  classroomId: string | null;
  classroom: { id: string; name: string; academicLevelId: string } | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  notes: string | null;
  type: 'QUIZ' | 'UNIT_TEST' | 'MIDTERM' | 'FINAL' | 'ASSIGNMENT_BASED' | 'PRACTICE' | 'OTHER';
  totalPoints: number;
  isPublished: boolean;
  createdById: string | null;
  createdByEmail: string | null;
  createdByName: string | null;
  durationMinutes: number | null;
  companyId: string | null;
  autoGrade: boolean;
  isOnline: boolean;
  instructions: string | null;
  totalQuestions: number;
  totalSubmissions: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CourseAssignmentInfo {
  id: string;
  title: string;
  academicLevelId: string;
  academicLevelName: string;
}

export interface ManageAssignmentsPageData {
  course: CourseAssignmentInfo;
  assignments: AssignmentData[];
  educatorId: string; // Pass educator ID to client for API calls
}

export default async function ManageAssignmentsServerPage({ params, searchParams }: PageProps) {

  const cookiesStore = (await cookies()).toString();
  const session = await getAuthSession();
  const educatorId = session?.user?.id || MOCK_CURRENT_EDUCATOR_ID;
  // const companyId = params.slug;

  const { slug, courseId } = params;
  const { classroomId, scheduleId } = searchParams;
  // const educatorId = MOCK_CURRENT_EDUCATOR_ID; // In a real app, get this from auth context

  
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

  let assignmentsPageData: ManageAssignmentsPageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiBaseUrl}/teacher/courses/${courseId}/assignments?educatorId=${encodeURIComponent(educatorId)}&classroomId=${encodeURIComponent(classroomId || "")}&scheduleId=${encodeURIComponent(scheduleId || "")}`,
      { next: { revalidate: 60 }, headers: { 'Cookie': cookiesStore || '' } }
    );

    if (res.ok) {
      assignmentsPageData = (await res.json()).data as ManageAssignmentsPageData;
      // Also pass down educatorId and companyId for client-side API calls
      assignmentsPageData.educatorId = educatorId;
      // assignmentsPageData.companyId = companyId;
    } else {
      const errorData = await res.json();
      fetchError = errorData.message || `Failed to fetch assignments data: ${res.status} ${res.statusText}`;
      console.error("[ManageAssignmentsServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[ManageAssignmentsServerPage] Catch error:", err);
  }

  if (fetchError || !assignmentsPageData || !assignmentsPageData.course) {
    // Render an error state or a fallback with a message
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Assignments</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load assignments data for this course."}</p>
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
    <ManageAssignmentsPageClient
      course={assignmentsPageData.course}
      initialAssignments={assignmentsPageData.assignments}
      educatorId={assignmentsPageData.educatorId}
      courseId={courseId}
      classroomId={classroomId || ''}
      scheduleId={scheduleId || ''}
    />
  );
}
