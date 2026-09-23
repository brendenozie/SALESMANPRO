// app/student/[slug]/my-classes/page.tsx
import React from "react";
import StudentClassesPageClient from "./StudentClassesPageClient";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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

import Link from "next/link";
import { serverFetchJson } from "@/lib/api/serverFetch";

export default async function StudentClassesServerPage({ params }: PageProps) {
  const { slug: studentSlug } = await params;
  const session = await getAuthSession();
  const studentId = session?.user?.id || "";

  let classesPageData: StudentClassesPageData | null = null;
  let fetchError: string | null = null;
  
  const identifier = studentSlug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  try {
    const res = await serverFetchJson<StudentClassesPageData>(
      `/api/student/classes?studentId=${encodeURIComponent(studentId)}`
    );

    if (res.ok && res.data) {
      classesPageData = res.data;
      classesPageData.studentId = studentId;
      classesPageData.companyId = companyId;
    } else {
      fetchError = res.error || res.message || "Failed to fetch student classes";
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
        <Link
          href={`/admin/${studentSlug}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-200 text-red-800 rounded-md shadow-sm
                     hover:bg-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        >
          Go Back
        </Link>
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
