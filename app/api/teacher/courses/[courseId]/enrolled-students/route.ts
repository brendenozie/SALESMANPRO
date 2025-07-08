// app/admin/[slug]/teacher-classes/[courseId]/send-message/page.tsx
import React from "react";
import SendMessagePageClient from "./SendMessagePageClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: In a real application, the currentEducatorId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator User ID

interface PageProps {
  params: {
    slug: string; // companyId
    courseId: string;
  };
}

// Define types for data fetched by the server component
export interface EnrolledStudent {
  studentId: string; // The Student model's ID
  userId: string;    // The User model's ID associated with the student
  name: string;
  email: string;
  profilePicture: string | null;
}

export interface CourseInfo {
  id: string;
  title: string;
  academicLevelId: string;
  academicLevelName: string;
}

export interface SendMessagePageData {
  course: CourseInfo;
  enrolledStudents: EnrolledStudent[];
  educatorUserId: string; // Pass educator's User ID to client for API calls
  companyId: string; // Pass company ID to client for API calls
}

export default async function SendMessageServerPage({ params }: PageProps) {
  const companyId = params.slug;
  const courseId = params.courseId;
  const educatorUserId = MOCK_CURRENT_EDUCATOR_ID; // In a real app, get this from auth context

  let messagePageData: SendMessagePageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiUrl}/teacher/courses/${courseId}/enrolled-students?educatorId=${encodeURIComponent(educatorUserId)}&companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" } // Ensure fresh data
    );

    if (res.ok) {
      messagePageData = (await res.json()) as SendMessagePageData;
      // Also pass down educatorUserId and companyId for client-side API calls
      messagePageData.educatorUserId = educatorUserId;
      messagePageData.companyId = companyId;
    } else {
      const errorData = await res.json();
      fetchError = errorData.message || `Failed to fetch enrolled students: ${res.status} ${res.statusText}`;
      console.error("[SendMessageServerPage] Fetch error:", fetchError);
    }
  } catch (err: any) {
    fetchError = `Network or server error: ${err.message}`;
    console.error("[SendMessageServerPage] Catch error:", err);
  }

  if (fetchError || !messagePageData || !messagePageData.course) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Page</h2>
        <p className="text-red-600 mb-6">{fetchError || "Could not load course or student data."}</p>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-200 text-red-800 rounded-md shadow-sm       hover:bg-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <SendMessagePageClient
      course={messagePageData.course}
      enrolledStudents={messagePageData.enrolledStudents}
      educatorUserId={messagePageData.educatorUserId}
      companyId={messagePageData.companyId}
    />
  );
}
