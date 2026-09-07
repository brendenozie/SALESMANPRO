import React from "react";
import AssignmentsGradesClient from "./AssignmentsGradesClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: {
    slug: string; // companyId
    assignmentId: string;
  };
  searchParams: {
    courseId?: string;
    classroomId?: string;
  };
}

export default async function AssignmentsGradesPage({ params, searchParams }: PageProps) {
  const { slug, assignmentId } = params;
  const { courseId, classroomId } = searchParams;
  
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

  const cookieHeader = (await cookies()).toString();

  // console.log({
  //   companyId,
  //   assignmentId,
  //   courseId,
  //   classroomId,
  // });

  let initialData: any = null;

  try {
    // Fetch Eligible Students & Existing Grades
    const gradesRes = await fetch(
      `${apiBaseUrl}/admin/grades/eligible?assignmentId=${assignmentId}&courseId=${courseId || ""}&classroomId=${classroomId || ""}`,
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

    return (
      <AssignmentsGradesClient
        assignmentId={assignmentId}
        courseId={courseId || ""}
        classroomId={classroomId}
        companyId={companyId}
        initialStudents={initialData || []}
        examTitle={initialData?.exam?.title || "Assignment Grades"}
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