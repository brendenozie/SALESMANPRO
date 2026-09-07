// app/admin/[slug]/teachers/page.tsx

import React from "react";
import TeachersClient, { EducatorType, DepartmentOption, AcademicLevelOption } from "./TeachersClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface ClassroomOption {
  id: string;
  name: string;
  academicLevelId?: string;
  academicLevel?: AcademicLevelOption;
}
interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data ---
const generateSampleEducatorsData = (companyId: string): {
  sampleEducators: EducatorType[];
  sampleDepartments: DepartmentOption[];
  sampleAcademicLevels: AcademicLevelOption[];
  sampleClassrooms: ClassroomOption[];
} => {
  const academicLevels: AcademicLevelOption[] = [
    // { id: 'AL001', name: 'Playgroup', sortOrder: 1 },
    // { id: 'AL002', name: 'Grade 1', sortOrder: 2 },
    // { id: 'AL003', name: 'Grade 2', sortOrder: 3 },
    // { id: 'AL004', name: 'Grade 7', sortOrder: 8 },
    // { id: 'AL005', name: 'Grade 8', sortOrder: 9 },
    // { id: 'AL006', name: 'Grade 9', sortOrder: 10 },
    // { id: 'AL007', name: 'High School - Freshman', sortOrder: 11 },
    // { id: 'AL008', name: 'University - Year 1', sortOrder: 15 },
  ];

  const classrooms: ClassroomOption[] = [
    // { id: 'CR001', name: 'Room 101', academicLevelId: 'AL004' },
    // { id: 'CR002', name: 'Science Lab A', academicLevelId: 'AL005' },
    // { id: 'CR003', name: 'Main Hall', academicLevelId: 'AL007' },
  ];

  const departments: DepartmentOption[] = [
    // { id: 'D001', name: 'Mathematics' },
    // { id: 'D002', name: 'English' },
    // { id: 'D003', name: 'Science' },
    // { id: 'D004', name: 'History' },
    // { id: 'D005', name: 'Art' },
  ];

  const educators: EducatorType[] = [
    // {
    //   id: 'EDU001',
    //   userId: 'USR001',
    //   loginCode: '700001',
    //   name: 'Mr. John Doe',
    //   email: 'john.doe@school.com',
    //   profilePicture: 'https://placehold.co/100x100/A78BFA/FFFFFF?text=JD',
    //   phone: '+254712345678',
    //   bio: 'Passionate about algebra and geometry. Loves to inspire young minds.',
    //   address: '123 School Rd, Nairobi',
    //   companyId: companyId,
    //   departmentId: 'D001',
    //   departmentName: 'Mathematics',
    //   academicLevels: [ // Renamed from assignedAcademicLevels
    //     { id: 'AL004', name: 'Grade 7' },
    //     { id: 'AL005', name: 'Grade 8' },
    //   ],
    //   academicLevelAssignments: [],
    //   classRooms: [{ id: 'CR001', name: 'Room 101', academicLevelId: 'AL004' }],
    //   totalStudents: 120, // These are now calculated and returned by API, not direct model fields
    //   totalCoursesTaught: 5, // These are now calculated and returned by API, not direct model fields
    //   totalClassesScheduled: 15,
    //   totalExamsCreated: 20,
    //   totalMaterialsUploaded: 50,
    //   totalAttendanceRecords: 300, // Placeholder
    //   totalDiscussionTopics: 10, // Placeholder
    //   totalUploadedMaterials: 50, // Placeholder
    //   totalAssignmentSubmissions: 120, // Placeholder
    //   totalExamSubmissions: 80, // Placeholder
    //   totalGradesRecorded: 500, // Placeholder
    //   createdAt: new Date('2015-08-01').toISOString(),
    //   updatedAt: new Date().toISOString(),
    // },
    // {
    //   id: 'EDU002',
    //   userId: 'USR002',
    //   loginCode: '700002',
    //   name: 'Mrs. Jane Smith',
    //   email: 'jane.smith@school.com',
    //   profilePicture: 'https://placehold.co/100x100/6EE7B7/FFFFFF?text=JS',
    //   phone: '+254723456789',
    //   bio: 'Specializes in classical literature and creative writing.',
    //   address: '456 Avenue, Nairobi',
    //   companyId: companyId,
    //   departmentId: 'D002',
    //   departmentName: 'English',
    //   academicLevels: [ // Renamed from assignedAcademicLevels
    //     { id: 'AL004', name: 'Grade 7' },
    //     { id: 'AL005', name: 'Grade 8' },
    //     { id: 'AL007', name: 'High School - Freshman' },
    //   ],
    //   classRooms: [{ id: 'CR003', name: 'Main Hall', academicLevelId: 'AL007' }],
    //   academicLevelAssignments: [],
    //   totalStudents: 100,
    //   totalCoursesTaught: 4,
    //   totalClassesScheduled: 12,
    //   totalExamsCreated: 18,
    //   totalMaterialsUploaded: 45,
    //   totalAttendanceRecords: 250, // Placeholder
    //   totalDiscussionTopics: 8, // Placeholder
    //   totalUploadedMaterials: 45, // Placeholder
    //   totalAssignmentSubmissions: 100, // Placeholder
    //   totalExamSubmissions: 70, // Placeholder
    //   totalGradesRecorded: 400, // Placeholder
    //   createdAt: new Date('2018-09-01').toISOString(),
    //   updatedAt: new Date().toISOString(),
    // },
    // {
    //   id: 'EDU003',
    //   userId: 'USR003',
    //   loginCode: '700003',
    //   name: 'Dr. Emily White',
    //   email: 'emily.white@school.com',
    //   profilePicture: 'https://placehold.co/100x100/FDBA74/FFFFFF?text=EW',
    //   phone: '+254734567890',
    //   bio: 'Enthusiastic about biology and environmental science. Leads school eco-club.',
    //   address: '789 Park St, Nairobi',
    //   companyId: companyId,
    //   departmentId: 'D003',
    //   departmentName: 'Science',
    //   academicLevels: [ // Renamed from assignedAcademicLevels
    //     { id: 'AL006', name: 'Grade 9' },
    //     { id: 'AL007', name: 'High School - Freshman' },
    //   ],
    //   academicLevelAssignments: [],
    //   classRooms: [{ id: 'CR002', name: 'Science Lab A', academicLevelId: 'AL005' }],
    //   totalStudents: 150,
    //   totalCoursesTaught: 6,
    //   totalClassesScheduled: 18,
    //   totalExamsCreated: 25,
    //   totalMaterialsUploaded: 60,
    //   totalAttendanceRecords: 350, // Placeholder
    //   totalDiscussionTopics: 12, // Placeholder
    //   totalUploadedMaterials: 60, // Placeholder
    //   totalAssignmentSubmissions: 150, // Placeholder
    //   totalExamSubmissions: 100, // Placeholder
    //   totalGradesRecorded: 600, // Placeholder
    //   createdAt: new Date('2020-01-15').toISOString(),
    //   updatedAt: new Date().toISOString(),
    // },
    // {
    //   id: 'EDU004',
    //   userId: 'USR004',
    //   loginCode: '700004',
    //   name: 'Mr. David Green',
    //   email: 'david.green@school.com',
    //   profilePicture: 'https://placehold.co/100x100/94A3B8/FFFFFF?text=DG',
    //   phone: '+254745678901',
    //   bio: 'Expert in world history and ancient civilizations.',
    //   address: '101 Hill Rd, Nairobi',
    //   companyId: companyId,
    //   departmentId: 'D004',
    //   departmentName: 'History',
    //   academicLevels: [ // Renamed from assignedAcademicLevels
    //     { id: 'AL005', name: 'Grade 8' },
    //     { id: 'AL007', name: 'High School - Freshman' },
    //   ],
    //   academicLevelAssignments: [],
    //   classRooms: [{ id: 'CR003', name: 'Main Hall', academicLevelId: 'AL007' }],
    //   totalStudents: 90,
    //   totalCoursesTaught: 3,
    //   totalClassesScheduled: 10,
    //   totalExamsCreated: 15,
    //   totalMaterialsUploaded: 30,
    //   totalAttendanceRecords: 200, // Placeholder
    //   totalDiscussionTopics: 7, // Placeholder
    //   totalUploadedMaterials: 30, // Placeholder
    //   totalAssignmentSubmissions: 90, // Placeholder
    //   totalExamSubmissions: 60, // Placeholder
    //   totalGradesRecorded: 350, // Placeholder
    //   createdAt: new Date('2017-03-10').toISOString(),
    //   updatedAt: new Date().toISOString(),
    // },
  ];

  return { sampleEducators: educators, sampleDepartments: departments, sampleAcademicLevels: academicLevels, sampleClassrooms: classrooms};
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function TeachersManagementPage({ params }: PageProps) {
  const { slug }  = await params;
  const cookieHeader = (await cookies()).toString();

  let initialEducators: EducatorType[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allClassrooms: ClassroomOption[] = [];
  let fetchError: boolean = false;
  
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

  try {
    // Fetch all educators for this company
    const educatorsRes = await fetch(
      `${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`, // Corrected API path
      {
         next: { revalidate: 60 }  // equivalent to SSR on every request
        , headers: { cookie: cookieHeader }
      }
    );
    if (educatorsRes.ok) {
      const data = (await educatorsRes.json()).data;
      initialEducators = data as EducatorType[];
    } else {
      console.error(
        `[TeachersManagementPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all departments for this company (or globally if not company-specific)
    const departmentsRes = await fetch( // Fetch departments via API instead of direct prisma call
      `${apiBaseUrl}/admin/departments?companyId=${encodeURIComponent(companyId)}`, // Assuming departments API exists
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (departmentsRes.ok) {
      const data = (await departmentsRes.json()).data.data;      
      allDepartments = data as DepartmentOption[];
    } else {
      console.error(
        `[TeachersManagementPage] Failed to fetch departments: ${departmentsRes.status} ${departmentsRes.statusText}`
      );
      fetchError = true;
    }

    // NEW: Fetch all academic levels for this company
    const academicLevelsRes = await fetch(
      `${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, // Corrected API path
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (academicLevelsRes.ok) {
      const data = (await academicLevelsRes.json()).data;     
      allAcademicLevels = data as AcademicLevelOption[];
    } else {
      console.error(
        `[TeachersManagementPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`
      );
      fetchError = true;
    }

    const classroomsRes = await fetch(
      `${apiBaseUrl}/admin/classrooms?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (classroomsRes.ok) {
      allClassrooms = (await classroomsRes.json()).data;
    } else {
      console.error(
        `[TeachersManagementPage] Failed to fetch classrooms: ${classroomsRes.status} ${classroomsRes.statusText}`
      );
      // Not setting fetchError to true here, as classrooms are optional
    }

  } catch (err: any) {
    console.error("[TeachersManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  return (
    <TeachersClient
      initialEducators={initialEducators}
      allDepartments={allDepartments}
      allAcademicLevels={allAcademicLevels} // Pass academic levels
      allClassrooms={allClassrooms}
      companyId={companyId}
      apiBaseUrl={apiBaseUrl}
    />
  );
}
