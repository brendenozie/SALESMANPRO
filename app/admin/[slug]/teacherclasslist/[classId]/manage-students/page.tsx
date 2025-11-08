// app/admin/[slug]/academic-levels/[academicLevelId]/student-roster/page.tsx
import React from "react";
import StudentRosterPage, { StudentRosterStudent } from "./StudentRosterPage";

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: Promise<{
    slug: string; // teacherId
    classId: string; // The ID of the academic level/class
  }>;
}

/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function StudentRosterPageServer({ params }: Props) {

  const { slug: teacherId, classId: academicLevelId } = await params;

  let studentsData: StudentRosterStudent[] = [];
  let fetchError: boolean = false;

  try {
    const res = await fetch(
      `${apiBaserUrl}/teacher/academic-levels/${encodeURIComponent(academicLevelId)}/students?teacherId=${teacherId}`,
      { next: { revalidate: 60 } } // equivalent to SSR on every request
    );

    if (res.ok) {
      studentsData = (await res.json()) as StudentRosterStudent[];
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
