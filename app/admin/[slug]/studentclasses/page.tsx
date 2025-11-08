// app/student/[slug]/my-classes/page.tsx
import React from "react";
import StudentClassesPageClient from "./StudentClassesPageClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentStudentId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_STUDENT_ID = "clx023j0d00003b6033877d9c"; // Example: Student ID

interface PageProps {
  params: Promise<{
    slug: string; // studentId
  }>;
}

// Define types for data fetched by the server component
export interface EnrolledClassData {
  id: string;
  name: string; // Course title
  teacher: string; // Teacher's name
  schedule: string; // Formatted schedule string (e.g., "Mon, Wed | 9:00 AM - 9:45 AM")
  room?: string; // Optional, as it's not directly in schema now
  currentGrade: string; // Formatted grade string
  upcomingAssignmentsCount: number;
  nextAssignmentDue: string; // Formatted date string or "None"
}

export interface StudentClassesPageData {
  studentName: string;
  studentGradeLevel: string;
  enrolledClasses: EnrolledClassData[];
  studentId: string; // Pass student ID to client for API calls
  companyId: string; // Pass company ID to client for API calls
}

export default async function StudentClassesServerPage({ params }: PageProps) {
  const { slug: studentSlug } = await params;
  const studentId = studentSlug || MOCK_CURRENT_STUDENT_ID;

  let classesPageData: StudentClassesPageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiBaseUrl}/student/classes?studentId=${encodeURIComponent(studentId)}`,
      { next: { revalidate: 60 } } // Ensure fresh data
    );

    if (res.ok) {
      classesPageData = (await res.json()) as StudentClassesPageData;
      classesPageData.studentId = studentId; // Ensure studentId is passed down
      // classesPageData.companyId = companyId; // Ensure companyId is passed down
    } else {
      const errorData = await res.json();
      fetchError = errorData.message || `Failed to fetch student classes: ${res.status} ${res.statusText}`;
      console.error("[StudentClassesServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[StudentClassesServerPage] Catch error:", err);
  }

  if (fetchError || !classesPageData || !classesPageData.enrolledClasses) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Classes</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load student class data."}</p>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-200 text-red-800 rounded-md shadow-sm
                     hover:bg-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <StudentClassesPageClient
      studentName={classesPageData.studentName}
      studentGradeLevel={classesPageData.studentGradeLevel}
      enrolledClasses={classesPageData.enrolledClasses}
      studentId={classesPageData.studentId}
      companyId={classesPageData.companyId}
    />
  );
}
