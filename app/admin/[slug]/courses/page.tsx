// app/admin/[slug]/courses/page.tsx

import React from "react";
import CoursesClient, { CourseType, EducatorOption, DepartmentOption, AcademicLevelOption } from "./CoursesClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data ---
const generateSampleCoursesData = (companyId: string): {
  sampleCourses: CourseType[];
  sampleEducators: EducatorOption[];
  sampleDepartments: DepartmentOption[];
  sampleAcademicLevels: AcademicLevelOption[];
} => {
  const academicLevels: AcademicLevelOption[] = [
    { id: 'AL001', name: 'Playgroup', sortOrder: 1 },
    { id: 'AL002', name: 'Kindergarten', sortOrder: 2 },
    { id: 'AL003', name: 'Grade 1', sortOrder: 3 },
    { id: 'AL004', name: 'Grade 7', sortOrder: 7 },
    { id: 'AL005', name: 'Grade 8', sortOrder: 8 },
    { id: 'AL006', name: 'Grade 9', sortOrder: 9 },
    { id: 'AL007', name: 'High School - Freshman', sortOrder: 10 },
    { id: 'AL008', name: 'University - Year 1', sortOrder: 15 },
  ];

  const educators: EducatorOption[] = [
    { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com' },
    { id: 'EDU002', name: 'Mrs. Jane Smith', email: 'jane.smith@school.com' },
    { id: 'EDU003', name: 'Dr. Emily White', email: 'emily.white@school.com' },
  ];

  const departments: DepartmentOption[] = [
    { id: 'D001', name: 'Mathematics' },
    { id: 'D002', name: 'English' },
    { id: 'D003', name: 'Science' },
    { id: 'D004', name: 'History' },
    { id: 'D005', name: 'Computer Science' },
  ];

  const courses: CourseType[] = [
    {
      id: 'CRS001',
      title: 'Algebra II',
      description: 'Foundational course in algebraic concepts, including linear equations, inequalities, and functions.',
      imageUrl: 'https://placehold.co/100x100/ADD8E6/00008B?text=Alg',
      code: 'MATH101', // NEW
      credits: 3, // NEW
      rating: 4.5,
      totalLessons: 45,
      studentsEnrolled: 120,
      companyId: companyId,
      departmentId: 'D001',
      departmentName: 'Mathematics',
      academicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      educators: [{ id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com', roleInCourse: 'Lead Instructor' }], // NEW: educators array
      createdAt: new Date('2023-01-15').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CRS002',
      title: 'Literary Analysis',
      description: 'Exploration of various literary genres and critical analysis techniques, focusing on classic and contemporary works.',
      imageUrl: 'https://placehold.co/100x100/FFB6C1/A52A2A?text=Lit',
      code: 'ENG201', // NEW
      credits: 3, // NEW
      rating: 4.7,
      totalLessons: 45,
      studentsEnrolled: 95,
      companyId: companyId,
      departmentId: 'D002',
      departmentName: 'English',
      academicLevels: [{ id: 'AL007', name: 'High School - Freshman' }],
      educators: [{ id: 'EDU002', name: 'Mrs. Jane Smith', email: 'jane.smith@school.com', roleInCourse: 'Lead Instructor' }], // NEW: educators array
      createdAt: new Date('2023-02-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CRS003',
      title: 'Introduction to Programming',
      description: 'Fundamentals of programming logic and Python, covering basic data structures and algorithms.',
      imageUrl: 'https://placehold.co/100x100/98FB98/006400?text=Code',
      code: 'CS101', // NEW
      credits: 4, // NEW
      totalLessons: 45,
      rating: 4.8,
      studentsEnrolled: 150,
      companyId: companyId,
      departmentId: 'D005',
      departmentName: 'Computer Science',
      academicLevels: [
        { id: 'AL006', name: 'Grade 9' },
        { id: 'AL007', name: 'High School - Freshman' },
      ],
      educators: [
        { id: 'EDU003', name: 'Dr. Emily White', email: 'emily.white@school.com', roleInCourse: 'Lead Instructor' },
        { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com', roleInCourse: 'Assistant' },
      ], // NEW: multiple educators
      createdAt: new Date('2023-03-10').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CRS004',
      title: 'Elementary Science',
      description: 'Basic scientific concepts for younger students, including nature, simple experiments, and the environment.',
      imageUrl: 'https://placehold.co/100x100/B0E0E6/4682B4?text=Sci',
      code: 'SCI100', // NEW
      credits: 2, // NEW
      rating: 4.2,
      totalLessons: 45,
      studentsEnrolled: 80,
      companyId: companyId,
      departmentId: 'D003',
      departmentName: 'Science',
      academicLevels: [
        { id: 'AL001', name: 'Playgroup' },
        { id: 'AL002', name: 'Kindergarten' },
        { id: 'AL003', name: 'Grade 1' },
      ],
      educators: [{ id: 'EDU003', name: 'Dr. Emily White', email: 'emily.white@school.com', roleInCourse: 'Lead Instructor' }], // NEW: educators array
      createdAt: new Date('2023-04-05').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleCourses: courses, sampleEducators: educators, sampleDepartments: departments, sampleAcademicLevels: academicLevels };
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function AdminCoursesPage({ params }: PageProps) {
  const { slug : companyId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialCourses: CourseType[] = [];
  let allEducators: EducatorOption[] = [];
  let allDepartments: DepartmentOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch all courses for this company
    const coursesRes = await fetch(
      `${apiBaseUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } } // equivalent to SSR on every request
    );
    if (coursesRes.ok) {
      initialCourses = (await coursesRes.json()).data as CourseType[];
    } else {
      console.error(
        `[AdminCoursesPage] Failed to fetch courses: ${coursesRes.status} ${coursesRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all educators for this company
    const educatorsRes = await fetch(
      `${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (educatorsRes.ok) {
      const fetchedEducators = (await educatorsRes.json()).data as any[]; // Use 'any' for initial fetch, then map
      allEducators = fetchedEducators.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
      }));
    } else {
      console.error(
        `[AdminCoursesPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all departments for this company
    const departmentsRes = await fetch(
      `${apiBaseUrl}/admin/departments?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (departmentsRes.ok) {
      allDepartments = (await departmentsRes.json()).data as DepartmentOption[];
    } else {
      console.error(
        `[AdminCoursesPage] Failed to fetch departments: ${departmentsRes.status} ${departmentsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all academic levels for this company
    const academicLevelsRes = await fetch(
      `${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (academicLevelsRes.ok) {
      allAcademicLevels = (await academicLevelsRes.json()).data as AcademicLevelOption[];
    } else {
      console.error(
        `[AdminCoursesPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`
      );
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[AdminCoursesPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  if (fetchError && initialCourses.length === 0 && allEducators.length === 0 && allDepartments.length === 0 && allAcademicLevels.length === 0) {
    console.log("[AdminCoursesPage] Using sample data for courses, educators, departments, and academic levels.");
    const { sampleCourses, sampleEducators, sampleDepartments, sampleAcademicLevels } = generateSampleCoursesData(companyId);
    initialCourses = sampleCourses;
    allEducators = sampleEducators;
    allDepartments = sampleDepartments;
    allAcademicLevels = sampleAcademicLevels;
  }

  return (
    <CoursesClient
      initialCourses={initialCourses}
      allEducators={allEducators}
      allDepartments={allDepartments}
      allAcademicLevels={allAcademicLevels}
      companyId={companyId}
      apiBaseUrl={apiBaseUrl}
    />
  );
}
