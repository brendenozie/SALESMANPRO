import React from "react";
import CurriculumClient from "./CurriculumClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ 
    slug: string;
    courseId: string;
   }>;
}

// --- Updated Helper function for Curriculum structure ---
const generateSampleCurriculumData = (companyId: string, courseId: string) => {
  const sampleEducators = [
    { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com' },
    { id: 'EDU002', name: 'Mrs. Jane Smith', email: 'jane.smith@school.com' },
  ];

  const sampleCourse = {
    id: courseId,
    title: 'Advanced Mathematics',
    description: 'A comprehensive guide to Algebra and Calculus.',
    companyId: companyId,
  };

  const sampleModules = [
    {
      id: 'MOD001',
      courseId: courseId,
      title: 'Module 1: Introduction to Algebra',
      description: 'The fundamentals of algebraic expressions.',
      order: 1,
      lessons: [
        { id: 'LES001', moduleId: 'MOD001', title: 'Variables & Constants', duration: 15, videoUrl: 'https://youtube.com', order: 1 },
        { id: 'LES002', moduleId: 'MOD001', title: 'Linear Equations', duration: 25, videoUrl: null, order: 2 },
      ]
    },
    {
      id: 'MOD002',
      courseId: courseId,
      title: 'Module 2: Quadratic Functions',
      description: 'Deep dive into parabolas and roots.',
      order: 2,
      lessons: []
    }
  ];

  return { sampleModules, sampleCourse, sampleEducators };
};

export default async function CourseCurriculumManagementPage({ params }: PageProps) {
  const { slug: companyId, courseId } = await params;
  const cookieHeader = (await cookies()).toString(); // Fixed name to match use below

  let initialModules: any[] = [];
  let courseDetails: any = null;
  let allEducators: any[] = [];
  let fetchError: boolean = false;

  try {
    // 1. Fetch course details
    const courseRes = await fetch(
      `${apiBaseUrl}/courses/${encodeURIComponent(courseId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } }
    );
    
    if (courseRes.ok) {
      courseDetails = (await courseRes.json()).data;
    }

    // 2. Fetch Curriculum (Modules + Lessons)
    const curriculumRes = await fetch(
      `${apiBaseUrl}/courses/${courseId}/curriculum?companyId=${companyId}`,
      { headers: { Cookie: cookieHeader }, cache: 'no-store' }
    );

    if (curriculumRes.ok) {
      const curriculum = (await curriculumRes.json()).data;
      initialModules = curriculum.modules || [];
    } else {
      fetchError = true;
    }

    // 3. Fetch Educators
    const educatorsRes = await fetch(
      `${apiBaseUrl}/educators?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader } }
    );
    if (educatorsRes.ok) {
      allEducators = (await educatorsRes.json()).data;
    }

  } catch (err: any) {
    console.error("[CurriculumPage] Error fetching data:", err.message);
    fetchError = true;
  }

  // Fallback to sample data if fetch fails
  if (fetchError || !courseDetails || initialModules.length === 0) {
    const { sampleModules, sampleCourse, sampleEducators } = generateSampleCurriculumData(companyId, courseId);
    initialModules = sampleModules;
    courseDetails = courseDetails || sampleCourse;
    allEducators = allEducators.length ? allEducators : sampleEducators;
  }

  return (
    <CurriculumClient
      initialModules={initialModules}
      courseDetails={courseDetails}
      // allEducators={allEducators}
      companyId={companyId}
      apiBaseUrl={apiBaseUrl}
    />
  );
}