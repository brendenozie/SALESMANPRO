// app/admin/[slug]/teacher-classes/[courseId]/consolidated-grades/page.tsx
import React from "react";
import ConsolidatedGradesPageClient from "./ConsolidatedGradesPageClient"; // Renamed client component

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
export interface StudentGradeData {
  studentId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface AssessmentData {
  id: string; // Exam ID
  name: string; // Exam title
  type: string; // ExamType enum value
  maxScore: number;
  examDate: string; // ISO string
}

export interface GradeRecord {
  gradeId: string; // The actual Grade record ID
  score: number;
  gradeValue: string | null;
  gradeStatus: string | null;
  comments: string | null;
  academicLevelAtTimeOfGradeId: string;
}

export interface CourseGradesInfo {
  id: string;
  title: string;
  description: string | null;
  academicLevelId: string;
  academicLevelName: string;
}

export interface ConsolidatedGradesPageData {
  course: CourseGradesInfo;
  students: StudentGradeData[];
  assessments: AssessmentData[];
  grades: { [studentId: string]: { [examId: string]: GradeRecord } }; // Nested structure
  educatorId: string; // Pass educator ID to client for API calls
  companyId: string; // Pass company ID to client for API calls
}

export default async function ConsolidatedGradesServerPage({ params }: PageProps) {
  const companyId = params.slug;
  const courseId = params.courseId;
  const educatorId = MOCK_CURRENT_EDUCATOR_ID; // In a real app, get this from auth context

  let gradesPageData: ConsolidatedGradesPageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiUrl}/teacher/courses/${courseId}/grades-data?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" } // Ensure fresh data
    );

    if (res.ok) {
      const data = await res.json();
      gradesPageData = {
        course: data.course,
        students: data.students,
        assessments: data.assessments,
        grades: data.grades,
        educatorId: educatorId,
        companyId: companyId,
      };
    } else {
      const errorData = await res.json();
      fetchError = errorData.message || `Failed to fetch grades data: ${res.status} ${res.statusText}`;
      console.error("[ConsolidatedGradesServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[ConsolidatedGradesServerPage] Catch error:", err);
  }

  if (fetchError || !gradesPageData) {
    // Render an error state or a fallback with a message
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Grades</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load grades data for this course."}</p>
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
    <ConsolidatedGradesPageClient
      course={gradesPageData.course}
      students={gradesPageData.students}
      assessments={gradesPageData.assessments}
      initialGrades={gradesPageData.grades}
      educatorId={gradesPageData.educatorId}
      companyId={gradesPageData.companyId}
    />
  );
}
