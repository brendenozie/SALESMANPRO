import React from "react";
import TakeAttendancePageClient from "./TakeAttendancePageClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c";

interface PageProps {
  params: { courseId: string; slug: string };
  searchParams: { classroomId?: string; scheduleId?: string };
}

export default async function TakeAttendanceServerPage({ params, searchParams }: PageProps) {
  const { slug, courseId } = params;
  const { classroomId, scheduleId } = searchParams;
  
    const {  } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    // const company = await findCompanyCached(identifier, "page");
  
    // if (!company) {
    //   return <div>Company not found</div>;
    // }
  
    // // Use the actual database ID for your API calls, ensuring consistency
    // const companyId = company.id;

  const cookiesStore = (await cookies()).toString();
  // const session = await getAuthSession();
  const educatorId = session?.user?.id || MOCK_CURRENT_EDUCATOR_ID;

  let attendanceData = null;
  let fetchError = null;

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Construct URL with required schedule/classroom context
    const url = new URL(`${apiBaseUrl}/teacher/courses/${courseId}/attendance-data`);
    url.searchParams.set('educatorId', educatorId);
    url.searchParams.set('date', today);
    if (classroomId) url.searchParams.set('classroomId', classroomId);
    if (scheduleId) url.searchParams.set('scheduleId', scheduleId);

    const res = await fetch(url.toString(), { 
      headers: { 'Cookie': cookiesStore || '' },
      next: { revalidate: 0 } // Attendance needs to be real-time
    });

    const result = await res.json();
    if (res.ok) {
      attendanceData = result.data;
    } else {
      fetchError = result.message || "Failed to load data";
    }
  } catch (err: any) {
    fetchError = err.message;
  }

  if (fetchError || !attendanceData) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Attendance</h2>
        <p className="text-red-600 mb-6">{fetchError}</p>
      </div>
    );
  }

  return (
    <TakeAttendancePageClient
      course={{
        id: courseId,
        title: attendanceData.courseTitle,
        academicLevelId: attendanceData.academicLevelId,
        academicLevelName: "" // Optional name if needed
      }}
      students={attendanceData.students}
      initialAttendance={attendanceData.existingAttendance}
      educatorId={educatorId}
      classroomId={classroomId!}
      scheduleId={scheduleId!}
    />
  );
}