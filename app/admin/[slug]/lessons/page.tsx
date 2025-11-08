// app/admin/[slug]/timetable/page.tsx

import React from "react";
import WeeklyTimetable, { TimetableEntry, CourseOption, EducatorOption, AcademicLevelOption } from "./WeeklyTimetable";

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
      courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
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
    },
    {
      id: 'SCH002',
      courseId: 'CRS002',
      courseTitle: 'Literary Analysis',
      courseCode: 'ENG203', // Added courseCode
      courseAcademicLevels: [{ id: 'AL007', name: 'High School - Freshman' }],
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
    },
    {
      id: 'SCH003',
      courseId: 'CRS001',
      courseTitle: 'Algebra I',
      courseCode: 'MATH101', // Added courseCode
      courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
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
    },
    {
      id: 'SCH004',
      courseId: 'CRS003',
      courseTitle: 'Elementary Math',
      courseCode: 'MATH100', // Added courseCode
      courseAcademicLevels: [{ id: 'AL003', name: 'Grade 1' }],
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
    },
  ];

  return { sampleTimetableEntries: timetableEntries, sampleCourses: courses, sampleEducators: educators, sampleAcademicLevels: academicLevels };
};
// --- End Helper function ---


export default async function TimetableManagerPage({ params }: PageProps) {
  const { slug : companyId } = await params;

  let initialTimetable: TimetableEntry[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];
  let allAcademicLevels: AcademicLevelOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch timetable entries with related course and educator info
    const timetableRes = await fetch(
      `${apiUrl}/admin/class-schedules?companyId=${encodeURIComponent(companyId)}`, // Corrected API path
      { next: { revalidate: 60 } } // SSR on every request
    );
    if (timetableRes.ok) {
      initialTimetable = (await timetableRes.json()) as TimetableEntry[];
    } else {
      console.error(
        "[TimetableManagerPage] Failed to fetch timetable →",
        timetableRes.status,
        timetableRes.statusText
      );
      fetchError = true;
    }

    // Fetch all courses for dropdowns
    const coursesRes = await fetch(
      `${apiUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`, // Corrected API path
      { next: { revalidate: 60 } }
    );
    if (coursesRes.ok) {
      const fetchedCourses = (await coursesRes.json()) as any[];
      allCourses = fetchedCourses.map(c => ({
        id: c.id,
        title: c.title,
        code: c.code, // Include course code
        academicLevels: c.academicLevels, // This should now be an array of {id, name}
      }));
    } else {
      console.error(
        "[TimetableManagerPage] Failed to fetch courses →",
        coursesRes.status,
        coursesRes.statusText
      );
      fetchError = true;
    }

    // Fetch all educators for dropdowns
    const educatorsRes = await fetch(
      `${apiUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`, // Corrected API path
      { next: { revalidate: 60 } }
    );
    if (educatorsRes.ok) {
      const fetchedEducators = (await educatorsRes.json()) as any[];
      allEducators = fetchedEducators.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
      }));
    } else {
      console.error(
        "[TimetableManagerPage] Failed to fetch educators →",
        educatorsRes.status,
        educatorsRes.statusText
      );
      fetchError = true;
    }

    // Fetch all academic levels (for display in course options)
    const academicLevelsRes = await fetch(
      `${apiUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, // Corrected API path
      { next: { revalidate: 60 } }
    );
    if (academicLevelsRes.ok) {
      allAcademicLevels = (await academicLevelsRes.json()) as AcademicLevelOption[];
    } else {
      console.error(
        `[TimetableManagerPage] Failed to fetch academic levels: ${academicLevelsRes.status} ${academicLevelsRes.statusText}`
      );
      fetchError = true;
    }


  } catch (err: any) {
    console.error("[TimetableManagerPage] Error fetching initial data →", err.message);
    fetchError = true;
  }

  // If no data was fetched from the API, generate and use sample data
  if (fetchError && initialTimetable.length === 0 && allCourses.length === 0 && allEducators.length === 0 && allAcademicLevels.length === 0) {
    console.log("[TimetableManagerPage] No data fetched, generating sample data...");
    const { sampleTimetableEntries, sampleCourses, sampleEducators, sampleAcademicLevels } = generateSampleTimetableData(companyId);
    initialTimetable = sampleTimetableEntries;
    allCourses = sampleCourses;
    allEducators = sampleEducators;
    allAcademicLevels = sampleAcademicLevels;
  }

  return (
    <WeeklyTimetable
      initialTimetable={initialTimetable}
      allCourses={allCourses}
      allEducators={allEducators}
      allAcademicLevels={allAcademicLevels}
      companyId={companyId}
    />
  );
}
