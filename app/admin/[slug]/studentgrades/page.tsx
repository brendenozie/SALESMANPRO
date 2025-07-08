// app/student/[slug]/my-grades/page.tsx
import React from "react";
import StudentGradesPageClient from "./StudentGradesPageClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentStudentId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_STUDENT_ID = "clx023j0d00003b6033877d9c"; // Example: Student ID

interface PageProps {
  params: {
    slug: string; // companyId
    courseId?: string; // Optional: if viewing grades for a specific course
  };
}

// Define types for data fetched by the server component
export interface CourseGradeData {
  id: string;
  name: string; // Course title
  teacher: string; // Teacher's name
  currentGrade: string; // Letter grade (e.g., "A-", "B+")
  averageScore: number | null; // Percentage average from assignments
  enrollmentGradeValue: number | null; // Raw numerical grade from enrollment
}

export interface AssignmentGradeData {
  id: string; // Submission ID
  assignmentId: string; // Exam ID
  assignmentName: string;
  className: string; // Course title
  type: string; // ExamType (e.g., 'HOMEWORK', 'QUIZ', 'PROJECT')
  grade: number;
  totalPoints: number;
  feedback: string | null;
  gradedDate: string; // ISO string
  description: string | null;
}

export interface StudentGradesPageData {
  studentName: string;
  studentGradeLevel: string;
  overallGPA: string;
  overallAverage: string; // Percentage string
  courseGrades: CourseGradeData[];
  assignmentGrades: AssignmentGradeData[];
  studentId: string;
  companyId: string;
  courseInfo?: { // Optional, if filtering by course
    id: string;
    title: string;
  };
}

export default async function StudentGradesServerPage({ params }: PageProps) {
  const companyId = params.slug;
  const courseId = params.courseId; // This will be undefined if not in the URL path
  const studentId = MOCK_CURRENT_STUDENT_ID;

  let gradesPageData: StudentGradesPageData | null = null;
  let fetchError: string | null = null;

  try {
    const url = new URL(`${apiUrl}/student/grades`);
    url.searchParams.append('studentId', studentId);
    url.searchParams.append('companyId', companyId);
    if (courseId) {
      url.searchParams.append('courseId', courseId);
    }

    const res = await fetch(url.toString(), { cache: "no-store" });

    if (res.ok) {
      gradesPageData = (await res.json()) as StudentGradesPageData;
      gradesPageData.studentId = studentId;
      gradesPageData.companyId = companyId;
      if (courseId) {
        // If a specific course was requested, add its info for the client component header
        gradesPageData.courseInfo = {
          id: courseId,
          title: gradesPageData.courseGrades[0]?.name || 'Unknown Course', // Use first course's name or fallback
        };
      }
    } else {
      const errorData = await res.json();
      fetchError = errorData.message || `Failed to fetch student grades: ${res.status} ${res.statusText}`;
      console.error("[StudentGradesServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[StudentGradesServerPage] Catch error:", err);
  }

  if (fetchError || !gradesPageData) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Grades</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load student grade data."}</p>
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
    <StudentGradesPageClient
      studentName={gradesPageData.studentName}
      studentGradeLevel={gradesPageData.studentGradeLevel}
      overallGPA={gradesPageData.overallGPA}
      overallAverage={gradesPageData.overallAverage}
      initialCourseGrades={gradesPageData.courseGrades}
      initialAssignmentGrades={gradesPageData.assignmentGrades}
      studentId={gradesPageData.studentId}
      companyId={gradesPageData.companyId}
      courseInfo={gradesPageData.courseInfo}
    />
  );
}
