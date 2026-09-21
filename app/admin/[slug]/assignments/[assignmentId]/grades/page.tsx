import React from "react";
import AssignmentsGradesClient from "./AssignmentsGradesClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{
    slug: string;
    assignmentId: string;
  }>;
  searchParams: Promise<{
    courseId?: string;
    classroomId?: string;
  }>;
}

export default async function AssignmentsGradesPage({ params, searchParams }: PageProps) {
  const { slug, assignmentId } = await params;
  const { courseId, classroomId } = await searchParams;
  
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;
  let initialData: any = null;

  try {
    const gradesRes = await serverFetchJson<any>(
      `/api/admin/grades/eligible?assignmentId=${assignmentId}&courseId=${courseId || ""}&classroomId=${classroomId || ""}`
    );

    if (gradesRes.success && gradesRes.data) {
      initialData = gradesRes.data;
    }
  } catch (err: any) {
    console.error("[AssignmentsGradesPage] Error fetching grades:", err);
  }

  return (
    <AssignmentsGradesClient
      assignmentId={assignmentId}
      courseId={courseId || ""}
      classroomId={classroomId}
      companyId={companyId}
      initialStudents={initialData?.students || initialData || []}
      examTitle={initialData?.exam?.title || "Assignment Grades"}
    />
  );
}