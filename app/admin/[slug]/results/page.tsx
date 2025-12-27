// app/admin/[slug]/results/page.tsx
import React from "react";
import AdminResultsOverviewPage, {
  ExamSubmissionDataForAdmin,
  ExamOption,
  StudentOption,
  CourseOption,
  EducatorOption,
} from "./AdminResultsOverviewPage";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleAdminResultsData = (companyId: string): {
  sampleSubmissions: ExamSubmissionDataForAdmin[];
  sampleExams: ExamOption[];
  sampleStudents: StudentOption[];
  sampleCourses: CourseOption[];
  sampleEducators: EducatorOption[];
} => {
  const sampleExams: ExamOption[] = [
    { id: 'EXM001', title: 'Mathematics Midterm', courseId: 'CRS001', createdByEducatorId: 'EDU001', type: 'MIDTERM' },
    { id: 'EXM002', title: 'English Essay', courseId: 'CRS002', createdByEducatorId: 'EDU002', type: 'ASSIGNMENT_BASED' },
    { id: 'EXM003', title: 'Science Unit Test', courseId: 'CRS003', createdByEducatorId: 'EDU003', type: 'UNIT_TEST' },
    { id: 'EXM004', title: 'Physics Final', courseId: 'CRS004', createdByEducatorId: 'EDU004', type: 'FINAL' },
  ];

  const sampleStudents: StudentOption[] = [
    { id: 'STU001', name: 'Alice Johnson', email: 'alice.j@example.com', academicLevel: { id: 'AL001', name: 'Grade 9' } },
    { id: 'STU002', name: 'Bob Williams', email: 'bob.w@example.com', academicLevel: { id: 'AL001', name: 'Grade 9' } },
    { id: 'STU003', name: 'Charlie Brown', email: 'charlie.b@example.com', academicLevel: { id: 'AL002', name: 'Grade 8' } },
    { id: 'STU004', name: 'Diana Prince', email: 'diana.p@example.com', academicLevel: { id: 'AL001', name: 'Grade 9' } },
  ];

  const sampleCourses: CourseOption[] = [
    { id: 'CRS001', title: 'Mathematics' },
    { id: 'CRS002', title: 'English' },
    { id: 'CRS003', title: 'Science' },
    { id: 'CRS004', title: 'Physics' },
  ];

  const sampleEducators: EducatorOption[] = [
    { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@example.com' },
    { id: 'EDU002', name: 'Mrs. Jane Smith', email: 'jane.smith@example.com' },
    { id: 'EDU003', name: 'Ms. Emily White', email: 'emily.white@example.com' },
    { id: 'EDU004', name: 'Dr. Anne Ndugu', email: 'anne.ndugu@example.com' },
  ];

  const sampleSubmissions: ExamSubmissionDataForAdmin[] = [
    {
      id: 'SUB001', examId: 'EXM001', examTitle: 'Mathematics Midterm', examType: 'MIDTERM', examTotalPoints: 100, examIsOnline: false, examDate: '2025-07-07', examCourseId: 'CRS001', examCourseTitle: 'Mathematics', examCourseAcademicLevels: [{ id: 'AL001', name: 'Grade 9' }], examCreatedByEducatorId: 'EDU001', examCreatedByEducatorName: 'Mr. John Doe', examCreatedByEducatorEmail: 'john.doe@example.com',
      studentId: 'STU001', studentName: 'Alice Johnson', studentEmail: 'alice.j@example.com', studentAcademicLevel: 'Grade 9', submittedAt: new Date('2025-07-07T10:00:00Z').toISOString(), score: 85.5, feedback: 'Good work.', answers: null, createdAt: '', updatedAt: '',
    },
    {
      id: 'SUB002', examId: 'EXM002', examTitle: 'English Essay', examType: 'ASSIGNMENT_BASED', examTotalPoints: 50, examIsOnline: true, examDate: '2025-07-05', examCourseId: 'CRS002', examCourseTitle: 'English', examCourseAcademicLevels: [{ id: 'AL001', name: 'Grade 9' }], examCreatedByEducatorId: 'EDU002', examCreatedByEducatorName: 'Mrs. Jane Smith', examCreatedByEducatorEmail: 'jane.smith@example.com',
      studentId: 'STU001', studentName: 'Alice Johnson', studentEmail: 'alice.j@example.com', studentAcademicLevel: 'Grade 9', submittedAt: new Date('2025-07-05T15:50:00Z').toISOString(), score: 42.0, feedback: 'Needs improvement.', answers: {}, createdAt: '', updatedAt: '',
    },
    {
      id: 'SUB003', examId: 'EXM001', examTitle: 'Mathematics Midterm', examType: 'MIDTERM', examTotalPoints: 100, examIsOnline: false, examDate: '2025-07-07', examCourseId: 'CRS001', examCourseTitle: 'Mathematics', examCourseAcademicLevels: [{ id: 'AL001', name: 'Grade 9' }], examCreatedByEducatorId: 'EDU001', examCreatedByEducatorName: 'Mr. John Doe', examCreatedByEducatorEmail: 'john.doe@example.com',
      studentId: 'STU002', studentName: 'Bob Williams', studentEmail: 'bob.w@example.com', studentAcademicLevel: 'Grade 9', submittedAt: new Date('2025-07-07T10:05:00Z').toISOString(), score: 78.0, feedback: 'Solid.', answers: null, createdAt: '', updatedAt: '',
    },
    {
      id: 'SUB004', examId: 'EXM003', examTitle: 'Science Unit Test', examType: 'UNIT_TEST', examTotalPoints: 100, examIsOnline: true, examDate: '2025-07-10', examCourseId: 'CRS003', examCourseTitle: 'Science', examCourseAcademicLevels: [{ id: 'AL002', name: 'Grade 8' }], examCreatedByEducatorId: 'EDU003', examCreatedByEducatorName: 'Ms. Emily White', examCreatedByEducatorEmail: 'emily.white@example.com',
      studentId: 'STU003', studentName: 'Charlie Brown', studentEmail: 'charlie.b@example.com', studentAcademicLevel: 'Grade 8', submittedAt: new Date('2025-07-10T09:30:00Z').toISOString(), score: null, feedback: null, answers: {}, createdAt: '', updatedAt: '', // Pending
    },
    {
      id: 'SUB005', examId: 'EXM004', examTitle: 'Physics Final', examType: 'FINAL', examTotalPoints: 100, examIsOnline: true, examDate: '2025-07-15', examCourseId: 'CRS004', examCourseTitle: 'Physics', examCourseAcademicLevels: [{ id: 'AL001', name: 'Grade 9' }], examCreatedByEducatorId: 'EDU004', examCreatedByEducatorName: 'Dr. Anne Ndugu', examCreatedByEducatorEmail: 'anne.ndugu@example.com',
      studentId: 'STU004', studentName: 'Diana Prince', studentEmail: 'diana.p@example.com', studentAcademicLevel: 'Grade 9', submittedAt: new Date('2025-07-15T11:20:00Z').toISOString(), score: 95.0, feedback: 'Excellent!', answers: {}, createdAt: '', updatedAt: '',
    },
  ];

  return { sampleSubmissions, sampleExams, sampleStudents, sampleCourses, sampleEducators };
};


export default async function AdminResultsOverviewPageWrapper({ params }: PageProps) {
  const { slug : companyId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialSubmissions: ExamSubmissionDataForAdmin[] = [];
  let allExams: ExamOption[] = [];
  let allStudents: StudentOption[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch all submissions for the company
    const submissionsRes = await fetch(`${apiBaseUrl}/admin/exam-submissions?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
    if (submissionsRes.ok) {
      const data = (await submissionsRes.json()).data.data;
      console.log("[AdminResultsOverviewPageWrapper] Fetched submissions data:", data);
      initialSubmissions = data as ExamSubmissionDataForAdmin[];
      // initialSubmissions = (await submissionsRes.json()) as ExamSubmissionDataForAdmin[];
    } else {
      console.error(`[AdminResultsOverviewPageWrapper] Failed to fetch submissions: ${submissionsRes.status} ${submissionsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all exams (for filter dropdown)
    const examsRes = await fetch(`${apiBaseUrl}/admin/exams?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
    if (examsRes.ok) {
      const data = (await examsRes.json()).data.data;
      console.log("[AdminResultsOverviewPageWrapper] Fetched exams data:", data);
      const fetchedExams = data as any[];
      allExams = fetchedExams.map(e => ({
        id: e.id,
        title: e.title,
        courseId: e.courseId,
        createdByEducatorId: e.createdByEducatorId,
        type: e.type,
      }));
    } else {
      console.error(`[AdminResultsOverviewPageWrapper] Failed to fetch exams: ${examsRes.status} ${examsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all students (for filter dropdown)
    const studentsRes = await fetch(`${apiBaseUrl}/admin/students?companyId=${encodeURIComponent(companyId)}`, { // Assuming /api/students endpoint
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
    if (studentsRes.ok) {
      const data = (await studentsRes.json()).data;
      console.log("[AdminResultsOverviewPageWrapper] Fetched students data:", data);
      const fetchedStudents = data as any[];
      allStudents = fetchedStudents.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        academicLevel: s.academicLevel,
      }));
    } else {
      console.error(`[AdminResultsOverviewPageWrapper] Failed to fetch students: ${studentsRes.status} ${studentsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all courses (for filter dropdown)
    const coursesRes = await fetch(`${apiBaseUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
    if (coursesRes.ok) {
      const data = (await coursesRes.json()).data;
      console.log("[AdminResultsOverviewPageWrapper] Fetched courses data:", data);
      const fetchedCourses = data as any[];
      allCourses = fetchedCourses.map(c => ({
        id: c.id,
        title: c.title,
      }));
    } else {
      console.error(`[AdminResultsOverviewPageWrapper] Failed to fetch courses: ${coursesRes.status} ${coursesRes.statusText}`);
      fetchError = true;
    }

    // Fetch all educators (for filter dropdown)
    const educatorsRes = await fetch(`${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
    if (educatorsRes.ok) {
      const data = (await educatorsRes.json()).data.data;
      console.log("[AdminResultsOverviewPageWrapper] Fetched educators data:", data);
      const fetchedEducators = data as any[];
      allEducators = fetchedEducators.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
      }));
    } else {
      console.error(`[AdminResultsOverviewPageWrapper] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`);
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[AdminResultsOverviewPageWrapper] Error fetching initial data →", err.message);
    fetchError = true;
  }

  // If any fetch failed or returned empty, use sample data as fallback
  if (fetchError || initialSubmissions.length === 0 && allExams.length === 0  && allStudents.length === 0  && allCourses.length === 0  && allEducators.length === 0) {
    console.log("[AdminResultsOverviewPageWrapper] Using sample data as fallback for admin results.");
    const { sampleSubmissions, sampleExams, sampleStudents, sampleCourses, sampleEducators } = generateSampleAdminResultsData(companyId);
    initialSubmissions = sampleSubmissions;
    allExams = sampleExams;
    allStudents = sampleStudents;
    allCourses = sampleCourses;
    allEducators = sampleEducators;
  }

  return (
    <AdminResultsOverviewPage
      initialSubmissions={initialSubmissions}
      allExams={allExams}
      allStudents={allStudents}
      allCourses={allCourses}
      allEducators={allEducators}
      companyId={companyId}
    />
  );
}
