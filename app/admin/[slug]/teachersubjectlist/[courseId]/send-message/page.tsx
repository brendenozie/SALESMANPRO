// app/admin/[slug]/teacher-classes/[courseId]/send-message/page.tsx
import React from "react";
import SendMessagePageClient from "./SendMessagePageClient";

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
  params: Promise<{
    slug: string;
    courseId: string;
  }>;
}

// ✅ Adjust this to your actual backend URL or use .env
const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function SendMessagePage({ params }: PageProps) {
  const { slug, courseId } = await params;

  try {
    // Fetch course info
    const courseRes = await fetch(`${apiUrl}/teacher/courses/${courseId}`, {
      cache: "no-store",
    });
    if (!courseRes.ok) throw new Error("Failed to fetch course info");
    const course: CourseInfo = await courseRes.json();

    // Fetch enrolled students
    const studentsRes = await fetch(
      `${apiUrl}/teacher/courses/${courseId}/students`,
      { cache: "no-store" }
    );
    if (!studentsRes.ok) throw new Error("Failed to fetch enrolled students");
    const enrolledStudents: EnrolledStudent[] = await studentsRes.json();

    // Fetch educator & company info (you can customize how you get these)
    // In a real app, you might get these from session or auth context
    const educatorUserId = "mock-educator-id"; // Replace with real value
    const companyId = slug; // Using slug as company identifier

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
          href={`/admin/${slug}/teacher-classes`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
        >
          Back to Classes
        </a>
      </div>
    );
  }
}
