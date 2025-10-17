// app/admin/[slug]/materials/page.tsx

import React from "react";
import MaterialsGlobalClient, { CourseMaterialType, CourseOption, EducatorOption, AcademicLevelOption } from "./MaterialsGlobalClient";
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data ---
const generateSampleGlobalMaterialsData = (companyId: string): {
  sampleMaterials: CourseMaterialType[];
  sampleCourses: CourseOption[];
  sampleEducators: EducatorOption[];
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

  const courses: CourseOption[] = [
    { id: 'CRS001', title: 'Algebra I', instructorName: 'Mr. John Doe', academicLevels: [{ id: 'AL006', name: 'Grade 9' }] },
    { id: 'CRS002', title: 'Literary Analysis', instructorName: 'Mrs. Jane Smith', academicLevels: [{ id: 'AL007', name: 'High School - Freshman' }] },
    { id: 'CRS003', title: 'Introduction to Programming', instructorName: 'Dr. Emily White', academicLevels: [{ id: 'AL006', name: 'Grade 9' }, { id: 'AL007', name: 'High School - Freshman' }] },
    { id: 'CRS004', title: 'Elementary Science', instructorName: 'Dr. Emily White', academicLevels: [{ id: 'AL001', name: 'Playgroup' }, { id: 'AL002', name: 'Kindergarten' }] },
  ];

  const materials: CourseMaterialType[] = [
    {
      id: 'MAT001',
      courseId: 'CRS001',
      courseTitle: 'Algebra I',
      title: 'Lecture 1: Introduction to Algebra',
      description: 'Overview of basic algebraic concepts and terms.',
      fileUrl: 'https://example.com/lecture1_notes.pdf',
      linkUrl: null,
      type: 'DOCUMENT',
      uploadedById: 'EDU001',
      uploadedByName: 'Mr. John Doe',
      uploadedByEmail: 'john.doe@school.com',
      createdAt: new Date('2023-01-20').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MAT002',
      courseId: 'CRS001',
      courseTitle: 'Algebra I',
      title: 'Video: Solving Linear Equations',
      description: 'Step-by-step guide to solving linear equations.',
      fileUrl: null,
      linkUrl: 'https://www.youtube.com/watch?v=linear_equations_example',
      type: 'VIDEO',
      uploadedById: 'EDU001',
      uploadedByName: 'Mr. John Doe',
      uploadedByEmail: 'john.doe@school.com',
      createdAt: new Date('2023-01-22').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MAT003',
      courseId: 'CRS002',
      courseTitle: 'Literary Analysis',
      title: 'Elements of a Story Handout',
      description: 'Handout defining plot, character, setting, and theme. Useful for literary analysis.',
      fileUrl: 'https://example.com/CL102_ElementsOfStory.pdf',
      linkUrl: null,
      type: 'DOCUMENT',
      uploadedById: 'EDU002',
      uploadedByName: 'Mrs. Jane Smith',
      uploadedByEmail: 'jane.smith@school.com',
      createdAt: new Date('2023-06-15').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MAT004',
      courseId: 'CRS003',
      courseTitle: 'Introduction to Programming',
      title: 'Python Basics Tutorial',
      description: 'Interactive tutorial for beginners on Python programming.',
      fileUrl: null,
      linkUrl: 'https://www.codecademy.com/learn/learn-python-3',
      type: 'LINK',
      uploadedById: 'EDU003',
      uploadedByName: 'Dr. Emily White',
      uploadedByEmail: 'emily.white@school.com',
      createdAt: new Date('2023-03-20').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MAT005',
      courseId: 'CRS004',
      courseTitle: 'Elementary Science',
      title: 'Animal Kingdom Flashcards',
      description: 'Digital flashcards with images and facts about various animals.',
      fileUrl: 'https://placehold.co/400x300/FFD700/000000?text=Animals',
      linkUrl: null,
      type: 'IMAGE',
      uploadedById: 'EDU003',
      uploadedByName: 'Dr. Emily White',
      uploadedByEmail: 'emily.white@school.com',
      createdAt: new Date('2023-04-10').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleMaterials: materials, sampleCourses: courses, sampleEducators: educators, sampleAcademicLevels: academicLevels };
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function GlobalCourseMaterialsManagementPage({ params }: PageProps) {
  const { slug : companyId } = await params;
  const cookieHeader = await cookies().toString();

  let initialMaterials: CourseMaterialType[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch all materials for this company
    // The API route /api/course-materials now supports filtering by companyId
    const materialsRes = await fetch(
      `${apiUrl}/course-materials?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (materialsRes.ok) {
      initialMaterials = (await materialsRes.json()).data as CourseMaterialType[];
    } else {
      console.error(
        `[GlobalCourseMaterialsManagementPage] Failed to fetch materials: ${materialsRes.status} ${materialsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all courses for this company (for filtering and linking)
    const coursesRes = await fetch(
      `${apiUrl}/courses?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
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
        `[GlobalCourseMaterialsManagementPage] Failed to fetch courses: ${coursesRes.status} ${coursesRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all educators (for the "uploaded by" dropdown)
    const educatorsRes = await fetch(
      `${apiUrl}/educators?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (educatorsRes.ok) {
      const fetchedEducators = (await educatorsRes.json()).data as any[];
      allEducators = fetchedEducators.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
      }));
    } else {
      console.error(
        `[GlobalCourseMaterialsManagementPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all academic levels (for filtering)
    const academicLevelsRes = await fetch(
      `${apiUrl}/academic-levels?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (academicLevelsRes.ok) {
      allAcademicLevels = (await academicLevelsRes.json()).data as AcademicLevelOption[];
    } else {
      console.error(
        `[GlobalCourseMaterialsManagementPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`
      );
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[GlobalCourseMaterialsManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  if (fetchError || initialMaterials.length === 0 || allCourses.length === 0 || allEducators.length === 0 || allAcademicLevels.length === 0) {
    console.log("[GlobalCourseMaterialsManagementPage] Using sample data for global course materials.");
    const { sampleMaterials, sampleCourses, sampleEducators, sampleAcademicLevels } = generateSampleGlobalMaterialsData(companyId);
    initialMaterials = sampleMaterials;
    allCourses = sampleCourses;
    allEducators = sampleEducators;
    allAcademicLevels = sampleAcademicLevels;
  }

  return (
    <MaterialsGlobalClient
      initialMaterials={initialMaterials}
      allCourses={allCourses}
      allEducators={allEducators}
      allAcademicLevels={allAcademicLevels}
      companyId={companyId}
      apiUrl={apiUrl}
    />
  );
}
