// app/admin/[slug]/teacher-classes/page.tsx
import React from "react";
import TeachersSubjectListPage from "./TeachersSubjectListPage";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from '@/lib/company-fetcher';

// Define shared types for the API and client component
// In a real project, these would be in a separate `types.ts` file
// e.g., `app/types/teacher-classes.ts`
interface TeacherInfo {
  id: string;
  name: string;
  email: string;
  role: string; // e.g., "Educator"
}

interface AcademicLevelInfo {
  id: string;
  name: string;
  description: string | null;
}

interface StudentInCourse {
  studentId: string;
  name: string;
  email: string;
  parentEmail: string | null;
}

interface AssignmentSummary {
  id: string;
  title: string;
  dueDate: string; // ISO string
  status: string; // e.g., 'pending', 'completed'
}

interface ResourceSummary {
  id: string;
  name: string;
  type: string; // e.g., 'PDF', 'Video'
}

interface EventSummary {
  id: string;
  name: string;
  date: string; // ISO string
  time: string; // e.g., '3:00 PM'
}

// Represents a course assigned to a teacher
interface AcademicLevelInfo {
  id: string;
  name: string;
  description: string | null;
}

interface StudentInCourse {
  studentId: string;
  name: string;
  email: string;
  parentEmail: string | null;
}

interface AssignmentSummary {
  id: string;
  title: string;
  dueDate: string; // ISO string
  status: string; // e.g., 'pending', 'completed'
}

interface ResourceSummary {
  id: string;
  name: string;
  type: string; // e.g., 'PDF', 'Video'
}

interface EventSummary {
  id: string;
  name: string;
  date: string; // ISO string
  time: string; // e.g., '3:00 PM'
}

interface TeacherAssignedCourse {
  id: string;
  title: string;
  description: string | null;
  schedule: string;
  room: string;
  studentsEnrolled: number;
  academicLevel: AcademicLevelInfo;
  students: StudentInCourse[];
  assignments: AssignmentSummary[];
  resources: ResourceSummary[];
  events: EventSummary[];
}


interface ScheduleInfo {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: {
    id: string;
    name: string;
  } | null;
  academicLevel?: {
    id: string;
    name: string;
  } | null;
  topic?: string | null;
  meetingLink?: string | null;
}

interface TeacherAssignedCourse {
  id: string;
  title: string;
  description: string | null;
  studentsEnrolled: number;
  academicLevel: AcademicLevelInfo;
  schedules: ScheduleInfo[];
  students: StudentInCourse[];
  assignments: AssignmentSummary[];
  resources: ResourceSummary[];
  events: EventSummary[];
}

const groupByDay = (schedules: ScheduleInfo[]) => {
  return schedules.reduce<Record<string, ScheduleInfo[]>>((acc, s) => {
    if (!acc[s.day]) acc[s.day] = [];
    acc[s.day].push(s);
    return acc;
  }, {});
};



// Data structure for the entire page
interface TeacherClassesPageData {
  teacherInfo: TeacherInfo;
  themeSettings: {
    primaryColor: string;
    accentColor: string;
  };
  teacherClasses: TeacherAssignedCourse[];
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Props {
  params:Promise<{ slug: string }>
}

// IMPORTANT: In a real application, the currentTeacherUserId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
// This ID should match a userId of an Educator in your database for real data to be fetched.
const MOCK_CURRENT_TEACHER_USER_ID = "clx023j0d00003b6033877d9c"; // Example: assuming this is a teacher's user ID

// --- Helper function to generate sample data (for fallback) ---
// This function is now less critical as we have a backend API
const generateSampleTeacherClassesData = (companyId: string, teacherUserId: string): TeacherClassesPageData => {
  const sampleTeacherInfo: TeacherInfo = {
    id: teacherUserId,
    name: "Mr. John Doe",
    email: "john.doe@school.com",
    role: "Educator",
  };

  const sampleThemeSettings = {
    primaryColor: "#fd2121",
    accentColor: "#FFC107",
  };

  const sampleStudents: StudentInCourse[] = [
    { studentId: 'S001', name: 'Alice Smith', email: 'alice.s@example.com', parentEmail: 'parent.alice@example.com' },
    { studentId: 'S002', name: 'Bob Johnson', email: 'bob.j@example.com', parentEmail: 'parent.bob@example.com' },
    { studentId: 'S003', name: 'Charlie Brown', email: 'charlie.b@example.com', parentEmail: 'parent.charlie@example.com' },
    { studentId: 'S005', name: 'Fatuma Hassan', email: 'fatuma.h@example.com', parentEmail: 'parent.fatuma@example.com' },
  ];

  const sampleClasses: TeacherAssignedCourse[] = [
    {
      id: 'COURSE001', // This is a Course ID
      title: 'Mathematics',
      description: 'Foundational concepts of algebra and geometry, focusing on critical thinking and problem-solving skills.',
      schedule: 'Mon, Wed, Fri | 9:00 AM - 9:45 AM',
      room: 'Room 101',
      studentsEnrolled: 35,
      academicLevel: { id: 'clx023j0d00003b6033877d9c', name: 'Grade 7', description: 'Primary level for 7th graders' }, // Use a valid AcademicLevel ID if possible
      students: sampleStudents,
      assignments: [{ id: 'A001', title: 'Algebra Worksheet 1', dueDate: '2025-07-10T00:00:00Z', status: 'pending' }],
      resources: [{ id: 'R001', name: 'Math Syllabus', type: 'PDF' }],
      events: [{ id: 'E001', name: 'Math Club Meeting', date: '2025-07-15T00:00:00Z', time: '3:00 PM' }],
      schedules: []
    },
    {
      id: 'COURSE002', // This is a Course ID
      title: 'English Literature',
      description: 'Developing critical reading, writing, and communication skills through literature analysis and essay writing.',
      schedule: 'Tue, Thu | 10:30 AM - 11:15 AM',
      room: 'Room 102',
      studentsEnrolled: 30,
      academicLevel: { id: 'clx023j0d00003b6033877d9c', name: 'Grade 8', description: 'Primary level for 8th graders' }, // Use a valid AcademicLevel ID if possible
      students: [
        { studentId: 'S003', name: 'Charlie Brown', email: 'charlie.b@example.com', parentEmail: 'parent.charlie@example.com' },
        { studentId: 'S004', name: 'Michael Njoroge', email: 'michael.n@example.com', parentEmail: 'parent.michael@example.com' },
        { studentId: 'S006', name: 'Daniel Maina', email: 'daniel.m@example.com', parentEmail: 'parent.daniel@example.com' },
      ],
      assignments: [{ id: 'A002', title: 'Essay Outline', dueDate: '2025-07-12T00:00:00Z', status: 'completed' }],
      resources: [{ id: 'R002', name: 'Grammar Guide', type: 'Doc' }],
      events: [{ id: 'E002', name: 'Poetry Reading', date: '2025-07-20T00:00:00Z', time: '2:00 PM' }],
      schedules: []
    },
    {
      id: 'COURSE003',
      title: 'Advanced Algebra',
      description: 'Intermediate algebra topics and problem-solving strategies, preparing students for advanced mathematics.',
      schedule: 'Mon, Wed | 1:00 PM - 1:45 PM',
      room: 'Room 103',
      studentsEnrolled: 28,
      academicLevel: { id: 'clx023j0d00003b6033877d9c', name: 'Grade 9', description: 'Primary level for 9th graders' }, // Use a valid AcademicLevel ID if possible
      students: [
        { studentId: 'S007', name: 'Olivia Davis', email: 'olivia.d@example.com', parentEmail: 'parent.olivia@example.com' },
        { studentId: 'S008', name: 'Liam Wilson', email: 'liam.w@example.com', parentEmail: 'parent.liam@example.com' },
      ],
      assignments: [], resources: [], events: [], schedules: []
    },
  ];

  return {
    teacherInfo: sampleTeacherInfo,
    themeSettings: sampleThemeSettings,
    teacherClasses: sampleClasses,
  };
};

/**
import { serverFetchJson } from "@/lib/api/serverFetch";

export default async function TeachersSubjectPage({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();
  const teacherUserId = session?.user?.id || MOCK_CURRENT_TEACHER_USER_ID;

  let pageData: TeacherClassesPageData | null = null;
  let fetchError: boolean = false;

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  try {
    const res = await serverFetchJson<TeacherClassesPageData>(
      `/api/teacher/teacher-assigned-subjects?teacherUserId=${encodeURIComponent(teacherUserId)}`
    );

    if (res.ok && res.data) {
      pageData = res.data;
    } else {
      console.error(`[TeachersClassPage] Failed to fetch teacher classes:`, res.error);
      fetchError = true;
    }
  } catch (err: any) {
    console.error("TeachersClassPage-fetch error:", err.message);
    fetchError = true;
  }

  // If fetch failed or data is missing, use sample data as fallback
  if (fetchError || !pageData || !pageData.teacherClasses || !pageData.teacherInfo) {
    pageData = generateSampleTeacherClassesData(teacherUserId, teacherUserId);
  }

  return (
    <TeachersSubjectListPage
      teacherInfo={pageData.teacherInfo}
      themeSettings={pageData.themeSettings}
      teacherUserId={teacherUserId} 
      teacherClasses={pageData.teacherClasses}
      adminSlug={slug}
    />
  );
}
