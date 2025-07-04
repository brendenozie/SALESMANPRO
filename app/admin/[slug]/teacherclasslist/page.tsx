// app/admin/[slug]/class-teacher-academic-levels/page.tsx
import { AssignedAcademicLevel, ClassTeacherAcademicLevelsPageData, ClassTeacherInfo, StudentInAcademicLevel } from "@/app/api/teacher/academic-levels/route";
import React from "react";
import ClassTeacherAcademicLevelsPage from "./TeachersClassListPage";
import { getAuthSession } from "@/lib/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: {
    slug: string; // companyId
  };
}

// IMPORTANT: In a real application, the currentTeacherUserId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
// This ID should match a userId of an Educator in your database that is assigned to an AcademicLevel.
const MOCK_CURRENT_TEACHER_USER_ID = "USR001"; // Example: assuming USR001 is a teacher's user ID

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

/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function ClassTeacherAcademicLevelsPageServer({ params }: Props) {
  const companyId = params.slug;
  const session = await getAuthSession();

  const teacherUserId = session?.user?.id || MOCK_CURRENT_TEACHER_USER_ID;

  let pageData: AssignedAcademicLevel[] = [];
  let fetchError: boolean = false;

  try {
    const res = await fetch(
      `${apiUrl}/teacher/academic-levels?teacherUserId=${encodeURIComponent(teacherUserId)}`,
      { cache: "no-store" } // equivalent to SSR on every request
    );

    if (res.ok) {
      pageData = (await res.json()) as AssignedAcademicLevel[];
    } else {
      console.error(`[ClassTeacherAcademicLevelsPageServer] Failed to fetch data: ${res.status} ${res.statusText}`);
      fetchError = true;
    }
  } catch (err: any) {
    console.error("ClassTeacherAcademicLevelsPageServer-fetch error:", err.message);
    fetchError = true;
  }

  // If fetch failed or data is missing, use sample data as fallback
  if (fetchError || !pageData ) {
    console.log("[ClassTeacherAcademicLevelsPageServer] Using sample data as fallback.");
    pageData = generateSampleClassTeacherAcademicLevelsData().assignedAcademicLevels;
  }

  return (
    <ClassTeacherAcademicLevelsPage
      classTeacherInfo={generateSampleClassTeacherAcademicLevelsData().classTeacherInfo}
      themeSettings={generateSampleClassTeacherAcademicLevelsData().themeSettings}
      assignedAcademicLevels={pageData}
      companyId={companyId} // Pass companyId for navigation
    />
  );
}
