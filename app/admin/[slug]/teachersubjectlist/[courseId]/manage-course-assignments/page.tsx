// app/admin/[slug]/teacher-classes/[courseId]/manage-assignments/page.tsx
import React from "react";
import ManageAssignmentsPageClient from "./ManageAssignmentsPageClient"; // Renamed client component

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentEducatorId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator ID

interface PageProps {
  params: Promise<{
    slug: string; // companyId
    courseId: string;
  }>;
}

// Define types for data fetched by the server component
export interface AssignmentData {
  id: string;
  title: string;
  description: string | null;
  dueDate: string; // YYYY-MM-DD format
  maxPoints: number;
  status: string; // This will be the ExamType from Prisma
  submissionCount: number;
  displayStatus: string; // A more user-friendly status derived from ExamType
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
  companyId: string; // Pass company ID to client for API calls
}

export default async function ManageAssignmentsServerPage({ params }: PageProps) {
  const { slug: companyId, courseId } = await params;
  // const courseId = params.courseId;
  const educatorId = MOCK_CURRENT_EDUCATOR_ID; // In a real app, get this from auth context

  let assignmentsPageData: ManageAssignmentsPageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiBaserUrl}/teacher/courses/${courseId}/assignments?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 } } // Ensure fresh data
    );

    if (res.ok) {
      assignmentsPageData = (await res.json()) as ManageAssignmentsPageData;
      // Also pass down educatorId and companyId for client-side API calls
      assignmentsPageData.educatorId = educatorId;
      assignmentsPageData.companyId = companyId;
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
      companyId={assignmentsPageData.companyId}
    />
  );
}
