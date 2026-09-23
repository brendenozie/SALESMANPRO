// app/admin/[slug]/timetable/page.tsx

import React from "react";
import ClassSchedulePage, { TimetableEntry, CourseOption, EducatorOption, AcademicLevelOption } from "./ClassSchedulePage";
import { cookies } from "next/headers";
import { ClassroomOption } from "@/app/admin/[slug]/teachers/TeachersClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { serverFetchJson } from '@/lib/api/serverFetch';

interface PageProps {
  params: Promise<{
    slug: string;
    academicLevelId: string;
    classId: string;
  }>;
}

// --- Helper function to generate sample data ---
const generateSampleTimetableData = (academicLevelId: string, classId: string): {
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
    { id: 'CRS001', title: 'Algebra I', code: 'MATH101', academicLevels: [{ id: 'AL006', name: 'Grade 9' }] },
    { id: 'CRS002', title: 'Literary Analysis', code: 'ENG203', academicLevels: [{ id: 'AL007', name: 'High School - Freshman' }] },
    { id: 'CRS003', title: 'Elementary Math', code: 'MATH100', academicLevels: [{ id: 'AL003', name: 'Grade 1' }] },
  ];

  const dummyDate = '1970-01-01T'; // For storing time components as Date objects

  const timetableEntries: TimetableEntry[] = [
    {
      id: 'SCH001',
      courseId: 'CRS001',
      courseTitle: 'Algebra I',
      courseCode: 'MATH101', // Added courseCode
      // courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      academicLevel: { id: 'AL006', name: 'Grade 9' },
      academicLevelId: 'AL006',
      // courseClassrooms: [{ id: 'CLS002', name: 'Room 202', academicLevelId: 'AL006' }],
      classroomId: 'CLS002',
      classroom: { id: 'CLS002', name: 'Room 202', academicLevelId: 'AL006' },
      educatorId: 'EDU001',
      educatorName: 'Mr. John Doe',
      educatorEmail: 'john.doe@school.com',
      dayOfWeek: 'Monday',
      startTime: `${dummyDate}08:00:00.000Z`,
      endTime: `${dummyDate}08:45:00.000Z`,
      topic: 'Introduction to Linear Equations',
      meetingLink: 'https://zoom.us/j/algebra-001',
      companyId: `${academicLevelId}-${classId}`,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH002',
      courseId: 'CRS002',
      courseTitle: 'Literary Analysis',
      courseCode: 'ENG203', // Added courseCode
      // courseAcademicLevels: [{ id: 'AL007', name: 'High School - Freshman' }],
      academicLevel: { id: 'AL007', name: 'High School - Freshman' },
      academicLevelId: 'AL007',
      // courseClassrooms: [{ id: 'CLS001', name: 'Room 101', academicLevelId: 'AL007' }],
      classroomId: 'CLS003',
      classroom: { id: 'CLS003', name: 'Lab A', academicLevelId: 'AL007' },
      educatorId: 'EDU002',
      educatorName: 'Ms. Jane Smith',
      educatorEmail: 'jane.smith@school.com',
      dayOfWeek: 'Tuesday',
      startTime: `${dummyDate}09:00:00.000Z`,
      endTime: `${dummyDate}09:45:00.000Z`,
      topic: 'Analyzing Poetic Devices',
      meetingLink: '',
      companyId: `${academicLevelId}-${classId}`,
      createdAt: new Date('2023-01-02').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH003',
      courseId: 'CRS001',
      courseTitle: 'Algebra I',
      courseCode: 'MATH101', // Added courseCode
      // courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      academicLevel: { id: 'AL006', name: 'Grade 9' },
      academicLevelId: 'AL006',
      // courseClassrooms: [{ id: 'CLS002', name: 'Room 202', academicLevelId: 'AL006' }],
      classroomId: 'CLS002',
      classroom: { id: 'CLS002', name: 'Room 202', academicLevelId: 'AL006' },
      educatorId: 'EDU001',
      educatorName: 'Mr. John Doe',
      educatorEmail: 'john.doe@school.com',
      dayOfWeek: 'Wednesday',
      startTime: `${dummyDate}10:00:00.000Z`,
      endTime: `${dummyDate}10:45:00.000Z`,
      topic: 'Solving Systems by Substitution',
      meetingLink: 'https://meet.google.com/algebra-002',
      companyId: `${academicLevelId}-${classId}`,
      createdAt: new Date('2023-01-03').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH004',
      courseId: 'CRS003',
      courseTitle: 'Elementary Math',
      courseCode: 'MATH100', // Added courseCode
      // courseAcademicLevels: [{ id: 'AL003', name: 'Grade 1' }],
      academicLevel: { id: 'AL003', name: 'Grade 1' },
      academicLevelId: 'AL003',
      // courseClassrooms: [{ id: 'CLS001', name: 'Room 101', academicLevelId: 'AL003' }],
      classroomId: 'CLS001',
      classroom: { id: 'CLS001', name: 'Room 101', academicLevelId: 'AL003' },
      educatorId: 'EDU003',
      educatorName: 'Dr. Alex Lee',
      educatorEmail: 'alex.lee@school.com',
      dayOfWeek: 'Monday',
      startTime: `${dummyDate}09:00:00.000Z`,
      endTime: `${dummyDate}09:45:00.000Z`,
      topic: 'Counting and Number Recognition',
      meetingLink: '',
      companyId: `${academicLevelId}-${classId}`,
      createdAt: new Date('2023-01-04').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleTimetableEntries: timetableEntries, sampleCourses: courses, sampleEducators: educators, sampleAcademicLevels: academicLevels };
};
// --- End Helper function ---


export default async function TimetableManagerPage({ params }: PageProps) {
  const { slug, academicLevelId, classId } = await params;

  let initialTimetable: TimetableEntry[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let allClassrooms: ClassroomOption[] = [];
  let fetchError: boolean = false;

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");
  const companyId = company?.id || '';

  try {
    const [timetableRes, coursesRes, educatorsRes, academicLevelsRes, classroomsRes] = await Promise.all([
      serverFetchJson<any[]>(
        `/api/admin/class-schedules?companyId=${encodeURIComponent(companyId)}&academicLevelId=${encodeURIComponent(academicLevelId)}&classId=${encodeURIComponent(classId)}`
      ),
      serverFetchJson<any[]>(
        `/api/admin/courses?companyId=${encodeURIComponent(companyId)}&academicLevelId=${encodeURIComponent(academicLevelId)}&classId=${encodeURIComponent(classId)}`
      ),
      serverFetchJson<any>(
        `/api/admin/educators?companyId=${encodeURIComponent(companyId)}&academicLevelId=${encodeURIComponent(academicLevelId)}&classId=${encodeURIComponent(classId)}`
      ),
      serverFetchJson<any[]>(
        `/api/admin/academic-levels?companyId=${encodeURIComponent(companyId)}&academicLevelId=${encodeURIComponent(academicLevelId)}&classId=${encodeURIComponent(classId)}`
      ),
      serverFetchJson<any[]>(
        `/api/admin/classrooms?companyId=${encodeURIComponent(companyId)}&academicLevelId=${encodeURIComponent(academicLevelId)}&classId=${encodeURIComponent(classId)}`
      ),
    ]);

    if (timetableRes.success && timetableRes.data) {
      initialTimetable = Array.isArray(timetableRes.data) ? timetableRes.data : [];
    }

    if (coursesRes.success && coursesRes.data) {
      const fetchedCourses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      allCourses = fetchedCourses.map(c => ({
        id: c.id,
        title: c.title,
        code: c.code,
        academicLevels: c.academicLevels,
      }));
    }

    if (educatorsRes.success && educatorsRes.data) {
      const rawEducators = Array.isArray(educatorsRes.data)
        ? educatorsRes.data
        : (educatorsRes.data.data && Array.isArray(educatorsRes.data.data) ? educatorsRes.data.data : []);
      allEducators = rawEducators.map((e: any) => ({
        id: e.id,
        name: e.name,
        email: e.email,
      }));
    }

    if (academicLevelsRes.success && academicLevelsRes.data) {
      allAcademicLevels = Array.isArray(academicLevelsRes.data) ? academicLevelsRes.data : [];
    }

    if (classroomsRes.success && classroomsRes.data) {
      allClassrooms = Array.isArray(classroomsRes.data) ? classroomsRes.data : [];
    }
  } catch (err: any) {
    console.error("[TimetableManagerPage] Error fetching initial data →", err?.message || err);
    fetchError = true;
  }

  // If no data was fetched from the API, generate and use sample data
  if (fetchError || (initialTimetable.length === 0 && allCourses.length === 0 && allEducators.length === 0 && allAcademicLevels.length === 0)) {
    const { sampleTimetableEntries, sampleCourses, sampleEducators, sampleAcademicLevels } = generateSampleTimetableData(academicLevelId, classId);
    initialTimetable = sampleTimetableEntries;
    allCourses = sampleCourses;
    allEducators = sampleEducators;
    allAcademicLevels = sampleAcademicLevels;
  }

  return (
    <ClassSchedulePage
      initialTimetable={initialTimetable}
      allCourses={allCourses}
      allEducators={allEducators}
      allAcademicLevels={allAcademicLevels}
      allClassrooms={allClassrooms}
      academicLevelId={academicLevelId}
      classId={classId}
    />
  );
}
