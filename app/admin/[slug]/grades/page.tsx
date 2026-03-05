// app/admin/[slug]/exams/page.tsx
import React from "react";
import AdminAssignmentsOverviewPage, { AssignmentData, CourseOption, EducatorOption, AcademicLevelOption } from "./AdminAssignmentsOverviewPage";
import { cookies } from "next/headers";
import { ClassRoomOption } from "../students/StudentsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleExamData = (companyId: string): {
  sampleExams: AssignmentData[];
  sampleCourses: CourseOption[];
  sampleEducators: EducatorOption[];
  sampleAcademicLevels: AcademicLevelOption[];
  sampleClassRooms: ClassRoomOption[];
} => {
  const academicLevels: AcademicLevelOption[] = [
    { id: 'AL001', name: 'Grade 7', sortOrder: 7 },
    { id: 'AL002', name: 'Grade 8', sortOrder: 8 },
    { id: 'AL003', name: 'Grade 9', sortOrder: 9 },
    { id: 'AL004', name: 'Grade 10', sortOrder: 10 },
    { id: 'AL005', name: 'Grade 11', sortOrder: 11 },
    { id: 'AL006', name: 'Grade 12', sortOrder: 12 },
  ];

  const classRooms: ClassRoomOption[] = [
    { id: 'CRM001', name: 'Room A101', academicLevelId: 'AL003', },
    { id: 'CRM002', name: 'Room B202', academicLevelId: 'AL004' },
    { id: 'CRM003', name: 'Lab 1', academicLevelId: 'AL005' },
    { id: 'CRM004', name: 'Auditorium', academicLevelId: '' },
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

  const exams: AssignmentData[] = [
    {
      id: 'EXM001',
      title: 'Mathematics Midterm Exam',
      description: 'Covers Chapters 1-5.',

      course: { id: 'CRS003', title: 'Algebra', academicLevels: [{ id: 'AL003', name: 'Grade 9' }] },
      courseId: 'CRS003',
      courseTitle: 'Algebra',
      courseAcademicLevels: [{ id: 'AL003', name: 'Grade 9' }],
      classroomId: 'CRM001',
      classroom: { id: 'CRM001', name: 'Room A101', academicLevelId: 'AL003' },
      date: '2025-07-07',
      startTime: `${dummyTime}09:00:00.000Z`,
      endTime: `${dummyTime}10:30:00.000Z`,
      location: 'School Hall A',
      notes: 'Bring pencils and calculator.',
      type: 'MIDTERM',
      totalPoints: 100,
      isPublished: false,
      createdById: 'EDU001',
      createdByName: 'Mr. John Doe',
      createdByEmail: 'john.doe@school.com',
      isOnline: false,
      durationMinutes: null,
      autoGrade: false,
      totalQuestions: 0,
      totalSubmissions: 0,
      companyId: companyId,
      createdAt: new Date('2025-06-01').toISOString(),
      updatedAt: new Date('2025-06-01').toISOString(),
      courseInstructorName: "",
      dueDate: "",
      status: "",
      maxGrade: 0
    },
    {
      id: 'EXM002',
      title: 'English Essay Final Draft',
      description: 'Submission deadline via LMS.',
      course: { id: 'CRS002', title: 'English Language', academicLevels: [{ id: 'AL002', name: 'Grade 8' }] },
      courseId: 'CRS002',
      courseTitle: 'English Language',
      courseAcademicLevels: [{ id: 'AL002', name: 'Grade 8' }],
      classroomId: null,
      classroom: null,
      date: '2025-07-05',
      startTime: `${dummyTime}16:00:00.000Z`,
      endTime: null, // No specific end time for submission
      location: 'Online Submission',
      notes: 'Ensure proper formatting.',
      type: 'ASSIGNMENT_BASED',
      totalPoints: 50,
      isPublished: false,
      createdById: 'EDU002',
      createdByName: 'Mrs. Jane Smith',
      createdByEmail: 'jane.smith@school.com',
      isOnline: true,
      durationMinutes: null,
      autoGrade: false,
      totalQuestions: 0,
      totalSubmissions: 0,
      companyId: companyId,
      createdAt: new Date('2025-06-05').toISOString(),
      updatedAt: new Date('2025-06-05').toISOString(),
      courseInstructorName: "",
      dueDate: "",
      status: "",
      maxGrade: 0
    },
    {
      id: 'EXM003',
      title: 'Science Unit 2 Test',
      description: 'Covering cell biology and photosynthesis.',
      course: { id: 'CRS005', title: 'Science', academicLevels: [{ id: 'AL002', name: 'Grade 8' }] },
      courseId: 'CRS005',
      courseTitle: 'Science',
      classroomId: 'CRM002',
      classroom: { id: 'CRM002', name: 'Lab 2', academicLevelId: 'AL002' },
      courseAcademicLevels: [{ id: 'AL002', name: 'Grade 8' }],
      date: '2025-06-25', // Past date
      startTime: `${dummyTime}11:00:00.000Z`,
      endTime: `${dummyTime}12:00:00.000Z`,
      location: 'Lab 2',
      notes: '',
      type: 'UNIT_TEST',
      totalPoints: 100,
      isPublished: true,
      createdById: 'EDU003',
      createdByName: 'Ms. Emily White',
      createdByEmail: 'emily.white@school.com',
      isOnline: false,
      durationMinutes: null,
      autoGrade: false,
      totalQuestions: 15,
      totalSubmissions: 30,
      companyId: companyId,
      createdAt: new Date('2025-06-10').toISOString(),
      updatedAt: new Date('2025-06-26').toISOString(),
      courseInstructorName: "",
      dueDate: "",
      status: "",
      maxGrade: 0
    },
    {
      id: 'EXM004',
      title: 'Physics Final Exam',
      description: 'Comprehensive exam covering all topics.',
      course: { id: 'CRS006', title: 'Physics', academicLevels: [{ id: 'AL005', name: 'Grade 11' }] },
      courseId: 'CRS006',
      courseTitle: 'Physics',
      classroomId: 'CRM003',
      classroom: { id: 'CRM003', name: 'Lab 1', academicLevelId: 'AL005' },
      courseAcademicLevels: [{ id: 'AL005', name: 'Grade 11' }],
      date: '2025-07-18',
      startTime: `${dummyTime}10:00:00.000Z`,
      endTime: `${dummyTime}12:00:00.000Z`,
      location: 'Lecture Hall 1',
      notes: 'Bring scientific calculator.',
      type: 'FINAL',
      totalPoints: 100,
      isPublished: false,
      createdById: 'EDU004',
      createdByName: 'Dr. Anne Ndugu',
      createdByEmail: 'anne.ndugu@school.com',
      isOnline: true,
      durationMinutes: 120,
      autoGrade: true,
      totalQuestions: 25,
      totalSubmissions: 0,
      companyId: companyId,
      createdAt: new Date('2025-06-20').toISOString(),
      updatedAt: new Date('2025-06-20').toISOString(),
      courseInstructorName: "",
      dueDate: "",
      status: "",
      maxGrade: 0
    },
  ];

  return { sampleExams: exams, sampleCourses: courses, sampleEducators: educators, sampleAcademicLevels: academicLevels, sampleClassRooms: classRooms };
};


export default async function ExamsManagerPage({ params }: PageProps) {

  const cookieHeader = (await cookies()).toString();
  const { slug : companyId } = await params;

  let initialAssignments: AssignmentData[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allClassRooms: ClassRoomOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch exams
    const examsRes = await fetch(`${apiBaseUrl}/admin/course-assignments?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: { 
        Cookie: cookieHeader
      }
    });
    if (examsRes.ok) {
      const data = (await examsRes.json()).data.assignments;
      console.log("Fetched Exams Data:");
      console.log(data);
      initialAssignments = data as AssignmentData[];
      console.log(initialAssignments);  
    } else {
      console.error(`[ExamsManagerPage] Failed to fetch exams: ${examsRes.status} ${examsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all courses
    const coursesRes = await fetch(`${apiBaseUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: {
        Cookie: cookieHeader
      }
    });
    if (coursesRes.ok) {
      const data = (await coursesRes.json()).data;
      allCourses = data as CourseOption[];
      console.log(allCourses);
    } else {
      console.error(`[ExamsManagerPage] Failed to fetch courses: ${coursesRes.status} ${coursesRes.statusText}`);
      fetchError = true;
    }

    // Fetch all educators
    const educatorsRes = await fetch(`${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: {
        Cookie: cookieHeader
      }
    });
    if (educatorsRes.ok) {
      allEducators = (await educatorsRes.json()).data.data as EducatorOption[];
    } else {
      console.error(`[ExamsManagerPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all academic levels (for display in course options)
    const academicLevelsRes = await fetch(`${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, {
      next: { revalidate: 60 },
      headers: {
        Cookie: cookieHeader
      }
    });
    if (academicLevelsRes.ok) {
      const data = (await academicLevelsRes.json()).data;
      
      allAcademicLevels = data as AcademicLevelOption[];
    } else {
      console.error(`[ExamsManagerPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all classrooms for this company
    const classRoomsRes = await fetch(
      `${apiBaseUrl}/admin/classrooms?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { Cookie: cookieHeader }  }
    );
    if (classRoomsRes.ok) {
      const data = (await classRoomsRes.json()).data;
      allClassRooms = data as ClassRoomOption[];
    } else {
      console.error(
        `[StudentsManagementPage] Failed to fetch classrooms: ${classRoomsRes.status} ${classRoomsRes.statusText}`
      );
      fetchError = true;
    }
        
  } catch (err: any) {
    console.error("[ExamsManagerPage] Error fetching initial data →", err.message);
    fetchError = true;
  }

  // If any fetch failed or returned empty, use sample data as fallback
  if (fetchError && initialAssignments.length === 0 && allCourses.length === 0 && allEducators.length === 0 && allAcademicLevels.length === 0 && allClassRooms.length === 0) {
    console.log("[ExamsManagerPage] Using sample data as fallback.");
    const { sampleExams, sampleCourses, sampleEducators, sampleAcademicLevels, sampleClassRooms } = generateSampleExamData(companyId);
    initialAssignments = sampleExams;
    allCourses = sampleCourses;
    allEducators = sampleEducators;
    allAcademicLevels = sampleAcademicLevels;
    allClassRooms = sampleClassRooms;
  }

  return (
    <AdminAssignmentsOverviewPage
      initialAssignments={initialAssignments}
      allCourses={allCourses}
      allEducators={allEducators}
      allAcademicLevels={allAcademicLevels}
      allClassRooms={allClassRooms}
      companyId={companyId}
    />
  );
}
