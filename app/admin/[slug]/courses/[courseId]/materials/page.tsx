// app/admin/[slug]/courses/[courseId]/materials/page.tsx

import React from "react";
import MaterialsClient, { CourseMaterialType, CourseDetailsType, EducatorOption } from "./MaterialsClient";
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ 
    slug: string;
    courseId: string;
   }>;
}

// --- Helper function to generate sample data ---
const generateSampleMaterialsData = (companyId: string, courseId: string): {
  sampleMaterials: CourseMaterialType[];
  sampleCourse: CourseDetailsType;
  sampleEducators: EducatorOption[];
} => {
  const sampleEducators: EducatorOption[] = [
    { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com' },
    { id: 'EDU002', name: 'Mrs. Jane Smith', email: 'jane.smith@school.com' },
    { id: 'EDU003', name: 'Dr. Emily White', email: 'emily.white@school.com' },
  ];

  const sampleCourse: CourseDetailsType = {
    id: courseId,
    title: 'Sample Course Title',
    description: 'This is a sample course for demonstration purposes.',
    imageUrl: 'https://placehold.co/100x100/ADD8E6/00008B?text=Course',
    instructorName: 'Mr. John Doe',
    departmentName: 'Mathematics',
    academicLevels: [{ id: 'AL006', name: 'Grade 9' }],
    totalLessons: 0, // Will be calculated dynamically from materials
    studentsEnrolled: 0, // Will be calculated dynamically
    rating: 4.5,
    companyId: companyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleMaterials: CourseMaterialType[] = [
    {
      id: 'MAT001',
      courseId: courseId,
      courseTitle: sampleCourse.title,
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
      courseId: courseId,
      courseTitle: sampleCourse.title,
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
      courseId: courseId,
      courseTitle: sampleCourse.title,
      title: 'Practice Problems: Algebra Basics',
      description: 'A set of exercises to reinforce understanding of introductory algebra.',
      fileUrl: 'https://example.com/algebra_practice.pdf',
      linkUrl: null,
      type: 'DOCUMENT',
      uploadedById: 'EDU001',
      uploadedByName: 'Mr. John Doe',
      uploadedByEmail: 'john.doe@school.com',
      createdAt: new Date('2023-01-25').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MAT004',
      courseId: courseId,
      courseTitle: sampleCourse.title,
      title: 'External Resource: Khan Academy Algebra',
      description: 'Link to Khan Academy resources for additional learning.',
      fileUrl: null,
      linkUrl: 'https://www.khanacademy.org/math/algebra',
      type: 'LINK',
      uploadedById: 'EDU002',
      uploadedByName: 'Mrs. Jane Smith',
      uploadedByEmail: 'jane.smith@school.com',
      createdAt: new Date('2023-02-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleMaterials, sampleCourse, sampleEducators };
};
// --- End Helper function ---


/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function CourseMaterialsManagementPage({ params }: PageProps) {
  const { slug: companyId, courseId } = await params;
  const cookieHeaders = (await cookies()).toString();

  let initialMaterials: CourseMaterialType[] = [];
  let courseDetails: CourseDetailsType | null = null;
  let allEducators: EducatorOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch course details
    const courseRes = await fetch(
      `${apiUrl}/courses/${encodeURIComponent(courseId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeaders } }
    );
    if (courseRes.ok) {
      courseDetails = (await courseRes.json()).data as CourseDetailsType;
    } else {
      console.error(
        `[CourseMaterialsManagementPage] Failed to fetch course details: ${courseRes.status} ${courseRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all materials for this specific course
    const materialsRes = await fetch(
      `${apiUrl}/course-materials?courseId=${encodeURIComponent(courseId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeaders } }
    );
    if (materialsRes.ok) {
      initialMaterials = (await materialsRes.json()).data as CourseMaterialType[];
    } else {
      console.error(
        `[CourseMaterialsManagementPage] Failed to fetch materials: ${materialsRes.status} ${materialsRes.statusText}`
      );
      fetchError = true;
    }

    // Fetch all educators (for the "uploaded by" dropdown)
    const educatorsRes = await fetch(
      `${apiUrl}/educators?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeaders } }
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
        `[CourseMaterialsManagementPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`
      );
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[CourseMaterialsManagementPage] Error fetching initial data:", err.message);
    fetchError = true;
  }

  // If fetching failed or returned no data, use sample data
  if (fetchError || !courseDetails || initialMaterials.length === 0 || allEducators.length === 0) {
    console.log("[CourseMaterialsManagementPage] Using sample data for course materials.");
    const { sampleMaterials, sampleCourse, sampleEducators } = generateSampleMaterialsData(companyId, courseId);
    initialMaterials = sampleMaterials;
    courseDetails = sampleCourse;
    allEducators = sampleEducators;
  }

  if (!courseDetails) {
    // This case should ideally be caught by sample data, but as a fallback
    return (
      <div className="p-8 text-center text-red-600">
        <h1 className="text-2xl font-bold">Course Not Found</h1>
        <p>The course with ID "{courseId}" could not be loaded.</p>
      </div>
    );
  }

  return (
    <MaterialsClient
      initialMaterials={initialMaterials}
      courseDetails={courseDetails}
      allEducators={allEducators}
      companyId={companyId}
      apiUrl={apiUrl}
    />
  );
}
