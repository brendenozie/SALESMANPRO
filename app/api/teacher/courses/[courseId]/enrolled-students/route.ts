// app/admin/[slug]/teacher-classes/[courseId]/send-message/page.tsx
import React from "react";
import SendMessagePageClient from "./SendMessagePageClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// IMPORTANT: Replace MOCK_CURRENT_EDUCATOR_ID with real auth context in production
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; 

interface PageProps {
  params: {
    slug: string; // companyId
    courseId: string;
  };
}

// Types for API response
export interface EnrolledStudent {
  studentId: string;
  userId: string;
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
  educatorUserId: string;
  companyId: string;
}

export default async function SendMessageServerPage({ params }: PageProps) {
  const companyId = params.slug;
  const courseId = params.courseId;
  const educatorUserId = MOCK_CURRENT_EDUCATOR_ID;

  let messagePageData: SendMessagePageData | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${apiUrl}/teacher/courses/${courseId}/enrolled-students?educatorId=${encodeURIComponent(
        educatorUserId
      )}&companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store" } // Always fetch fresh data
    );

    const data = await res.json();

    if (res.ok && data.success) {
      // Use formatResponse structure: { success, data, message }
      messagePageData = data.data as SendMessagePageData;
      messagePageData.educatorUserId = educatorUserId;
      messagePageData.companyId = companyId;
    } else {
      fetchError =
        data?.message || `Failed to fetch enrolled students: ${res.status} ${res.statusText}`;
      console.error("[SendMessageServerPage] API Error:", fetchError);
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-200 text-red-800 rounded-md shadow-sm hover:bg-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
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
