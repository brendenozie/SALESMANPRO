// app/admin/[slug]/teacher-classes/course-reports/page.tsx
import React from "react";
import CourseReportsPageClient from "./CourseReportsPageClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator User ID

interface PageProps {
  params: {
    slug: string; // educatorId
  };
}

// Define types for data fetched by the server component
export interface CourseOption {
  id: string;
  title: string;
  academicLevelName: string;
}

export interface StudentReportData {
  studentId: string;
  studentUserId: string;
  studentName: string;
  studentEmail: string;
  enrollmentProgress: number;
  enrollmentGrade: number | null;
  assignmentSummary: {
    totalAssignments: number;
    submittedCount: number;
    averageGrade: number | null;
  };
  attendanceSummary: {
    totalRecords: number;
    present: number;
    absent: number;
    tardy: number;
  };
}

export interface CourseReportDetails {
  course: {
    id: string;
    title: string;
    academicLevelName: string;
  };
  studentReports: StudentReportData[];
}

export interface CourseReportsPageData {
  courses: CourseOption[];
  educatorId: string;
  companyId: string; // This will now come directly from the API response
}

export default async function CourseReportsServerPage({ params }: PageProps) {
  // As clarified, params.slug is the educatorId
  const educatorId = params.slug || MOCK_CURRENT_EDUCATOR_ID;

  let reportsPageData: CourseReportsPageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiUrl}/teacher/courses-for-reports?educatorId=${encodeURIComponent(educatorId)}`,
      { cache: "no-store" } // Ensure fresh data
    );

    if (res.ok) {
      // Destructure both courses and companyId from the API response
      const { courses, companyId: fetchedCompanyId } = await res.json();
      reportsPageData = {
        courses: courses,
        educatorId: educatorId,
        companyId: fetchedCompanyId, // Assign the companyId fetched from the API
      };
    } else {
      const errorData = await res.json();
      fetchError = errorData.message || `Failed to fetch courses: ${res.status} ${res.statusText}`;
      console.error("[CourseReportsServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[CourseReportsServerPage] Catch error:", err);
  }

  if (fetchError || !reportsPageData) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Reports Page</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load courses for reporting."}</p>
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
    <CourseReportsPageClient
      initialCourses={reportsPageData.courses}
      educatorId={reportsPageData.educatorId}
      companyId={reportsPageData.companyId}
    />
  );
}