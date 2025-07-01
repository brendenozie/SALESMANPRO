// app/admin/timetable-manager/page.tsx

import React from "react";
import WeeklyTimetable, { TimetableEntry, CourseOption, EducatorOption } from "./WeeklyTimetable"; // Import types
import prisma from "@/server/db/prismadb"; // Adjust path as needed

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params?: {
    slug?: string; // Optional, in case you want to use it later
  };
}

// --- Helper function to generate sample data ---
const generateSampleTimetableData = (): {
  sampleTimetableEntries: TimetableEntry[];
  sampleCourses: CourseOption[];
  sampleEducators: EducatorOption[];
} => {
  const sampleCourses: CourseOption[] = [
    { id: 'C001', title: 'Grade 7 Mathematics', level: 'Grade 7' },
    { id: 'C002', title: 'Grade 8 Science', level: 'Grade 8' },
    { id: 'C003', title: 'Grade 9 Algebra', level: 'Grade 9' },
    { id: 'C004', title: 'Grade 10 English', level: 'Grade 10' },
    { id: 'C005', title: 'Grade 11 Physics', level: 'Grade 11' },
    { id: 'C006', title: 'Grade 12 Literature', level: 'Grade 12' },
  ];

  const sampleEducators: EducatorOption[] = [
    { id: 'E001', name: 'Mr. John Doe', email: 'john.doe@school.com' },
    { id: 'E002', name: 'Ms. Jane Smith', email: 'jane.smith@school.com' },
    { id: 'E003', name: 'Dr. Alex Lee', email: 'alex.lee@school.com' },
    { id: 'E004', name: 'Mrs. Emily Chen', email: 'emily.chen@school.com' },
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const baseDate = new Date(); // Use current date as a base
  const dayOffset = baseDate.getDay() === 0 ? -6 : 1 - baseDate.getDay(); // Adjust to Monday
  const monday = new Date(baseDate.setDate(baseDate.getDate() + dayOffset));

  const sampleTimetableEntries: TimetableEntry[] = [
    {
      id: 'TTE_S001',
      courseId: 'C003',
      course: sampleCourses.find(c => c.id === 'C003')!,
      educatorId: 'E001',
      educator: sampleEducators.find(e => e.id === 'E001')!,
      date: new Date(monday).toISOString().split('T')[0], // Monday
      startTime: '08:00 AM',
      endTime: '08:45 AM',
      topic: 'Algebraic Expressions',
      meetingLink: 'https://zoom.us/j/algebra-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'TTE_S002',
      courseId: 'C001',
      course: sampleCourses.find(c => c.id === 'C001')!,
      educatorId: 'E002',
      educator: sampleEducators.find(e => e.id === 'E002')!,
      date: new Date(new Date(monday).setDate(monday.getDate() + 1)).toISOString().split('T')[0], // Tuesday
      startTime: '09:00 AM',
      endTime: '09:45 AM',
      topic: 'Number Theory Basics',
      meetingLink: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'TTE_S003',
      courseId: 'C005',
      course: sampleCourses.find(c => c.id === 'C005')!,
      educatorId: 'E003',
      educator: sampleEducators.find(e => e.id === 'E003')!,
      date: new Date(new Date(monday).setDate(monday.getDate() + 2)).toISOString().split('T')[0], // Wednesday
      startTime: '10:00 AM',
      endTime: '10:45 AM',
      topic: 'Kinematics',
      meetingLink: 'https://meet.google.com/physics-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'TTE_S004',
      courseId: 'C004',
      course: sampleCourses.find(c => c.id === 'C004')!,
      educatorId: 'E002',
      educator: sampleEducators.find(e => e.id === 'E002')!,
      date: new Date(new Date(monday).setDate(monday.getDate() + 0)).toISOString().split('T')[0], // Monday
      startTime: '10:00 AM',
      endTime: '10:45 AM',
      topic: 'Literary Devices',
      meetingLink: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'TTE_S005',
      courseId: 'C002',
      course: sampleCourses.find(c => c.id === 'C002')!,
      educatorId: 'E004',
      educator: sampleEducators.find(e => e.id === 'E004')!,
      date: new Date(new Date(monday).setDate(monday.getDate() + 1)).toISOString().split('T')[0], // Tuesday
      startTime: '11:00 AM',
      endTime: '11:45 AM',
      topic: 'Ecosystems',
      meetingLink: 'https://zoom.us/j/science-002',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'TTE_S006',
      courseId: 'C006',
      course: sampleCourses.find(c => c.id === 'C006')!,
      educatorId: 'E001',
      educator: sampleEducators.find(e => e.id === 'E001')!,
      date: new Date(new Date(monday).setDate(monday.getDate() + 4)).toISOString().split('T')[0], // Friday
      startTime: '09:00 AM',
      endTime: '09:45 AM',
      topic: 'Poetry Analysis',
      meetingLink: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleTimetableEntries, sampleCourses, sampleEducators };
};
// --- End Helper function ---


export default async function TimetableManagerPage({ params }: PageProps) {
  const companyId = params?.slug || "default-company"; // Use a default or handle as needed

  let initialTimetable: TimetableEntry[] = [];
  let allCourses: CourseOption[] = [];
  let allEducators: EducatorOption[] = [];

  try {
    // Fetch timetable entries with related course and educator info
    const timetableRes = await fetch(`${apiUrl}/timetables`, {
      cache: "no-store", // SSR on every request
    });
    if (timetableRes.ok) {
      initialTimetable = (await timetableRes.json()) as TimetableEntry[];
    } else {
      console.error(
        "[TimetableManagerPage] Failed to fetch timetable →",
        timetableRes.status,
        timetableRes.statusText
      );
    }

    // Fetch all courses for dropdowns
    const coursesRes = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        level: true,
        instructorId: true,
      },
      orderBy: { title: 'asc' },
    });
    allCourses = coursesRes as CourseOption[];

    // Fetch all educators for dropdowns
    const educatorsRes = await prisma.educator.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });
    allEducators = educatorsRes as EducatorOption[];

  } catch (err: any) {
    console.error("[TimetableManagerPage] Error fetching initial data →", err.message);
    // If any fetch fails, clear current data to ensure fallback is used
    initialTimetable = [];
    allCourses = [];
    allEducators = [];
  }

  // If no data was fetched from the API, generate and use sample data
  if (initialTimetable.length === 0 && allCourses.length === 0 && allEducators.length === 0) {
    console.log("[TimetableManagerPage] No data fetched, generating sample data...");
    const { sampleTimetableEntries, sampleCourses, sampleEducators } = generateSampleTimetableData();
    initialTimetable = sampleTimetableEntries;
    allCourses = sampleCourses;
    allEducators = sampleEducators;
  }

  return (
    <WeeklyTimetable
      initialTimetable={initialTimetable}
      allCourses={allCourses}
      allEducators={allEducators}
    />
  );
}
