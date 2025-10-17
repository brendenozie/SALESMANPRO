// app/admin/[slug]/exams/page.tsx
import React from "react";
import AdminExamsOverviewPage, { ExamData, CourseOption, EducatorOption, AcademicLevelOption } from "./AdminExamsOverviewPage";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // This will be the companyId
  };
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleExamData = (companyId: string): {
  sampleExams: ExamData[];
  sampleCourses: CourseOption[];
  sampleEducators: EducatorOption[];
  sampleAcademicLevels: AcademicLevelOption[];
} => {
  const academicLevels: AcademicLevelOption[] = [
    { id: 'AL001', name: 'Grade 7', sortOrder: 7 },
    { id: 'AL002', name: 'Grade 8', sortOrder: 8 },
    { id: 'AL003', name: 'Grade 9', sortOrder: 9 },
    { id: 'AL004', name: 'Grade 10', sortOrder: 10 },
    { id: 'AL005', name: 'Grade 11', sortOrder: 11 },
    { id: 'AL006', name: 'Grade 12', sortOrder: 12 },
  ];

  const educators: EducatorOption[] = [
    { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com' },
    { id: 'EDU002', name: 'Mrs. Jane Smith', email: 'jane.smith@school.com' },
    { id: 'EDU003', name: 'Ms. Emily White', email: 'emily.white@school.com' },
    { id: 'EDU004', name: 'Dr. Anne Ndugu', email: 'anne.ndugu@school.com' },
  ];

  const courses: CourseOption[] = [
    { id: 'CRS001', title: 'Mathematics', academicLevels: [{ id: 'AL003', name: 'Grade 9' }] },
    { id: 'CRS002', title: 'English Language', academicLevels: [{ id: 'AL002', name: 'Grade 8' }] },
    { id: 'CRS003', title: 'Algebra', academicLevels: [{ id: 'AL003', name: 'Grade 9' }] },
    { id: 'CRS004', title: 'Geometry', academicLevels: [{ id: 'AL004', name: 'Grade 10' }] },
    { id: 'CRS005', title: 'Science', academicLevels: [{ id: 'AL002', name: 'Grade 8' }] },
    { id: 'CRS006', title: 'Physics', academicLevels: [{ id: 'AL005', name: 'Grade 11' }] },
  ];

  const dummyTime = '1970-01-01T'; // For storing time components as Date objects

  const exams: ExamData[] = [
    {
      id: 'EXM001',
      title: 'Mathematics Midterm Exam',
      description: 'Covers Chapters 1-5.',
      courseId: 'CRS003',
      courseTitle: 'Algebra',
      courseAcademicLevels: [{ id: 'AL003', name: 'Grade 9' }],
      date: '2025-07-07',
      startTime: `${dummyTime}09:00:00.000Z`,
      endTime: `${dummyTime}10:30:00.000Z`,
      location: 'School Hall A',
      notes: 'Bring pencils and calculator.',
      type: 'MIDTERM',
      totalPoints: 100,
      isPublished: false,
      createdByEducatorId: 'EDU001',
      createdByEducatorName: 'Mr. John Doe',
      createdByEducatorEmail: 'john.doe@school.com',
      isOnline: false,
      durationMinutes: null,
      autoGrade: false,
      totalQuestions: 0,
      totalSubmissions: 0,
      companyId: companyId,
      createdAt: new Date('2025-06-01').toISOString(),
      updatedAt: new Date('2025-06-01').toISOString(),
    },
    {
      id: 'EXM002',
      title: 'English Essay Final Draft',
      description: 'Submission deadline via LMS.',
      courseId: 'CRS002',
      courseTitle: 'English Language',
      courseAcademicLevels: [{ id: 'AL002', name: 'Grade 8' }],
      date: '2025-07-05',
      startTime: `${dummyTime}16:00:00.000Z`,
      endTime: null, // No specific end time for submission
      location: 'Online Submission',
      notes: 'Ensure proper formatting.',
      type: 'ASSIGNMENT_BASED',
      totalPoints: 50,
      isPublished: false,
      createdByEducatorId: 'EDU002',
      createdByEducatorName: 'Mrs. Jane Smith',
      createdByEducatorEmail: 'jane.smith@school.com',
      isOnline: true,
      durationMinutes: null,
      autoGrade: false,
      totalQuestions: 0,
      totalSubmissions: 0,
      companyId: companyId,
      createdAt: new Date('2025-06-05').toISOString(),
      updatedAt: new Date('2025-06-05').toISOString(),
    },
    {
      id: 'EXM003',
      title: 'Science Unit 2 Test',
      description: 'Covering cell biology and photosynthesis.',
      courseId: 'CRS005',
      courseTitle: 'Science',
      courseAcademicLevels: [{ id: 'AL002', name: 'Grade 8' }],
      date: '2025-06-25', // Past date
      startTime: `${dummyTime}11:00:00.000Z`,
      endTime: `${dummyTime}12:00:00.000Z`,
      location: 'Lab 2',
      notes: '',
      type: 'UNIT_TEST',
      totalPoints: 100,
      isPublished: true,
      createdByEducatorId: 'EDU003',
      createdByEducatorName: 'Ms. Emily White',
      createdByEducatorEmail: 'emily.white@school.com',
      isOnline: false,
      durationMinutes: null,
      autoGrade: false,
      totalQuestions: 15,
      totalSubmissions: 30,
      companyId: companyId,
      createdAt: new Date('2025-06-10').toISOString(),
      updatedAt: new Date('2025-06-26').toISOString(),
    },
    {
      id: 'EXM004',
      title: 'Physics Final Exam',
      description: 'Comprehensive exam covering all topics.',
      courseId: 'CRS006',
      courseTitle: 'Physics',
      courseAcademicLevels: [{ id: 'AL005', name: 'Grade 11' }],
      date: '2025-07-18',
      startTime: `${dummyTime}10:00:00.000Z`,
      endTime: `${dummyTime}12:00:00.000Z`,
      location: 'Lecture Hall 1',
      notes: 'Bring scientific calculator.',
      type: 'FINAL',
      totalPoints: 100,
      isPublished: false,
      createdByEducatorId: 'EDU004',
      createdByEducatorName: 'Dr. Anne Ndugu',
      createdByEducatorEmail: 'anne.ndugu@school.com',
      isOnline: true,
      durationMinutes: 120,
      autoGrade: true,
      totalQuestions: 25,
      totalSubmissions: 0,
      companyId: companyId,
      createdAt: new Date('2025-06-20').toISOString(),
      updatedAt: new Date('2025-06-20').toISOString(),
    },
  ];

  return { sampleExams: exams, sampleCourses: courses, sampleEducators: educators, sampleAcademicLevels: academicLevels };
};


export default async function ExamsManagerPage({ params }: PageProps) {
  const { slug : companyId } = await params;

  let initialExams: ExamData[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch exams
    const examsRes = await fetch(`${apiUrl}/admin/exams?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (examsRes.ok) {
      initialExams = (await examsRes.json()) as ExamData[];
    } else {
      console.error(`[ExamsManagerPage] Failed to fetch exams: ${examsRes.status} ${examsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all courses
    const coursesRes = await fetch(`${apiUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (coursesRes.ok) {
      allCourses = (await coursesRes.json()) as CourseOption[];
    } else {
      console.error(`[ExamsManagerPage] Failed to fetch courses: ${coursesRes.status} ${coursesRes.statusText}`);
      fetchError = true;
    }

    // Fetch all educators
    const educatorsRes = await fetch(`${apiUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (educatorsRes.ok) {
      allEducators = (await educatorsRes.json()) as EducatorOption[];
    } else {
      console.error(`[ExamsManagerPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all academic levels (for display in course options)
    const academicLevelsRes = await fetch(`${apiUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
    });
    if (academicLevelsRes.ok) {
      allAcademicLevels = (await academicLevelsRes.json()) as AcademicLevelOption[];
    } else {
      console.error(`[ExamsManagerPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`);
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[ExamsManagerPage] Error fetching initial data →", err.message);
    fetchError = true;
  }

  // If any fetch failed or returned empty, use sample data as fallback
  if (fetchError && initialExams.length === 0 && allCourses.length === 0 && allEducators.length === 0 && allAcademicLevels.length === 0) {
    console.log("[ExamsManagerPage] Using sample data as fallback.");
    const { sampleExams, sampleCourses, sampleEducators, sampleAcademicLevels } = generateSampleExamData(companyId);
    initialExams = sampleExams;
    allCourses = sampleCourses;
    allEducators = sampleEducators;
    allAcademicLevels = sampleAcademicLevels;
  }

  return (
    <AdminExamsOverviewPage
      initialExams={initialExams}
      allCourses={allCourses}
      allEducators={allEducators}
      allAcademicLevels={allAcademicLevels}
      companyId={companyId}
    />
  );
}
