import React from "react";
import StudentsClient, { StudentType, ParentOption, AcademicLevelOption, StudentLevelStatusOption, ClassRoomOption } from "./StudentsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StudentsManagementPage({ params }: PageProps) {
  const { slug } = await params;

  let initialStudents: StudentType[] = [];
  let allParents: ParentOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allClassRooms: ClassRoomOption[] = [];

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const allStudentLevelStatusOptions: StudentLevelStatusOption[] = [
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'SENIOR', label: 'Senior' },
  ];

  try {
    const [studentsRes, parentsRes, levelsRes, classroomsRes] = await Promise.all([
      serverFetchJson<StudentType[]>(`/api/admin/students?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<ParentOption[]>(`/api/admin/parents?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<AcademicLevelOption[]>(`/api/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<ClassRoomOption[]>(`/api/admin/classrooms?companyId=${encodeURIComponent(companyId)}`)
    ]);

    if (studentsRes.success && Array.isArray(studentsRes.data)) {
      initialStudents = studentsRes.data;
    }
    if (parentsRes.success && Array.isArray(parentsRes.data)) {
      allParents = parentsRes.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        loginCode: p.loginCode
      }));
    }
    if (levelsRes.success && Array.isArray(levelsRes.data)) {
      allAcademicLevels = levelsRes.data;
    }
    if (classroomsRes.success && Array.isArray(classroomsRes.data)) {
      allClassRooms = classroomsRes.data;
    }
  } catch (err: any) {
    console.error("[StudentsManagementPage] Error fetching data:", err);
  }

  return (
    <StudentsClient
      initialStudents={initialStudents}
      allParents={allParents}
      allAcademicLevels={allAcademicLevels}
      allStudentLevelStatusOptions={allStudentLevelStatusOptions}
      allClassRooms={allClassRooms}
      companyId={companyId}
      apiBaseUrl="/api"
    />
  );
}
