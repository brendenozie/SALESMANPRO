// app/student/[slug]/my-classes/[courseId]/assignments/page.tsx
import React from "react";
import StudentAssignmentsPageClient from "./StudentAssignmentsPageClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, these IDs would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use hardcoded mock IDs.
const MOCK_CURRENT_STUDENT_USER_ID = "clx023j0d00003b6033877d9c"; // Example: Student User ID (User.id)
const MOCK_COMPANY_ID = "clx021j3f00003b6033877d9a"; // Example: Company ID (replace with actual if available)

interface PageProps {
  params: Promise<{
    slug: string; // studentId (which is actually the User.id associated with the Student)
    courseId?: string; // Optional: if viewing assignments for a specific course
  }>;
  searchParams: Promise<{
    companyId?: string; // Expect companyId as a query parameter
  }>;
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
  type: string; // AssignmentType (e.g., 'HOMEWORK', 'PROJECT', 'QUIZ')
  totalPoints: number; // This will map to maxGrade from the API
  grade: number | null;
  feedback: string | null; // This will map to 'comments' from the API
  submissionUrl: string | null;
  submissionContent: string | null; // NEW: For text-based submissions
  description: string | null;
  submittedAt: string | null; // ISO string
}

export interface CourseInfo {
  id: string;
  title: string;
}

export interface StudentAssignmentsPageData {
  studentName: string;
  studentGradeLevel: string;
  assignments: AssignmentData[];
  studentId: string; // Pass student ID (User.id) to client for API calls
  companyId: string; // Pass company ID to client for API calls
  courseInfo?: CourseInfo; // Optional, if filtering by course
}

export default async function StudentAssignmentsServerPage({ params, searchParams }: PageProps) {
  const { slug: studentSlug, courseId } = await params;
  const studentId = studentSlug || MOCK_CURRENT_STUDENT_USER_ID;
  // const companyId = searchParams.companyId || MOCK_COMPANY_ID; // Get companyId from search params or use mock

  let assignmentsPageData: StudentAssignmentsPageData | null = null;
  let fetchError: string | null = null;

  try {
    const url = new URL(`${apiUrl}/student/assignments`);
    url.searchParams.append('studentId', studentId);
    // url.searchParams.append('companyId', companyId); // Always append companyId
    if (courseId) {
      url.searchParams.append('courseId', courseId);
    }

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });

    if (res.ok) {
      const data = await res.json();
      assignmentsPageData = {
        studentName: data.studentName,
        studentGradeLevel: data.studentGradeLevel,
        assignments: data.assignments,
        studentId: studentId, // Ensure studentId is passed down
        companyId: "companyId", // Ensure companyId is passed down
      };

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

  if (fetchError || !assignmentsPageData || !assignmentsPageData.assignments) {
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