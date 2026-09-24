// app/admin/[slug]/timetable/page.tsx

import React from "react";
import WeeklyTimetable, { TimetableEntry, CourseOption, EducatorOption, AcademicLevelOption } from "./WeeklyTimetable";
import { cookies } from "next/headers";
import { ClassroomOption } from "../teachers/page";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from "@/lib/api/serverFetch";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data ---
const generateSampleTimetableData = (companyId: string): {
  sampleTimetableEntries: TimetableEntry[];
  sampleCourses: CourseOption[];
  sampleEducators: EducatorOption[];
  sampleAcademicLevels: AcademicLevelOption[];
} => {
  const academicLevels: AcademicLevelOption[] = [
    { id: 'AL001', name: 'Playgroup', sortOrder: 1 },
    { id: 'AL002', name: 'Kindergarten', sortOrder: 2 },
    { id: 'AL003', name: 'Grade 1', sortOrder: 3 },
    { id: 'AL006', name: 'Grade 9', sortOrder: 9 },
    { id: 'AL007', name: 'High School - Freshman', sortOrder: 10 },
  ];

  const educators: EducatorOption[] = [
    { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com' },
    { id: 'EDU002', name: 'Ms. Jane Smith', email: 'jane.smith@school.com' },
    { id: 'EDU003', name: 'Dr. Alex Lee', email: 'alex.lee@school.com' },
  ];

  const classRooms: ClassroomOption[] = [
    { id: 'CLS001', name: 'Room 101', academicLevelId: 'AL003' },
    { id: 'CLS002', name: 'Room 202', academicLevelId: 'AL006' },
  ];

  const courses: CourseOption[] = [
    { id: 'CRS001', title: 'Algebra I', code: 'MATH101', academicLevels: [{ id: 'AL006', name: 'Grade 9' }], classrooms: [{ id: 'CLS002', name: 'Room 202', academicLevelId: 'AL006' }], educators: [{ id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com', roleInCourse: 'Lead Instructor' }] },
    { id: 'CRS002', title: 'Literary Analysis', code: 'ENG203', academicLevels: [{ id: 'AL007', name: 'High School - Freshman' }], classrooms: [{ id: 'CLS003', name: 'Lab A', academicLevelId: 'AL007' }], educators: [{ id: 'EDU002', name: 'Ms. Jane Smith', email: 'jane.smith@school.com', roleInCourse:"" }] },
    { id: 'CRS003', title: 'Elementary Math', code: 'MATH100', academicLevels: [{ id: 'AL003', name: 'Grade 1' }], classrooms: [{ id: 'CLS001', name: 'Room 101', academicLevelId: 'AL003' }], educators:[{ id:'EDU003', name:'Dr. Alex Lee', email:'alex.lee@school.com', roleInCourse:'Assistant Instructor'}] },
  ];

  const dummyDate = '1970-01-01T'; // For storing time components as Date objects

  const timetableEntries: TimetableEntry[] = [
    {
      id: 'SCH001',
      courseId: 'CRS001',
      // courseTitle: 'Algebra I',
      // courseCode: 'MATH101', // Added courseCode

      // courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      academicLevel: { id: 'AL006', name: 'Grade 9' },
      academicLevelId: 'AL006',
      // courseClassrooms: [{ id: 'CLS002', name: 'Room 202', academicLevelId: 'AL006' }],
      classroomId: 'CLS002',
      classroom: { id: 'CLS002', name: 'Room 202', academicLevelId: 'AL006' },
      educators: [{ id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com', roleInCourse: 'Lead Instructor' }],
      educator: { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com', roleInCourse: 'Lead Instructor' },
      educatorId: 'EDU001',
      educatorName: 'Mr. John Doe',
      educatorEmail: 'john.doe@school.com',
      dayOfWeek: 'Monday',
      startTime: `${dummyDate}08:00:00.000Z`,
      endTime: `${dummyDate}08:45:00.000Z`,
      topic: 'Introduction to Linear Equations',
      meetingLink: 'https://zoom.us/j/algebra-001',
      companyId: companyId,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
      course: {
        id: "",
        title: "",
        code: "",
        academicLevels: [],
        classrooms: [],
        educators: []
      }
    },
    {
      id: 'SCH002',
      courseId: 'CRS002',
      // courseTitle: 'Literary Analysis',
      // courseCode: 'ENG203', // Added courseCode

      // courseAcademicLevels: [{ id: 'AL007', name: 'High School - Freshman' }],
      academicLevel: { id: 'AL007', name: 'High School - Freshman' },
      academicLevelId: 'AL007',
      // courseClassrooms: [{ id: 'CLS001', name: 'Room 101', academicLevelId: 'AL007' }],
      classroomId: 'CLS003',
      classroom: { id: 'CLS003', name: 'Lab A', academicLevelId: 'AL007' },
      educators: [{ id: 'EDU002', name: 'Ms. Jane Smith', email: 'jane.smith@school.com', roleInCourse: "Co-Instructor" }],
      educator: { id: 'EDU002', name: 'Ms. Jane Smith', email: 'jane.smith@school.com', roleInCourse: "Co-Instructor" },
      educatorId: 'EDU002',
      educatorName: 'Ms. Jane Smith',
      educatorEmail: 'jane.smith@school.com',
      dayOfWeek: 'Tuesday',
      startTime: `${dummyDate}09:00:00.000Z`,
      endTime: `${dummyDate}09:45:00.000Z`,
      topic: 'Analyzing Poetic Devices',
      meetingLink: '',
      companyId: companyId,
      createdAt: new Date('2023-01-02').toISOString(),
      updatedAt: new Date().toISOString(),
      course: {
        id: "",
        title: "",
        code: "",
        academicLevels: [],
        classrooms: [],
        educators: []
      }
    },
    {
      id: 'SCH003',
      courseId: 'CRS001',
      // courseTitle: 'Algebra I',
      // courseCode: 'MATH101', // Added courseCode

      // courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      academicLevel: { id: 'AL006', name: 'Grade 9' },
      academicLevelId: 'AL006',
      // courseClassrooms: [{ id: 'CLS002', name: 'Room 202', academicLevelId: 'AL006' }],
      classroomId: 'CLS002',
      classroom: { id: 'CLS002', name: 'Room 202', academicLevelId: 'AL006' },
      educators: [{ id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com', roleInCourse: 'Lead Instructor' }],
      educator: { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com', roleInCourse: 'Lead Instructor' },
      educatorId: 'EDU001',
      educatorName: 'Mr. John Doe',
      educatorEmail: 'john.doe@school.com',
      dayOfWeek: 'Wednesday',
      startTime: `${dummyDate}10:00:00.000Z`,
      endTime: `${dummyDate}10:45:00.000Z`,
      topic: 'Solving Systems by Substitution',
      meetingLink: 'https://meet.google.com/algebra-002',
      companyId: companyId,
      createdAt: new Date('2023-01-03').toISOString(),
      updatedAt: new Date().toISOString(),
      course: {
        id: "",
        title: "",
        code: "",
        academicLevels: [],
        classrooms: [],
        educators: []
      }
    },
    {
      id: 'SCH004',
      courseId: 'CRS003',
      // courseTitle: 'Elementary Math',
      // courseCode: 'MATH100', // Added courseCode

      // courseAcademicLevels: [{ id: 'AL003', name: 'Grade 1' }],
      academicLevel: { id: 'AL003', name: 'Grade 1' },
      academicLevelId: 'AL003',
      // courseClassrooms: [{ id: 'CLS001', name: 'Room 101', academicLevelId: 'AL003' }],
      classroomId: 'CLS001',
      classroom: { id: 'CLS001', name: 'Room 101', academicLevelId: 'AL003' },
      educators: [{ id: 'EDU003', name: 'Dr. Alex Lee', email: 'alex.lee@school.com', roleInCourse: 'Assistant Instructor' }],
      educator: { id: 'EDU003', name: 'Dr. Alex Lee', email: 'alex.lee@school.com', roleInCourse: 'Assistant Instructor' },
      educatorId: 'EDU003',
      educatorName: 'Dr. Alex Lee',
      educatorEmail: 'alex.lee@school.com',
      dayOfWeek: 'Monday',
      startTime: `${dummyDate}09:00:00.000Z`,
      endTime: `${dummyDate}09:45:00.000Z`,
      topic: 'Counting and Number Recognition',
      meetingLink: '',
      companyId: companyId,
      createdAt: new Date('2023-01-04').toISOString(),
      updatedAt: new Date().toISOString(),
      course: {
        id: "",
        title: "",
        code: "",
        academicLevels: [],
        classrooms: [],
        educators: []
      }
    },
  ];

  return { sampleTimetableEntries: timetableEntries, sampleCourses: courses, sampleEducators: educators, sampleAcademicLevels: academicLevels };
};
// --- End Helper function ---


export default async function TimetableManagerPage({ params }: PageProps) {

  const { slug }  = await params;

  const cookieHeader = (await cookies()).toString();
    
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }

    const companyId = company.id;
  
  let initialTimetable: TimetableEntry[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allClassrooms: ClassroomOption[] = [];
  let fetchError: boolean = false;

  try {
    const [timetableRes, coursesRes, educatorsRes, levelsRes, classroomsRes] = await Promise.all([
      serverFetchJson<any[]>(`/api/admin/class-schedules?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<any[]>(`/api/admin/courses?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<any[]>(`/api/admin/educators?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<AcademicLevelOption[]>(`/api/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`),
      serverFetchJson<ClassroomOption[]>(`/api/admin/classrooms?companyId=${encodeURIComponent(companyId)}`)
    ]);

    if (timetableRes.success && Array.isArray(timetableRes.data)) {
      initialTimetable = timetableRes.data;
    }
    if (coursesRes.success && Array.isArray(coursesRes.data)) {
      allCourses = coursesRes.data.map((c: any) => ({
        id: c.id,
        title: c.title,
        code: c.code,
        academicLevels: c.academicLevels,
        classrooms: c.classrooms,
        educators: c.educators,
      }));
    }
    if (educatorsRes.success && Array.isArray(educatorsRes.data)) {
      allEducators = educatorsRes.data.map((e: any) => ({
        id: e.id,
        name: e.name,
        email: e.email,
      }));
    }
    if (levelsRes.success && Array.isArray(levelsRes.data)) {
      allAcademicLevels = levelsRes.data;
    }
    if (classroomsRes.success && Array.isArray(classroomsRes.data)) {
      allClassrooms = classroomsRes.data;
    }
  } catch (err: any) {
    console.error("[TimetableManagerPage] SSR fetch error:", err);
  }

  return (
    <WeeklyTimetable
      initialTimetable={initialTimetable}
      allCourses={allCourses}
      allEducators={allEducators}
      allAcademicLevels={allAcademicLevels}
      allClassrooms={allClassrooms}
      companyId={companyId}
    />
  );
}
