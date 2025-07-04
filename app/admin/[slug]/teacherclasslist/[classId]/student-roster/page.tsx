// app/admin/[slug]/academic-levels/[academicLevelId]/student-roster/page.tsx
import React from "react";
import StudentRosterPage from "./StudentRosterPage";
import { StudentRosterAcademicLevelInfo, StudentRosterPageData, StudentRosterStudent } from "@/app/api/teacher/academic-levels/[academicLevelId]/students/route";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: {
    slug: string; // teacherId
    classId: string; // The ID of the academic level/class
  };
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleStudentRosterData = (classId: string): StudentRosterPageData => {
  const sampleAcademicLevelInfo: StudentRosterAcademicLevelInfo = {
    id: classId,
    name: 'Grade 7 Mathematics', // This should be AcademicLevel name, not Course name
    description: 'Foundational concepts of algebra and geometry.',
    studentsCount: 8, // Adjust based on sample students below
  };

  const sampleStudents: StudentRosterStudent[] = [
    { id: 'S001', userId: 'U001', name: 'Alice Smith', email: 'alice.s@example.com', parentId: 'P001', parentEmail: 'parent.alice@example.com', profilePicture: 'https://placehold.co/100x100/FFC107/FFFFFF?text=AS', studentGrade: '7' },
    { id: 'S002', userId: 'U002', name: 'Bob Johnson', email: 'bob.j@example.com', parentId: 'P002', parentEmail: 'parent.bob@example.com', profilePicture: 'https://placehold.co/100x100/fd2121/FFFFFF?text=BJ', studentGrade: '7' },
    { id: 'S003', userId: 'U003', name: 'Charlie Brown', email: 'charlie.b@example.com', parentId: 'P003', parentEmail: 'parent.charlie@example.com', profilePicture: 'https://placehold.co/100x100/28A745/FFFFFF?text=CB', studentGrade: '7' },
    { id: 'S004', userId: 'U004', name: 'Diana Prince', email: 'diana.p@example.com', parentId: 'P004', parentEmail: 'parent.diana@example.com', profilePicture: 'https://placehold.co/100x100/007BFF/FFFFFF?text=DP', studentGrade: '7' },
    { id: 'S005', userId: 'U005', name: 'Ethan Hunt', email: 'ethan.h@example.com', parentId: 'P005', parentEmail: 'parent.ethan@example.com', profilePicture: 'https://placehold.co/100x100/8A2BE2/FFFFFF?text=EH', studentGrade: '7' },
    { id: 'S006', userId: 'U006', name: 'Fiona Gallagher', email: 'fiona.g@example.com', parentId: 'P006', parentEmail: 'parent.fiona@example.com', profilePicture: 'https://placehold.co/100x100/DDA0DD/FFFFFF?text=FG', studentGrade: '7' },
    { id: 'S007', userId: 'U007', name: 'George Costanza', email: 'george.c@example.com', parentId: 'P007', parentEmail: 'parent.george@example.com', profilePicture: 'https://placehold.co/100x100/4169E1/FFFFFF?text=GC', studentGrade: '7' },
    { id: 'S008', userId: 'U008', name: 'Hannah Montana', email: 'hannah.m@example.com', parentId: 'P008', parentEmail: 'parent.hannah@example.com', profilePicture: 'https://placehold.co/100x100/FF4500/FFFFFF?text=HM', studentGrade: '7' },
  ];

  return {
    academicLevelInfo: { ...sampleAcademicLevelInfo, studentsCount: sampleStudents.length },
    students: sampleStudents,
    themeSettings: {
      primaryColor: "#fd2121",
      accentColor: "#FFC107",
    },
  };
};

/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function StudentRosterPageServer({ params }: Props) {
  const academicLevelId = params.classId;

  let pageData: StudentRosterPageData | null = null;
  let fetchError: boolean = false;

  try {
    const res = await fetch(
      `${apiUrl}/teacher/academic-levels/${encodeURIComponent(academicLevelId)}/students`,
      { cache: "no-store" } // equivalent to SSR on every request
    );

    if (res.ok) {
      pageData = (await res.json()) as StudentRosterPageData;
    } else {
      console.error(`[StudentRosterPageServer] Failed to fetch student roster: ${res.status} ${res.statusText}`);
      fetchError = true;
    }
  } catch (err: any) {
    console.error("StudentRosterPageServer-fetch error:", err.message);
    fetchError = true;
  }

  // If fetch failed or data is missing, use sample data as fallback
  if (fetchError || !pageData || !pageData.academicLevelInfo || !pageData.students) {
    console.log("[StudentRosterPageServer] Using sample data as fallback.");
    pageData = generateSampleStudentRosterData(academicLevelId);
  }

  return (
    <StudentRosterPage
      academicLevelInfo={pageData.academicLevelInfo}
      students={pageData.students}
      themeSettings={pageData.themeSettings}
      companyId={academicLevelId} // Pass companyId for navigation
    />
  );
}
