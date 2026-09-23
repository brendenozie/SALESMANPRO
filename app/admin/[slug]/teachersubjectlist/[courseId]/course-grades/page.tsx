// app/admin/[slug]/teacher-classes/[courseId]/consolidated-grades/page.tsx

import React from "react";
import ConsolidatedGradesPageClient from "./ConsolidatedGradesPageClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator ID

// interface PageProps {
//   params: Promise<{
//     slug: string; // companyId
//     courseId: string;
//   }>;
// }
interface PageProps {
  params: { courseId: string; slug: string };
  searchParams: { classroomId?: string; scheduleId?: string };
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

import Link from "next/link";
import { serverFetchJson } from "@/lib/api/serverFetch";

export default async function ConsolidatedGradesServerPage({ params, searchParams }: PageProps) {
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

  let gradesPageData: ConsolidatedGradesPageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await serverFetchJson<ConsolidatedGradesPageData>(
      `/api/teacher/courses/${courseId}/grades-data?educatorId=${encodeURIComponent(educatorId)}&classroomId=${encodeURIComponent(classroomId)}&scheduleId=${encodeURIComponent(scheduleId)}`
    );

    if (res.ok && res.data) {
      const data = res.data;
      gradesPageData = {
        course: data.course,
        students: data.students,
        assessments: data.assessments,
        grades: data.grades,
        educatorId: educatorId,
        companyId: companyId,
      };
    } else {
      fetchError = res.error || res.message || "Failed to fetch grades data";
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