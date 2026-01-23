// app/student/[slug]/my-grades/page.tsx
import React from "react";
import StudentGradesPageClient from "./StudentGradesPageClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentStudentId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_USER_ID = "clx023j0d00003b6033877d9c"; // This is the User ID

interface PageProps {
  params: Promise<{
    slug: string; // This is now the student's USER ID from the URL
    courseId?: string; // Optional: if viewing grades for a specific course
  }>;
}

// --- NEW DATA TYPES TO MATCH THE UPDATED API RESPONSE ---

export interface CourseGradeData {
  id: string;
  name: string;
  teacher: string;
  finalNumericGrade: number | null;
  finalLetterGrade: string;
}

export interface DetailedGradeData {
  id: string;
  itemName: string;
  itemType: string;
  courseName: string;
  score: number;
  totalPoints: number | null;
  gradeValue: string | null; // e.g., "A", "B+"
  status: string | null; // e.g., "PASSED", "FAILED"
  gradedDate: string; // ISO string
}

export interface CourseInfo {
  id: string;
  title: string;
}

export interface StudentGradesPageData {
  studentName: string;
  studentGradeLevel: string;
  overallGPA: string;
  overallAverage: string;
  courseGrades: CourseGradeData[];
  detailedGrades: DetailedGradeData[];
  studentId: string; // The User ID
  companyId: string; // This should be part of the response or context
  courseInfo?: CourseInfo;
}

// Server Component: Fetches data and passes it to the client
export default async function StudentGradesServerPage({ params }: PageProps) {
  
  const { slug: studentSlug, courseId } = await params;
  // The 'slug' from the URL is the student's User ID
  // const studentId = studentSlug || MOCK_CURRENT_USER_ID;
  const cookiesStore = (await cookies()).toString();
    const session = await getAuthSession();
    const studentId = session?.user?.id || "";
  // const studentId = params.slug || MOCK_CURRENT_USER_ID; 
  // const courseId = params.courseId;

  let gradesPageData: StudentGradesPageData | null = null;
  let fetchError: string | null = null;

  try {
    const url = new URL(`${apiBaseUrl}/student/grades`);
    // The API expects `studentId` which is the User ID
    url.searchParams.append('studentId', studentId); 
    
    if (courseId) {
      url.searchParams.append('courseId', courseId);
    }

    const res = await fetch(url.toString(), { next: { revalidate: 60 }, headers: { cookie: cookiesStore } } );

    if (res.ok) {
      // The API response structure is now different
      const data = (await res.json()).data as StudentGradesPageData;
      gradesPageData = {
        ...data,
        studentId: studentId,
        companyId: studentSlug, // Assuming companyId is the slug for routing purposes
      };
      
      if (gradesPageData && courseId && data.courseGrades.length > 0) {
        // If filtering by course, find its name from the fetched data
        gradesPageData.courseInfo = {
          id: courseId,
          title: data.courseGrades[0]?.name || 'Course',
        };
      }
    } else {
      const errorData = (await res.json()).data;
      fetchError = errorData.message || `Failed to fetch student grades: ${res.status} ${res.statusText}`;
      console.error("[StudentGradesServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[StudentGradesServerPage] Catch error:", err);
  }

  if (fetchError || !gradesPageData) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Grades</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load student grade data."}</p>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.history.back(); }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-200 text-red-800 rounded-md shadow-sm hover:bg-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        >
          Go Back
        </a>
      </div>
    );
  }

  return (
    <StudentGradesPageClient
      studentName={gradesPageData.studentName}
      studentGradeLevel={gradesPageData.studentGradeLevel}
      overallGPA={gradesPageData.overallGPA}
      overallAverage={gradesPageData.overallAverage}
      initialCourseGrades={gradesPageData.courseGrades}
      initialDetailedGrades={gradesPageData.detailedGrades}
      studentId={gradesPageData.studentId}
      companyId={gradesPageData.companyId}
      courseInfo={gradesPageData.courseInfo}
    />
  );
}
