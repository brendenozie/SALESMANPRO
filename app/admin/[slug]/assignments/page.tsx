import React from "react";
import AdminAssignmentsOverviewPage, { AssignmentData, CourseOption, EducatorOption, AcademicLevelOption } from "./AdminAssignmentsOverviewPage";
import { ClassRoomOption } from "../students/StudentsClient";
import { AcademicYear } from "../academic-years/page";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AssignmentsPage({ params }: PageProps) {
  const { slug } = await params;

  let initialAssignments: AssignmentData[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allClassRooms: ClassRoomOption[] = [];
  let academicYears: AcademicYear[] = [];
  let activeYearId: string | null = null;
  let activeTermId: string | null = null;

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  try {
    const [sessionRes, examsRes, coursesRes, educatorsRes, levelsRes, classroomsRes] = await Promise.all([
      serverFetchJson<any>(`/api/admin/academic-years/session?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<any>(`/api/admin/course-assignments?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<CourseOption[]>(`/api/admin/courses?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<EducatorOption[]>(`/api/admin/educators?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<AcademicLevelOption[]>(`/api/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<ClassRoomOption[]>(`/api/admin/classrooms?companyId=${encodeURIComponent(companyId)}`),
    ]);

    if (sessionRes.success && sessionRes.data) {
      academicYears = sessionRes.data.academicYears || [];
      activeYearId = sessionRes.data.activeAcademicYearId || null;
      activeTermId = sessionRes.data.activeTermId || null;
    }

    if (examsRes.success && examsRes.data) {
      initialAssignments = (examsRes.data.assignments || examsRes.data) as AssignmentData[];
    }

    if (coursesRes.success && Array.isArray(coursesRes.data)) {
      allCourses = coursesRes.data;
    }

    if (educatorsRes.success && Array.isArray(educatorsRes.data)) {
      allEducators = educatorsRes.data;
    }

    if (levelsRes.success && Array.isArray(levelsRes.data)) {
      allAcademicLevels = levelsRes.data;
    }

    if (classroomsRes.success && Array.isArray(classroomsRes.data)) {
      allClassRooms = classroomsRes.data;
    }
  } catch (err: any) {
    console.error("[AssignmentsPage] Error fetching data:", err);
  }

  return (
    <AdminAssignmentsOverviewPage
      initialAssignments={initialAssignments}
      allCourses={allCourses}
      allEducators={allEducators}
      allAcademicLevels={allAcademicLevels}
      allClassRooms={allClassRooms}
      companyId={companyId}
      activeAcademicYearId={activeYearId}
      activeTermId={activeTermId}
      academicYears={academicYears}
    />
  );
}
