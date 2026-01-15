// app/admin/[slug]/academic-levels/[academicLevelId]/student-roster/page.tsx
import React from "react";
import StudentRosterPage, { StudentRosterStudent } from "./StudentRosterPage";
import { getAuthSession } from "@/lib/auth";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: Promise<{
    academicLevelId: string; // teacherId
    classId: string; // The ID of the academic level/class
  }>;
}

/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function StudentRosterPageServer({ params }: Props) {
  const cookiesStore = (await cookies()).toString();
  const { classId, academicLevelId } = await params;

  const sesssion = await getAuthSession();
  const teacherId = sesssion?.user?.id || "TEACHER_ID_PLACEHOLDER";

  let studentsData: StudentRosterStudent[] = [];
  let fetchError: boolean = false;

  try {
    const res = await fetch(
      `${apiBaseUrl}/teacher/academic-levels/${encodeURIComponent(academicLevelId)}/students?teacherId=${teacherId}&classId=${classId}`,
      { headers: { cookie: cookiesStore }, next: { revalidate: 60 } } // equivalent to SSR on every request
    );

    if (res.ok) {
      studentsData = (await res.json()).data as StudentRosterStudent[];
    } else {
      console.error(`[StudentRosterPageServer] Failed to fetch student roster: ${res.status} ${res.statusText}`);
      fetchError = true;
    }
  } catch (err: any) {
    console.error("StudentRosterPageServer-fetch error:", err.message);
    fetchError = true;
  }

  // If fetch failed or data is missing, use sample data as fallback
  if (fetchError || !studentsData ) {
    console.log("[StudentRosterPageServer] Using sample data as fallback.");
  }

  return (
    <StudentRosterPage
      students={studentsData}
      companyId={academicLevelId} // Pass companyId for navigation
    />
  );
}
