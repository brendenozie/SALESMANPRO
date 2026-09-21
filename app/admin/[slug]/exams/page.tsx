import React from "react";
import AdminExamsOverviewPage, { ExamData, CourseOption, EducatorOption, AcademicLevelOption } from "./AdminExamsOverviewPage";
import { ClassRoomOption } from "../students/StudentsClient";
import { AcademicYear } from "../academic-terms/page";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExamsPage({ params }: PageProps) {
  const { slug } = await params;

  let initialExamCategories: any[] = [];
  let initialExams: ExamData[] = [];
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
    const [sessionRes, examCatsRes, examsRes, coursesRes, educatorsRes, levelsRes, classroomsRes] = await Promise.all([
      serverFetchJson<any>(`/api/admin/academic-years/session?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<any[]>(`/api/admin/exam-categories?schoolId=${encodeURIComponent(companyId)}`),
      serverFetchJson<ExamData[]>(`/api/admin/exams?companyId=${encodeURIComponent(companyId)}`),
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

    if (examCatsRes.success && Array.isArray(examCatsRes.data)) {
      initialExamCategories = examCatsRes.data;
    }

    if (examsRes.success && Array.isArray(examsRes.data)) {
      initialExams = examsRes.data;
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
    console.error("[ExamsPage] Error fetching data:", err);
  }

  return (
    <AdminExamsOverviewPage
      initialExamCategories={initialExamCategories}
      initialExams={initialExams}
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
