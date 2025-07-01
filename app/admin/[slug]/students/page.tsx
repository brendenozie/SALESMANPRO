// app/admin/[slug]/students/page.tsx

import React from "react";
import StudentsClient, { StudentType } from "./StudentsClient";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // companyId
  };
}

// --- Helper function to generate sample data ---
const generateSampleStudentsData = (companyId: string): StudentType[] => {
  const sampleStudents: StudentType[] = [
    {
      id: 'STU001',
      userId: 'USER001',
      loginCode: '100001', // Sample login code
      name: 'Jane Wanjiru',
      email: 'jane.w@school.com',
      profilePicture: 'https://placehold.co/100x100/FFD1DC/FF69B4?text=JW',
      phone: '+254711223344',
      bio: 'Enthusiastic learner with a passion for science.',
      address: '123 Nairobi St, Nairobi',
      companyId: companyId,
      studentGrade: '8',
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
      loginCode: '100002', // Sample login code
      name: 'Kevin Otieno',
      email: 'kevin.o@school.com',
      profilePicture: 'https://placehold.co/100x100/C8E6C9/4CAF50?text=KO',
      phone: '+254722334455',
      bio: 'Loves mathematics and coding.',
      address: '456 Mombasa Rd, Nairobi',
      companyId: companyId,
      studentGrade: '7',
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
      loginCode: '100003', // Sample login code
      name: 'Sarah Kimani',
      email: 'sarah.k@school.com',
      profilePicture: 'https://placehold.co/100x100/B3E5FC/2196F3?text=SK',
      phone: '+254733445566',
      bio: 'Aspiring artist with a keen interest in history.',
      address: '789 Kisumu St, Nairobi',
      companyId: companyId,
      studentGrade: '9',
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
      loginCode: '100004', // Sample login code
      name: 'Michael Njoroge',
      email: 'michael.n@school.com',
      profilePicture: 'https://placehold.co/100x100/CFD8DC/607D8B?text=MN',
      phone: '+254744556677',
      bio: 'Strong in physics and problem-solving.',
      address: '101 Eldoret Ave, Nairobi',
      companyId: companyId,
      studentGrade: '8',
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

  return sampleStudents;
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
      console.error(
        `[StudentsManagementPage] Failed to fetch students: ${studentsRes.status} ${studentsRes.statusText}`
      );
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[StudentsManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  if (fetchError || initialStudents.length === 0) {
    console.log("[StudentsManagementPage] Using sample data for students.");
    initialStudents = generateSampleStudentsData(companyId);
  }

  return (
    <StudentsClient
      initialStudents={initialStudents}
      companyId={companyId}
      apiUrl={apiUrl}
    />
  );
}