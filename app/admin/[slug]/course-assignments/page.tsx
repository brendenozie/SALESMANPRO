// app/admin/[slug]/course-assignments/page.tsx

import React from "react";
import CourseAssignmentsClient, { CourseAssignmentType, CourseOption, AcademicLevelOption } from "./CourseAssignmentsClient";
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // companyId
  };
}

// --- Helper function to generate sample data ---
const generateSampleGlobalAssignmentsData = (companyId: string): {
  sampleAssignments: CourseAssignmentType[];
  sampleCourses: CourseOption[];
  sampleAcademicLevels: AcademicLevelOption[];
} => {
  const academicLevels: AcademicLevelOption[] = [
    { id: 'AL001', name: 'Playgroup', sortOrder: 1 },
    { id: 'AL004', name: 'Grade 7', sortOrder: 7 },
    { id: 'AL006', name: 'Grade 9', sortOrder: 9 },
    { id: 'AL007', name: 'High School - Freshman', sortOrder: 10 },
  ];

  const courses: CourseOption[] = [
    { id: 'CRS001', title: 'Algebra I', instructorName: 'Mr. John Doe', academicLevels: [{ id: 'AL006', name: 'Grade 9' }] },
    { id: 'CRS002', title: 'Literary Analysis', instructorName: 'Mrs. Jane Smith', academicLevels: [{ id: 'AL007', name: 'High School - Freshman' }] },
    { id: 'CRS003', title: 'Introduction to Programming', instructorName: 'Dr. Emily White', academicLevels: [{ id: 'AL006', name: 'Grade 9' }, { id: 'AL007', name: 'High School - Freshman' }] },
    { id: 'CRS004', title: 'Elementary Science', instructorName: 'Dr. Emily White', academicLevels: [{ id: 'AL001', name: 'Playgroup' }, { id: 'AL004', name: 'Grade 7' }] },
  ];

  const assignments: CourseAssignmentType[] = [
    {
      id: 'ASN001',
      courseId: 'CRS001',
      courseTitle: 'Algebra I',
      courseInstructorName: 'Mr. John Doe',
      courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      title: 'Homework 1: Linear Equations',
      description: 'Solve problems 1-10 from page 50 in the textbook.',
      dueDate: new Date('2025-07-05T23:59:59Z'),
      maxGrade: 100,
      assignedAt: new Date('2025-07-01T09:00:00Z'),
      updatedAt: new Date('2025-07-01T09:00:00Z'),
      totalSubmissions: 85,
    },
    {
      id: 'ASN002',
      courseId: 'CRS002',
      courseTitle: 'Literary Analysis',
      courseInstructorName: 'Mrs. Jane Smith',
      courseAcademicLevels: [{ id: 'AL007', name: 'High School - Freshman' }],
      title: 'Essay: Character Analysis of Hamlet',
      description: 'Write a 1000-word essay analyzing the character of Hamlet.',
      dueDate: new Date('2025-07-15T23:59:59Z'),
      maxGrade: 50,
      assignedAt: new Date('2025-07-01T10:00:00Z'),
      updatedAt: new Date('2025-07-01T10:00:00Z'),
      totalSubmissions: 70,
    },
    {
      id: 'ASN003',
      courseId: 'CRS003',
      courseTitle: 'Introduction to Programming',
      courseInstructorName: 'Dr. Emily White',
      courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }, { id: 'AL007', name: 'High School - Freshman' }],
      title: 'Coding Project 1: Simple Calculator',
      description: 'Develop a Python program that functions as a basic calculator.',
      dueDate: new Date('2025-07-20T23:59:59Z'),
      maxGrade: 100,
      assignedAt: new Date('2025-07-03T11:00:00Z'),
      updatedAt: new Date('2025-07-03T11:00:00Z'),
      totalSubmissions: 110,
    },
    {
      id: 'ASN004',
      courseId: 'CRS004',
      courseTitle: 'Elementary Science',
      courseInstructorName: 'Dr. Emily White',
      courseAcademicLevels: [{ id: 'AL001', name: 'Playgroup' }, { id: 'AL004', name: 'Grade 7' }],
      title: 'Science Experiment: Plant Growth',
      description: 'Conduct a simple experiment on plant growth and record observations.',
      dueDate: new Date('2025-07-10T23:59:59Z'),
      maxGrade: 20,
      assignedAt: new Date('2025-07-02T14:00:00Z'),
      updatedAt: new Date('2025-07-02T14:00:00Z'),
      totalSubmissions: 60,
    },
  ];

  return { sampleAssignments: assignments, sampleCourses: courses, sampleAcademicLevels: academicLevels };
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function GlobalCourseAssignmentsManagementPage({ params }: PageProps) {
  const companyId = params.slug;
  const cookieHeader = await cookies().toString();

  let initialAssignments: CourseAssignmentType[] = [];
  let allCourses: CourseOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch all assignments for this company
    const assignmentsRes = await fetch(
      `${apiUrl}/course-assignments?companyId=${encodeURIComponent(companyId)}`,
      { 
        next: { revalidate: 60 },
        headers: { cookie: cookieHeader }
     }
    );
    if (assignmentsRes.ok) {
      initialAssignments = (await assignmentsRes.json()).data as CourseAssignmentType[];
    } else {
      console.error(
        `[GlobalCourseAssignmentsManagementPage] Failed to fetch assignments: ${assignmentsRes.status} ${assignmentsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all courses for this company (for filtering and linking)
    const coursesRes = await fetch(
      `${apiUrl}/courses?companyId=${encodeURIComponent(companyId)}`,
      { 
        next: { revalidate: 60 },
        headers: { cookie: cookieHeader }

     }
    );
    if (coursesRes.ok) {
      const fetchedCourses = (await coursesRes.json()).data as any[]; // Use 'any' for initial fetch, then map
      allCourses = fetchedCourses.map(c => ({
        id: c.id,
        title: c.title,
        instructorName: c.instructorName,
        academicLevels: c.academicLevels, // Include academic levels for course filtering
      }));
    } else {
      console.error(
        `[GlobalCourseAssignmentsManagementPage] Failed to fetch courses: ${coursesRes.status} ${coursesRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all academic levels (for filtering)
    const academicLevelsRes = await fetch(
      `${apiUrl}/academic-levels?companyId=${encodeURIComponent(companyId)}`,
      { 
        next: { revalidate: 60 },
        headers: { cookie: cookieHeader }
       }
    );
    if (academicLevelsRes.ok) {
      allAcademicLevels = (await academicLevelsRes.json()).data as AcademicLevelOption[];
    } else {
      console.error(
        `[GlobalCourseAssignmentsManagementPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`
      );
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[GlobalCourseAssignmentsManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  if (fetchError || initialAssignments.length === 0 || allCourses.length === 0 || allAcademicLevels.length === 0) {
    console.log("[GlobalCourseAssignmentsManagementPage] Using sample data for global course assignments.");
    const { sampleAssignments, sampleCourses, sampleAcademicLevels } = generateSampleGlobalAssignmentsData(companyId);
    initialAssignments = sampleAssignments;
    allCourses = sampleCourses;
    allAcademicLevels = sampleAcademicLevels;
  }

  return (
    <CourseAssignmentsClient
      initialAssignments={initialAssignments}
      allCourses={allCourses}
      allAcademicLevels={allAcademicLevels}
      companyId={companyId}
      apiUrl={apiUrl}
    />
  );
}
