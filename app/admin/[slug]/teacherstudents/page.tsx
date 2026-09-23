import React from "react";
import TeachersStudentListPage from "./TeachersStudentListPage";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from '@/lib/api/serverFetch';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TeacherStudentsPage({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();
  const teacherId = session?.user?.id;

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  let initialRosters: Record<string, any> = {};

  try {
    if (teacherId) {
      const res = await serverFetchJson(
        `/api/teacher/academic-levels?teacherId=${encodeURIComponent(teacherId)}`
      );

      if (res.ok && res.data?.assignedAcademicLevels?.length > 0) {
        res.data.assignedAcademicLevels.forEach((level: any) => {
          const classKey = level.id || level.name;
          const students = (level.students || []).map((s: any) => ({
            id: s.studentId || s.id,
            name: s.name,
            email: s.email || `${s.name?.toLowerCase().replace(/\s+/g, '.')}@school.com`,
            parentName: s.parentName || "Parent / Guardian",
            parentPhone: s.parentPhone || "N/A",
            status: "Active",
            gradeLevel: level.name || "N/A",
          }));

          initialRosters[classKey] = {
            name: `${level.name}${level.classroom?.name ? ` - ${level.classroom.name}` : ''}`,
            teacher: session.user?.name || "Teacher",
            students: students,
          };
        });
      }
    }
  } catch (err: any) {
    console.error("[TeacherStudentsPage] Failed to fetch academic levels:", err?.message || err);
  }

  return (
    <TeachersStudentListPage
      initialRosters={Object.keys(initialRosters).length > 0 ? initialRosters : undefined}
      educatorName={session?.user?.name || "Teacher"}
      schoolSlug={slug}
    />
  );
}
