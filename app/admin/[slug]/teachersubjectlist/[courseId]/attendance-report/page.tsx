import React from "react";
import AttendanceReportClient from "./AttendanceReportClient";
import { getAuthSession } from "@/lib/auth";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const MOCK_CURRENT_EDUCATOR_ID = "clx023j0d00003b6033877d9c";

interface PageProps {
  params: { courseId: string; slug: string };
  searchParams: { classroomId?: string; scheduleId?: string };
}

export default async function TakeAttendanceServerPage({ params, searchParams }: PageProps) {
  const { courseId } = params;
  const { classroomId, scheduleId } = searchParams;
  
  const cookiesStore = (await cookies()).toString();
  const session = await getAuthSession();
  const educatorId = session?.user?.id || MOCK_CURRENT_EDUCATOR_ID;

  let attendanceData = null;
  let fetchError = null;

  // try {
  //   const today = new Date().toISOString().split('T')[0];
    
  //   // Construct URL with required schedule/classroom context
  //   const url = new URL(`${apiBaseUrl}/teacher/courses/${courseId}/attendance-data`);
  //   url.searchParams.set('educatorId', educatorId);
  //   url.searchParams.set('date', today);
  //   if (classroomId) url.searchParams.set('classroomId', classroomId);
  //   if (scheduleId) url.searchParams.set('scheduleId', scheduleId);

  //   const res = await fetch(url.toString(), { 
  //     headers: { 'Cookie': cookiesStore || '' },
  //     next: { revalidate: 0 } // Attendance needs to be real-time
  //   });

  //   const result = await res.json();
  //   if (res.ok) {
  //     attendanceData = result.data;
  //   } else {
  //     fetchError = result.message || "Failed to load data";
  //   }
  // } catch (err: any) {
  //   fetchError = err.message;
  // }

  // if (fetchError || !attendanceData) {
  //   return (
  //     <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
  //       <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Attendance</h2>
  //       <p className="text-red-600 mb-6">{fetchError}</p>
  //     </div>
  //   );
  // }

  return (
    <AttendanceReportClient
      classroomId={classroomId!}
    />
  );
}