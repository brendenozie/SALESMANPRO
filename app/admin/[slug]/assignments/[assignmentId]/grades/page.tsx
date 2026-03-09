import React from "react";
import AssignmentsGradesClient from "./AssignmentsGradesClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  const { slug: companyId, assignmentId } = params;
  const { courseId, classroomId } = searchParams;

  const cookieHeader = (await cookies()).toString();

  console.log({
    companyId,
    assignmentId,
    courseId,
    classroomId,
  });

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

    console.log("Initial Data →", initialData);

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
    console.error("[ExamGradesPage] Error →", err.message);

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