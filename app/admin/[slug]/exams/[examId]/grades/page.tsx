import React from "react";
import ExamGradesClient from "./ExamGradesClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: {
    slug: string; // companyId
    examId: string;
  };
  searchParams: {
    courseId?: string;
    classroomId?: string;
    academicYearId?: string;
    termId?: string;
  };
}

export default async function ExamGradesPage({ params, searchParams }: PageProps) {
  const { slug, examId } = params;
  const { courseId, classroomId, academicYearId, termId } = searchParams;

  const cookieHeader = (await cookies()).toString();


      const session = await getAuthSession();
    
      // 1. Safely resolve the exact same identifier used in AdminStoreLayout
      const identifier = slug || session?.user?.id || '';
    
      // 2. Retrieve the memoized company data (no extra DB cost)
      const company = await findCompanyCached(identifier, "page");
    
      if (!company) {
        return <div>Company not found</div>;
      }
    
      // Use the actual database ID for your API calls, ensuring consistency
      const companyId = company.id;

  // console.log({
  //   companyId,
  //   examId,
  //   courseId,
  //   classroomId,
  //   academicYearId,
  //   termId,
  // });

  let initialData: any = null;

  try {
    // Fetch Eligible Students & Existing Grades
    const gradesRes = await fetch(
      `${apiBaseUrl}/admin/grades/eligible?examId=${examId}&courseId=${courseId || ""}&classroomId=${classroomId || ""}`,
      {
        cache: "no-store",
        headers: {
          cookie: cookieHeader,
        },
      }
    );

    if (gradesRes.ok) {
      initialData = (await gradesRes.json()).data;
    }

    // console.log("Initial Data →", initialData);

    return (
      <ExamGradesClient
        examId={examId}
        courseId={courseId || ""}
        classroomId={classroomId}
        companyId={companyId}
        initialStudents={initialData || []}
        examTitle={initialData?.exam?.title || "Exam"}
        academicYearId={academicYearId}
        termId={termId}
      />
    );
  } catch (err: any) {
    // console.error("[ExamGradesPage] Error →", err.message);

    return (
      <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
        <h2 className="text-xl font-bold">Grade Loading Error</h2>
        <p className="mt-2 text-sm">
          Could not initialize grading sheet. Please check if the exam exists.
        </p>
      </div>
    );
  }
}