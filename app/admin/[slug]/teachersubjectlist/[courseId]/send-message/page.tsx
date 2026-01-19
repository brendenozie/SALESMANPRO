// app/admin/[slug]/teacher-classes/[courseId]/send-message/page.tsx
import React from "react";
import SendMessagePageClient from "./SendMessagePageClient";
import { getAuthSession } from "@/lib/auth";
import { cookies } from "next/headers";


export interface CourseInfo {
  id: string;
  title: string;
  academicLevelName: string;
}

export interface EnrolledStudent {
  userId: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface PageProps {
  params: { courseId: string; slug: string };
  searchParams: { classroomId?: string; scheduleId?: string };
}

const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c"; // Example: Educator ID


// ✅ Adjust this to your actual backend URL or use .env
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function SendMessagePage({ params, searchParams }: PageProps) {
  // const { slug, courseId } = await params;
  
    const cookiesStore = (await cookies()).toString();
    const session = await getAuthSession();
    const educatorId = session?.user?.id || MOCK_CURRENT_EDUCATOR_ID;
    // const companyId = params.slug;
  
    const { slug: companyId, courseId } = params;
    const { classroomId, scheduleId } = searchParams;

  try {
    // Fetch course info
    const courseRes = await fetch(`${apiBaseUrl}/teacher/courses/${courseId}?classroomId=${classroomId}&scheduleId=${scheduleId}`, {
      cache: "no-store", headers: { cookie: cookiesStore }
    });
    if (!courseRes.ok) throw new Error("Failed to fetch course info");
    const course: CourseInfo = (await courseRes.json()).data;

    // Fetch enrolled students
    const studentsRes = await fetch(
      `${apiBaseUrl}/teacher/courses/${courseId}/students?classroomId=${classroomId}&scheduleId=${scheduleId}`,
      { cache: "no-store", headers: { cookie: cookiesStore } }
    );
    if (!studentsRes.ok) throw new Error("Failed to fetch enrolled students");
    const enrolledStudents: EnrolledStudent[] = (await studentsRes.json()).data;

    // Fetch educator & company info (you can customize how you get these)
    // In a real app, you might get these from session or auth context
    const educatorUserId = session?.user?.id || MOCK_CURRENT_EDUCATOR_ID;
    // const companyId = slug; // Using slug as company identifier

    return (
      <SendMessagePageClient
        course={course}
        enrolledStudents={enrolledStudents}
        educatorUserId={educatorUserId}
        companyId={companyId}
      />
    );
  } catch (err) {
    console.error("Error loading SendMessagePage:", err);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Failed to load course or student data
        </h1>
        <p className="text-gray-600 mb-6">
          Please try again later or contact support if this issue persists.
        </p>
        <a
          // href={`/admin/${slug}/teacher-classes`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
        >
          Back to Classes
        </a>
      </div>
    );
  }
}
