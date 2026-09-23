// app/admin/[slug]/class-teacher-academic-levels/page.tsx
// import { AssignedAcademicLevel, ClassTeacherAcademicLevelsPageData, ClassTeacherInfo, StudentInAcademicLevel } from "@/app/api/class-teacher-academic-levels/route";
// import { AssignedAcademicLevel, ClassTeacherAcademicLevelsPageData, ClassTeacherInfo, StudentInAcademicLevel } from "@/app/api/teacher/academic-levels/route";

import React from "react";
import ClassTeacherAcademicLevelsPage from "./TeachersClassListPage";
import { getAuthSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Props {
  params: Promise<{
    slug: string; 
  }>;
}

// IMPORTANT: In a real application, the currentTeacherUserId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
// This ID should match a userId of an Educator in your database that is assigned to an AcademicLevel.
const MOCK_CURRENT_TEACHER_USER_ID = "USR001"; // Example: assuming USR001 is a teacher's user ID

// Local TypeScript types used by this page (define here to avoid missing-type errors)
type ThemeSettings = {
  primaryColor?: string;
  accentColor?: string;
};

interface ClassTeacherInfo {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

interface StudentInAcademicLevel {
  studentId: string;
  name: string;
  email?: string;
  parentEmail?: string;
}

interface AcademicLevelEvent {
  id: string;
  name: string;
  date?: string;
  time?: string;
}

interface AcademicLevelAnnouncement {
  id: string;
  text: string;
  type?: 'info' | 'warning' | 'error' | string;
}

export interface AssignedAcademicLevel {
  id: string;
  name: string;
  description?: string;

  classroom?: {
    id: string;
    name: string;
  } | null;

  roleInLevel?: string;
  studentsCount: number;
  students?: StudentInAcademicLevel[];

  academicLevelEvents: AcademicLevelEvent[];
  academicLevelAnnouncements: AcademicLevelAnnouncement[];
}


// export interface AssignedAcademicLevel {
//   id: string;
//   name: string;
//   description?: string;
//   roleInLevel?: string;
//   studentsCount: number;
//   students?: StudentInAcademicLevel[];
//   academicLevelEvents: AcademicLevelEvent[];
//   academicLevelAnnouncements: AcademicLevelAnnouncement[];
// }

// Define types used by the client component
// type AcademicLevelEvent = {
//   id: string;
//   name: string;
//   date: string; // ISO date string
//   time?: string;
// };

// type AcademicLevelAnnouncement = {
//   id: string;
//   text: string;
//   createdAt?: string;
// };

// interface AssignedAcademicLevel {
//   id: string;
//   name: string;
//   description?: string;
//   studentsCount: number;
//   roleInLevel?: string;
//   academicLevelEvents: AcademicLevelEvent[];
//   academicLevelAnnouncements: AcademicLevelAnnouncement[];
// }

interface ClassTeacherAcademicLevelsPageData {
  classTeacherInfo: ClassTeacherInfo;
  themeSettings?: ThemeSettings;
  assignedAcademicLevels: AssignedAcademicLevel[];
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleClassTeacherAcademicLevelsData = (): ClassTeacherAcademicLevelsPageData => {
  const sampleClassTeacherInfo: ClassTeacherInfo = {
    id: "teacherUserId",
    name: "Mrs. Emily Davis",
    email: "emily.davis@school.com",
    role: "Class Teacher",
  };

  const sampleThemeSettings = {
    primaryColor: "#007bff", // A different primary color for this page's mock
    accentColor: "#28a745", // A different accent color
  };

  const sampleStudentsGrade7: StudentInAcademicLevel[] = [
    { studentId: 'S001', name: 'Alice Smith', email: 'alice.s@example.com', parentEmail: 'parent.alice@example.com' },
    { studentId: 'S002', name: 'Bob Johnson', email: 'bob.j@example.com', parentEmail: 'parent.bob@example.com' },
    { studentId: 'S003', name: 'Charlie Brown', email: 'charlie.b@example.com', parentEmail: 'parent.charlie@example.com' },
  ];

  const sampleStudentsGrade8: StudentInAcademicLevel[] = [
    { studentId: 'S004', name: 'Diana Prince', email: 'diana.p@example.com', parentEmail: 'parent.diana@example.com' },
    { studentId: 'S005', name: 'Ethan Hunt', email: 'ethan.h@example.com', parentEmail: 'parent.ethan@example.com' },
  ];

  const sampleAssignedAcademicLevels: AssignedAcademicLevel[] = [
    {
      id: 'ACADEMIC001', // AcademicLevel ID
      name: 'Grade 7',
      description: 'The seventh academic year of primary education.',
      roleInLevel: 'Class Teacher',
      studentsCount: sampleStudentsGrade7.length,
      students: sampleStudentsGrade7,
      academicLevelEvents: [
        { id: 'ALE001', name: 'Grade 7 Orientation', date: new Date('2025-08-20T09:00:00Z').toISOString(), time: '9:00 AM' },
        { id: 'ALE002', name: 'Grade 7 Parent-Teacher Conference', date: new Date('2025-10-15T14:00:00Z').toISOString(), time: '2:00 PM' },
      ],
      academicLevelAnnouncements: [
        { id: 'ALA001', text: 'Reminder: Grade 7 field trip permission slips due Friday.', type: 'info' },
        { id: 'ALA002', text: 'Important: Grade 7 science fair moved to next month.', type: 'warning' },
      ],
    },
    {
      id: 'ACADEMIC002', // AcademicLevel ID
      name: 'Grade 8',
      description: 'The eighth academic year, preparing students for high school.',
      roleInLevel: 'Assistant Class Teacher',
      studentsCount: sampleStudentsGrade8.length,
      students: sampleStudentsGrade8,
      academicLevelEvents: [],
      academicLevelAnnouncements: [
        { id: 'ALA003', text: 'Grade 8 graduation ceremony details coming soon!', type: 'info' },
      ],
    },
  ];

  return {
    classTeacherInfo: sampleClassTeacherInfo,
    themeSettings: sampleThemeSettings,
    assignedAcademicLevels: sampleAssignedAcademicLevels,
  };
};

import { serverFetchJson } from "@/lib/api/serverFetch";

export default async function ClassTeacherAcademicLevelsPageServer({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;
  const teacherId = session?.user?.id || companyId || MOCK_CURRENT_TEACHER_USER_ID;

  let pageData: ClassTeacherAcademicLevelsPageData | null = null;
  let fetchError: boolean = false;

  try {
    const res = await serverFetchJson<ClassTeacherAcademicLevelsPageData>(
      `/api/teacher/academic-levels?teacherId=${encodeURIComponent(teacherId)}`
    );

    if (res.ok && res.data) {
      pageData = res.data;
    } else {
      console.error(`[ClassTeacherAcademicLevelsPageServer] Failed to fetch data:`, res.error);
      fetchError = true;
    }
  } catch (err: any) {
    console.error("ClassTeacherAcademicLevelsPageServer-fetch error:", err.message);
    fetchError = true;
  }

  // If fetch failed or data is missing, use sample data as fallback
  if (fetchError || !pageData || !pageData.assignedAcademicLevels) {
    pageData = generateSampleClassTeacherAcademicLevelsData();
  }

  const resolvedThemeSettings: { primaryColor: string; accentColor: string } = {
    primaryColor: pageData.themeSettings?.primaryColor ?? "#007bff",
    accentColor: pageData.themeSettings?.accentColor ?? "#28a745",
  };

  return (
    <ClassTeacherAcademicLevelsPage
      classTeacherInfo={pageData.classTeacherInfo}
      themeSettings={resolvedThemeSettings}
      assignedAcademicLevels={pageData.assignedAcademicLevels}
      teacherId={teacherId}
      adminSlug={slug}
    />
  );
}
