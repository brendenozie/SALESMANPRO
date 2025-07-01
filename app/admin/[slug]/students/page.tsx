// app/admin/[slug]/students/page.tsx

import React from "react";
import StudentsClient, { StudentType, ParentOption, AcademicLevelOption } from "./StudentsClient";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // companyId
  };
}

// --- Helper function to generate sample data ---
const generateSampleStudentsData = (companyId: string): {
  sampleStudents: StudentType[];
  sampleParents: ParentOption[];
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

  const sampleParents: ParentOption[] = [
    { id: 'PAR001', name: 'Mercy Wanjiru', email: 'mercy.w@example.com', phone: '+254711223344', loginCode: '900001' },
    { id: 'PAR002', name: 'David Otieno', email: 'david.o@example.com', phone: '+254722334455', loginCode: '900002' },
    { id: 'PAR003', name: 'Elizabeth Kimani', email: 'elizabeth.k@example.com', phone: '+254733445566', loginCode: '900003' },
    { id: 'PAR004', name: 'Ruth Njoroge', email: 'ruth.n@example.com', phone: '+254744556677', loginCode: '900004' },
    { id: 'PAR005', name: 'Ahmed Hassan', email: 'ahmed.h@example.com', phone: '+254755667788', loginCode: '900005' },
  ];

  const sampleStudents: StudentType[] = [
    {
      id: 'STU001',
      userId: 'USER001',
      loginCode: '100001',
      name: 'Jane Wanjiru',
      email: 'jane.w@school.com',
      profilePicture: 'https://placehold.co/100x100/FFD1DC/FF69B4?text=JW',
      phone: '+254711223344',
      bio: 'Enthusiastic learner with a passion for science.',
      address: '123 Nairobi St, Nairobi',
      companyId: companyId,
      academicLevelId: 'AL004', // Linked to Grade 7
      academicLevelName: 'Grade 7',
      parentId: 'PAR001',
      parentName: 'Mercy Wanjiru',
      parentEmail: 'mercy.w@example.com',
      parentPhone: '+254711223344',
      totalCourses: 3,
      completedCourses: 1,
      certificatesEarned: 0,
      averageProgress: 33.3,
      totalSubmissions: 5,
      totalAttendanceRecords: 20,
      totalExamSubmissions: 2,
      createdAt: new Date('2020-09-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'STU002',
      userId: 'USER002',
      loginCode: '100002',
      name: 'Kevin Otieno',
      email: 'kevin.o@school.com',
      profilePicture: 'https://placehold.co/100x100/C8E6C9/4CAF50?text=KO',
      phone: '+254722334455',
      bio: 'Loves mathematics and coding.',
      address: '456 Mombasa Rd, Nairobi',
      companyId: companyId,
      academicLevelId: 'AL004', // Linked to Grade 7
      academicLevelName: 'Grade 7',
      parentId: 'PAR002',
      parentName: 'David Otieno',
      parentEmail: 'david.o@example.com',
      parentPhone: '+254722334455',
      totalCourses: 2,
      completedCourses: 0,
      certificatesEarned: 0,
      averageProgress: 10.5,
      totalSubmissions: 3,
      totalAttendanceRecords: 18,
      totalExamSubmissions: 1,
      createdAt: new Date('2021-09-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'STU003',
      userId: 'USER003',
      loginCode: '100003',
      name: 'Sarah Kimani',
      email: 'sarah.k@school.com',
      profilePicture: 'https://placehold.co/100x100/B3E5FC/2196F3?text=SK',
      phone: '+254733445566',
      bio: 'Aspiring artist with a keen interest in history.',
      address: '789 Kisumu St, Nairobi',
      companyId: companyId,
      academicLevelId: 'AL006', // Linked to Grade 9
      academicLevelName: 'Grade 9',
      parentId: 'PAR003',
      parentName: 'Elizabeth Kimani',
      parentEmail: 'elizabeth.k@example.com',
      parentPhone: '+254733445566',
      totalCourses: 4,
      completedCourses: 2,
      certificatesEarned: 1,
      averageProgress: 75.0,
      totalSubmissions: 8,
      totalAttendanceRecords: 25,
      totalExamSubmissions: 3,
      createdAt: new Date('2019-09-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'STU004',
      userId: 'USER004',
      loginCode: '100004',
      name: 'Michael Njoroge',
      email: 'michael.n@school.com',
      profilePicture: 'https://placehold.co/100x100/CFD8DC/607D8B?text=MN',
      phone: '+254744556677',
      bio: 'Strong in physics and problem-solving.',
      address: '101 Eldoret Ave, Nairobi',
      companyId: companyId,
      academicLevelId: 'AL005', // Linked to Grade 8
      academicLevelName: 'Grade 8',
      parentId: 'PAR004',
      parentName: 'Ruth Njoroge',
      parentEmail: 'ruth.n@example.com',
      parentPhone: '+254744556677',
      totalCourses: 3,
      completedCourses: 3,
      certificatesEarned: 2,
      averageProgress: 90.0,
      totalSubmissions: 10,
      totalAttendanceRecords: 22,
      totalExamSubmissions: 4,
      createdAt: new Date('2020-09-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleStudents, sampleParents, sampleAcademicLevels: academicLevels };
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function StudentsManagementPage({ params }: PageProps) {
  const companyId = params.slug;

  let initialStudents: StudentType[] = [];
  let allParents: ParentOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = []; // NEW
  let fetchError: boolean = false;

  try {
    // Fetch all students for this company
    const studentsRes = await fetch(
      `${apiUrl}/admin/students?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" } // equivalent to SSR on every request
    );
    if (studentsRes.ok) {
      initialStudents = (await studentsRes.json()) as StudentType[];
    } else {
      // console.error(
      //   `[StudentsManagementPage] Failed to fetch students: ${studentsRes.status} ${studentsRes.statusText}`
      // );
      fetchError = true;
    }

    // Fetch all parents for this company (or globally if not company-specific)
    const parentsRes = await fetch(
      `${apiUrl}/admin/parents?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" }
    );
    if (parentsRes.ok) {
      const parentsData = (await parentsRes.json()) as ParentOption[];
      allParents = parentsData.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        loginCode: p.loginCode
      }));
    } else {
      // console.error(
      //   `[StudentsManagementPage] Failed to fetch parents: ${parentsRes.status} ${parentsRes.statusText}`
      // );
      fetchError = true;
    }

    // NEW: Fetch all academic levels for this company
    const academicLevelsRes = await fetch(
      `${apiUrl}/academic-levels?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" }
    );
    if (academicLevelsRes.ok) {
      allAcademicLevels = (await academicLevelsRes.json()) as AcademicLevelOption[];
    } else {
      // console.error(
      //   `[StudentsManagementPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`
      // );
      fetchError = true;
    }

  } catch (err: any) {
    // console.error("[StudentsManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  if (fetchError || initialStudents.length === 0 || allParents.length === 0 || allAcademicLevels.length === 0) {
    console.log("[StudentsManagementPage] Using sample data for students, parents, and academic levels.");
    const { sampleStudents, sampleParents, sampleAcademicLevels } = generateSampleStudentsData(companyId);
    initialStudents = sampleStudents;
    allParents = sampleParents;
    allAcademicLevels = sampleAcademicLevels;
  }

  return (
    <StudentsClient
      initialStudents={initialStudents}
      allParents={allParents}
      allAcademicLevels={allAcademicLevels} // NEW: Pass academic levels
      companyId={companyId}
      apiUrl={apiUrl}
    />
  );
}
