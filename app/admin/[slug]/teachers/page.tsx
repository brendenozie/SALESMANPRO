// app/admin/[slug]/teachers/page.tsx

import React from "react";
import TeachersClient, { EducatorType, DepartmentOption, AcademicLevelOption } from "./TeachersClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // companyId
  };
}

// --- Helper function to generate sample data ---
const generateSampleEducatorsData = (companyId: string): {
  sampleEducators: EducatorType[];
  sampleDepartments: DepartmentOption[];
  sampleAcademicLevels: AcademicLevelOption[];
} => {
  const academicLevels: AcademicLevelOption[] = [
    { id: 'AL001', name: 'Playgroup', sortOrder: 1 },
    { id: 'AL002', name: 'Grade 1', sortOrder: 2 },
    { id: 'AL003', name: 'Grade 2', sortOrder: 3 },
    { id: 'AL004', name: 'Grade 7', sortOrder: 8 },
    { id: 'AL005', name: 'Grade 8', sortOrder: 9 },
    { id: 'AL006', name: 'Grade 9', sortOrder: 10 },
    { id: 'AL007', name: 'High School - Freshman', sortOrder: 11 },
    { id: 'AL008', name: 'University - Year 1', sortOrder: 15 },
  ];

  const departments: DepartmentOption[] = [
    { id: 'D001', name: 'Mathematics' },
    { id: 'D002', name: 'English' },
    { id: 'D003', name: 'Science' },
    { id: 'D004', name: 'History' },
    { id: 'D005', name: 'Art' },
  ];

  const educators: EducatorType[] = [
    {
      id: 'EDU001',
      userId: 'USR001',
      loginCode: '700001',
      name: 'Mr. John Doe',
      email: 'john.doe@school.com',
      profilePicture: 'https://placehold.co/100x100/A78BFA/FFFFFF?text=JD',
      phone: '+254712345678',
      bio: 'Passionate about algebra and geometry. Loves to inspire young minds.',
      address: '123 School Rd, Nairobi',
      companyId: companyId,
      departmentId: 'D001',
      departmentName: 'Mathematics',
      academicLevels: [ // Renamed from assignedAcademicLevels
        { id: 'AL004', name: 'Grade 7' },
        { id: 'AL005', name: 'Grade 8' },
      ],
      totalStudents: 120, // These are now calculated and returned by API, not direct model fields
      totalCoursesTaught: 5, // These are now calculated and returned by API, not direct model fields
      totalClassesScheduled: 15,
      totalExamsCreated: 20,
      totalMaterialsUploaded: 50,
      totalAttendanceRecords: 300, // Placeholder
      totalDiscussionTopics: 10, // Placeholder
      totalUploadedMaterials: 50, // Placeholder
      totalAssignmentSubmissions: 120, // Placeholder
      totalExamSubmissions: 80, // Placeholder
      totalGradesRecorded: 500, // Placeholder
      createdAt: new Date('2015-08-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'EDU002',
      userId: 'USR002',
      loginCode: '700002',
      name: 'Mrs. Jane Smith',
      email: 'jane.smith@school.com',
      profilePicture: 'https://placehold.co/100x100/6EE7B7/FFFFFF?text=JS',
      phone: '+254723456789',
      bio: 'Specializes in classical literature and creative writing.',
      address: '456 Avenue, Nairobi',
      companyId: companyId,
      departmentId: 'D002',
      departmentName: 'English',
      academicLevels: [ // Renamed from assignedAcademicLevels
        { id: 'AL004', name: 'Grade 7' },
        { id: 'AL005', name: 'Grade 8' },
        { id: 'AL007', name: 'High School - Freshman' },
      ],
      totalStudents: 100,
      totalCoursesTaught: 4,
      totalClassesScheduled: 12,
      totalExamsCreated: 18,
      totalMaterialsUploaded: 45,
      totalAttendanceRecords: 250, // Placeholder
      totalDiscussionTopics: 8, // Placeholder
      totalUploadedMaterials: 45, // Placeholder
      totalAssignmentSubmissions: 100, // Placeholder
      totalExamSubmissions: 70, // Placeholder
      totalGradesRecorded: 400, // Placeholder
      createdAt: new Date('2018-09-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'EDU003',
      userId: 'USR003',
      loginCode: '700003',
      name: 'Dr. Emily White',
      email: 'emily.white@school.com',
      profilePicture: 'https://placehold.co/100x100/FDBA74/FFFFFF?text=EW',
      phone: '+254734567890',
      bio: 'Enthusiastic about biology and environmental science. Leads school eco-club.',
      address: '789 Park St, Nairobi',
      companyId: companyId,
      departmentId: 'D003',
      departmentName: 'Science',
      academicLevels: [ // Renamed from assignedAcademicLevels
        { id: 'AL006', name: 'Grade 9' },
        { id: 'AL007', name: 'High School - Freshman' },
      ],
      totalStudents: 150,
      totalCoursesTaught: 6,
      totalClassesScheduled: 18,
      totalExamsCreated: 25,
      totalMaterialsUploaded: 60,
      totalAttendanceRecords: 350, // Placeholder
      totalDiscussionTopics: 12, // Placeholder
      totalUploadedMaterials: 60, // Placeholder
      totalAssignmentSubmissions: 150, // Placeholder
      totalExamSubmissions: 100, // Placeholder
      totalGradesRecorded: 600, // Placeholder
      createdAt: new Date('2020-01-15').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'EDU004',
      userId: 'USR004',
      loginCode: '700004',
      name: 'Mr. David Green',
      email: 'david.green@school.com',
      profilePicture: 'https://placehold.co/100x100/94A3B8/FFFFFF?text=DG',
      phone: '+254745678901',
      bio: 'Expert in world history and ancient civilizations.',
      address: '101 Hill Rd, Nairobi',
      companyId: companyId,
      departmentId: 'D004',
      departmentName: 'History',
      academicLevels: [ // Renamed from assignedAcademicLevels
        { id: 'AL005', name: 'Grade 8' },
        { id: 'AL007', name: 'High School - Freshman' },
      ],
      totalStudents: 90,
      totalCoursesTaught: 3,
      totalClassesScheduled: 10,
      totalExamsCreated: 15,
      totalMaterialsUploaded: 30,
      totalAttendanceRecords: 200, // Placeholder
      totalDiscussionTopics: 7, // Placeholder
      totalUploadedMaterials: 30, // Placeholder
      totalAssignmentSubmissions: 90, // Placeholder
      totalExamSubmissions: 60, // Placeholder
      totalGradesRecorded: 350, // Placeholder
      createdAt: new Date('2017-03-10').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleEducators: educators, sampleDepartments: departments, sampleAcademicLevels: academicLevels };
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function TeachersManagementPage({ params }: PageProps) {
  const { slug : companyId } = await params;

  let initialEducators: EducatorType[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch all educators for this company
    const educatorsRes = await fetch(
      `${apiUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`, // Corrected API path
      { next: { revalidate: 60 } } // equivalent to SSR on every request
    );
    if (educatorsRes.ok) {
      initialEducators = (await educatorsRes.json()) as EducatorType[];
    } else {
      console.error(
        `[TeachersManagementPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all departments for this company (or globally if not company-specific)
    const departmentsRes = await fetch( // Fetch departments via API instead of direct prisma call
      `${apiUrl}/admin/departments?companyId=${encodeURIComponent(companyId)}`, // Assuming departments API exists
      { next: { revalidate: 60 } }
    );
    if (departmentsRes.ok) {
      allDepartments = (await departmentsRes.json()) as DepartmentOption[];
    } else {
      console.error(
        `[TeachersManagementPage] Failed to fetch departments: ${departmentsRes.status} ${departmentsRes.statusText}`
      );
      fetchError = true;
    }


    // NEW: Fetch all academic levels for this company
    const academicLevelsRes = await fetch(
      `${apiUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, // Corrected API path
      { next: { revalidate: 60 } }
    );
    if (academicLevelsRes.ok) {
      allAcademicLevels = (await academicLevelsRes.json()) as AcademicLevelOption[];
    } else {
      console.error(
        `[TeachersManagementPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`
      );
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[TeachersManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  if (fetchError || initialEducators.length === 0 || allDepartments.length === 0 || allAcademicLevels.length === 0) {
    console.log("[TeachersManagementPage] Using sample data for educators, departments, and academic levels.");
    const { sampleEducators, sampleDepartments, sampleAcademicLevels } = generateSampleEducatorsData(companyId);
    initialEducators = sampleEducators;
    allDepartments = sampleDepartments;
    allAcademicLevels = sampleAcademicLevels;
  }

  return (
    <TeachersClient
      initialEducators={initialEducators}
      allDepartments={allDepartments}
      allAcademicLevels={allAcademicLevels} // Pass academic levels
      companyId={companyId}
      apiUrl={apiUrl}
    />
  );
}
