import React from "react";
import StudentAssignmentsPageClient from "./StudentAssignmentsPageClient";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from "@/lib/api/serverFetch";

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
    courseId?: string;
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
  const { slug: studentSlug } = await params;
  const sParams = await searchParams;
  const courseId = sParams?.courseId;

  const session = await getAuthSession();
  const studentId = session?.user?.id || "";
  
  const identifier = studentSlug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let assignmentsPageData: StudentAssignmentsPageData | null = null;
  let fetchError: string | null = null;

  try {
    const queryParams = new URLSearchParams({ studentId });
    if (courseId) {
      queryParams.append('courseId', courseId);
    }

    const res = await serverFetchJson<StudentAssignmentsPageData>(
      `/api/student/assignments?${queryParams.toString()}`
    );

    if (res.ok && res.data) {
      const data = res.data;
      assignmentsPageData = {
        studentName: data.studentName,
        studentGradeLevel: data.studentGradeLevel,
        assignments: data.assignments,
        studentId: studentId,
        companyId: companyId,
      };

      if (courseId) {
        assignmentsPageData.courseInfo = {
          id: courseId,
          title: assignmentsPageData.assignments[0]?.className || 'Unknown Course',
        };
      }
    } else {
      fetchError = res.error || res.message || "Failed to fetch student assignments";
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
        <Link
          href={`/admin/${studentSlug}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-200 text-red-800 rounded-md shadow-sm
                       hover:bg-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        >
          Go Back
        </Link>
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