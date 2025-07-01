// app/admin/[slug]/teachers/page.tsx

import React from "react";
import TeachersClient, { EducatorType, DepartmentOption } from "./TeachersClient";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

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
} => {
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
      name: 'Mr. John Doe',
      email: 'john.doe@school.com',
      profilePicture: 'https://placehold.co/100x100/A78BFA/FFFFFF?text=JD',
      phone: '+254712345678',
      bio: 'Passionate about algebra and geometry. Loves to inspire young minds.',
      address: '123 School Rd, Nairobi',
      companyId: companyId,
      departmentId: 'D001',
      departmentName: 'Mathematics',
      totalStudents: 120,
      totalCoursesTaught: 5,
      totalClassesScheduled: 15,
      totalExamsCreated: 20,
      totalMaterialsUploaded: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'EDU002',
      userId: 'USR002',
      name: 'Mrs. Jane Smith',
      email: 'jane.smith@school.com',
      profilePicture: 'https://placehold.co/100x100/6EE7B7/FFFFFF?text=JS',
      phone: '+254723456789',
      bio: 'Specializes in classical literature and creative writing.',
      address: '456 Avenue, Nairobi',
      companyId: companyId,
      departmentId: 'D002',
      departmentName: 'English',
      totalStudents: 100,
      totalCoursesTaught: 4,
      totalClassesScheduled: 12,
      totalExamsCreated: 18,
      totalMaterialsUploaded: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'EDU003',
      userId: 'USR003',
      name: 'Dr. Emily White',
      email: 'emily.white@school.com',
      profilePicture: 'https://placehold.co/100x100/FDBA74/FFFFFF?text=EW',
      phone: '+254734567890',
      bio: 'Enthusiastic about biology and environmental science. Leads school eco-club.',
      address: '789 Park St, Nairobi',
      companyId: companyId,
      departmentId: 'D003',
      departmentName: 'Science',
      totalStudents: 150,
      totalCoursesTaught: 6,
      totalClassesScheduled: 18,
      totalExamsCreated: 25,
      totalMaterialsUploaded: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'EDU004',
      userId: 'USR004',
      name: 'Mr. David Green',
      email: 'david.green@school.com',
      profilePicture: 'https://placehold.co/100x100/94A3B8/FFFFFF?text=DG',
      phone: '+254745678901',
      bio: 'Expert in world history and ancient civilizations.',
      address: '101 Hill Rd, Nairobi',
      companyId: companyId,
      departmentId: 'D004',
      departmentName: 'History',
      totalStudents: 90,
      totalCoursesTaught: 3,
      totalClassesScheduled: 10,
      totalExamsCreated: 15,
      totalMaterialsUploaded: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleEducators: educators, sampleDepartments: departments };
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function TeachersManagementPage({ params }: PageProps) {
  const companyId = params.slug;

  let initialEducators: EducatorType[] = [];
  let allDepartments: DepartmentOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch all educators for this company
    const educatorsRes = await fetch(
      `${apiUrl}/educators?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" } // equivalent to SSR on every request
    );
    if (educatorsRes.ok) {
      initialEducators = (await educatorsRes.json()) as EducatorType[];
    } else {
      // console.error(
      //   `[TeachersManagementPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`
      // );
      fetchError = true;
    }

    // Fetch all departments for this company (or globally if not company-specific)
    // Assuming Department model has a companyId or is global
    const departmentsFromDb = await prisma.department.findMany({
      where: { companyId: companyId }, // Assuming departments are company-specific
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    allDepartments = departmentsFromDb as DepartmentOption[];

  } catch (err: any) {
    //console.error("[TeachersManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  if (fetchError || initialEducators.length === 0 || allDepartments.length === 0) {
    console.log("[TeachersManagementPage] Using sample data for educators and departments.");
    const { sampleEducators, sampleDepartments } = generateSampleEducatorsData(companyId);
    initialEducators = sampleEducators;
    allDepartments = sampleDepartments;
  }

  return (
    <TeachersClient
      initialEducators={initialEducators}
      allDepartments={allDepartments}
      companyId={companyId}
      apiUrl={apiUrl}
    />
  );
}
