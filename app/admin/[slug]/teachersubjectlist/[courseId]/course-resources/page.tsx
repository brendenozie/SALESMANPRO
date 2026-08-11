import React from "react";
import CourseResourcesPageClient from "./CourseResourcesPageClient"; // The captivating client we built
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ courseId?: string; classroomId?: string }>;
}

/**
 * SERVER COMPONENT
 * Fetches the specific course context and initial resource list.
 */
export default async function AdminCourseResourcesPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { courseId, classroomId } = await searchParams;
  
  const session = await getAuthSession();
  const cookieStore = (await cookies()).toString();

  // 1. Security Check
  if (!session?.user?.id) return notFound();

  const educatorId = session.user.id;
  let initialCourses = [];
  let fetchError: string | null = null;

  
    // const { slug } = await params;
  
    // const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  try {
    // 2. Fetch all courses this educator is assigned to
    // This allows the client to provide a "Switch Course" dropdown
    const coursesRes = await fetch(
      `${apiBaseUrl}/teacher/courses-for-reports?educatorId=${encodeURIComponent(educatorId)}`,
      { 
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: { cookie: cookieStore } 
      }
    );

    if (coursesRes.ok) {
      const result = await coursesRes.json();
      initialCourses = result.data.courses || [];
    }
  } catch (err: any) {
    console.error("Resource Page Fetch Error:", err);
    fetchError = "Unable to connect to course services.";
  }

  // 3. Determine active course context
  // Fallback to the first available course if none is selected in URL
  const activeCourse = initialCourses.find((c: any) => c.id === courseId) || initialCourses[0];

  const pageContext = {
    companyId,
    educatorId,
    courseId: activeCourse?.id || "",
    courseTitle: activeCourse?.title || "Unknown Course",
    classroomId: classroomId || "Main Section",
    educatorName: session.user.name || "Educator"
  };

  // If no courses are found at all, show empty state
  if (!activeCourse && !fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl text-center max-w-sm">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-xl font-black text-slate-900">No Courses Assigned</h2>
          <p className="text-slate-500 mt-2 font-medium">You don't have any courses assigned to your profile yet.</p>
        </div>
      </div>
    );
  }

  return (
    <CourseResourcesPageClient 
      context={pageContext} 
      availableCourses={initialCourses}
      error={fetchError}
    />
  );
}