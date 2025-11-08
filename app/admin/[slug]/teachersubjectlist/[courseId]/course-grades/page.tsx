// app/admin/[slug]/teacher-classes/[courseId]/consolidated-grades/page.tsx

import React from "react";
import ConsolidatedGradesPageClient from "./ConsolidatedGradesPageClient";

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator ID

interface PageProps {
  params: Promise<{
    slug: string; // companyId
    courseId: string;
  }>;
}

export interface StudentGradeData {
  studentId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface AssessmentData {
  id: string; // Exam or Course Assignment ID
  name: string; // Exam or Assignment title
  type: string; // ExamType or AssignmentType enum value (e.g., 'Exam', 'Assignment', 'Quiz')
  maxScore: number;
  examDate: string | null; // ISO string (using examDate for consistency, can be dueDate for assignments)
}

export interface GradeRecord {
  gradeId: string;
  score: number;
  gradeValue: string | null;
  gradeStatus: string | null; // This should match GradeStatus enum: 'PASSED' | 'FAILED' | 'PENDING'
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
  // CORRECTED: Allow assessmentKey to be either examId or courseAssignmentId
  grades: { [studentId: string]: { [assessmentKey: string]: GradeRecord } };
  educatorId: string;
  companyId: string;
}

export default async function ConsolidatedGradesServerPage({ params }: PageProps) {

  const courseId = (await params).courseId;
  const educatorId = (await params).slug || MOCK_CURRENT_EDUCATOR_ID;

  let gradesPageData: ConsolidatedGradesPageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiUrl}/teacher/courses/${courseId}/grades-data?educatorId=${encodeURIComponent(educatorId)}`,
      { next: { revalidate: 60 } }
    );

    if (res.ok) {
      const data = await res.json();
      gradesPageData = {
        course: data.course,
        students: data.students,
        assessments: data.assessments,
        grades: data.grades,
        educatorId: educatorId,
        companyId: data.companyId, // Ensure companyId is passed from the API response
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