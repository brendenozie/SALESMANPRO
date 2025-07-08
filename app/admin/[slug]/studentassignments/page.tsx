// app/student/[slug]/my-classes/[courseId]/assignments/page.tsx
import React from "react";
import StudentAssignmentsPageClient from "./StudentAssignmentsPageClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentStudentId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_STUDENT_ID = "clx023j0d00003b6033877d9c"; // Example: Student ID

interface PageProps {
  params: {
    slug: string; // companyId
    courseId?: string; // Optional: if viewing assignments for a specific course
  };
}

// Define types for data fetched by the server component
export interface AssignmentData {
  id: string;
  name: string; // Assignment title
  classId: string; // Course ID
  className: string; // Course title
  teacher: string; // Teacher's name
  dueDate: string; // ISO string
  status: 'Pending Submission' | 'Submitted' | 'Graded' | 'Overdue' | 'Not Submitted'; // Frontend status
  type: string; // ExamType (e.g., 'HOMEWORK', 'PROJECT', 'QUIZ')
  totalPoints: number;
  grade: number | null;
  feedback: string | null;
  submissionUrl: string | null;
  description: string | null;
  submittedAt: string | null; // ISO string
}

export interface StudentAssignmentsPageData {
  studentName: string;
  studentGradeLevel: string;
  assignments: AssignmentData[];
  studentId: string;
  companyId: string;
  courseInfo?: { // Optional, if filtering by course
    id: string;
    title: string;
  };
}

export default async function StudentAssignmentsServerPage({ params }: PageProps) {
  const companyId = params.slug;
  const courseId = params.courseId; // This will be undefined if not in the URL path
  const studentId = MOCK_CURRENT_STUDENT_ID;

  let assignmentsPageData: StudentAssignmentsPageData | null = null;
  let fetchError: string | null = null;

  try {
    const url = new URL(`${apiUrl}/student/assignments`);
    url.searchParams.append('studentId', studentId);
    url.searchParams.append('companyId', companyId);
    if (courseId) {
      url.searchParams.append('courseId', courseId);
    }

    const res = await fetch(url.toString(), { cache: "no-store" });

    if (res.ok) {
      assignmentsPageData = (await res.json()) as StudentAssignmentsPageData;
      assignmentsPageData.studentId = studentId;
      assignmentsPageData.companyId = companyId;
      if (courseId) {
        // If a specific course was requested, add its info for the client component header
        assignmentsPageData.courseInfo = {
          id: courseId,
          title: assignmentsPageData.assignments[0]?.className || 'Unknown Course', // Use first assignment's class name or fallback
        };
      }
    } else {
      const errorData = await res.json();
      fetchError = errorData.message || `Failed to fetch student assignments: ${res.status} ${res.statusText}`;
      console.error("[StudentAssignmentsServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[StudentAssignmentsServerPage] Catch error:", err);
  }

  if (fetchError || !assignmentsPageData) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Assignments</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load student assignment data."}</p>
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
    <StudentAssignmentsPageClient
      studentName={assignmentsPageData.studentName}
      studentGradeLevel={assignmentsPageData.studentGradeLevel}
      initialAssignments={assignmentsPageData.assignments}
      studentId={assignmentsPageData.studentId}
      companyId={assignmentsPageData.companyId}
      courseInfo={assignmentsPageData.courseInfo}
    />
  );
}
